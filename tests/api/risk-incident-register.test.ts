// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { riskLevel } from '@/lib/api/risk-fields';
import { computeDeadlines } from '@/lib/api/incident-fields';
import { GET as LIST_RISKS, POST as CREATE_RISK } from '@/app/api/organizations/[id]/risks/route';
import { PATCH as UPDATE_RISK, DELETE as DELETE_RISK } from '@/app/api/risks/[id]/route';
import { GET as CLIENT_RISKS } from '@/app/api/client/risks/route';
import { GET as LIST_INCIDENTS, POST as CREATE_INCIDENT } from '@/app/api/organizations/[id]/incidents/route';
import { PATCH as UPDATE_INCIDENT, DELETE as DELETE_INCIDENT } from '@/app/api/incidents/[id]/route';
import { GET as CLIENT_INCIDENTS } from '@/app/api/client/incidents/route';
import { GET as LIST_VULNS, POST as CREATE_VULN } from '@/app/api/organizations/[id]/vulnerabilities/route';
import { PATCH as UPDATE_VULN, DELETE as DELETE_VULN } from '@/app/api/vulnerabilities/[id]/route';
import { GET as CLIENT_VULNS } from '@/app/api/client/vulnerabilities/route';

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

describe('calcul du niveau de risque (probabilité × impact, jamais stocké)', () => {
  it.each([
    [1, 1, 'Faible'], [2, 2, 'Modéré'], [4, 2, 'Élevé'], [5, 5, 'Critique'], [4, 4, 'Critique'],
  ])('likelihood=%d impact=%d -> %s', (l, i, expected) => {
    expect(riskLevel(l, i)).toBe(expected);
  });
});

describe('registre des risques (module C)', () => {
  it('rejette une probabilité ou un impact hors échelle 1-5', async () => {
    loginAs(admin);
    const res = await CREATE_RISK(req('/api/organizations/org-x/risks', post({ title: 'X', likelihood: 6, impact: 3 })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('crée un risque et le lie à une action du plan de la même organisation', async () => {
    tables.actionPlanItem.push({ id: 'item-x', organizationId: 'org-x', title: 'Action X', status: 'Non commencé', priority: 'Moyenne', createdAt: new Date(), updatedAt: new Date() });
    loginAs(admin);
    const res = await CREATE_RISK(req('/api/organizations/org-x/risks', post({
      title: 'Perte de données clients', likelihood: 3, impact: 4, owner: 'RSSI', actionPlanItemId: 'item-x',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.actionPlanItemId).toBe('item-x');
    expect(body.treatment).toBe('À traiter');
  });

  it("refuse de lier un risque à l'action d'un AUTRE client (400)", async () => {
    tables.actionPlanItem.push({ id: 'item-y', organizationId: 'org-y', title: 'Action Y', status: 'Non commencé', priority: 'Moyenne', createdAt: new Date(), updatedAt: new Date() });
    loginAs(admin);
    const res = await CREATE_RISK(req('/api/organizations/org-x/risks', post({
      title: 'X', likelihood: 2, impact: 2, actionPlanItemId: 'item-y',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
    expect(tables.risk).toHaveLength(0);
  });

  it('cloisonnement par client sur la liste des risques', async () => {
    loginAs(admin);
    await CREATE_RISK(req('/api/organizations/org-x/risks', post({ title: 'Risque X', likelihood: 2, impact: 2 })), ctx({ id: 'org-x' }));
    await CREATE_RISK(req('/api/organizations/org-y/risks', post({ title: 'Risque Y', likelihood: 2, impact: 2 })), ctx({ id: 'org-y' }));
    const listX = await (await LIST_RISKS(req('/api/organizations/org-x/risks'), ctx({ id: 'org-x' }))).json();
    expect(listX).toHaveLength(1);
    expect(listX[0].title).toBe('Risque X');
  });

  it("l'admin met à jour le traitement et le statut d'un risque", async () => {
    loginAs(admin);
    const created = await (await CREATE_RISK(req('/api/organizations/org-x/risks', post({ title: 'X', likelihood: 3, impact: 3 })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_RISK(req(`/api/risks/${created.id}`, patch({ treatment: 'Réduire', status: 'Traité' })), ctx({ id: created.id }));
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.treatment).toBe('Réduire');
    expect(updated.status).toBe('Traité');
  });

  it('le client X lit ses risques, jamais ceux de Y ; ne peut rien modifier', async () => {
    tables.risk.push(
      { id: 'r-x', organizationId: 'org-x', title: 'Risque X', likelihood: 2, impact: 2, treatment: 'À traiter', status: 'Ouvert', createdAt: new Date(), updatedAt: new Date() },
      { id: 'r-y', organizationId: 'org-y', title: 'Risque Y', likelihood: 2, impact: 2, treatment: 'À traiter', status: 'Ouvert', createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_RISKS(req('/api/client/risks'), ctx({}))).json();
    expect(list.map((r: { id: string }) => r.id)).toEqual(['r-x']);
    expect((await UPDATE_RISK(req('/api/risks/r-x', patch({ status: 'Clos' })), ctx({ id: 'r-x' }))).status).toBe(403);
    expect((await DELETE_RISK(req('/api/risks/r-x', { method: 'DELETE' }), ctx({ id: 'r-x' }))).status).toBe(403);
  });
});

describe('échéances NIS2 24h/72h/1 mois (calculées à la volée, jamais stockées)', () => {
  const detectedAt = new Date('2026-01-01T00:00:00.000Z');

  it('pending avant échéance, late après échéance si rien envoyé', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00.000Z')); // +12h
    const d1 = computeDeadlines(detectedAt, { earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null });
    expect(d1.earlyWarning.state).toBe('pending');

    vi.setSystemTime(new Date('2026-01-02T06:00:00.000Z')); // +30h, échéance 24h dépassée
    const d2 = computeDeadlines(detectedAt, { earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null });
    expect(d2.earlyWarning.state).toBe('late');
    vi.useRealTimers();
  });

  it('done si envoyé avant échéance, late si envoyé après', () => {
    const onTime = computeDeadlines(detectedAt, { earlyWarningSentAt: new Date('2026-01-01T10:00:00.000Z'), notificationSentAt: null, finalReportSentAt: null });
    expect(onTime.earlyWarning.state).toBe('done');

    const tooLate = computeDeadlines(detectedAt, { earlyWarningSentAt: new Date('2026-01-02T10:00:00.000Z'), notificationSentAt: null, finalReportSentAt: null });
    expect(tooLate.earlyWarning.state).toBe('late');
  });
});

describe("registre d'incidents (module C)", () => {
  it('refuse un incident sans date de détection', async () => {
    loginAs(admin);
    const res = await CREATE_INCIDENT(req('/api/organizations/org-x/incidents', post({ title: 'x' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('déclare un incident avec données personnelles concernées', async () => {
    loginAs(admin);
    const res = await CREATE_INCIDENT(req('/api/organizations/org-x/incidents', post({
      title: 'Fuite de données clients', severity: 'Critique', detectedAt: '2026-01-01T08:00:00.000Z', personalDataInvolved: true,
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.personalDataInvolved).toBe(true);
    expect(body.status).toBe('Ouvert');
  });

  it("l'admin renseigne la date d'envoi de l'alerte précoce", async () => {
    loginAs(admin);
    const created = await (await CREATE_INCIDENT(req('/api/organizations/org-x/incidents', post({ title: 'x', detectedAt: '2026-01-01T08:00:00.000Z' })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_INCIDENT(req(`/api/incidents/${created.id}`, patch({ earlyWarningSentAt: '2026-01-01T20:00:00.000Z' })), ctx({ id: created.id }));
    expect(res.status).toBe(200);
    expect((await res.json()).earlyWarningSentAt).not.toBeNull();
  });

  it('cloisonnement et confinement client sur les incidents', async () => {
    tables.incidentCase.push(
      { id: 'i-x', organizationId: 'org-x', title: 'Incident X', severity: 'Moyenne', status: 'Ouvert', detectedAt: new Date(), personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'i-y', organizationId: 'org-y', title: 'Incident Y', severity: 'Moyenne', status: 'Ouvert', detectedAt: new Date(), personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientY);
    const list = await (await CLIENT_INCIDENTS(req('/api/client/incidents'), ctx({}))).json();
    expect(list.map((i: { id: string }) => i.id)).toEqual(['i-y']);
    expect((await LIST_INCIDENTS(req('/api/organizations/org-x/incidents'), ctx({ id: 'org-x' }))).status).toBe(403);
    expect((await UPDATE_INCIDENT(req('/api/incidents/i-y', patch({ status: 'Clos' })), ctx({ id: 'i-y' }))).status).toBe(403);
    expect((await DELETE_INCIDENT(req('/api/incidents/i-y', { method: 'DELETE' }), ctx({ id: 'i-y' }))).status).toBe(403);
  });
});

describe('vulnérabilités par client (module C)', () => {
  it('rejette un score CVSS hors échelle 0-10', async () => {
    loginAs(admin);
    const res = await CREATE_VULN(req('/api/organizations/org-x/vulnerabilities', post({ title: 'x', cvssScore: 11 })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('crée une vulnérabilité et la lie à une action de la même organisation', async () => {
    tables.actionPlanItem.push({ id: 'item-x', organizationId: 'org-x', title: 'Patch', status: 'Non commencé', priority: 'Haute', createdAt: new Date(), updatedAt: new Date() });
    loginAs(admin);
    const res = await CREATE_VULN(req('/api/organizations/org-x/vulnerabilities', post({
      title: 'CVE-2026-1234', severity: 'Critique', cvssScore: 9.8, actionPlanItemId: 'item-x',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    expect((await res.json()).actionPlanItemId).toBe('item-x');
  });

  it("refuse de lier une vulnérabilité à l'action d'un AUTRE client (400)", async () => {
    tables.actionPlanItem.push({ id: 'item-y', organizationId: 'org-y', title: 'Patch Y', status: 'Non commencé', priority: 'Haute', createdAt: new Date(), updatedAt: new Date() });
    loginAs(admin);
    const res = await CREATE_VULN(req('/api/organizations/org-x/vulnerabilities', post({ title: 'x', actionPlanItemId: 'item-y' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('cloisonnement et confinement client sur les vulnérabilités', async () => {
    tables.clientVulnerability.push(
      { id: 'v-x', organizationId: 'org-x', title: 'CVE X', severity: 'Haute', status: 'Ouverte', discoveredAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      { id: 'v-y', organizationId: 'org-y', title: 'CVE Y', severity: 'Haute', status: 'Ouverte', discoveredAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_VULNS(req('/api/client/vulnerabilities'), ctx({}))).json();
    expect(list.map((v: { id: string }) => v.id)).toEqual(['v-x']);
    expect((await LIST_VULNS(req('/api/organizations/org-y/vulnerabilities'), ctx({ id: 'org-y' }))).status).toBe(403);
    expect((await UPDATE_VULN(req('/api/vulnerabilities/v-x', patch({ status: 'Corrigée' })), ctx({ id: 'v-x' }))).status).toBe(403);
    expect((await DELETE_VULN(req('/api/vulnerabilities/v-x', { method: 'DELETE' }), ctx({ id: 'v-x' }))).status).toBe(403);
  });
});
