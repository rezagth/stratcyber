import { describe, it, expect } from 'vitest';
import { buildAuditReportHtml, parsePlanDescription, categoryLabel } from '@/lib/audit-report/html';
import { planActions } from '@/lib/audit/prioritization';
import type { AuditReportData } from '@/lib/audit-report/data';

const base = (over: Partial<AuditReportData> = {}): AuditReportData => ({
  organizationName: 'Cabinet <b>Test</b>',
  detail: 'full',
  audit: { id: 'a', createdAt: new Date('2026-11-16'), score: 52, maturity: 'Moyenne' },
  recommendations: [],
  plan: [],
  actionItems: [],
  categoryScores: [{ category: 'SupplyChain', percent: 50 }, { category: 'GRC', percent: 33 }],
  compliance: [],
  responses: [],
  ...over,
} as AuditReportData);

describe('rapport d’audit — preuves et lisibilité', () => {
  it('extrait la phase et la preuve attendue de la description d’une action', () => {
    const [a] = planActions([{ title: 'Activer la MFA sur la messagerie', category: 'Technique' }], new Date('2026-11-16'));
    const parsed = parsePlanDescription(a.description);
    expect(parsed.phase).toBe('Phase 1');
    expect(parsed.proof).toMatch(/capture d.écran|confirmation écrite/);
    expect(parsed.proof?.endsWith('.')).toBe(false);
  });

  it('renvoie null quand la description est absente', () => {
    expect(parsePlanDescription(null)).toEqual({ phase: null, proof: null });
    expect(parsePlanDescription('texte libre')).toEqual({ phase: null, proof: null });
  });

  it('le plan du rapport a une colonne « Preuve attendue » remplie', () => {
    const planned = planActions([{ title: 'Mettre en place des sauvegardes hors site', category: 'Technique' }], new Date('2026-11-16'));
    const html = buildAuditReportHtml(base({
      actionItems: planned.map((p) => ({ title: p.title, description: p.description, priority: p.priority, responsible: 'DSI', dueDate: p.dueDate })),
    }));
    expect(html).toContain('Preuve attendue');
    expect(html).toMatch(/Preuve attendue<\/th>/);
    expect(html).toContain('Phase 1');
    expect(html).not.toContain('À définir avec le client');
  });

  it('affiche « À définir avec le client » quand aucune preuve n’est connue', () => {
    const html = buildAuditReportHtml(base({
      actionItems: [{ title: 'Action sans description', description: null, priority: 'Haute', responsible: null, dueDate: null }],
    }));
    expect(html).toContain('À définir avec le client');
  });

  it('remplace les libellés internes par des libellés lisibles', () => {
    expect(categoryLabel('SupplyChain')).toBe('Chaîne d\'approvisionnement');
    expect(categoryLabel('GRC')).toBe('Gouvernance, risques et conformité');
    expect(categoryLabel('Technique')).toBe('Technique');
    const html = buildAuditReportHtml(base());
    expect(html).not.toContain('>SupplyChain<');
    expect(html).toContain('Chaîne d&#39;approvisionnement');
  });

  it('échappe le HTML venant des données (nom du client, actions)', () => {
    const html = buildAuditReportHtml(base({
      actionItems: [{ title: '<script>alert(1)</script>', description: 'Preuve attendue : <img src=x onerror=1>.', priority: 'Haute', responsible: null, dueDate: null }],
    }));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('Cabinet <b>Test</b>');
  });

  it('garde les avertissements : non qualifié ANSSI, pas une attestation de conformité', () => {
    const html = buildAuditReportHtml(base());
    expect(html).toMatch(/pas une prestation qualifiée par l'ANSSI/);
    expect(html).toMatch(/n'est pas une attestation de conformité/);
  });
});
