// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { DELETE } from '@/app/api/organizations/[id]/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));

const del = (body?: unknown) => ({ method: 'DELETE', body: body === undefined ? undefined : JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('DELETE /api/organizations/[id]', () => {
  it('refuse un client (rôle non admin)', async () => {
    loginAs({ id: 'c1', email: 'c@exemple.fr', name: 'C', role: 'client', organizationId: 'org-x' });
    const res = await DELETE(req('/api/organizations/org-x', del({ confirmName: 'Client X' })) as never, ctx({ id: 'org-x' }) as never);
    expect(res.status).toBe(403);
    expect(tables.organization).toHaveLength(2);
  });

  it('refuse sans confirmation du nom exact', async () => {
    loginAs(admin);
    for (const body of [undefined, {}, { confirmName: 'client x' }, { confirmName: 'Client Y' }]) {
      const res = await DELETE(req('/api/organizations/org-x', del(body)) as never, ctx({ id: 'org-x' }) as never);
      expect(res.status).toBe(400);
    }
    expect(tables.organization).toHaveLength(2);
  });

  it('404 si le client n\'existe pas', async () => {
    loginAs(admin);
    const res = await DELETE(req('/api/organizations/nope', del({ confirmName: 'x' })) as never, ctx({ id: 'nope' }) as never);
    expect(res.status).toBe(404);
  });

  it('supprime uniquement le client demandé, avec ses audits', async () => {
    loginAs(admin);
    tables.audit.push({ id: 'a1', organizationId: 'org-x' }, { id: 'a2', organizationId: 'org-y' });
    tables.auditResponse.push({ id: 'r1', auditId: 'a1' }, { id: 'r2', auditId: 'a2' });
    tables.report.push({ id: 'p1', auditId: 'a1' }, { id: 'p2', auditId: 'a2' });
    const res = await DELETE(req('/api/organizations/org-x', del({ confirmName: 'Client X' })) as never, ctx({ id: 'org-x' }) as never);
    expect(res.status).toBe(200);
    expect(tables.organization.map((o) => o.id)).toEqual(['org-y']);
    expect(tables.audit.map((a) => a.id)).toEqual(['a2']);
    expect(tables.auditResponse.map((a) => a.id)).toEqual(['r2']);
    expect(tables.report.map((a) => a.id)).toEqual(['p2']);
  });
});
