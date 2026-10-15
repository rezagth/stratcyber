// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { buildGovernanceDashboard } from '@/lib/governance/dashboard';
import { GET as LIST_MEETINGS, POST as CREATE_MEETING } from '@/app/api/organizations/[id]/governance/meetings/route';
import { PATCH as UPDATE_MEETING, DELETE as DELETE_MEETING } from '@/app/api/governance/meetings/[id]/route';
import { GET as CLIENT_MEETINGS } from '@/app/api/client/governance/meetings/route';
import { PATCH as CLIENT_VALIDATE_MEETING } from '@/app/api/client/governance/meetings/[id]/route';
import { GET as LIST_TRAININGS, POST as CREATE_TRAINING } from '@/app/api/organizations/[id]/governance/trainings/route';
import { PATCH as UPDATE_TRAINING, DELETE as DELETE_TRAINING } from '@/app/api/governance/trainings/[id]/route';
import { GET as CLIENT_TRAININGS } from '@/app/api/client/governance/trainings/route';
import { GET as ADMIN_DASHBOARD } from '@/app/api/organizations/[id]/governance/dashboard/route';
import { GET as CLIENT_DASHBOARD } from '@/app/api/client/governance/dashboard/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Direction Client', role: 'client', organizationId,
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

describe('comités et revue annuelle (module G)', () => {
  it('crée un comité et une revue annuelle', async () => {
    loginAs(admin);
    const r1 = await CREATE_MEETING(req('/api/organizations/org-x/governance/meetings', post({
      type: 'Comité', title: 'Comité cyber T3 2026', meetingDate: '2026-09-15', attendees: 'DG, RSSI, DSI',
    })), ctx({ id: 'org-x' }));
    expect(r1.status).toBe(201);
    expect((await r1.json()).status).toBe('Brouillon');

    const r2 = await CREATE_MEETING(req('/api/organizations/org-x/governance/meetings', post({
      type: 'Revue annuelle', title: 'Revue annuelle 2026', meetingDate: '2026-12-01',
    })), ctx({ id: 'org-x' }));
    expect(r2.status).toBe(201);
  });

  it('rejette un type invalide ou une date manquante', async () => {
    loginAs(admin);
    expect((await CREATE_MEETING(req('/api/organizations/org-x/governance/meetings', post({ type: 'Réunion', title: 'x', meetingDate: '2026-01-01' })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await CREATE_MEETING(req('/api/organizations/org-x/governance/meetings', post({ title: 'x' })), ctx({ id: 'org-x' }))).status).toBe(400);
  });

  it("l'admin passe une réunion en \"À valider\", jamais directement \"Validé\"", async () => {
    loginAs(admin);
    const created = await (await CREATE_MEETING(req('/api/organizations/org-x/governance/meetings', post({ title: 'Comité', meetingDate: '2026-01-01' })), ctx({ id: 'org-x' }))).json();
    expect((await UPDATE_MEETING(req(`/api/governance/meetings/${created.id}`, patch({ status: 'Validé' })), ctx({ id: created.id }))).status).toBe(400);
    const ok = await UPDATE_MEETING(req(`/api/governance/meetings/${created.id}`, patch({ status: 'À valider' })), ctx({ id: created.id }));
    expect((await ok.json()).status).toBe('À valider');
  });

  it("le client valide la preuve d'implication de sa direction : nom et date fixés par le serveur", async () => {
    tables.governanceMeeting.push({
      id: 'm-x', organizationId: 'org-x', type: 'Revue annuelle', title: 'Revue 2026', meetingDate: new Date('2026-12-01'),
      attendees: null, summary: null, status: 'À valider', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    loginAs(clientX);
    const res = await CLIENT_VALIDATE_MEETING(req('/api/client/governance/meetings/m-x', patch({ validatedByName: 'Quelqu\'un d\'autre' })), ctx({ id: 'm-x' }));
    const body = await res.json();
    expect(body.status).toBe('Validé');
    expect(body.validatedByName).toBe('Direction Client');
  });

  it('le client ne peut pas valider un brouillon (409) ni la réunion d\'un autre client (404)', async () => {
    tables.governanceMeeting.push(
      { id: 'm-x-draft', organizationId: 'org-x', type: 'Comité', title: 'x', meetingDate: new Date(), attendees: null, summary: null, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'm-y', organizationId: 'org-y', type: 'Comité', title: 'y', meetingDate: new Date(), attendees: null, summary: null, status: 'À valider', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    expect((await CLIENT_VALIDATE_MEETING(req('/api/client/governance/meetings/m-x-draft', patch({})), ctx({ id: 'm-x-draft' }))).status).toBe(409);
    expect((await CLIENT_VALIDATE_MEETING(req('/api/client/governance/meetings/m-y', patch({})), ctx({ id: 'm-y' }))).status).toBe(404);
  });

  it('une réunion déjà validée ne peut plus être modifiée par l\'admin (409)', async () => {
    tables.governanceMeeting.push({
      id: 'm-x', organizationId: 'org-x', type: 'Comité', title: 'x', meetingDate: new Date(), attendees: null, summary: null,
      status: 'Validé', validatedByName: 'Direction', validatedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    });
    loginAs(admin);
    expect((await UPDATE_MEETING(req('/api/governance/meetings/m-x', patch({ summary: 'modifié' })), ctx({ id: 'm-x' }))).status).toBe(409);
  });

  it('cloisonnement et confinement du client sur les réunions', async () => {
    tables.governanceMeeting.push(
      { id: 'm-x', organizationId: 'org-x', type: 'Comité', title: 'x', meetingDate: new Date(), attendees: null, summary: null, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'm-y', organizationId: 'org-y', type: 'Comité', title: 'y', meetingDate: new Date(), attendees: null, summary: null, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientY);
    const list = await (await CLIENT_MEETINGS(req('/api/client/governance/meetings'), ctx({}))).json();
    expect(list.map((m: { id: string }) => m.id)).toEqual(['m-y']);
    expect((await LIST_MEETINGS(req('/api/organizations/org-x/governance/meetings'), ctx({ id: 'org-x' }))).status).toBe(403);
    expect((await DELETE_MEETING(req('/api/governance/meetings/m-y', { method: 'DELETE' }), ctx({ id: 'm-y' }))).status).toBe(403);
  });
});

describe('formation des dirigeants (module G)', () => {
  it('enregistre une formation et rejette les champs manquants', async () => {
    loginAs(admin);
    const res = await CREATE_TRAINING(req('/api/organizations/org-x/governance/trainings', post({
      participantName: 'Jean Dupont', role: 'DG', trainingTitle: 'Sensibilisation cybersécurité dirigeants', completedAt: '2026-06-01',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    expect((await CREATE_TRAINING(req('/api/organizations/org-x/governance/trainings', post({ participantName: 'x' })), ctx({ id: 'org-x' }))).status).toBe(400);
  });

  it("l'admin met à jour et supprime une formation", async () => {
    loginAs(admin);
    const created = await (await CREATE_TRAINING(req('/api/organizations/org-x/governance/trainings', post({
      participantName: 'Jean Dupont', trainingTitle: 'Formation', completedAt: '2026-06-01',
    })), ctx({ id: 'org-x' }))).json();
    const updated = await UPDATE_TRAINING(req(`/api/governance/trainings/${created.id}`, patch({ role: 'Président' })), ctx({ id: created.id }));
    expect((await updated.json()).role).toBe('Président');
    expect((await DELETE_TRAINING(req(`/api/governance/trainings/${created.id}`, { method: 'DELETE' }), ctx({ id: created.id }))).status).toBe(200);
  });

  it('cloisonnement et confinement du client sur les formations', async () => {
    tables.leadershipTraining.push(
      { id: 't-x', organizationId: 'org-x', participantName: 'A', role: null, trainingTitle: 'F', completedAt: new Date(), evidenceLink: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 't-y', organizationId: 'org-y', participantName: 'B', role: null, trainingTitle: 'F', completedAt: new Date(), evidenceLink: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_TRAININGS(req('/api/client/governance/trainings'), ctx({}))).json();
    expect(list.map((t: { id: string }) => t.id)).toEqual(['t-x']);
    expect((await CREATE_TRAINING(req('/api/organizations/org-x/governance/trainings', post({ participantName: 'x', trainingTitle: 'y', completedAt: '2026-01-01' })), ctx({ id: 'org-x' }))).status).toBe(403);
  });
});

describe('tableau de bord de direction (agrégation, module G)', () => {
  beforeEach(() => {
    tables.risk.push(
      { id: 'r1', organizationId: 'org-x', title: 'Risque critique', likelihood: 5, impact: 5, status: 'Ouvert', treatment: 'À traiter', createdAt: new Date(), updatedAt: new Date() },
      { id: 'r2', organizationId: 'org-x', title: 'Risque clos', likelihood: 5, impact: 5, status: 'Clos', treatment: 'Réduire', createdAt: new Date(), updatedAt: new Date() }
    );
    tables.actionPlanItem.push(
      { id: 'a1', organizationId: 'org-x', title: 'Action en retard', status: 'Non commencé', priority: 'Haute', dueDate: new Date('2020-01-01'), createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2', organizationId: 'org-x', title: 'Action à jour', status: 'Terminé', priority: 'Haute', dueDate: new Date('2020-01-01'), createdAt: new Date(), updatedAt: new Date() }
    );
    tables.incidentCase.push(
      { id: 'i1', organizationId: 'org-x', title: 'Incident en retard', severity: 'Haute', status: 'Ouvert', detectedAt: new Date('2020-01-01'), earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() }
    );
    tables.control.push(
      { id: 'c1', organizationId: 'org-x', title: 'MFA', frameworks: '["NIS2"]', status: 'Conforme', createdAt: new Date(), updatedAt: new Date() }
    );
    tables.governanceMeeting.push(
      { id: 'm1', organizationId: 'org-x', type: 'Comité', title: 'Prochain comité', meetingDate: new Date('2099-01-01'), attendees: null, summary: null, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'm2', organizationId: 'org-x', type: 'Revue annuelle', title: 'Revue passée', meetingDate: new Date('2025-01-01'), attendees: null, summary: null, status: 'Validé', validatedByName: 'Direction', validatedAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
    );
  });

  it('agrège correctement risques, actions, incidents, contrôles et réunions', async () => {
    const dashboard = await buildGovernanceDashboard('org-x');
    expect(dashboard.risks.open).toBe(1);
    expect(dashboard.risks.byLevel.Critique).toBe(1);
    expect(dashboard.actions.overdue).toBe(1);
    expect(dashboard.incidents.withLateDeadline).toBe(1);
    expect(dashboard.controls.byStatus['Conforme']).toBe(1);
    expect(dashboard.nextCommittee?.id).toBe('m1');
    expect(dashboard.lastAnnualReview?.id).toBe('m2');
  });

  it('le tableau de bord est cloisonné par client (admin et client)', async () => {
    loginAs(admin);
    const adminRes = await (await ADMIN_DASHBOARD(req('/api/organizations/org-x/governance/dashboard'), ctx({ id: 'org-x' }))).json();
    expect(adminRes.risks.open).toBe(1);

    loginAs(clientY);
    const clientRes = await (await CLIENT_DASHBOARD(req('/api/client/governance/dashboard'), ctx({}))).json();
    expect(clientRes.risks.open).toBe(0);
    expect(clientRes.controls.total).toBe(0);
  });
});
