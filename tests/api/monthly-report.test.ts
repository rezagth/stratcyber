// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { buildMonthlyReportData } from '@/lib/monthly-report/data';
import { buildMonthlyReportHtml } from '@/lib/monthly-report/html';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
vi.mock('@/lib/monthly-report/render', () => ({
  renderMonthlyReportPdf: vi.fn(async () => Buffer.from('%PDF-FAKE')),
}));

import { GET as ADMIN_REPORT } from '@/app/api/organizations/[id]/monthly-report/route';
import { GET as CLIENT_REPORT } from '@/app/api/client/monthly-report/route';
import { renderMonthlyReportPdf } from '@/lib/monthly-report/render';

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Client', role: 'client', organizationId,
});
const clientX = clientOf('org-x');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  vi.mocked(renderMonthlyReportPdf).mockClear();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('agrégation des données du rapport mensuel (module K)', () => {
  it('agrège incidents et actions du mois, sans mélanger les mois ni les clients', async () => {
    tables.incidentCase.push(
      { id: 'i1', organizationId: 'org-x', title: 'Incident de mars', severity: 'Haute', status: 'Clos', detectedAt: new Date('2026-03-15'), earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'i2', organizationId: 'org-x', title: 'Incident de février', severity: 'Haute', status: 'Clos', detectedAt: new Date('2026-02-28'), earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() },
      { id: 'i3', organizationId: 'org-y', title: 'Incident autre client', severity: 'Haute', status: 'Clos', detectedAt: new Date('2026-03-10'), earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, personalDataInvolved: false, createdAt: new Date(), updatedAt: new Date() }
    );
    tables.actionPlanItem.push(
      { id: 'a1', organizationId: 'org-x', title: 'Action finie en mars', status: 'Terminé', priority: 'Haute', proofDate: new Date('2026-03-05'), createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2', organizationId: 'org-x', title: 'Action finie en avril', status: 'Terminé', priority: 'Haute', proofDate: new Date('2026-04-01'), createdAt: new Date(), updatedAt: new Date() }
    );

    const report = await buildMonthlyReportData('org-x', 3, 2026);
    expect(report?.incidentsInPeriod.map((i) => i.title)).toEqual(['Incident de mars']);
    expect(report?.actionsCompletedInPeriod.map((a) => a.title)).toEqual(['Action finie en mars']);
    expect(report?.period.label).toBe('mars 2026');
  });

  it('agrège vulnérabilités, politiques, questionnaires et fournisseurs', async () => {
    tables.clientVulnerability.push(
      { id: 'v1', organizationId: 'org-x', title: 'v1', severity: 'Critique', status: 'Ouverte', discoveredAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      { id: 'v2', organizationId: 'org-x', title: 'v2', severity: 'Critique', status: 'Corrigée', discoveredAt: new Date(), createdAt: new Date(), updatedAt: new Date() }
    );
    tables.clientPolicyDocument.push(
      { id: 'p1', organizationId: 'org-x', type: 'PSSI', title: 'PSSI', content: 'x', version: 1, status: 'Validé', createdAt: new Date(), updatedAt: new Date() }
    );
    tables.securityAnswer.push(
      { id: 's1', organizationId: 'org-x', question: 'q', answer: 'a', isNotApplicable: false, category: null, answeredAt: new Date(), status: 'Validé', createdAt: new Date(), updatedAt: new Date() }
    );
    tables.supplier.push(
      { id: 'sup1', organizationId: 'org-x', name: 'Fournisseur', criticality: 'Moyenne', hasSecurityClause: true, status: 'Actif', lastReviewDate: new Date('2020-01-01'), createdAt: new Date(), updatedAt: new Date() }
    );

    const report = await buildMonthlyReportData('org-x', 1, 2026);
    expect(report?.vulnerabilities).toEqual({ total: 2, open: 1, critical: 1 });
    expect(report?.policies).toEqual({ total: 1, validated: 1 });
    expect(report?.securityAnswers).toEqual({ total: 1, validated: 1 });
    expect(report?.suppliers).toEqual({ total: 1, withSecurityClause: 1, reviewLate: 1 });
  });

  it('renvoie null pour un client inexistant', async () => {
    expect(await buildMonthlyReportData('org-inconnu', 1, 2026)).toBeNull();
  });
});

describe('gabarit HTML du rapport mensuel (module K)', () => {
  it('inclut le nom du client, la période et les sections principales', async () => {
    const report = await buildMonthlyReportData('org-x', 6, 2026);
    const html = buildMonthlyReportHtml(report!);
    expect(html).toContain('Client X');
    expect(html).toContain('juin 2026');
    expect(html).toContain('Synthèse gouvernance');
    expect(html).toContain('Formation');
  });

  it('échappe le HTML dans les champs texte libres', async () => {
    tables.organization.push({ id: 'org-xss', name: '<script>alert(1)</script>' });
    const report = await buildMonthlyReportData('org-xss', 1, 2026);
    const html = buildMonthlyReportHtml(report!);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('route PDF du rapport mensuel (module K)', () => {
  it("génère le PDF pour l'admin avec la période demandée", async () => {
    loginAs(admin);
    const res = await ADMIN_REPORT(req('/api/organizations/org-x/monthly-report?month=3&year=2026'), ctx({ id: 'org-x' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(renderMonthlyReportPdf).toHaveBeenCalledTimes(1);
    const dataArg = vi.mocked(renderMonthlyReportPdf).mock.calls[0][0];
    expect(dataArg.period).toEqual({ month: 3, year: 2026, label: 'mars 2026' });
  });

  it('rejette un mois invalide (400) et un client inconnu (404)', async () => {
    loginAs(admin);
    expect((await ADMIN_REPORT(req('/api/organizations/org-x/monthly-report?month=13'), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await ADMIN_REPORT(req('/api/organizations/org-inconnu/monthly-report'), ctx({ id: 'org-inconnu' }))).status).toBe(404);
  });

  it("un client ne peut pas utiliser la route admin (403)", async () => {
    loginAs(clientX);
    expect((await ADMIN_REPORT(req('/api/organizations/org-x/monthly-report'), ctx({ id: 'org-x' }))).status).toBe(403);
  });

  it("le client télécharge le rapport de sa propre organisation", async () => {
    loginAs(clientX);
    const res = await CLIENT_REPORT(req('/api/client/monthly-report?month=3&year=2026'), ctx({}));
    expect(res.status).toBe(200);
    const dataArg = vi.mocked(renderMonthlyReportPdf).mock.calls[0][0];
    expect(dataArg.organization.id).toBe('org-x');
  });
});
