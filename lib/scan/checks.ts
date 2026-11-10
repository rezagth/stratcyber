import { promises as dns } from 'dns';
import { checkDomain, normalizeDomain, sortFindings, type Finding, type Resolver } from '@/lib/surface/dns-check';
import { resolvePublicAddresses, type LookupAll } from './net-guard';
import { httpProbe, tlsProbe, type CertInfo, type HttpProbe, type HttpProbeOptions } from './safe-net';
import type { ResolvedAddress } from './net-guard';

/**
 * Contrôles externes NON INTRUSIFS d'un domaine : ce que n'importe quel visiteur d'Internet peut observer
 * (DNS public, certificat HTTPS, en-têtes de la page d'accueil, redirection HTTP→HTTPS, security.txt).
 * Aucun test d'attaque, aucun scan de ports, aucune tentative de connexion : une page d'accueil lue,
 * un certificat lu, quelques enregistrements DNS lus.
 */

export type ScanResultFinding = Finding & { evidence?: string };

export type ScanDeps = {
  lookup?: LookupAll;
  resolver: Resolver & { resolveCaa(name: string): Promise<unknown[]> };
  tlsProbe: (host: string, address: ResolvedAddress) => Promise<CertInfo>;
  httpProbe: (options: HttpProbeOptions) => Promise<HttpProbe>;
};

export const realDeps: ScanDeps = { resolver: dns, tlsProbe, httpProbe };

const DAY = 86_400_000;
const day = (d: Date) => d.toISOString().slice(0, 10);
const clip = (s: string, n = 300) => (s.length > n ? `${s.slice(0, n)}…` : s);
const header = (headers: HttpProbe['headers'], name: string): string => {
  const value = headers[name];
  return Array.isArray(value) ? value.join(', ') : (value ?? '');
};

const CERT_ERRORS: Record<string, string> = {
  DEPTH_ZERO_SELF_SIGNED_CERT: 'Le certificat est auto-signé : aucun navigateur ne lui fait confiance.',
  SELF_SIGNED_CERT_IN_CHAIN: 'La chaîne de certificats contient un certificat auto-signé non reconnu.',
  UNABLE_TO_VERIFY_LEAF_SIGNATURE: "La chaîne est incomplète (certificat intermédiaire absent) : certains appareils afficheront une alerte.",
  UNABLE_TO_GET_ISSUER_CERT_LOCALLY: "L'émetteur du certificat n'est pas reconnu.",
};

export function analyzeCertificate(cert: CertInfo, now: Date): ScanResultFinding[] {
  const out: ScanResultFinding[] = [];
  const expired = cert.validTo !== null && cert.validTo.getTime() < now.getTime();
  if (expired) {
    out.push({ id: 'tls-expired', severity: 'Critique', title: 'Certificat HTTPS expiré', detail: `Le certificat a expiré le ${day(cert.validTo!)} : les navigateurs affichent une alerte de sécurité aux visiteurs.` });
  } else if (cert.validFrom && cert.validFrom.getTime() > now.getTime()) {
    out.push({ id: 'tls-not-yet-valid', severity: 'Haute', title: "Certificat HTTPS pas encore valide", detail: `Le certificat ne sera valable qu'à partir du ${day(cert.validFrom)}.` });
  } else if (cert.validTo) {
    const days = Math.floor((cert.validTo.getTime() - now.getTime()) / DAY);
    if (days < 15) out.push({ id: 'tls-expiring', severity: 'Haute', title: `Certificat HTTPS expire dans ${days} jour(s)`, detail: `Expiration le ${day(cert.validTo)}. Vérifier le renouvellement automatique.` });
    else if (days < 30) out.push({ id: 'tls-expiring', severity: 'Moyenne', title: `Certificat HTTPS expire dans ${days} jours`, detail: `Expiration le ${day(cert.validTo)}. Vérifier que le renouvellement est bien en place.` });
    else out.push({ id: 'tls-validity', severity: 'OK', title: 'Certificat HTTPS valide', detail: `Valable jusqu'au ${day(cert.validTo)}${cert.issuer ? ` (émis par ${cert.issuer})` : ''}.` });
  }
  if (!cert.authorized && cert.authorizationError && cert.authorizationError !== 'CERT_HAS_EXPIRED') {
    out.push({ id: 'tls-untrusted', severity: 'Haute', title: 'Certificat HTTPS non reconnu', detail: CERT_ERRORS[cert.authorizationError] ?? 'Le certificat ne peut pas être validé par un navigateur.', evidence: clip(`Code : ${cert.authorizationError}`) });
  }
  if (cert.hostnameMismatch) {
    out.push({ id: 'tls-hostname', severity: 'Haute', title: "Certificat HTTPS émis pour un autre nom", detail: "Le nom du site n'apparaît pas dans le certificat : les visiteurs voient une alerte de sécurité." });
  }
  if (cert.protocol && cert.protocol !== 'TLSv1.2' && cert.protocol !== 'TLSv1.3') {
    out.push({ id: 'tls-old-protocol', severity: 'Haute', title: `Protocole obsolète négocié (${cert.protocol})`, detail: 'Les protocoles antérieurs à TLS 1.2 sont considérés comme vulnérables.' });
  } else if (cert.protocol) {
    out.push({ id: 'tls-protocol', severity: 'OK', title: `Connexion sécurisée en ${cert.protocol.replace('TLSv', 'TLS ')}`, detail: 'Un protocole moderne est accepté.' });
  }
  out.push({ id: 'tls-legacy-untested', severity: 'Info', title: 'Anciens protocoles TLS non testés', detail: "Cet outil ne vérifie pas si TLS 1.0/1.1 restent acceptés. À contrôler avec SSL Labs ou testssl.sh (voir le guide de campagne)." });
  return out;
}

const SESSION_COOKIE = /sess|sid|token|auth|jwt|login/i;

export function analyzeHeaders(headers: HttpProbe['headers']): ScanResultFinding[] {
  const out: ScanResultFinding[] = [];

  const hsts = header(headers, 'strict-transport-security');
  if (!hsts) {
    out.push({ id: 'hsts-missing', severity: 'Moyenne', title: 'HSTS absent', detail: "Sans l'en-tête Strict-Transport-Security, un visiteur peut être poussé vers une version non chiffrée du site (attaque de type « downgrade »)." });
  } else {
    const age = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
    if (age < 15_552_000) out.push({ id: 'hsts-short', severity: 'Moyenne', title: 'HSTS de durée trop courte', detail: 'La durée max-age devrait être d\'au moins 6 mois (15 552 000 secondes), idéalement 1 an.', evidence: clip(`Strict-Transport-Security: ${hsts}`) });
    else out.push({ id: 'hsts-ok', severity: 'OK', title: 'HSTS en place', detail: 'Les navigateurs sont forcés d\'utiliser HTTPS.' });
  }

  const csp = header(headers, 'content-security-policy');
  if (!csp) {
    out.push({ id: 'csp-missing', severity: 'Moyenne', title: 'Politique de sécurité de contenu (CSP) absente', detail: "Sans CSP, une faille d'injection de script (XSS) est beaucoup plus facile à exploiter. À mettre en place progressivement, d'abord en mode rapport." });
  } else if (/(script-src|default-src)[^;]*'unsafe-(inline|eval)'/i.test(csp)) {
    out.push({ id: 'csp-weak', severity: 'Info', title: 'CSP affaiblie (unsafe-inline / unsafe-eval)', detail: "La politique autorise des scripts non maîtrisés, ce qui réduit fortement sa protection.", evidence: clip(`Content-Security-Policy: ${csp}`) });
  } else {
    out.push({ id: 'csp-ok', severity: 'OK', title: 'CSP en place', detail: 'Une politique de sécurité de contenu est publiée.' });
  }

  const missing: string[] = [];
  if (!header(headers, 'x-frame-options') && !/frame-ancestors/i.test(csp)) missing.push('protection contre l\'affichage dans un cadre (X-Frame-Options ou frame-ancestors)');
  if (header(headers, 'x-content-type-options').toLowerCase() !== 'nosniff') missing.push('X-Content-Type-Options: nosniff');
  if (!header(headers, 'referrer-policy')) missing.push('Referrer-Policy');
  if (!header(headers, 'permissions-policy')) missing.push('Permissions-Policy');
  if (missing.length > 0) {
    out.push({ id: 'headers-hardening', severity: 'Info', title: `${missing.length} en-tête(s) de durcissement absent(s)`, detail: `Bonnes pratiques non appliquées : ${missing.join(' ; ')}.` });
  }

  const server = header(headers, 'server');
  const poweredBy = header(headers, 'x-powered-by');
  const disclosed = [server && /\d+\.\d+/.test(server) ? `Server: ${server}` : '', poweredBy ? `X-Powered-By: ${poweredBy}` : ''].filter(Boolean);
  if (disclosed.length > 0) {
    const withVersion = disclosed.some((d) => /\d+\.\d+/.test(d));
    out.push({ id: 'version-disclosure', severity: withVersion ? 'Moyenne' : 'Info', title: 'Technologies et versions exposées', detail: "Le serveur annonce son logiciel et parfois sa version, ce qui aide un attaquant à chercher les failles connues correspondantes. À masquer.", evidence: clip(disclosed.join(' | ')) });
  }

  const cookies = ((headers['set-cookie'] as string[] | undefined) ?? []).map((raw) => {
    const [pair, ...attrs] = raw.split(';').map((p) => p.trim());
    return { name: pair.split('=')[0], flags: attrs.map((a) => a.toLowerCase()) };
  });
  const noSecure = cookies.filter((c) => !c.flags.includes('secure')).map((c) => c.name);
  const noHttpOnly = cookies.filter((c) => SESSION_COOKIE.test(c.name) && !c.flags.includes('httponly')).map((c) => c.name);
  if (noSecure.length > 0) out.push({ id: 'cookie-secure', severity: 'Moyenne', title: 'Cookie sans attribut Secure', detail: 'Ces cookies peuvent être transmis en clair si le visiteur passe un instant en HTTP.', evidence: clip(`Cookies : ${noSecure.join(', ')}`) });
  if (noHttpOnly.length > 0) out.push({ id: 'cookie-httponly', severity: 'Moyenne', title: 'Cookie de session sans attribut HttpOnly', detail: 'Un script injecté dans la page pourrait lire ces cookies de session.', evidence: clip(`Cookies : ${noHttpOnly.join(', ')}`) });

  const cors = header(headers, 'access-control-allow-origin');
  if (cors === '*') {
    const credentials = header(headers, 'access-control-allow-credentials').toLowerCase() === 'true';
    out.push(credentials
      ? { id: 'cors-credentials', severity: 'Haute', title: 'CORS ouvert à tous avec identifiants', detail: "Le site autorise n'importe quelle origine avec les identifiants du visiteur : à corriger en priorité." }
      : { id: 'cors-wildcard', severity: 'Info', title: 'CORS ouvert à toutes les origines', detail: "Normal pour une ressource publique, à éviter pour une API qui renvoie des données privées." });
  }
  return out;
}

export function analyzeHttpPort(probe: HttpProbe): ScanResultFinding[] {
  const location = header(probe.headers, 'location');
  if ([301, 302, 303, 307, 308].includes(probe.status)) {
    if (/^https:\/\//i.test(location)) return [{ id: 'http-redirect', severity: 'OK', title: 'HTTP redirigé vers HTTPS', detail: 'Les visiteurs en HTTP sont renvoyés vers la version chiffrée.' }];
    return [{ id: 'http-redirect-insecure', severity: 'Moyenne', title: "Redirection HTTP qui ne mène pas à HTTPS", detail: 'La redirection du port 80 ne renvoie pas vers une adresse en https://.', evidence: clip(`Location: ${location}`) }];
  }
  if (probe.status >= 200 && probe.status < 300) {
    return [{ id: 'http-no-redirect', severity: 'Haute', title: 'Site accessible en HTTP sans redirection', detail: "Le site répond en clair sur le port 80 au lieu de renvoyer vers HTTPS : les échanges peuvent être lus ou modifiés sur un réseau non maîtrisé." }];
  }
  return [];
}

const missing = (error: unknown) => {
  const code = (error as { code?: string })?.code;
  return code === 'ENODATA' || code === 'ENOTFOUND' || code === 'NOTFOUND' || code === 'NXDOMAIN';
};

async function caaFinding(deps: ScanDeps, host: string): Promise<ScanResultFinding[]> {
  try {
    const records = await deps.resolver.resolveCaa(host);
    return records.length > 0
      ? [{ id: 'caa-ok', severity: 'OK', title: 'CAA en place', detail: 'Seules certaines autorités peuvent émettre des certificats pour ce domaine.' }]
      : [{ id: 'caa-missing', severity: 'Info', title: 'Aucun enregistrement CAA', detail: "Sans CAA, n'importe quelle autorité de certification peut émettre un certificat pour ce domaine. À restreindre à celles utilisées." }];
  } catch (error) {
    return missing(error)
      ? [{ id: 'caa-missing', severity: 'Info', title: 'Aucun enregistrement CAA', detail: "Sans CAA, n'importe quelle autorité de certification peut émettre un certificat pour ce domaine. À restreindre à celles utilisées." }]
      : [];
  }
}

export type ScanOutcome = { host: string; addresses: string[]; findings: ScanResultFinding[] } | { error: string };

/**
 * Lance les contrôles externes d'un domaine. Précondition (vérifiée par l'appelant) : le domaine figure
 * dans le périmètre d'une campagne dont l'autorisation écrite est valide à cet instant.
 */
export async function runExternalScan(
  hostInput: unknown,
  options: { checkDns: boolean },
  deps: ScanDeps = realDeps,
  now: Date = new Date()
): Promise<ScanOutcome> {
  const host = normalizeDomain(hostInput);
  if (!host) return { error: 'Domaine invalide : un nom de domaine public est attendu (pas d\'adresse IP ni d\'URL).' };
  const resolved = await resolvePublicAddresses(host, deps.lookup);
  if ('error' in resolved) return resolved;
  const address = resolved.addresses[0];

  const [dnsPart, tlsPart, httpsPart, httpPart, secPart] = await Promise.allSettled([
    options.checkDns
      ? Promise.all([checkDomain(host, deps.resolver), caaFinding(deps, host)])
      : Promise.resolve(null),
    deps.tlsProbe(host, address),
    deps.httpProbe({ host, address, port: 443, path: '/' }),
    deps.httpProbe({ host, address, port: 80, path: '/' }),
    deps.httpProbe({ host, address, port: 443, path: '/.well-known/security.txt' }),
  ]);

  const findings: ScanResultFinding[] = [];

  if (dnsPart.status === 'fulfilled' && dnsPart.value) {
    const [mail, caa] = dnsPart.value;
    if ('error' in mail) findings.push({ id: 'dns-unavailable', severity: 'Info', title: 'Contrôle DNS indisponible', detail: mail.error });
    else findings.push(...mail.findings);
    findings.push(...caa);
  }

  if (tlsPart.status === 'fulfilled') {
    findings.push(...analyzeCertificate(tlsPart.value, now));
  } else if (httpPart.status === 'fulfilled') {
    findings.push({ id: 'https-absent', severity: 'Haute', title: 'HTTPS indisponible (port 443)', detail: "Le site répond en HTTP mais aucune connexion chiffrée n'aboutit : les échanges circulent en clair." });
  } else {
    findings.push({ id: 'web-none', severity: 'Info', title: 'Aucun service web détecté', detail: "Ni le port 80 ni le port 443 ne répondent. Normal si ce nom n'héberge pas de site." });
  }

  if (httpsPart.status === 'fulfilled') findings.push(...analyzeHeaders(httpsPart.value.headers));
  if (httpPart.status === 'fulfilled') findings.push(...analyzeHttpPort(httpPart.value));

  if (secPart.status === 'fulfilled') {
    const ok = secPart.value.status === 200 && /^\s*Contact:/im.test(secPart.value.body);
    findings.push(ok
      ? { id: 'security-txt', severity: 'OK', title: 'security.txt publié', detail: 'Un point de contact pour signaler une faille est disponible.' }
      : { id: 'security-txt-missing', severity: 'Info', title: 'Pas de fichier security.txt', detail: "Aucun point de contact public pour signaler une faille (norme RFC 9116). Un fichier de quelques lignes suffit." });
  }

  return { host, addresses: resolved.addresses.map((a) => a.address), findings: sortFindings(findings) as ScanResultFinding[] };
}
