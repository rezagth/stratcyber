// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { GET as LIST_SUPPLIERS, POST as CREATE_SUPPLIER } from '@/app/api/organizations/[id]/suppliers/route';
import { PATCH as UPDATE_SUPPLIER, DELETE as DELETE_SUPPLIER } from '@/app/api/suppliers/[id]/route';
import { GET as CLIENT_SUPPLIERS } from '@/app/api/client/suppliers/route';
import { POST as CREATE_EVIDENCE } from '@/app/api/suppliers/[id]/evidences/route';
import { PATCH as UPDATE_EVIDENCE, DELETE as DELETE_EVIDENCE } from '@/app/api/supplier-evidences/[id]/route';

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
const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const patch = (body: unknown) => ({ method: 'PATCH', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('registre des fournisseurs (module H)', () => {
  it('crée un fournisseur avec localisation des données et clause de sécurité', async () => {
    loginAs(admin);
    const res = await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({
      name: 'Cloud Provider SA', dataLocation: 'Union européenne (Irlande)', criticality: 'Haute',
      hasSecurityClause: true, securityClauseReference: 'Contrat art. 12 — DPA', lastReviewDate: '2026-06-01',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.dataLocation).toBe('Union européenne (Irlande)');
    expect(body.hasSecurityClause).toBe(true);
    expect(body.status).toBe('Actif');
    expect(body.criticality).toBe('Haute');
  });

  it('valeurs par défaut à la création : criticité Moyenne, pas de clause, statut Actif', async () => {
    loginAs(admin);
    const res = await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Sous-traitant X' })), ctx({ id: 'org-x' }));
    const body = await res.json();
    expect(body.criticality).toBe('Moyenne');
    expect(body.hasSecurityClause).toBe(false);
    expect(body.status).toBe('Actif');
  });

  it('rejette un fournisseur sans nom ou avec une criticité invalide', async () => {
    loginAs(admin);
    const noName = await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: '' })), ctx({ id: 'org-x' }));
    expect(noName.status).toBe(400);
    const badCriticality = await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'X', criticality: 'Extrême' })), ctx({ id: 'org-x' }));
    expect(badCriticality.status).toBe(400);
  });

  it("l'admin met à jour la revue et la clause de sécurité d'un fournisseur", async () => {
    loginAs(admin);
    const created = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_SUPPLIER(req(`/api/suppliers/${created.id}`, patch({
      hasSecurityClause: true, securityClauseReference: 'Avenant signé', lastReviewDate: '2026-10-01',
    })), ctx({ id: created.id }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.hasSecurityClause).toBe(true);
    expect(body.securityClauseReference).toBe('Avenant signé');
  });

  it('rejette un statut invalide', async () => {
    loginAs(admin);
    const created = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'X' })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_SUPPLIER(req(`/api/suppliers/${created.id}`, patch({ status: 'Douteux' })), ctx({ id: created.id }));
    expect(res.status).toBe(400);
  });

  it('cloisonnement par client sur la liste des fournisseurs', async () => {
    loginAs(admin);
    await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Fournisseur X' })), ctx({ id: 'org-x' }));
    await CREATE_SUPPLIER(req('/api/organizations/org-y/suppliers', post({ name: 'Fournisseur Y' })), ctx({ id: 'org-y' }));
    const listX = await LIST_SUPPLIERS(req('/api/organizations/org-x/suppliers'), ctx({ id: 'org-x' }));
    const suppliersX = await listX.json();
    expect(suppliersX).toHaveLength(1);
    expect(suppliersX[0].name).toBe('Fournisseur X');
  });

  it('un client ne peut ni créer, ni modifier, ni supprimer de fournisseur (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'x' })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.supplier.push({ id: 's-x', organizationId: 'org-x', name: 'X', criticality: 'Moyenne', hasSecurityClause: false, status: 'Actif', createdAt: new Date(), updatedAt: new Date() });
    expect((await UPDATE_SUPPLIER(req('/api/suppliers/s-x', patch({ status: 'Inactif' })), ctx({ id: 's-x' }))).status).toBe(403);
    expect((await DELETE_SUPPLIER(req('/api/suppliers/s-x', { method: 'DELETE' }), ctx({ id: 's-x' }))).status).toBe(403);
  });

  it('le client X lit ses fournisseurs, jamais ceux de Y', async () => {
    tables.supplier.push(
      { id: 's-x', organizationId: 'org-x', name: 'Fournisseur X', criticality: 'Moyenne', hasSecurityClause: false, status: 'Actif', createdAt: new Date(), updatedAt: new Date() },
      { id: 's-y', organizationId: 'org-y', name: 'Fournisseur Y', criticality: 'Moyenne', hasSecurityClause: false, status: 'Actif', createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const res = await CLIENT_SUPPLIERS(req('/api/client/suppliers'), ctx({}));
    const suppliers = await res.json();
    expect(suppliers.map((s: { id: string }) => s.id)).toEqual(['s-x']);
  });
});

describe('preuves annuelles fournisseur (module H)', () => {
  it('ajoute une preuve annuelle datée avec lien et expiration', async () => {
    loginAs(admin);
    const supplier = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    const res = await CREATE_EVIDENCE(req(`/api/suppliers/${supplier.id}/evidences`, post({
      label: 'Certification ISO 27001 2026', evidenceDate: '2026-09-01', expiresAt: '2027-09-01', link: 'https://exemple.fr/certif.pdf',
    })), ctx({ id: supplier.id }));
    expect(res.status).toBe(201);
    const evidence = await res.json();
    expect(evidence.label).toBe('Certification ISO 27001 2026');
    expect(evidence.organizationId).toBe('org-x');
  });

  it('rejette une preuve sans date', async () => {
    loginAs(admin);
    const supplier = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    const res = await CREATE_EVIDENCE(req(`/api/suppliers/${supplier.id}/evidences`, post({ label: 'x' })), ctx({ id: supplier.id }));
    expect(res.status).toBe(400);
  });

  it('la preuve apparaît imbriquée dans le fournisseur (admin et client)', async () => {
    loginAs(admin);
    const supplier = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    await CREATE_EVIDENCE(req(`/api/suppliers/${supplier.id}/evidences`, post({ label: 'Preuve 1', evidenceDate: '2026-01-01' })), ctx({ id: supplier.id }));

    const adminList = await (await LIST_SUPPLIERS(req('/api/organizations/org-x/suppliers'), ctx({ id: 'org-x' }))).json();
    expect(adminList[0].evidences).toHaveLength(1);

    loginAs(clientX);
    const clientList = await (await CLIENT_SUPPLIERS(req('/api/client/suppliers'), ctx({}))).json();
    expect(clientList[0].evidences).toHaveLength(1);
    expect(clientList[0].evidences[0].label).toBe('Preuve 1');
  });

  it("l'admin met à jour et supprime une preuve", async () => {
    loginAs(admin);
    const supplier = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    const evidence = await (await CREATE_EVIDENCE(req(`/api/suppliers/${supplier.id}/evidences`, post({ label: 'Preuve', evidenceDate: '2026-01-01' })), ctx({ id: supplier.id }))).json();

    const updated = await UPDATE_EVIDENCE(req(`/api/supplier-evidences/${evidence.id}`, patch({ link: 'https://exemple.fr/doc.pdf' })), ctx({ id: evidence.id }));
    expect(updated.status).toBe(200);
    expect((await updated.json()).link).toBe('https://exemple.fr/doc.pdf');

    const deleted = await DELETE_EVIDENCE(req(`/api/supplier-evidences/${evidence.id}`, { method: 'DELETE' }), ctx({ id: evidence.id }));
    expect(deleted.status).toBe(200);
    expect(tables.supplierEvidence.find((e) => e.id === evidence.id)).toBeUndefined();
  });

  it('un client ne peut ni ajouter, ni modifier, ni supprimer de preuve (403)', async () => {
    tables.supplier.push({ id: 's-x', organizationId: 'org-x', name: 'Hébergeur', criticality: 'Moyenne', hasSecurityClause: false, status: 'Actif', createdAt: new Date(), updatedAt: new Date() });
    tables.supplierEvidence.push({ id: 'e-x', supplierId: 's-x', organizationId: 'org-x', label: 'Preuve', evidenceDate: new Date(), createdAt: new Date(), updatedAt: new Date() });
    loginAs(clientX);
    expect((await CREATE_EVIDENCE(req('/api/suppliers/s-x/evidences', post({ label: 'x', evidenceDate: '2026-01-01' })), ctx({ id: 's-x' }))).status).toBe(403);
    expect((await UPDATE_EVIDENCE(req('/api/supplier-evidences/e-x', patch({ link: 'hack' })), ctx({ id: 'e-x' }))).status).toBe(403);
    expect((await DELETE_EVIDENCE(req('/api/supplier-evidences/e-x', { method: 'DELETE' }), ctx({ id: 'e-x' }))).status).toBe(403);
  });

  it('la suppression du fournisseur supprime aussi ses preuves', async () => {
    loginAs(admin);
    const supplier = await (await CREATE_SUPPLIER(req('/api/organizations/org-x/suppliers', post({ name: 'Hébergeur' })), ctx({ id: 'org-x' }))).json();
    await CREATE_EVIDENCE(req(`/api/suppliers/${supplier.id}/evidences`, post({ label: 'Preuve', evidenceDate: '2026-01-01' })), ctx({ id: supplier.id }));
    expect(tables.supplierEvidence).toHaveLength(1);

    await DELETE_SUPPLIER(req(`/api/suppliers/${supplier.id}`, { method: 'DELETE' }), ctx({ id: supplier.id }));
    expect(tables.supplier).toHaveLength(0);
    expect(tables.supplierEvidence).toHaveLength(0);
  });

  it('le client Y ne voit jamais les preuves du client X', async () => {
    tables.supplier.push({ id: 's-x', organizationId: 'org-x', name: 'Hébergeur', criticality: 'Moyenne', hasSecurityClause: false, status: 'Actif', createdAt: new Date(), updatedAt: new Date() });
    tables.supplierEvidence.push({ id: 'e-x', supplierId: 's-x', organizationId: 'org-x', label: 'Preuve confidentielle X', evidenceDate: new Date(), createdAt: new Date(), updatedAt: new Date() });
    loginAs(clientY);
    const res = await CLIENT_SUPPLIERS(req('/api/client/suppliers'), ctx({}));
    const suppliers = await res.json();
    expect(suppliers).toHaveLength(0);
    expect(JSON.stringify(suppliers)).not.toMatch(/confidentielle/);
  });
});
