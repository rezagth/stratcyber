// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { ctx, req, sessionFor, userA, userB } from '../helpers/api-test-utils';
import { GET, DELETE } from '@/app/api/audits/[id]/route';
import { POST as DUPLICATE } from '@/app/api/audits/[id]/duplicate/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const loginAs = (user: Parameters<typeof sessionFor>[0]) =>
  vi.mocked(getServerSession).mockResolvedValue(sessionFor(user));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  // Un audit appartenant à A, avec deux réponses
  tables.audit.push({
    id: 'audit-a',
    userId: userA.id,
    score: 62,
    maturity: 'Moyenne',
    recommendations: 'secret-A',
    companyProfile: '{"nom":"Société A"}',
    createdAt: new Date('2026-01-01'),
  });
  tables.auditResponse.push(
    { id: 'r1', auditId: 'audit-a', question: 'q1', answer: 'oui', score: 4, category: 'Accès' },
    { id: 'r2', auditId: 'audit-a', question: 'q2', answer: 'non', score: 1, category: 'Données' }
  );
});

describe('GET /api/audits/[id]', () => {
  it('401 sans session', async () => {
    loginAs(null);
    const res = await GET(req('/api/audits/audit-a'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(401);
  });

  it('A lit son propre audit', async () => {
    loginAs(userA);
    const res = await GET(req('/api/audits/audit-a'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('audit-a');
    expect(body.responses).toHaveLength(2);
  });

  it("B ne peut pas lire l'audit de A (404, aucune donnée de A dans la réponse)", async () => {
    loginAs(userB);
    const res = await GET(req('/api/audits/audit-a'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('secret-A');
  });

  it("B ne peut pas contourner via ?userId=<id de A> dans l'URL", async () => {
    loginAs(userB);
    const res = await GET(
      req(`/api/audits/audit-a?userId=${userA.id}`),
      ctx({ id: 'audit-a' })
    );
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/audits/[id]', () => {
  it('401 sans session, rien n’est supprimé', async () => {
    loginAs(null);
    const res = await DELETE(req('/api/audits/audit-a', { method: 'DELETE' }), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(401);
    expect(tables.audit).toHaveLength(1);
  });

  it("B ne peut pas supprimer l'audit de A, même en mettant userId=A dans le body", async () => {
    loginAs(userB);
    const res = await DELETE(
      req('/api/audits/audit-a', {
        method: 'DELETE',
        body: JSON.stringify({ userId: userA.id }),
      }),
      ctx({ id: 'audit-a' })
    );
    expect(res.status).toBe(404);
    expect(tables.audit).toHaveLength(1);
    expect(tables.auditResponse).toHaveLength(2);
  });

  it('A supprime son audit et ses réponses', async () => {
    loginAs(userA);
    const res = await DELETE(req('/api/audits/audit-a', { method: 'DELETE' }), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(200);
    expect(tables.audit).toHaveLength(0);
    expect(tables.auditResponse).toHaveLength(0);
  });
});

describe('POST /api/audits/[id]/duplicate', () => {
  it('401 sans session, aucune copie créée', async () => {
    loginAs(null);
    const res = await DUPLICATE(req('/api/audits/audit-a/duplicate', { method: 'POST' }), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(401);
    expect(tables.audit).toHaveLength(1);
  });

  it("B ne peut pas dupliquer l'audit de A : 404, aucune copie chez A ni chez B, rien n'est divulgué", async () => {
    loginAs(userB);
    const res = await DUPLICATE(req('/api/audits/audit-a/duplicate', { method: 'POST' }), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('secret-A');
    expect(tables.audit).toHaveLength(1);
    expect(tables.auditResponse).toHaveLength(2);
  });

  it('A duplique son audit : la copie lui appartient et reprend les réponses', async () => {
    loginAs(userA);
    const res = await DUPLICATE(req('/api/audits/audit-a/duplicate', { method: 'POST' }), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(200);
    const copy = await res.json();
    expect(copy.id).not.toBe('audit-a');
    expect(copy.responses).toHaveLength(2);
    expect(tables.audit).toHaveLength(2);
    expect(tables.audit.every((a) => a.userId === userA.id)).toBe(true);
  });
});
