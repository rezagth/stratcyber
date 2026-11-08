import { describe, expect, it } from 'vitest';
import { analyzeDmarc, analyzeSpf, checkDomain, normalizeDomain, sortFindings } from '@/lib/surface/dns-check';
import { suggestAnswers } from '@/lib/security-answers/suggest';

const resolver = (txt: Record<string, string[]>, mx: Array<{ exchange: string; priority: number }> = [{ exchange: 'mx.exemple.fr', priority: 10 }]) => ({
  resolveTxt: async (name: string) => { if (!(name in txt)) throw Object.assign(new Error('x'), { code: 'ENODATA' }); return txt[name].map((r) => [r]); },
  resolveMx: async () => mx,
});

describe('normalizeDomain', () => {
  it('accepte un domaine public et le normalise', () => {
    expect(normalizeDomain('  Exemple.FR. ')).toBe('exemple.fr');
    expect(normalizeDomain('mail.sous-domaine.exemple.com')).toBe('mail.sous-domaine.exemple.com');
  });
  it('refuse URL, IP, localhost, noms internes et valeurs non textuelles (anti-SSRF)', () => {
    for (const bad of ['http://exemple.fr', 'exemple.fr/chemin', '192.168.0.1', '127.0.0.1', 'localhost', 'serveur.local', 'a.internal', 'exemple', '', 'exemple.fr:80', '[::1]']) {
      expect(normalizeDomain(bad)).toBeNull();
    }
    expect(normalizeDomain(42)).toBeNull();
    expect(normalizeDomain(null)).toBeNull();
  });
});

describe('SPF', () => {
  it('signale l\'absence, la duplication et les règles ouvertes', () => {
    expect(analyzeSpf([])[0]).toMatchObject({ id: 'spf-missing', severity: 'Haute' });
    expect(analyzeSpf(['v=spf1 -all', 'v=spf1 +all'])[0].id).toBe('spf-multiple');
    expect(analyzeSpf(['v=spf1 include:_spf.x.com +all'])[0]).toMatchObject({ id: 'spf-open', severity: 'Critique' });
    expect(analyzeSpf(['v=spf1 include:_spf.x.com'])[0].id).toBe('spf-no-all');
    expect(analyzeSpf(['v=spf1 mx ~all'])[0].id).toBe('spf-softfail');
    expect(analyzeSpf(['v=spf1 mx -all'])[0]).toMatchObject({ id: 'spf-ok', severity: 'OK' });
  });
  it('signale un SPF qui dépasse 10 résolutions', () => {
    const many = `v=spf1 ${Array.from({ length: 11 }, (_, i) => `include:s${i}.x.com`).join(' ')} -all`;
    expect(analyzeSpf([many]).map((f) => f.id)).toContain('spf-lookups');
  });
});

describe('DMARC', () => {
  it('signale l\'absence, p=none, et reconnaît quarantine/reject', () => {
    expect(analyzeDmarc([])[0]).toMatchObject({ id: 'dmarc-missing', severity: 'Haute' });
    expect(analyzeDmarc(['v=DMARC1; p=none; rua=mailto:a@b.fr']).map((f) => f.id)).toEqual(['dmarc-none']);
    expect(analyzeDmarc(['v=DMARC1; p=quarantine']).map((f) => f.id)).toEqual(['dmarc-quarantine', 'dmarc-no-rua']);
    expect(analyzeDmarc(['v=DMARC1; p=reject; rua=mailto:a@b.fr'])[0]).toMatchObject({ id: 'dmarc-reject', severity: 'OK' });
  });
});

describe('checkDomain', () => {
  it('assemble les constats d\'un domaine mal protégé, du plus grave au moins grave', async () => {
    const out = await checkDomain('exemple.fr', resolver({ 'exemple.fr': ['v=spf1 +all'] }));
    if ('error' in out) throw new Error(out.error);
    const sorted = sortFindings(out.findings);
    expect(sorted[0].severity).toBe('Critique');
    expect(out.findings.map((f) => f.id)).toContain('dmarc-missing');
  });
  it('refuse un domaine invalide sans interroger le DNS', async () => {
    let called = false;
    const spy = { resolveTxt: async () => { called = true; return []; }, resolveMx: async () => { called = true; return []; } };
    expect(await checkDomain('http://exemple.fr', spy)).toHaveProperty('error');
    expect(called).toBe(false);
  });
  it('renvoie une erreur générique si le DNS tombe, sans détail technique', async () => {
    const broken = { resolveTxt: async () => { throw Object.assign(new Error('SERVFAIL interne 10.0.0.1'), { code: 'ESERVFAIL' }); }, resolveMx: async () => [] };
    const out = await checkDomain('exemple.fr', broken);
    expect(out).toEqual({ error: 'Résolution DNS impossible pour le moment. Réessaie plus tard.' });
  });
});

describe('suggestAnswers', () => {
  const mk = (id: string, question: string, answer: string, status = 'Brouillon', date = '2026-01-01') =>
    ({ id, question, answer, isNotApplicable: false, notApplicableReason: null, status, answeredAt: new Date(date) });
  const bank = [
    mk('1', 'Les sauvegardes sont-elles chiffrées et testées ?', 'Oui, chiffrées, restauration testée chaque trimestre.'),
    mk('2', 'Une double authentification est-elle exigée pour les accès distants ?', 'Oui pour la messagerie et le VPN.', 'Validé'),
    mk('3', 'Quel est votre hébergeur de données ?', 'Hébergement en France.'),
  ];
  it('retrouve la réponse la plus proche, sans tenir compte des accents ni de la casse', () => {
    const out = suggestAnswers('Vos sauvegardes sont elles CHIFFREES ?', bank);
    expect(out[0].answer.id).toBe('1');
  });
  it('ne renvoie rien quand aucune réponse ne ressemble à la question', () => {
    expect(suggestAnswers('Disposez-vous d\'une certification ISO 27001 ?', bank)).toEqual([]);
    expect(suggestAnswers('???', bank)).toEqual([]);
  });
  it('préfère la réponse validée à un brouillon de pertinence égale', () => {
    const dup = [mk('a', 'Double authentification accès distants', 'Brouillon A'), mk('b', 'Double authentification accès distants', 'Validée B', 'Validé')];
    expect(suggestAnswers('Double authentification accès distants', dup)[0].answer.id).toBe('b');
  });
});
