// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { analyzeCertificate, analyzeHeaders, analyzeHttpPort, runExternalScan, type ScanDeps } from '@/lib/scan/checks';
import type { CertInfo, HttpProbe } from '@/lib/scan/safe-net';

const now = new Date('2026-11-10T12:00:00Z');
const goodCert: CertInfo = {
  authorized: true, authorizationError: null, hostnameMismatch: false, protocol: 'TLSv1.3',
  validFrom: new Date('2026-10-01'), validTo: new Date('2027-01-10'), issuer: "Let's Encrypt",
};
const ids = (findings: Array<{ id: string }>) => findings.map((f) => f.id);
const byId = <T extends { id: string }>(findings: T[], id: string) => findings.find((f) => f.id === id);

describe('analyzeCertificate', () => {
  it('certificat sain : OK', () => {
    const f = analyzeCertificate(goodCert, now);
    expect(byId(f, 'tls-validity')?.severity).toBe('OK');
    expect(byId(f, 'tls-protocol')?.severity).toBe('OK');
    expect(byId(f, 'tls-legacy-untested')?.severity).toBe('Info');
  });
  it('expiré = Critique, et sans doublon « non reconnu »', () => {
    const f = analyzeCertificate({ ...goodCert, authorized: false, authorizationError: 'CERT_HAS_EXPIRED', validTo: new Date('2026-11-01') }, now);
    expect(byId(f, 'tls-expired')?.severity).toBe('Critique');
    expect(byId(f, 'tls-untrusted')).toBeUndefined();
  });
  it('expiration proche : Haute sous 15 jours, Moyenne sous 30 jours', () => {
    expect(byId(analyzeCertificate({ ...goodCert, validTo: new Date('2026-11-20') }, now), 'tls-expiring')?.severity).toBe('Haute');
    expect(byId(analyzeCertificate({ ...goodCert, validTo: new Date('2026-12-05') }, now), 'tls-expiring')?.severity).toBe('Moyenne');
  });
  it('auto-signé, mauvais nom et vieux protocole sont signalés', () => {
    const f = analyzeCertificate({ ...goodCert, authorized: false, authorizationError: 'DEPTH_ZERO_SELF_SIGNED_CERT', hostnameMismatch: true, protocol: 'TLSv1' }, now);
    expect(ids(f)).toEqual(expect.arrayContaining(['tls-untrusted', 'tls-hostname', 'tls-old-protocol']));
  });
});

describe('analyzeHeaders', () => {
  const complete: HttpProbe['headers'] = {
    'strict-transport-security': 'max-age=63072000; includeSubDomains',
    'content-security-policy': "default-src 'self'; frame-ancestors 'none'",
    'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'permissions-policy': 'camera=()',
  };
  it('site bien configuré : aucun constat à corriger', () => {
    const f = analyzeHeaders(complete);
    expect(f.filter((x) => x.severity !== 'OK')).toEqual([]);
  });
  it('en-têtes absents : HSTS et CSP Moyenne, durcissement regroupé en Info', () => {
    const f = analyzeHeaders({});
    expect(byId(f, 'hsts-missing')?.severity).toBe('Moyenne');
    expect(byId(f, 'csp-missing')?.severity).toBe('Moyenne');
    expect(byId(f, 'headers-hardening')?.severity).toBe('Info');
  });
  it('HSTS trop court et CSP affaiblie', () => {
    const f = analyzeHeaders({ ...complete, 'strict-transport-security': 'max-age=300', 'content-security-policy': "default-src 'self' 'unsafe-inline'" });
    expect(byId(f, 'hsts-short')).toBeDefined();
    expect(byId(f, 'csp-weak')).toBeDefined();
  });
  it('version exposée : Moyenne ; simple X-Powered-By sans version : Info', () => {
    expect(byId(analyzeHeaders({ ...complete, server: 'Apache/2.4.49 (Unix)' }), 'version-disclosure')?.severity).toBe('Moyenne');
    expect(byId(analyzeHeaders({ ...complete, 'x-powered-by': 'Express' }), 'version-disclosure')?.severity).toBe('Info');
    expect(byId(analyzeHeaders({ ...complete, server: 'nginx' }), 'version-disclosure')).toBeUndefined();
  });
  it('cookies : signale les noms, JAMAIS les valeurs', () => {
    const f = analyzeHeaders({ ...complete, 'set-cookie': ['sessionid=SECRETVALUE123; Path=/', 'prefs=dark; Secure; HttpOnly'] });
    const secure = byId(f, 'cookie-secure');
    const httpOnly = byId(f, 'cookie-httponly');
    expect(secure?.evidence).toContain('sessionid');
    expect(secure?.evidence).not.toContain('prefs');
    expect(httpOnly?.evidence).toContain('sessionid');
    expect(JSON.stringify(f)).not.toContain('SECRETVALUE123');
  });
  it('CORS : joker avec identifiants = Haute, joker seul = Info', () => {
    expect(byId(analyzeHeaders({ ...complete, 'access-control-allow-origin': '*', 'access-control-allow-credentials': 'true' }), 'cors-credentials')?.severity).toBe('Haute');
    expect(byId(analyzeHeaders({ ...complete, 'access-control-allow-origin': '*' }), 'cors-wildcard')?.severity).toBe('Info');
  });
});

describe('analyzeHttpPort', () => {
  const probe = (status: number, location?: string): HttpProbe => ({ status, headers: location ? { location } : {}, body: '' });
  it('redirection vers https = OK ; réponse en clair = Haute ; redirection non https = Moyenne', () => {
    expect(analyzeHttpPort(probe(301, 'https://exemple.fr/'))[0].severity).toBe('OK');
    expect(analyzeHttpPort(probe(200))[0].severity).toBe('Haute');
    expect(analyzeHttpPort(probe(302, 'http://autre.fr/'))[0].severity).toBe('Moyenne');
    expect(analyzeHttpPort(probe(404))).toEqual([]);
  });
});

function makeDeps(overrides: Partial<ScanDeps> = {}): ScanDeps & { tls: ReturnType<typeof vi.fn>; http: ReturnType<typeof vi.fn> } {
  const tls = vi.fn(async () => goodCert);
  const http = vi.fn(async ({ port, path }: { port: number; path: string }): Promise<HttpProbe> => {
    if (port === 80) return { status: 301, headers: { location: 'https://exemple.fr/' }, body: '' };
    if (path === '/.well-known/security.txt') return { status: 200, headers: {}, body: 'Contact: mailto:secu@exemple.fr\n' };
    return { status: 200, headers: { 'strict-transport-security': 'max-age=63072000', 'content-security-policy': "default-src 'self'; frame-ancestors 'none'", 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'permissions-policy': 'camera=()' }, body: '' };
  });
  return {
    lookup: async () => [{ address: '93.184.216.34', family: 4 }],
    resolver: {
      resolveTxt: async (name: string) => (name === 'exemple.fr' ? [['v=spf1 include:_spf.exemple.fr -all']] : [['v=DMARC1; p=reject; rua=mailto:d@exemple.fr']]),
      resolveMx: async () => [{ exchange: 'mx.exemple.fr', priority: 10 }],
      resolveCaa: async () => [{ critical: 0, issue: 'letsencrypt.org' }],
    },
    tlsProbe: tls as never, httpProbe: http as never, tls, http, ...overrides,
  } as never;
}

describe('runExternalScan', () => {
  it('domaine bien configuré : uniquement des constats OK ou Info', async () => {
    const result = await runExternalScan('Exemple.FR', { checkDns: true }, makeDeps(), now);
    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.host).toBe('exemple.fr');
    expect(result.addresses).toEqual(['93.184.216.34']);
    expect(result.findings.filter((f) => ['Critique', 'Haute', 'Moyenne'].includes(f.severity))).toEqual([]);
    expect(ids(result.findings)).toEqual(expect.arrayContaining(['spf-ok', 'dmarc-reject', 'caa-ok', 'tls-validity', 'hsts-ok', 'http-redirect', 'security-txt']));
  });

  it('refuse une adresse IP, une URL, localhost : aucune sonde lancée', async () => {
    const deps = makeDeps();
    for (const bad of ['127.0.0.1', 'http://exemple.fr', 'localhost', '10.0.0.1', '[::1]', 'a.internal']) {
      expect('error' in (await runExternalScan(bad, { checkDns: true }, deps, now))).toBe(true);
    }
    expect(deps.tls).not.toHaveBeenCalled();
    expect(deps.http).not.toHaveBeenCalled();
  });

  it('refuse un nom qui pointe vers une adresse interne, sans aucune connexion (SSRF)', async () => {
    for (const address of ['127.0.0.1', '169.254.169.254', '10.1.1.1', '::1', '::ffff:192.168.0.1']) {
      const deps = makeDeps({ lookup: async () => [{ address, family: address.includes(':') ? 6 : 4 }] });
      const result = await runExternalScan('piege.fr', { checkDns: true }, deps, now);
      expect('error' in result && result.error).toMatch(/non publique/);
      expect((deps as never as { tls: ReturnType<typeof vi.fn> }).tls).not.toHaveBeenCalled();
      expect((deps as never as { http: ReturnType<typeof vi.fn> }).http).not.toHaveBeenCalled();
    }
  });

  it('ne contacte que les ports 80 et 443 de l\'adresse validée, avec des chemins figés', async () => {
    const deps = makeDeps();
    await runExternalScan('exemple.fr', { checkDns: false }, deps, now);
    const calls = deps.http.mock.calls.map(([o]) => `${o.address.address}:${o.port}${o.path}`);
    expect(calls.sort()).toEqual(['93.184.216.34:443/', '93.184.216.34:443/.well-known/security.txt', '93.184.216.34:80/'].sort());
  });

  it('checkDns: false ne fait aucune requête DNS de messagerie', async () => {
    const resolveTxt = vi.fn(async () => [] as string[][]);
    const deps = makeDeps({ resolver: { resolveTxt, resolveMx: async () => [], resolveCaa: async () => [] } });
    const result = await runExternalScan('www.exemple.fr', { checkDns: false }, deps, now);
    expect(resolveTxt).not.toHaveBeenCalled();
    expect('error' in result ? [] : ids(result.findings)).not.toContain('spf-missing');
  });

  it('HTTPS en panne alors que HTTP répond : constat « HTTPS indisponible »', async () => {
    const deps = makeDeps({
      tlsProbe: async () => { throw new Error('ECONNREFUSED'); },
      httpProbe: async ({ port }) => { if (port === 80) return { status: 200, headers: {}, body: '' }; throw new Error('ECONNREFUSED'); },
    });
    const result = await runExternalScan('exemple.fr', { checkDns: false }, deps, now);
    expect('error' in result ? [] : ids(result.findings)).toEqual(expect.arrayContaining(['https-absent', 'http-no-redirect']));
  });

  it('aucun service web : simple information', async () => {
    const deps = makeDeps({ tlsProbe: async () => { throw new Error('x'); }, httpProbe: async () => { throw new Error('x'); } });
    const result = await runExternalScan('exemple.fr', { checkDns: false }, deps, now);
    expect('error' in result ? [] : ids(result.findings)).toEqual(['web-none']);
  });

  it('classe les constats du plus grave au moins grave', async () => {
    const deps = makeDeps({ httpProbe: async ({ port }) => (port === 80 ? { status: 200, headers: {}, body: '' } : { status: 200, headers: {}, body: '' }) });
    const result = await runExternalScan('exemple.fr', { checkDns: true }, deps, now);
    if ('error' in result) throw new Error('inattendu');
    const order = ['Critique', 'Haute', 'Moyenne', 'Info', 'OK'];
    const ranks = result.findings.map((f) => order.indexOf(f.severity));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});
