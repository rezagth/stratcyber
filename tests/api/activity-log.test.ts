// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { POST as CREATE_ORG } from '@/app/api/organizations/route';
import { POST as SHARE } from '@/app/api/audits/[id]/share/route';
import { POST as REGISTER } from '@/app/api/auth/register/route';
import { GET as CLIENT_GET } from '@/app/api/client/audits/[id]/route';
import { GET as LOGS } from '@/app/api/admin/activity/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const client = { id: 'c1', email: 'c1@exemple.fr', name: 'C', role: 'client', organizationId: 'org-x' };
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'X' });
  tables.audit.push({ id: 'a1', userId: admin.id, organizationId: 'org-x', sharedWithClient: true, score: 50, maturity: 'Moyenne' });
});

describe("journal des actions", () => {
  it('trace la création de client, le partage, la création de compte et la consultation par le client', async () => {
    loginAs(admin);
    await CREATE_ORG(req('/api/organizations', json({ name: 'Société Z' })), ctx({}));
    await SHARE(req('/api/audits/a1/share', json({ organizationId: 'org-x', shared: true })), ctx({ id: 'a1' }));
    await REGISTER(req('/api/auth/register', json({ email: 'n@exemple.fr', password: 'un-mot-de-passe-long', organizationId: 'org-x' })), ctx({}));
    loginAs(client);
    await CLIENT_GET(req('/api/client/audits/a1'), ctx({ id: 'a1' }));

    const actions = tables.activityLog.map((l) => l.action);
    expect(actions).toEqual(['organization.create', 'audit.share', 'user.create', 'client.audit.view']);
    expect(tables.activityLog[3]).toMatchObject({ actorId: 'c1', actorRole: 'client', organizationId: 'org-x', targetId: 'a1' });
  });

  it('ne contient aucun mot de passe, e-mail ni contenu d\'audit', async () => {
    loginAs(admin);
    await REGISTER(req('/api/auth/register', json({ email: 'secret@exemple.fr', password: 'un-mot-de-passe-long', organizationId: 'org-x' })), ctx({}));
    const dump = JSON.stringify(tables.activityLog);
    expect(dump).not.toContain('un-mot-de-passe-long');
    expect(dump).not.toContain('secret@exemple.fr');
  });

  it("une action n'échoue pas si le journal ne peut pas écrire", async () => {
    loginAs(admin);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fakePrisma } = await import('../helpers/fake-prisma');
    const original = fakePrisma.activityLog.create;
    fakePrisma.activityLog.create = (async () => { throw new Error('base indisponible'); }) as typeof original;
    const res = await CREATE_ORG(req('/api/organizations', json({ name: 'Société Y' })), ctx({}));
    fakePrisma.activityLog.create = original;
    spy.mockRestore();
    expect(res.status).toBe(201);
  });

  it("seul l'admin lit le journal", async () => {
    loginAs(client);
    expect((await LOGS(req('/api/admin/activity'), ctx({}))).status).toBe(403);
    loginAs(admin);
    expect((await LOGS(req('/api/admin/activity'), ctx({}))).status).toBe(200);
  });
});
