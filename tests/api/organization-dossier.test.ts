// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { POST as CREATE_ORG } from '@/app/api/organizations/route';
import { GET as ORG_DETAIL, PATCH as ORG_UPDATE } from '@/app/api/organizations/[id]/route';
import { GET as CLIENT_ORG } from '@/app/api/client/organization/route';
import { GET as LIST_CONTACTS, POST as CREATE_CONTACT } from '@/app/api/organizations/[id]/contacts/route';
import { PATCH as UPDATE_CONTACT, DELETE as DELETE_CONTACT } from '@/app/api/contacts/[id]/route';
import { GET as CLIENT_CONTACTS } from '@/app/api/client/contacts/route';
import { GET as LIST_DECISIONS, POST as CREATE_DECISION } from '@/app/api/organizations/[id]/decisions/route';
import { GET as LIST_NOTES, POST as CREATE_NOTE } from '@/app/api/organizations/[id]/notes/route';

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
  tables.organization.push(
    { id: 'org-x', name: 'Client X', sector: 'Industrie', size: 'PME' },
    { id: 'org-y', name: 'Client Y', sector: 'Santé', size: 'ETI' }
  );
});

describe('profil client (module A)', () => {
  it("l'admin crée un client avec un profil complet", async () => {
    loginAs(admin);
    const res = await CREATE_ORG(req('/api/organizations', post({
      name: 'Nouvelle Société', sector: 'Finance', size: 'TPE', headcount: 8, annualRevenue: 500000,
    })), ctx({}));
    expect(res.status).toBe(201);
    const created = tables.organization.find((o) => o.name === 'Nouvelle Société');
    expect(created?.headcount).toBe(8);
    expect(created?.annualRevenue).toBe(500000);
  });

  it('rejette un secteur ou une taille hors liste', async () => {
    loginAs(admin);
    const res = await CREATE_ORG(req('/api/organizations', post({ name: 'X', sector: 'Inconnu' })), ctx({}));
    expect(res.status).toBe(400);
  });

  it("l'admin met à jour le profil, le périmètre de mission et le test d'applicabilité", async () => {
    loginAs(admin);
    const res = await ORG_UPDATE(req('/api/organizations/org-x', patch({
      headcount: 42,
      missionScope: 'Audit annuel + accompagnement RGPD',
      nis2Applicability: 'Incertain',
      nis2Note: 'Transposition française non finalisée',
      rgpdApplicability: 'Oui',
      iso27001Status: 'En cours',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(200);
    const updated = tables.organization.find((o) => o.id === 'org-x');
    expect(updated?.headcount).toBe(42);
    expect(updated?.nis2Applicability).toBe('Incertain');
    expect(updated?.applicabilityAssessedAt).toBeInstanceOf(Date);
  });

  it('rejette une valeur invalide pour le test d\'applicabilité', async () => {
    loginAs(admin);
    const res = await ORG_UPDATE(req('/api/organizations/org-x', patch({ nis2Applicability: 'Peut-être' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('un client ne peut pas lire ni modifier le dossier via les routes admin (403)', async () => {
    loginAs(clientX);
    expect((await ORG_DETAIL(req('/api/organizations/org-x'), ctx({ id: 'org-x' }))).status).toBe(403);
    expect((await ORG_UPDATE(req('/api/organizations/org-x', patch({ headcount: 1 })), ctx({ id: 'org-x' }))).status).toBe(403);
  });

  it('le client lit son propre profil (lecture seule) sans les notes ni décisions', async () => {
    tables.organization.find((o) => o.id === 'org-x')!.missionScope = 'Audit annuel';
    loginAs(clientX);
    const res = await CLIENT_ORG(req('/api/client/organization'), ctx({}));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('org-x');
    expect(body.missionScope).toBe('Audit annuel');
    expect(body).not.toHaveProperty('internalNotes');
    expect(body).not.toHaveProperty('decisions');
  });

  it("le client Y lit son propre profil, jamais celui de X", async () => {
    loginAs(clientY);
    const res = await CLIENT_ORG(req('/api/client/organization'), ctx({}));
    const body = await res.json();
    expect(body.id).toBe('org-y');
  });

  it('un client sans organisation reçoit 403', async () => {
    loginAs(clientOf(null, 'orphan'));
    expect((await CLIENT_ORG(req('/api/client/organization'), ctx({}))).status).toBe(403);
  });
});

describe('contacts (module A)', () => {
  it("l'admin crée un contact, qui devient automatiquement le seul principal", async () => {
    loginAs(admin);
    const r1 = await CREATE_CONTACT(req('/api/organizations/org-x/contacts', post({ name: 'Alice', role: 'DSI', isPrimary: true })), ctx({ id: 'org-x' }));
    expect(r1.status).toBe(201);
    const r2 = await CREATE_CONTACT(req('/api/organizations/org-x/contacts', post({ name: 'Bob', role: 'Dirigeant', isPrimary: true })), ctx({ id: 'org-x' }));
    expect(r2.status).toBe(201);

    const list = await LIST_CONTACTS(req('/api/organizations/org-x/contacts'), ctx({ id: 'org-x' }));
    const contacts = await list.json();
    expect(contacts).toHaveLength(2);
    const primaries = contacts.filter((c: { isPrimary: boolean }) => c.isPrimary);
    expect(primaries).toHaveLength(1);
    expect(primaries[0].name).toBe('Bob');
  });

  it('rejette un email invalide', async () => {
    loginAs(admin);
    const res = await CREATE_CONTACT(req('/api/organizations/org-x/contacts', post({ name: 'Alice', email: 'pas-un-email' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it("l'admin met à jour et supprime un contact", async () => {
    loginAs(admin);
    const created = await (await CREATE_CONTACT(req('/api/organizations/org-x/contacts', post({ name: 'Alice' })), ctx({ id: 'org-x' }))).json();

    const updated = await UPDATE_CONTACT(req(`/api/contacts/${created.id}`, patch({ role: 'RSSI' })), ctx({ id: created.id }));
    expect(updated.status).toBe(200);
    expect((await updated.json()).role).toBe('RSSI');

    const deleted = await DELETE_CONTACT(req(`/api/contacts/${created.id}`, { method: 'DELETE' }), ctx({ id: created.id }));
    expect(deleted.status).toBe(200);
    expect(tables.contact.find((c) => c.id === created.id)).toBeUndefined();
  });

  it('le client X lit les contacts de son organisation, jamais ceux de Y', async () => {
    tables.contact.push(
      { id: 'c-x', organizationId: 'org-x', name: 'Alice', isPrimary: true, createdAt: new Date() },
      { id: 'c-y', organizationId: 'org-y', name: 'Bob', isPrimary: true, createdAt: new Date() }
    );
    loginAs(clientX);
    const res = await CLIENT_CONTACTS(req('/api/client/contacts'), ctx({}));
    const contacts = await res.json();
    expect(contacts.map((c: { id: string }) => c.id)).toEqual(['c-x']);
  });

  it('un client ne peut pas créer, modifier ou supprimer de contact (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_CONTACT(req('/api/organizations/org-x/contacts', post({ name: 'Pirate' })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.contact.push({ id: 'c-x', organizationId: 'org-x', name: 'Alice', isPrimary: true, createdAt: new Date() });
    expect((await UPDATE_CONTACT(req('/api/contacts/c-x', patch({ role: 'Hack' })), ctx({ id: 'c-x' }))).status).toBe(403);
    expect((await DELETE_CONTACT(req('/api/contacts/c-x', { method: 'DELETE' }), ctx({ id: 'c-x' }))).status).toBe(403);
  });
});

describe('historique des décisions (module A, admin uniquement)', () => {
  it("l'admin enregistre une décision cloisonnée par client", async () => {
    loginAs(admin);
    const res = await CREATE_DECISION(req('/api/organizations/org-x/decisions', post({
      title: 'Report de la MFA au Q3', description: 'Faute de budget disponible', decidedAt: '2026-03-01',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);

    const listX = await LIST_DECISIONS(req('/api/organizations/org-x/decisions'), ctx({ id: 'org-x' }));
    expect(await listX.json()).toHaveLength(1);
    const listY = await LIST_DECISIONS(req('/api/organizations/org-y/decisions'), ctx({ id: 'org-y' }));
    expect(await listY.json()).toHaveLength(0);
  });

  it('un client ne peut jamais lire ni écrire de décision (403)', async () => {
    loginAs(clientX);
    expect((await LIST_DECISIONS(req('/api/organizations/org-x/decisions'), ctx({ id: 'org-x' }))).status).toBe(403);
    expect((await CREATE_DECISION(req('/api/organizations/org-x/decisions', post({ title: 'x' })), ctx({ id: 'org-x' }))).status).toBe(403);
  });
});

describe('notes internes (module A, jamais visibles du client)', () => {
  it("l'admin écrit et lit des notes internes, cloisonnées par client", async () => {
    loginAs(admin);
    const res = await CREATE_NOTE(req('/api/organizations/org-x/notes', post({ content: 'Client difficile sur les délais.' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const listX = await LIST_NOTES(req('/api/organizations/org-x/notes'), ctx({ id: 'org-x' }));
    expect(await listX.json()).toHaveLength(1);
    const listY = await LIST_NOTES(req('/api/organizations/org-y/notes'), ctx({ id: 'org-y' }));
    expect(await listY.json()).toHaveLength(0);
  });

  it('un client ne peut jamais lire ni écrire de note interne (403)', async () => {
    loginAs(clientX);
    expect((await LIST_NOTES(req('/api/organizations/org-x/notes'), ctx({ id: 'org-x' }))).status).toBe(403);
    expect((await CREATE_NOTE(req('/api/organizations/org-x/notes', post({ content: 'x' })), ctx({ id: 'org-x' }))).status).toBe(403);
  });
});
