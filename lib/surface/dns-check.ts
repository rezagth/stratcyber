import { promises as dns } from 'dns';

/**
 * Contrôle externe de la messagerie d'un domaine par DNS uniquement (SPF, DMARC, MX).
 * Aucune requête HTTP n'est faite vers le domaine saisi : pas de risque de SSRF, et rien n'est envoyé
 * au domaine contrôlé. Ce sont des enregistrements publics.
 */

export type Severity = 'Critique' | 'Haute' | 'Moyenne' | 'Info' | 'OK';
export type Finding = { id: string; severity: Severity; title: string; detail: string };
export type Resolver = {
  resolveTxt(name: string): Promise<string[][]>;
  resolveMx(name: string): Promise<Array<{ exchange: string; priority: number }>>;
};

const DOMAIN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/** Normalise un domaine saisi ; renvoie null s'il n'est pas un nom de domaine public valide (IP, localhost, URL...). */
export function normalizeDomain(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const value = input.trim().toLowerCase().replace(/\.$/, '');
  if (!DOMAIN.test(value)) return null;
  if (value === 'localhost' || value.endsWith('.local') || value.endsWith('.localhost') || value.endsWith('.internal')) return null;
  return value;
}

const isMissing = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  return code === 'ENODATA' || code === 'ENOTFOUND' || code === 'NXDOMAIN' || code === 'NOTFOUND';
};

async function txt(resolver: Resolver, name: string): Promise<string[]> {
  try {
    return (await resolver.resolveTxt(name)).map((parts) => parts.join(''));
  } catch (error) {
    if (isMissing(error)) return [];
    throw error;
  }
}

const SPF_LOOKUP = /^[+\-~?]?(include:|a\b|mx\b|ptr\b|exists:|redirect=)/i;

export function analyzeSpf(records: string[]): Finding[] {
  const spf = records.filter((r) => /^v=spf1(\s|$)/i.test(r));
  if (spf.length === 0) {
    return [{ id: 'spf-missing', severity: 'Haute', title: 'Aucun enregistrement SPF', detail: "Sans SPF, n'importe qui peut plus facilement se faire passer pour ce domaine dans un e-mail." }];
  }
  if (spf.length > 1) {
    return [{ id: 'spf-multiple', severity: 'Haute', title: 'Plusieurs enregistrements SPF', detail: 'Un domaine ne doit publier qu\'un seul SPF : avec plusieurs, les serveurs de réception peuvent tous les ignorer.' }];
  }
  const terms = spf[0].trim().split(/\s+/).slice(1);
  const all = terms.find((t) => /^[+\-~?]?all$/i.test(t));
  const findings: Finding[] = [];
  if (!all) {
    findings.push({ id: 'spf-no-all', severity: 'Moyenne', title: 'SPF sans règle finale', detail: "L'enregistrement ne se termine pas par « -all » ou « ~all » : les expéditeurs non listés ne sont pas refusés." });
  } else if (/^\+all$|^all$|^\?all$/i.test(all)) {
    findings.push({ id: 'spf-open', severity: 'Critique', title: 'SPF ouvert à tous', detail: `La règle « ${all} » autorise ou ne contrôle aucun expéditeur : le SPF est sans effet.` });
  } else if (/^~all$/i.test(all)) {
    findings.push({ id: 'spf-softfail', severity: 'Moyenne', title: 'SPF en « softfail » (~all)', detail: 'Les expéditeurs non listés sont marqués suspects mais pas refusés. « -all » est plus strict, à adopter une fois les expéditeurs légitimes inventoriés.' });
  } else {
    findings.push({ id: 'spf-ok', severity: 'OK', title: 'SPF strict (-all)', detail: 'Seuls les expéditeurs listés sont autorisés.' });
  }
  const lookups = terms.filter((t) => SPF_LOOKUP.test(t)).length;
  if (lookups > 10) {
    findings.push({ id: 'spf-lookups', severity: 'Moyenne', title: `SPF trop long (${lookups} résolutions DNS)`, detail: 'Au-delà de 10 résolutions, le SPF est invalide pour beaucoup de serveurs. Réduire les « include » inutiles.' });
  }
  return findings;
}

export function analyzeDmarc(records: string[]): Finding[] {
  const dmarc = records.filter((r) => /^v=DMARC1\s*;/i.test(r.trim()) || /^v=DMARC1$/i.test(r.trim()));
  if (dmarc.length === 0) {
    return [{ id: 'dmarc-missing', severity: 'Haute', title: 'Aucun enregistrement DMARC', detail: "Sans DMARC, le domaine n'indique pas quoi faire des e-mails qui usurpent son nom et ne reçoit aucun rapport d'abus." }];
  }
  const tags = new Map(dmarc[0].split(';').map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf('=');
    return [p.slice(0, i).trim().toLowerCase(), p.slice(i + 1).trim()] as const;
  }));
  const policy = (tags.get('p') ?? '').toLowerCase();
  const findings: Finding[] = [];
  if (policy === 'none' || policy === '') {
    findings.push({ id: 'dmarc-none', severity: 'Moyenne', title: 'DMARC en simple observation (p=none)', detail: 'Les e-mails usurpés ne sont pas bloqués. À passer en « quarantine » puis « reject » après analyse des rapports.' });
  } else if (policy === 'quarantine') {
    findings.push({ id: 'dmarc-quarantine', severity: 'OK', title: 'DMARC en quarantaine', detail: 'Les e-mails qui échouent sont mis en spam. « reject » est l\'étape suivante.' });
  } else if (policy === 'reject') {
    findings.push({ id: 'dmarc-reject', severity: 'OK', title: 'DMARC en rejet (p=reject)', detail: 'Les e-mails qui usurpent le domaine sont refusés.' });
  }
  if (!tags.get('rua')) {
    findings.push({ id: 'dmarc-no-rua', severity: 'Info', title: 'DMARC sans adresse de rapports (rua)', detail: "Sans « rua », aucun rapport d'usurpation n'est reçu." });
  }
  return findings;
}

export async function checkDomain(domainInput: unknown, resolver: Resolver = dns): Promise<{ domain: string; findings: Finding[] } | { error: string }> {
  const domain = normalizeDomain(domainInput);
  if (!domain) return { error: 'Domaine invalide : saisis un nom de domaine public (ex. exemple.fr), sans http:// ni adresse IP.' };
  try {
    const [txtRecords, dmarcRecords, mx] = await Promise.all([
      txt(resolver, domain),
      txt(resolver, `_dmarc.${domain}`),
      resolver.resolveMx(domain).catch((error) => { if (isMissing(error)) return []; throw error; }),
    ]);
    const findings: Finding[] = [];
    if (mx.length === 0) {
      findings.push({ id: 'mx-none', severity: 'Info', title: 'Aucun serveur de messagerie (MX)', detail: 'Si le domaine n\'envoie ni ne reçoit d\'e-mails, publier « v=spf1 -all » et un DMARC « reject » empêche son usurpation.' });
    }
    findings.push(...analyzeSpf(txtRecords), ...analyzeDmarc(dmarcRecords));
    return { domain, findings };
  } catch {
    return { error: 'Résolution DNS impossible pour le moment. Réessaie plus tard.' };
  }
}

const RANK: Record<Severity, number> = { Critique: 0, Haute: 1, Moyenne: 2, Info: 3, OK: 4 };
export const sortFindings = (findings: Finding[]) => [...findings].sort((a, b) => RANK[a.severity] - RANK[b.severity]);
