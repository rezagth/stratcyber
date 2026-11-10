// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/scan/checks', () => ({ runExternalScan: vi.fn() }));

import { runExternalScan } from '@/lib/scan/checks';
import { GET as LIST, POST as CREATE } from '@/app/api/organizations/[id]/scan-campaigns/route';
import { DELETE as DELETE_CAMPAIGN, GET as DETAIL, PATCH as PATCH_CAMPAIGN } from '@/app/api/scan-campaigns/[id]/route';
import { POST as ADD_TARGET } from '@/app/api/scan-campaigns/[id]/targets/route';
import { DELETE as REMOVE_TARGET } from '@/app/api/scan-campaigns/[id]/targets/[targetId]/route';
import { POST as RUN } from '@/app/api/scan-campaigns/[id]/run/route';
import { POST as MANUAL } from '@/app/api/scan-campaigns/[id]/findings/route';
import { DELETE as DELETE_FINDING, PATCH as PATCH_FINDING } from '@/app/api/scan-findings/[id]/route';

const json = (method: string, body?: unknown) => ({ method, body: body === undefined ? undefined : JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
const AUTH = { authorizedByName: 'Camille Martin', authorizedByRole: 'Dirigeante', authorizationRef: 'Lettre-signee.pdf', authorizedAt: iso(-1), windowStart: iso(-1), windowEnd: iso(5) };

const scanResult = {
  host: 'exemple.fr', addresses: ['93.184.216.34'],
  findings: [
    { id: 'hsts-missing', severity: 'Moyenne', title: 'HSTS absent', detail: 'Pas de HSTS.' },
    { id: 'tls-validity', severity: 'OK', title: 'Certificat HTTPS valide', detail: 'Valable.' },
  ],
};

async function newCampaign(orgId = 'org-x') {
  const res = await CREATE(req(`/x`, json('POST', { name: 'Campagne novembre' })), ctx({ id: orgId }));
  return (await res.json()).id as string;
}
async function addTarget(id: string, host = 'exemple.fr', extra: object = {}) {
  const res = await ADD_TARGET(req('/x', json('POST', { host, ...extra })), ctx({ id }));
  return { status: res.status, body: await res.json() };
}
async function authorize(id: string) {
  await PATCH_CAMPAIGN(req('/x', json('PATCH', AUTH)), ctx({ id }));
  return PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Autorisée' })), ctx({ id }));
}
async function readyCampaign() {
  const id = await newCampaign();
  const target = await addTarget(id);
  const res = await authorize(id);
  expect(res.status).toBe(200);
  return { id, targetId: target.body.id as string };
}

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  vi.mocked(runExternalScan).mockReset();
  vi.mocked(runExternalScan).mockResolvedValue(scanResult as never);
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  loginAs(admin);
});

describe('accès', () => {
  it('refuse les non-administrateurs et les visiteurs sans session sur toutes les routes', async () => {
    const id = await newCampaign();
    const calls = () => [
      LIST(req('/x'), ctx({ id: 'org-x' })),
      CREATE(req('/x', json('POST', { name: 'N' })), ctx({ id: 'org-x' })),
      DETAIL(req('/x'), ctx({ id })),
      PATCH_CAMPAIGN(req('/x', json('PATCH', { name: 'N' })), ctx({ id })),
      DELETE_CAMPAIGN(req('/x', json('DELETE')), ctx({ id })),
      ADD_TARGET(req('/x', json('POST', { host: 'exemple.fr' })), ctx({ id })),
      REMOVE_TARGET(req('/x', json('DELETE')), ctx({ id, targetId: 't' })),
      RUN(req('/x', json('POST', { targetId: 't' })), ctx({ id })),
      MANUAL(req('/x', json('POST', {})), ctx({ id })),
      PATCH_FINDING(req('/x', json('PATCH', { status: 'Retenu' })), ctx({ id: 'f' })),
      DELETE_FINDING(req('/x', json('DELETE')), ctx({ id: 'f' })),
    ];
    loginAs(userA);
    for (const res of await Promise.all(calls())) expect(res.status).toBe(403);
    vi.mocked(getServerSession).mockResolvedValue(null);
    for (const res of await Promise.all(calls())) expect(res.status).toBe(401);
    expect(runExternalScan).not.toHaveBeenCalled();
  });
});

describe('campagnes', () => {
  it('crée en brouillon, liste par client, 404 pour un client inconnu', async () => {
    const id = await newCampaign('org-x');
    expect(tables.scanCampaign.find((c) => c.id === id)?.status).toBe('Brouillon');
    expect((await CREATE(req('/x', json('POST', { name: 'N' })), ctx({ id: 'nope' }))).status).toBe(404);
    expect((await CREATE(req('/x', json('POST', { name: '' })), ctx({ id: 'org-x' }))).status).toBe(400);
    const mine = await (await LIST(req('/x'), ctx({ id: 'org-x' }))).json();
    const other = await (await LIST(req('/x'), ctx({ id: 'org-y' }))).json();
    expect(mine).toHaveLength(1);
    expect(other).toHaveLength(0);
  });

  it('refuse de confirmer l\'autorisation tant qu\'elle est incomplète ou sans domaine au périmètre', async () => {
    const id = await newCampaign();
    const incomplete = await PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Autorisée' })), ctx({ id }));
    expect(incomplete.status).toBe(400);
    expect((await incomplete.json()).error).toMatch(/incomplète/);
    await PATCH_CAMPAIGN(req('/x', json('PATCH', AUTH)), ctx({ id }));
    const noTarget = await PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Autorisée' })), ctx({ id }));
    expect(noTarget.status).toBe(400);
    expect((await noTarget.json()).error).toMatch(/domaine/);
    await addTarget(id);
    expect((await PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Autorisée' })), ctx({ id }))).status).toBe(200);
  });

  it('refuse une période trop longue, inversée, ou une signature future', async () => {
    const id = await newCampaign();
    for (const body of [
      { windowStart: iso(0), windowEnd: iso(200) }, { windowStart: iso(5), windowEnd: iso(1) }, { authorizedAt: iso(30) }, { windowEnd: 'pas une date' },
    ]) {
      expect((await PATCH_CAMPAIGN(req('/x', json('PATCH', body)), ctx({ id }))).status).toBe(400);
    }
  });

  it('modifier l\'autorisation d\'une campagne autorisée la remet en brouillon', async () => {
    const { id } = await readyCampaign();
    const res = await PATCH_CAMPAIGN(req('/x', json('PATCH', { windowEnd: iso(10) })), ctx({ id }));
    expect((await res.json()).status).toBe('Brouillon');
    // modifier seulement le nom ou les notes ne retire rien
    await authorize(id);
    const rename = await PATCH_CAMPAIGN(req('/x', json('PATCH', { name: 'Autre nom' })), ctx({ id }));
    expect((await rename.json()).status).toBe('Autorisée');
  });

  it('une campagne terminée n\'accepte plus que des notes', async () => {
    const { id } = await readyCampaign();
    await PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Terminée' })), ctx({ id }));
    expect((await PATCH_CAMPAIGN(req('/x', json('PATCH', { status: 'Autorisée' })), ctx({ id }))).status).toBe(400);
    expect((await PATCH_CAMPAIGN(req('/x', json('PATCH', { windowEnd: iso(9) })), ctx({ id }))).status).toBe(400);
    expect((await PATCH_CAMPAIGN(req('/x', json('PATCH', { notes: 'Rapport remis le 12/11' })), ctx({ id }))).status).toBe(200);
    expect((await ADD_TARGET(req('/x', json('POST', { host: 'autre.fr' })), ctx({ id }))).status).toBe(400);
  });

  it('la suppression retire campagne, périmètre et constats', async () => {
    const { id, targetId } = await readyCampaign();
    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    expect(tables.scanFinding.length).toBeGreaterThan(0);
    expect((await DELETE_CAMPAIGN(req('/x', json('DELETE')), ctx({ id }))).status).toBe(200);
    expect(tables.scanCampaign).toHaveLength(0);
    expect(tables.scanTarget).toHaveLength(0);
    expect(tables.scanFinding).toHaveLength(0);
  });
});

describe('périmètre', () => {
  it('refuse adresses IP, URL, localhost et noms invalides ; accepte et normalise un domaine', async () => {
    const id = await newCampaign();
    for (const host of ['127.0.0.1', 'http://exemple.fr', 'localhost', '10.0.0.5', 'a b.fr', '', null]) {
      expect((await addTarget(id, host as string)).status).toBe(400);
    }
    const ok = await addTarget(id, '  Exemple.FR ');
    expect(ok.status).toBe(201);
    expect(ok.body.host).toBe('exemple.fr');
  });
  it('refuse un doublon (409) et plus de 10 domaines', async () => {
    const id = await newCampaign();
    await addTarget(id, 'exemple.fr');
    expect((await addTarget(id, 'exemple.fr')).status).toBe(409);
    for (let i = 1; i < 10; i++) expect((await addTarget(id, `site${i}.fr`)).status).toBe(201);
    expect((await addTarget(id, 'trop.fr')).status).toBe(400);
  });
  it('ajouter un domaine après l\'autorisation la retire ; en retirer un non', async () => {
    const { id, targetId } = await readyCampaign();
    const added = await addTarget(id, 'nouveau.fr');
    expect(added.body.authorizationReset).toBe(true);
    expect(tables.scanCampaign.find((c) => c.id === id)?.status).toBe('Brouillon');
    await authorize(id);
    expect((await REMOVE_TARGET(req('/x', json('DELETE')), ctx({ id, targetId: added.body.id }))).status).toBe(200);
    expect(tables.scanCampaign.find((c) => c.id === id)?.status).toBe('Autorisée');
    expect((await REMOVE_TARGET(req('/x', json('DELETE')), ctx({ id, targetId: 'inconnu' }))).status).toBe(404);
    expect(targetId).toBeTruthy();
  });
  it('ne retire pas le domaine d\'une autre campagne', async () => {
    const a = await readyCampaign();
    const b = await newCampaign('org-y');
    expect((await REMOVE_TARGET(req('/x', json('DELETE')), ctx({ id: b, targetId: a.targetId }))).status).toBe(404);
    expect(tables.scanTarget).toHaveLength(1);
  });
});

describe('lancement d\'un contrôle', () => {
  it('REFUSE (403) sans autorisation confirmée : rien n\'est contacté', async () => {
    const id = await newCampaign();
    const target = await addTarget(id);
    const res = await RUN(req('/x', json('POST', { targetId: target.body.id })), ctx({ id }));
    expect(res.status).toBe(403);
    expect(runExternalScan).not.toHaveBeenCalled();
    expect(tables.scanFinding).toHaveLength(0);
  });

  it('REFUSE hors de la période autorisée, même avec le statut « Autorisée »', async () => {
    const { id, targetId } = await readyCampaign();
    const campaign = tables.scanCampaign.find((c) => c.id === id)!;
    campaign.windowStart = new Date(Date.now() - 10 * 86_400_000);
    campaign.windowEnd = new Date(Date.now() - 5 * 86_400_000);
    const res = await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/terminée/);
    expect(runExternalScan).not.toHaveBeenCalled();
  });

  it('ne contrôle qu\'un domaine du périmètre de CETTE campagne (identifiant, jamais un nom libre)', async () => {
    const a = await readyCampaign();
    const other = await newCampaign('org-y');
    await addTarget(other, 'autre-client.fr');
    const foreign = tables.scanTarget.find((t) => t.host === 'autre-client.fr')!;
    expect((await RUN(req('/x', json('POST', { targetId: foreign.id })), ctx({ id: a.id }))).status).toBe(404);
    expect((await RUN(req('/x', json('POST', { host: 'victime.fr' })), ctx({ id: a.id }))).status).toBe(404);
    expect(runExternalScan).not.toHaveBeenCalled();
  });

  it('enregistre les constats, journalise le domaine et les adresses, limite à un contrôle par minute', async () => {
    const { id, targetId } = await readyCampaign();
    const res = await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    expect(res.status).toBe(200);
    expect(vi.mocked(runExternalScan)).toHaveBeenCalledWith('exemple.fr', { checkDns: true });
    expect(tables.scanFinding.map((f) => f.checkId).sort()).toEqual(['hsts-missing', 'tls-validity']);
    expect(tables.scanFinding.every((f) => f.campaignId === id && f.targetHost === 'exemple.fr' && f.status === 'Nouveau')).toBe(true);
    const log = tables.activityLog.find((l) => l.action === 'scan.run');
    expect(JSON.parse(log!.metadata)).toMatchObject({ host: 'exemple.fr', ips: '93.184.216.34', findings: 2 });
    expect((await RUN(req('/x', json('POST', { targetId })), ctx({ id }))).status).toBe(429);
  });

  it('un second contrôle met à jour sans doublon, garde les constats déjà traités et retire les corrigés', async () => {
    const { id, targetId } = await readyCampaign();
    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    const hsts = tables.scanFinding.find((f) => f.checkId === 'hsts-missing')!;
    await PATCH_FINDING(req('/x', json('PATCH', { status: 'Écarté' })), ctx({ id: hsts.id }));
    tables.scanTarget[0].lastRunAt = new Date(Date.now() - 120_000);
    vi.mocked(runExternalScan).mockResolvedValue({ ...scanResult, findings: [{ id: 'csp-missing', severity: 'Moyenne', title: 'CSP absente', detail: 'x' }] } as never);
    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    expect(tables.scanFinding.map((f) => f.checkId).sort()).toEqual(['csp-missing', 'hsts-missing']);
    expect(tables.scanFinding.find((f) => f.checkId === 'hsts-missing')?.status).toBe('Écarté');
  });

  it('transmet l\'erreur du moteur (domaine non public) en 400 sans rien enregistrer', async () => {
    const { id, targetId } = await readyCampaign();
    vi.mocked(runExternalScan).mockResolvedValue({ error: 'exemple.fr pointe vers une adresse non publique : contrôle refusé par sécurité.' });
    const res = await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    expect(res.status).toBe(400);
    expect(tables.scanFinding).toHaveLength(0);
  });
});

describe('constats', () => {
  it('« Retenir » crée une vulnérabilité ET une action liées, une seule fois ; l\'OK est refusé', async () => {
    const { id, targetId } = await readyCampaign();
    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    const hsts = tables.scanFinding.find((f) => f.checkId === 'hsts-missing')!;
    const ok = tables.scanFinding.find((f) => f.checkId === 'tls-validity')!;
    expect((await PATCH_FINDING(req('/x', json('PATCH', { status: 'Retenu' })), ctx({ id: ok.id }))).status).toBe(400);
    expect((await PATCH_FINDING(req('/x', json('PATCH', { status: 'n\'importe quoi' })), ctx({ id: hsts.id }))).status).toBe(400);

    expect((await PATCH_FINDING(req('/x', json('PATCH', { status: 'Retenu' })), ctx({ id: hsts.id }))).status).toBe(200);
    expect(tables.clientVulnerability).toHaveLength(1);
    expect(tables.actionPlanItem).toHaveLength(1);
    const vuln = tables.clientVulnerability[0];
    expect(vuln).toMatchObject({ organizationId: 'org-x', severity: 'Moyenne', status: 'Ouverte', title: 'HSTS absent (exemple.fr)' });
    expect(vuln.actionPlanItemId).toBe(tables.actionPlanItem[0].id);
    expect(tables.actionPlanItem[0]).toMatchObject({ organizationId: 'org-x', category: 'Technique', priority: 'Moyenne' });

    await PATCH_FINDING(req('/x', json('PATCH', { status: 'Écarté' })), ctx({ id: hsts.id }));
    await PATCH_FINDING(req('/x', json('PATCH', { status: 'Retenu' })), ctx({ id: hsts.id }));
    expect(tables.clientVulnerability).toHaveLength(1);
    expect(tables.actionPlanItem).toHaveLength(1);
  });

  it('« Info » devient une gravité « Faible » au registre', async () => {
    const { id, targetId } = await readyCampaign();
    vi.mocked(runExternalScan).mockResolvedValue({ ...scanResult, findings: [{ id: 'caa-missing', severity: 'Info', title: 'Aucun CAA', detail: 'x' }] } as never);
    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    await PATCH_FINDING(req('/x', json('PATCH', { status: 'Retenu' })), ctx({ id: tables.scanFinding[0].id }));
    expect(tables.clientVulnerability[0].severity).toBe('Faible');
    expect(tables.actionPlanItem[0].priority).toBe('Faible');
  });

  it('constat manuel : seulement pour un domaine du périmètre, et supprimable seulement s\'il est manuel', async () => {
    const { id, targetId } = await readyCampaign();
    const good = { targetHost: 'exemple.fr', title: 'Port 3389 ouvert', severity: 'Haute', detail: 'Le bureau à distance est exposé.', evidence: '3389/tcp open ms-wbt-server' };
    expect((await MANUAL(req('/x', json('POST', { ...good, targetHost: 'autre.fr' })), ctx({ id }))).status).toBe(400);
    expect((await MANUAL(req('/x', json('POST', { ...good, severity: 'OK' })), ctx({ id }))).status).toBe(400);
    expect((await MANUAL(req('/x', json('POST', { ...good, title: '' })), ctx({ id }))).status).toBe(400);
    const created = await MANUAL(req('/x', json('POST', good)), ctx({ id }));
    expect(created.status).toBe(201);
    const manual = await created.json();
    expect(manual.source).toBe('manuel');

    await RUN(req('/x', json('POST', { targetId })), ctx({ id }));
    const auto = tables.scanFinding.find((f) => f.source === 'auto')!;
    expect((await DELETE_FINDING(req('/x', json('DELETE')), ctx({ id: auto.id }))).status).toBe(400);
    expect((await DELETE_FINDING(req('/x', json('DELETE')), ctx({ id: manual.id }))).status).toBe(200);
  });

  it('GET détaille la campagne avec la raison d\'un lancement impossible et trie les constats par gravité', async () => {
    const id = await newCampaign();
    await addTarget(id);
    const draft = await (await DETAIL(req('/x'), ctx({ id }))).json();
    expect(draft.launchProblem).toMatch(/pas confirmée/);
    const ready = await readyCampaign();
    await RUN(req('/x', json('POST', { targetId: ready.targetId })), ctx({ id: ready.id }));
    const detail = await (await DETAIL(req('/x'), ctx({ id: ready.id }))).json();
    expect(detail.launchProblem).toBeNull();
    expect(detail.findings.map((f: { severity: string }) => f.severity)).toEqual(['Moyenne', 'OK']);
    expect((await DETAIL(req('/x'), ctx({ id: 'inconnue' }))).status).toBe(404);
  });
});
