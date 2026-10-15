// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { ctx, req, sessionFor, userA, userB } from '../helpers/api-test-utils';
import { GET, PATCH } from '@/app/api/roadmap/actions/route';
import { getActionStatuses } from '@/lib/roadmap/action-status';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const patch = (body: unknown) =>
  PATCH(
    req('/api/roadmap/actions', { method: 'PATCH', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }),
    ctx({})
  );
const loginAs = (u: Parameters<typeof sessionFor>[0]) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
});

describe('statuts des actions de la feuille de route (en base)', () => {
  it('401 sans session', async () => {
    loginAs(null);
    expect((await patch({ actionId: 'a1', status: 'En cours', progress: 10 })).status).toBe(401);
  });

  it('enregistre le statut, puis le met à jour sans doublon', async () => {
    loginAs(userA);
    expect((await patch({ actionId: 'a1', status: 'En cours', progress: 30 })).status).toBe(200);
    expect((await patch({ actionId: 'a1', status: 'Terminé', progress: 100 })).status).toBe(200);
    expect(tables.actionStatus).toHaveLength(1);
    expect(await getActionStatuses(userA.id)).toEqual({ a1: { status: 'Terminé', progress: 100 } });
  });

  it("l'utilisateur B ne voit ni ne modifie les statuts de A", async () => {
    loginAs(userA);
    await patch({ actionId: 'a1', status: 'En cours', progress: 30 });
    loginAs(userB);
    const list = await GET(req('/api/roadmap/actions'), ctx({}));
    expect(await list.json()).toEqual([]);
    await patch({ actionId: 'a1', status: 'Terminé', progress: 100 });
    expect(await getActionStatuses(userA.id)).toEqual({ a1: { status: 'En cours', progress: 30 } });
  });

  it.each([
    [{ actionId: 'a1', status: 'Inventé', progress: 10 }],
    [{ actionId: 'a1', status: 'En cours', progress: 101 }],
    [{ actionId: 'a1', status: 'En cours', progress: -1 }],
    [{ status: 'En cours', progress: 10 }],
    [{ actionId: 'a1', status: 'En cours', progress: 'beaucoup' }],
  ])('400 sur une entrée invalide %j', async (body) => {
    loginAs(userA);
    expect((await patch(body)).status).toBe(400);
    expect(tables.actionStatus).toHaveLength(0);
  });
});
