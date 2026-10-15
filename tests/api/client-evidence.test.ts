// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { GET as CLIENT_EVIDENCE } from '@/app/api/client/evidence/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Client', role: 'client', organizationId,
});
const clientX = clientOf('org-x');
const clientY = clientOf('org-y');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('"Mes preuves" (module M)', () => {
  it('combine les preuves du coffre (contrôles) et des fournisseurs, avec leur origine', async () => {
    tables.control.push({ id: 'c1', organizationId: 'org-x', title: 'MFA', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() });
    tables.evidence.push({ id: 'e1', controlId: 'c1', organizationId: 'org-x', label: 'Export Azure AD', evidenceDate: new Date('2026-01-01'), expiresAt: null, link: null, createdAt: new Date(), updatedAt: new Date() });
    tables.supplier.push({ id: 's1', organizationId: 'org-x', name: 'Hébergeur Cloud', criticality: 'Haute', hasSecurityClause: true, status: 'Actif', createdAt: new Date(), updatedAt: new Date() });
    tables.supplierEvidence.push({ id: 'se1', supplierId: 's1', organizationId: 'org-x', label: 'Certification ISO 27001', evidenceDate: new Date('2026-01-01'), expiresAt: null, link: null, createdAt: new Date(), updatedAt: new Date() });

    loginAs(clientX);
    const res = await CLIENT_EVIDENCE(req('/api/client/evidence'), ctx({}));
    expect(res.status).toBe(200);
    const items = await res.json();
    expect(items).toHaveLength(2);
    const control = items.find((i: { origin: string }) => i.origin === 'control');
    const supplier = items.find((i: { origin: string }) => i.origin === 'supplier');
    expect(control.source).toBe('MFA');
    expect(control.label).toBe('Export Azure AD');
    expect(supplier.source).toBe('Hébergeur Cloud');
    expect(supplier.label).toBe('Certification ISO 27001');
  });

  it('trie par urgence : expirées et proches d\'expirer avant celles sans échéance', async () => {
    tables.control.push({ id: 'c1', organizationId: 'org-x', title: 'C', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() });
    tables.evidence.push(
      { id: 'e-none', controlId: 'c1', organizationId: 'org-x', label: 'Sans échéance', evidenceDate: new Date(), expiresAt: null, link: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'e-expired', controlId: 'c1', organizationId: 'org-x', label: 'Expirée', evidenceDate: new Date(), expiresAt: new Date('2020-01-01'), link: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'e-soon', controlId: 'c1', organizationId: 'org-x', label: 'Bientôt', evidenceDate: new Date(), expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), link: null, createdAt: new Date(), updatedAt: new Date() }
    );

    loginAs(clientX);
    const items = await (await CLIENT_EVIDENCE(req('/api/client/evidence'), ctx({}))).json();
    expect(items.map((i: { label: string }) => i.label)).toEqual(['Expirée', 'Bientôt', 'Sans échéance']);
  });

  it('cloisonnement par client : X ne voit jamais les preuves de Y', async () => {
    tables.control.push(
      { id: 'c-x', organizationId: 'org-x', title: 'X', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c-y', organizationId: 'org-y', title: 'Y', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() }
    );
    tables.evidence.push(
      { id: 'e-x', controlId: 'c-x', organizationId: 'org-x', label: 'Preuve X', evidenceDate: new Date(), expiresAt: null, link: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'e-y', controlId: 'c-y', organizationId: 'org-y', label: 'Preuve confidentielle Y', evidenceDate: new Date(), expiresAt: null, link: null, createdAt: new Date(), updatedAt: new Date() }
    );

    loginAs(clientY);
    const res = await CLIENT_EVIDENCE(req('/api/client/evidence'), ctx({}));
    const items = await res.json();
    expect(items).toHaveLength(1);
    expect(items[0].label).toBe('Preuve confidentielle Y');
  });

  it("un admin ne peut pas utiliser la route client (403)", async () => {
    loginAs(admin);
    expect((await CLIENT_EVIDENCE(req('/api/client/evidence'), ctx({}))).status).toBe(403);
  });
});
