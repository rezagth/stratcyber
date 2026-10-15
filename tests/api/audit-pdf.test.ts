// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { ctx, req, sessionFor, userA, userB } from '../helpers/api-test-utils';

const launched = vi.hoisted(() => ({ calls: 0, html: '' }));

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(async () => {
      launched.calls += 1;
      return {
        newPage: async () => ({
          setViewport: async () => {},
          setContent: async (html: string) => {
            launched.html = html;
          },
          pdf: async () => Buffer.from('%PDF-fake'),
        }),
        close: async () => {},
      };
    }),
  },
}));
vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

import { GET } from '@/app/api/audit/[id]/export/pdf/route';

const loginAs = (user: Parameters<typeof sessionFor>[0]) =>
  vi.mocked(getServerSession).mockResolvedValue(sessionFor(user));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  launched.calls = 0;
  launched.html = '';
  tables.audit.push({
    id: 'audit-a',
    userId: userA.id,
    score: 62,
    maturity: 'Moyenne',
    recommendations: 'secret-A',
    createdAt: new Date('2026-01-01'),
  });
  tables.auditResponse.push({
    id: 'r1',
    auditId: 'audit-a',
    question: '<script>alert(1)</script>',
    answer: 'oui',
    score: 4,
    category: 'Accès',
  });
});

describe('GET /api/audit/[id]/export/pdf', () => {
  it('401 sans session, sans lancer le navigateur', async () => {
    loginAs(null);
    const res = await GET(req('/api/audit/audit-a/export/pdf'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(401);
    expect(launched.calls).toBe(0);
  });

  it("B ne peut pas exporter l'audit de A (404, aucun PDF produit)", async () => {
    loginAs(userB);
    const res = await GET(req('/api/audit/audit-a/export/pdf'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(404);
    expect(launched.calls).toBe(0);
    expect(launched.html).not.toContain('secret-A');
  });

  it('A exporte son audit, et le contenu est échappé dans le HTML', async () => {
    loginAs(userA);
    const res = await GET(req('/api/audit/audit-a/export/pdf'), ctx({ id: 'audit-a' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(launched.html).not.toContain('<script>alert(1)</script>');
    expect(launched.html).toContain('&lt;script&gt;');
  });
});
