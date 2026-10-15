// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { GET as LIST_CONTROLS, POST as CREATE_CONTROL } from '@/app/api/organizations/[id]/controls/route';
import { PATCH as UPDATE_CONTROL, DELETE as DELETE_CONTROL } from '@/app/api/controls/[id]/route';
import { GET as CLIENT_CONTROLS } from '@/app/api/client/controls/route';
import { POST as CREATE_EVIDENCE } from '@/app/api/controls/[id]/evidences/route';
import { PATCH as UPDATE_EVIDENCE, DELETE as DELETE_EVIDENCE } from '@/app/api/evidences/[id]/route';

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

describe('contrôles multi-référentiels (module B)', () => {
  it('un contrôle peut compter pour plusieurs référentiels à la fois', async () => {
    loginAs(admin);
    const res = await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({
      title: 'Authentification multifacteur (MFA)', frameworks: ['NIS2', 'RGPD', 'ISO27001'], owner: 'RSSI',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.frameworks).toEqual(['NIS2', 'RGPD', 'ISO27001']);
    expect(body.status).toBe('Non évalué');
  });

  it('rejette un contrôle sans référentiel ou avec un référentiel inconnu', async () => {
    loginAs(admin);
    const noFrameworks = await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'X', frameworks: [] })), ctx({ id: 'org-x' }));
    expect(noFrameworks.status).toBe(400);
    const badFramework = await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'X', frameworks: ['SOC2'] })), ctx({ id: 'org-x' }));
    expect(badFramework.status).toBe(400);
  });

  it("l'admin met à jour le statut d'un contrôle", async () => {
    loginAs(admin);
    const created = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'Sauvegardes', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_CONTROL(req(`/api/controls/${created.id}`, patch({ status: 'Conforme' })), ctx({ id: created.id }));
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('Conforme');
  });

  it('rejette un statut invalide', async () => {
    loginAs(admin);
    const created = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'X', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_CONTROL(req(`/api/controls/${created.id}`, patch({ status: 'Douteux' })), ctx({ id: created.id }));
    expect(res.status).toBe(400);
  });

  it('cloisonnement par client sur la liste des contrôles', async () => {
    loginAs(admin);
    await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'Contrôle X', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }));
    await CREATE_CONTROL(req('/api/organizations/org-y/controls', post({ title: 'Contrôle Y', frameworks: ['RGPD'] })), ctx({ id: 'org-y' }));
    const listX = await LIST_CONTROLS(req('/api/organizations/org-x/controls'), ctx({ id: 'org-x' }));
    const controlsX = await listX.json();
    expect(controlsX).toHaveLength(1);
    expect(controlsX[0].title).toBe('Contrôle X');
  });

  it('un client ne peut ni créer, ni modifier, ni supprimer de contrôle (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'x', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.control.push({ id: 'c-x', organizationId: 'org-x', title: 'X', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() });
    expect((await UPDATE_CONTROL(req('/api/controls/c-x', patch({ status: 'Conforme' })), ctx({ id: 'c-x' }))).status).toBe(403);
    expect((await DELETE_CONTROL(req('/api/controls/c-x', { method: 'DELETE' }), ctx({ id: 'c-x' }))).status).toBe(403);
  });

  it('le client X lit ses contrôles, jamais ceux de Y', async () => {
    tables.control.push(
      { id: 'c-x', organizationId: 'org-x', title: 'Contrôle X', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() },
      { id: 'c-y', organizationId: 'org-y', title: 'Contrôle Y', frameworks: '["RGPD"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const res = await CLIENT_CONTROLS(req('/api/client/controls'), ctx({}));
    const controls = await res.json();
    expect(controls.map((c: { id: string }) => c.id)).toEqual(['c-x']);
  });
});

describe('coffre de preuves (module B)', () => {
  it('ajoute une preuve datée avec source, responsable et expiration', async () => {
    loginAs(admin);
    const control = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'MFA', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    const res = await CREATE_EVIDENCE(req(`/api/controls/${control.id}/evidences`, post({
      label: 'Export Azure AD — politique MFA active', source: 'Export Azure AD', owner: 'DSI',
      evidenceDate: '2026-09-01', expiresAt: '2027-03-01', link: 'https://exemple.fr/preuve.pdf',
    })), ctx({ id: control.id }));
    expect(res.status).toBe(201);
    const evidence = await res.json();
    expect(evidence.source).toBe('Export Azure AD');
    expect(evidence.organizationId).toBe('org-x');
  });

  it('rejette une preuve sans date', async () => {
    loginAs(admin);
    const control = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'MFA', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    const res = await CREATE_EVIDENCE(req(`/api/controls/${control.id}/evidences`, post({ label: 'x' })), ctx({ id: control.id }));
    expect(res.status).toBe(400);
  });

  it('la preuve apparaît imbriquée dans le contrôle (admin et client)', async () => {
    loginAs(admin);
    const control = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'MFA', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    await CREATE_EVIDENCE(req(`/api/controls/${control.id}/evidences`, post({ label: 'Preuve 1', evidenceDate: '2026-01-01' })), ctx({ id: control.id }));

    const adminList = await (await LIST_CONTROLS(req('/api/organizations/org-x/controls'), ctx({ id: 'org-x' }))).json();
    expect(adminList[0].evidences).toHaveLength(1);

    loginAs(clientX);
    const clientList = await (await CLIENT_CONTROLS(req('/api/client/controls'), ctx({}))).json();
    expect(clientList[0].evidences).toHaveLength(1);
    expect(clientList[0].evidences[0].label).toBe('Preuve 1');
  });

  it("l'admin met à jour et supprime une preuve", async () => {
    loginAs(admin);
    const control = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'MFA', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    const evidence = await (await CREATE_EVIDENCE(req(`/api/controls/${control.id}/evidences`, post({ label: 'Preuve', evidenceDate: '2026-01-01' })), ctx({ id: control.id }))).json();

    const updated = await UPDATE_EVIDENCE(req(`/api/evidences/${evidence.id}`, patch({ source: 'Capture écran' })), ctx({ id: evidence.id }));
    expect(updated.status).toBe(200);
    expect((await updated.json()).source).toBe('Capture écran');

    const deleted = await DELETE_EVIDENCE(req(`/api/evidences/${evidence.id}`, { method: 'DELETE' }), ctx({ id: evidence.id }));
    expect(deleted.status).toBe(200);
    expect(tables.evidence.find((e) => e.id === evidence.id)).toBeUndefined();
  });

  it('un client ne peut ni ajouter, ni modifier, ni supprimer de preuve (403)', async () => {
    tables.control.push({ id: 'c-x', organizationId: 'org-x', title: 'MFA', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() });
    tables.evidence.push({ id: 'e-x', controlId: 'c-x', organizationId: 'org-x', label: 'Preuve', evidenceDate: new Date(), createdAt: new Date(), updatedAt: new Date() });
    loginAs(clientX);
    expect((await CREATE_EVIDENCE(req('/api/controls/c-x/evidences', post({ label: 'x', evidenceDate: '2026-01-01' })), ctx({ id: 'c-x' }))).status).toBe(403);
    expect((await UPDATE_EVIDENCE(req('/api/evidences/e-x', patch({ source: 'hack' })), ctx({ id: 'e-x' }))).status).toBe(403);
    expect((await DELETE_EVIDENCE(req('/api/evidences/e-x', { method: 'DELETE' }), ctx({ id: 'e-x' }))).status).toBe(403);
  });

  it('la suppression du contrôle supprime aussi ses preuves', async () => {
    loginAs(admin);
    const control = await (await CREATE_CONTROL(req('/api/organizations/org-x/controls', post({ title: 'MFA', frameworks: ['NIS2'] })), ctx({ id: 'org-x' }))).json();
    await CREATE_EVIDENCE(req(`/api/controls/${control.id}/evidences`, post({ label: 'Preuve', evidenceDate: '2026-01-01' })), ctx({ id: control.id }));
    expect(tables.evidence).toHaveLength(1);

    await DELETE_CONTROL(req(`/api/controls/${control.id}`, { method: 'DELETE' }), ctx({ id: control.id }));
    expect(tables.control).toHaveLength(0);
    expect(tables.evidence).toHaveLength(0);
  });

  it('le client Y ne voit jamais les preuves du client X', async () => {
    tables.control.push({ id: 'c-x', organizationId: 'org-x', title: 'MFA', frameworks: '["NIS2"]', status: 'Non évalué', createdAt: new Date(), updatedAt: new Date() });
    tables.evidence.push({ id: 'e-x', controlId: 'c-x', organizationId: 'org-x', label: 'Preuve confidentielle X', evidenceDate: new Date(), createdAt: new Date(), updatedAt: new Date() });
    loginAs(clientY);
    const res = await CLIENT_CONTROLS(req('/api/client/controls'), ctx({}));
    const controls = await res.json();
    expect(controls).toHaveLength(0);
    expect(JSON.stringify(controls)).not.toMatch(/confidentielle/);
  });
});
