// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { GET as LIST_ORGS, POST as CREATE_ORG } from '@/app/api/organizations/route';
import { POST as SHARE } from '@/app/api/audits/[id]/share/route';
import { GET as CLIENT_LIST } from '@/app/api/client/audits/route';
import { GET as CLIENT_GET } from '@/app/api/client/audits/[id]/route';
import { GET as OWNER_GET } from '@/app/api/audits/[id]/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id,
  email: `${id}@exemple.fr`,
  name: 'Client',
  role: 'client',
  organizationId,
});
const clientX = clientOf('org-x');
const clientY = clientOf('org-y');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const json = (body: unknown) => ({
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'content-type': 'application/json' },
});

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  tables.audit.push(
    // audit de X partagé
    { id: 'a-x-shared', userId: admin.id, organizationId: 'org-x', sharedWithClient: true, score: 70, maturity: 'Bonne', recommendations: 'reco-X', actionPlan: '[]', createdAt: new Date('2026-02-01') },
    // audit de X NON partagé (brouillon interne)
    { id: 'a-x-draft', userId: admin.id, organizationId: 'org-x', sharedWithClient: false, score: 20, maturity: 'Faible', recommendations: 'brouillon-interne', createdAt: new Date('2026-02-02') },
    // audit de Y partagé
    { id: 'a-y-shared', userId: admin.id, organizationId: 'org-y', sharedWithClient: true, score: 55, maturity: 'Moyenne', recommendations: 'reco-Y', createdAt: new Date('2026-02-03') },
    // audit sans organisation
    { id: 'a-none', userId: admin.id, organizationId: null, sharedWithClient: true, score: 10, maturity: 'x', recommendations: 'sans-org', createdAt: new Date('2026-02-04') }
  );
});

describe('espace client : cloisonnement par organisation', () => {
  it('le client X ne voit que ses audits partagés', async () => {
    loginAs(clientX);
    const res = await CLIENT_LIST(req('/api/client/audits'), ctx({}));
    expect(res.status).toBe(200);
    const ids = (await res.json()).map((a: { id: string }) => a.id);
    expect(ids).toEqual(['a-x-shared']);
  });

  it("le client X lit le détail d'un audit partagé de son organisation", async () => {
    loginAs(clientX);
    const res = await CLIENT_GET(req('/api/client/audits/a-x-shared'), ctx({ id: 'a-x-shared' }));
    expect(res.status).toBe(200);
    expect((await res.json()).recommendations).toBe('reco-X');
  });

  it.each(['a-x-draft', 'a-y-shared', 'a-none'])(
    'le client X reçoit 404 sur %s (non partagé, autre client ou sans client)',
    async (id) => {
      loginAs(clientX);
      const res = await CLIENT_GET(req(`/api/client/audits/${id}`), ctx({ id }));
      expect(res.status).toBe(404);
      const text = JSON.stringify(await res.json());
      expect(text).not.toMatch(/reco-Y|brouillon-interne|sans-org/);
    }
  );

  it('le client Y ne voit pas les audits de X', async () => {
    loginAs(clientY);
    const res = await CLIENT_GET(req('/api/client/audits/a-x-shared'), ctx({ id: 'a-x-shared' }));
    expect(res.status).toBe(404);
  });

  it("un compte client sans organisation ne voit rien (403), pas tous les audits", async () => {
    loginAs(clientOf(null, 'client-orphan'));
    const list = await CLIENT_LIST(req('/api/client/audits'), ctx({}));
    expect(list.status).toBe(403);
    const one = await CLIENT_GET(req('/api/client/audits/a-none'), ctx({ id: 'a-none' }));
    expect(one.status).toBe(403);
  });

  it("le client n'a pas accès aux routes d'audit du propriétaire", async () => {
    loginAs(clientX);
    const res = await OWNER_GET(req('/api/audits/a-x-shared'), ctx({ id: 'a-x-shared' }));
    expect(res.status).toBe(404);
  });

  it("un non-client (admin) n'utilise pas les routes client", async () => {
    loginAs(admin);
    expect((await CLIENT_LIST(req('/api/client/audits'), ctx({}))).status).toBe(403);
  });

  it('401 sans session', async () => {
    loginAs(null);
    expect((await CLIENT_LIST(req('/api/client/audits'), ctx({}))).status).toBe(401);
  });
});

describe('gestion des clients et du partage (admin)', () => {
  it("un client ou un utilisateur simple ne peut ni créer ni lister les organisations", async () => {
    for (const u of [clientX, userA]) {
      loginAs(u);
      expect((await LIST_ORGS(req('/api/organizations'), ctx({}))).status).toBe(403);
      expect((await CREATE_ORG(req('/api/organizations', json({ name: 'Nouveau' })), ctx({}))).status).toBe(403);
    }
  });

  it("l'admin crée un client", async () => {
    loginAs(admin);
    const res = await CREATE_ORG(req('/api/organizations', json({ name: 'Société Z', sector: 'Industrie' })), ctx({}));
    expect(res.status).toBe(201);
    expect(tables.organization.some((o) => o.name === 'Société Z')).toBe(true);
    expect((await CREATE_ORG(req('/api/organizations', json({ name: 'x' })), ctx({}))).status).toBe(400);
  });

  it("l'admin partage un audit à un client, qui le voit alors", async () => {
    loginAs(admin);
    const res = await SHARE(
      req('/api/audits/a-x-draft/share', json({ organizationId: 'org-x', shared: true })),
      ctx({ id: 'a-x-draft' })
    );
    expect(res.status).toBe(200);
    loginAs(clientX);
    const list = await CLIENT_LIST(req('/api/client/audits'), ctx({}));
    expect((await list.json()).map((a: { id: string }) => a.id).sort()).toEqual(['a-x-draft', 'a-x-shared']);
  });

  it("le client ne peut pas partager ni rattacher un audit", async () => {
    loginAs(clientX);
    const res = await SHARE(
      req('/api/audits/a-x-draft/share', json({ organizationId: 'org-x', shared: true })),
      ctx({ id: 'a-x-draft' })
    );
    expect(res.status).toBe(403);
    expect(tables.audit.find((a) => a.id === 'a-x-draft')?.sharedWithClient).toBe(false);
  });

  it("un autre admin ne peut pas partager l'audit d'un admin tiers (404)", async () => {
    loginAs({ ...admin, id: 'admin-2' });
    const res = await SHARE(
      req('/api/audits/a-x-draft/share', json({ organizationId: 'org-x', shared: true })),
      ctx({ id: 'a-x-draft' })
    );
    expect(res.status).toBe(404);
  });
});
