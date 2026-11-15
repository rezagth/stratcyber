// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb, tables } from '../helpers/fake-prisma';
import { buildAuditReportData } from '@/lib/audit-report/data';
import { buildAuditReportHtml } from '@/lib/audit-report/html';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});

const owner = { id: 'user-a', email: 'a@exemple.fr', name: 'Auditeur', role: 'admin', organizationId: null };
const clientX = { id: 'client-x', email: 'c@exemple.fr', name: 'Client', role: 'client', organizationId: 'org-x' };
const clientY = { id: 'client-y', email: 'y@exemple.fr', name: 'Client Y', role: 'client', organizationId: 'org-y' };

const finding = (over: Record<string, unknown>) => ({
  id: `f-${Math.random()}`, campaignId: 'camp-x', targetHost: 'exemple.fr', checkId: 'c', source: 'auto',
  severity: 'Haute', title: 'HSTS absent', detail: 'En-tête manquant', status: 'Nouveau', runAt: new Date('2026-11-10'), ...over,
});

beforeEach(() => {
  resetDb();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  tables.audit.push(
    { id: 'audit-x', userId: owner.id, organizationId: 'org-x', sharedWithClient: true, score: 60, maturity: 'Moyenne', createdAt: new Date('2026-11-12') },
    { id: 'audit-y', userId: owner.id, organizationId: 'org-y', sharedWithClient: true, score: 70, maturity: 'Élevée', createdAt: new Date('2026-11-12') }
  );
  tables.scanCampaign.push(
    { id: 'camp-x', organizationId: 'org-x', status: 'Terminée' },
    { id: 'camp-x-annulee', organizationId: 'org-x', status: 'Annulée' },
    { id: 'camp-y', organizationId: 'org-y', status: 'Terminée' }
  );
  tables.scanFinding.push(
    finding({ id: 'f1', title: 'HSTS absent', status: 'Nouveau' }),
    finding({ id: 'f2', title: 'Certificat expire bientôt', severity: 'Critique', status: 'Retenu' }),
    finding({ id: 'f3', title: 'Faux positif écarté', status: 'Écarté' }),
    finding({ id: 'f4', title: 'Contrôle réussi', severity: 'OK', status: 'Nouveau' }),
    finding({ id: 'f5', title: 'Constat campagne annulée', campaignId: 'camp-x-annulee' }),
    finding({ id: 'f6', title: 'SECRET AUTRE CLIENT', campaignId: 'camp-y', targetHost: 'autre.fr', status: 'Retenu' })
  );
});

describe('rapport d’audit — constats vérifiés par le contrôle externe', () => {
  it('le rapport complet contient les constats non écartés du client, triés par gravité, sans les « OK »', async () => {
    const data = await buildAuditReportData(owner as never, 'audit-x');
    expect(data).not.toBeNull();
    expect(data!.scan.findings.map((f) => f.title)).toEqual(['Certificat expire bientôt', 'HSTS absent']);
    expect(data!.scan.hosts).toEqual(['exemple.fr']);
    expect(data!.scan.checks).toBe(3); // f1, f2, f4 : ni l'écarté, ni la campagne annulée, ni l'autre client
  });

  it('le client ne voit que les constats « Retenus » de SA organisation', async () => {
    const data = await buildAuditReportData(clientX as never, 'audit-x');
    expect(data!.scan.findings.map((f) => f.title)).toEqual(['Certificat expire bientôt']);
    expect(JSON.stringify(data)).not.toContain('SECRET AUTRE CLIENT');
  });

  it('un client ne peut pas obtenir le rapport (ni les constats) d’une autre organisation', async () => {
    expect(await buildAuditReportData(clientY as never, 'audit-x')).toBeNull();
    const own = await buildAuditReportData(clientY as never, 'audit-y');
    expect(own!.scan.findings.map((f) => f.title)).toEqual(['SECRET AUTRE CLIENT']);
  });

  it('un audit sans organisation n’a aucun constat de scan', async () => {
    tables.audit.push({ id: 'audit-sans-org', userId: owner.id, organizationId: null, score: 50, maturity: 'Moyenne', createdAt: new Date() });
    const data = await buildAuditReportData(owner as never, 'audit-sans-org');
    expect(data!.scan).toEqual({ findings: [], checks: 0, hosts: [], lastRunAt: null });
  });

  it('le HTML affiche la section « Constats vérifiés » et précise la méthode quand un contrôle a eu lieu', async () => {
    const data = await buildAuditReportData(owner as never, 'audit-x');
    const html = buildAuditReportHtml(data!);
    expect(html).toContain('Constats vérifiés par contrôle externe non intrusif');
    expect(html).toContain('HSTS absent');
    expect(html).toContain('contrôle externe non intrusif');
    expect(html).toContain('exemple.fr');
    expect(html).toContain('Aucun test d\'intrusion');
  });

  it('sans contrôle externe, le rapport reste déclaratif et n’affiche aucune section « vérifiés »', async () => {
    tables.scanFinding.length = 0;
    const data = await buildAuditReportData(owner as never, 'audit-x');
    const html = buildAuditReportHtml(data!);
    expect(html).not.toContain('Constats vérifiés');
    expect(html).toContain('pas été vérifiées techniquement');
  });
});
