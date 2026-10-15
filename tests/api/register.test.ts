// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { POST } from '@/app/api/auth/register/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const post = (body: unknown) =>
  POST(
    req('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
    ctx({})
  );
const loginAs = (u: Parameters<typeof sessionFor>[0]) =>
  vi.mocked(getServerSession).mockResolvedValue(sessionFor(u));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
});

describe('POST /api/auth/register', () => {
  const good = { email: 'Client@Exemple.fr', password: 'un-mot-de-passe-long', name: 'Client' };

  it('401 sans session : inscription publique fermée', async () => {
    loginAs(null);
    expect((await post(good)).status).toBe(401);
    expect(tables.user).toHaveLength(0);
  });

  it('403 pour un utilisateur non admin', async () => {
    loginAs(userA);
    expect((await post(good)).status).toBe(403);
    expect(tables.user).toHaveLength(0);
  });

  it("l'admin crée un compte, sans renvoyer le mot de passe", async () => {
    loginAs(admin);
    const res = await post(good);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.email).toBe('client@exemple.fr');
    expect(JSON.stringify(body)).not.toContain('password');
    expect(tables.user[0].password).not.toBe(good.password);
  });

  it('un compte créé avec organizationId devient un compte client rattaché', async () => {
    tables.organization.push({ id: 'org-x', name: 'Client X' });
    loginAs(admin);
    const res = await post({ ...good, organizationId: 'org-x' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.user.role).toBe('client');
    expect(body.user.organizationId).toBe('org-x');
  });

  it('refuse un organizationId inexistant', async () => {
    loginAs(admin);
    expect((await post({ ...good, organizationId: 'nope' })).status).toBe(404);
  });

  it('refuse un mot de passe trop court', async () => {
    loginAs(admin);
    expect((await post({ ...good, password: 'court' })).status).toBe(400);
  });
});
