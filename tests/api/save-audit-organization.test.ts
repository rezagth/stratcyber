// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, sessionFor, userA } from '../helpers/api-test-utils';
import { saveAudit } from '@/app/strategie/actions';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('../../lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const data = () => ({
  profile: { sector: 'Numérique', size: 'PME' } as never,
  answers: [{ questionId: 'q1', answer: 'Non', score: 1 }],
  result: {} as never,
  actionPlan: [],
});

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' });
});

describe('saveAudit : rattachement à un client', () => {
  it("rattache l'audit au client choisi par l'administrateur", async () => {
    loginAs(admin);
    const res = await saveAudit(data(), 'org-x');
    expect(res.success).toBe(true);
    expect(tables.audit).toHaveLength(1);
    expect(tables.audit[0].organizationId).toBe('org-x');
  });

  it('laisse l\'audit non rattaché quand aucun client n\'est choisi', async () => {
    loginAs(admin);
    expect((await saveAudit(data())).success).toBe(true);
    expect(tables.audit[0].organizationId).toBeNull();
  });

  it('refuse le rattachement pour un non-administrateur, sans rien créer', async () => {
    loginAs(userA);
    const res = await saveAudit(data(), 'org-x');
    expect(res.success).toBe(false);
    expect(tables.audit).toHaveLength(0);
  });

  it('refuse un client inexistant, sans rien créer', async () => {
    loginAs(admin);
    const res = await saveAudit(data(), 'org-inconnu');
    expect(res.success).toBe(false);
    expect(tables.audit).toHaveLength(0);
  });
});
