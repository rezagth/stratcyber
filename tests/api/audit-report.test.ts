// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA, userB } from '../helpers/api-test-utils';
import { buildAuditReportData } from '@/lib/audit-report/data';
import { buildAuditReportHtml } from '@/lib/audit-report/html';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/audit-report/render', () => ({
  renderAuditReportPdf: vi.fn(async () => Buffer.from('%PDF-FAKE')),
}));

import { GET } from '@/app/api/audits/[id]/report-pdf/route';
import { renderAuditReportPdf } from '@/lib/audit-report/render';

const client = (organizationId: string | null) => ({
  id: `client-${organizationId}`, email: 'c@exemple.fr', name: 'Client', role: 'client', organizationId,
});
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const call = (id: string) => GET(req(`/api/audits/${id}/report-pdf`), ctx({ id }));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  vi.mocked(renderAuditReportPdf).mockClear();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  tables.audit.push(
    { id: 'audit-a', userId: userA.id, organizationId: 'org-x', sharedWithClient: true, score: 62, maturity: 'Moyenne',
      recommendations: 'Activer la MFA\nSauvegarder hors ligne', actionPlan: JSON.stringify([{ title: 'Déployer la MFA', priority: 'HIGH' }]), createdAt: new Date('2026-01-01') },
    { id: 'audit-prive', userId: userA.id, organizationId: 'org-x', sharedWithClient: false, score: 10, maturity: 'Faible', recommendations: 'secret-prive', createdAt: new Date('2026-01-02') },
    { id: 'audit-y', userId: userA.id, organizationId: 'org-y', sharedWithClient: true, score: 90, maturity: 'Élevée', recommendations: 'secret-y', createdAt: new Date('2026-01-03') }
  );
  tables.auditResponse.push(
    { id: 'r1', auditId: 'audit-a', question: '<script>alert(1)</script>', answer: 'oui', score: 4, category: 'Accès' },
    { id: 'r2', auditId: 'audit-a', question: 'Sauvegardes ?', answer: 'non', score: 1, category: 'Accès' }
  );
  tables.complianceScore.push({ id: 'c1', auditId: 'audit-a', regulation: 'NIS2', score: 55, status: 'À améliorer' });
});

describe('GET /api/audits/[id]/report-pdf', () => {
  it('401 sans session, sans rendu', async () => {
    loginAs(null);
    expect((await call('audit-a')).status).toBe(401);
    expect(renderAuditReportPdf).not.toHaveBeenCalled();
  });

  it("le propriétaire obtient son PDF avec le détail complet", async () => {
    loginAs(userA);
    const res = await call('audit-a');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    const data = vi.mocked(renderAuditReportPdf).mock.calls[0][0];
    expect(data.detail).toBe('full');
    expect(data.responses).toHaveLength(2);
    expect(data.categoryScores).toEqual([{ category: 'Accès', percent: 50 }]);
  });

  it("un autre utilisateur, même admin, n'obtient pas l'audit d'autrui (404)", async () => {
    for (const u of [userB, admin]) {
      loginAs(u);
      expect((await call('audit-a')).status).toBe(404);
    }
    expect(renderAuditReportPdf).not.toHaveBeenCalled();
  });

  it('un client obtient un audit partagé de son organisation, en version résumée', async () => {
    loginAs(client('org-x'));
    expect((await call('audit-a')).status).toBe(200);
    const data = vi.mocked(renderAuditReportPdf).mock.calls[0][0];
    expect(data.detail).toBe('summary');
    expect(data.responses).toEqual([]);
    expect(data.compliance).toEqual([]);
  });

  it("un client n'obtient ni un audit non partagé, ni celui d'une autre organisation, ni sans organisation (404)", async () => {
    loginAs(client('org-x'));
    expect((await call('audit-prive')).status).toBe(404);
    expect((await call('audit-y')).status).toBe(404);
    loginAs(client(null));
    expect((await call('audit-a')).status).toBe(404);
    expect(renderAuditReportPdf).not.toHaveBeenCalled();
  });

  it('404 pour un audit inexistant', async () => {
    loginAs(userA);
    expect((await call('inconnu')).status).toBe(404);
  });
});

describe('gabarit HTML du rapport d\'audit', () => {
  it('échappe le contenu libre et ne montre pas le détail en version résumée', async () => {
    const full = await buildAuditReportData(userA, 'audit-a');
    const html = buildAuditReportHtml(full!);
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('NIS2');
    expect(html).toContain('Déployer la MFA');

    const summary = await buildAuditReportData(client('org-x'), 'audit-a');
    const summaryHtml = buildAuditReportHtml(summary!);
    expect(summaryHtml).not.toContain('Détail des réponses');
    expect(summaryHtml).not.toContain('NIS2');
    expect(summaryHtml).toContain('Activer la MFA');
  });

  it("règles de pagination : seules la synthèse et les lignes ne se coupent pas, l'en-tête de tableau se répète", async () => {
    const html = buildAuditReportHtml((await buildAuditReportData(userA, 'audit-a'))!);
    expect(html).toMatch(/\.section \{[^}]*\}/);
    expect(html.match(/\.section \{[^}]*\}/)![0]).not.toContain('avoid');
    expect(html).toContain('.section.keep { break-inside: avoid; }');
    expect(html).toContain('break-after: avoid');
    expect(html).toContain('thead { display: table-header-group; }');
    expect(html).toContain('tr { break-inside: avoid; }');
    expect(html.match(/class="section keep"/g)).toHaveLength(1);
  });
});
