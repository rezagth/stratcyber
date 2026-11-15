import { describe, it, expect } from 'vitest';
import { buildAuditReportHtml, planBlocks, parsePlanDescription, categoryLabel } from '@/lib/audit-report/html';
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

describe('rapport d’audit — sources vérifiées et périmètre', () => {
  it('liste les sources des questions posées et le périmètre non couvert', () => {
    const html = buildAuditReportHtml(base({
      responses: [
        { question: 't3', answer: 'Oui', category: 'Technique', score: 5 },
        { question: 'rgpd2', answer: 'Non', category: 'RGPD', score: 0 },
      ],
    }));
    expect(html).toContain('Références vérifiées');
    expect(html).toContain('cybermalveillance.gouv.fr');
    expect(html).toContain('cnil.fr');
    expect(html).toContain('Non couvert par ce questionnaire');
    expect(html).toContain('DORA');
    expect(html).toContain('toutes de poids égal');
  });

  it('signale les réponses d’un ancien questionnaire sans source vérifiée', () => {
    const html = buildAuditReportHtml(base({
      responses: [{ question: 'iso_1', answer: 'Oui', category: 'Gouvernance', score: 5 }],
    }));
    expect(html).toContain('sans source vérifiée');
  });

  it('présente à part, hors score, les points à valider par le consultant', () => {
    const html = buildAuditReportHtml(base({
      responses: [{ question: 'g2', answer: 'Non', category: 'Gouvernance', score: 0 }],
    }));
    expect(html).toContain('Points à valider par le consultant');
    expect(html).toContain('hors score');
    expect(html).not.toContain('sans source vérifiée</strong>');
  });
});

describe('rapport d’audit — dossier de preuves', () => {
  it('liste les preuves attendues par action avec des colonnes à compléter', () => {
    const html = buildAuditReportHtml(base({
      actionItems: [{ title: 'Activer la MFA', priority: 'Haute', responsible: null, dueDate: null, description: 'Phase 1 : à traiter. Preuve attendue : capture de la configuration MFA.' } as never],
    }));
    expect(html).toContain('Dossier de preuves');
    expect(html).toContain('capture de la configuration MFA');
    expect(html).toContain('Remise le');
    expect(html).toContain('Aucun contrôle externe réalisé');
  });

  it('sans action au plan : aucune preuve inventée', () => {
    const html = buildAuditReportHtml(base({ actionItems: [] }));
    expect(html).toContain('Aucune action enregistrée : aucune preuve à réunir');
  });
});

describe('rapport d’audit — plan en blocs 30 / 60 / 90 jours', () => {
  const day = 24 * 60 * 60 * 1000;
  const t0 = new Date('2026-11-15T10:00:00Z');
  const item = (title: string, days: number | null) => ({
    title, description: 'Preuve attendue : x.', priority: 'Haute', responsible: null,
    dueDate: days === null ? null : new Date(t0.getTime() + days * day), createdAt: t0,
  });
  it('répartit les actions selon leur échéance', () => {
    const blocks = planBlocks([item('A', 14), item('B', 30), item('C', 31), item('D', 60), item('E', 90), item('F', 91), item('G', null)] as never[], t0);
    expect(blocks.map((b) => [b.label, b.items.map((i: { title: string }) => i.title)])).toEqual([
      ['Sous 30 jours', ['A', 'B']],
      ['De 31 à 60 jours', ['C', 'D']],
      ['De 61 à 90 jours', ['E']],
      ['Au-delà de 90 jours', ['F', 'G']],
    ]);
  });
  it('omet les blocs vides et les affiche dans le rapport', () => {
    const html = buildAuditReportHtml(base({ actionItems: [item('Activer la MFA', 30), item('Plan de continuité', 90)] as never[] }));
    expect(html).toContain('Sous 30 jours');
    expect(html).toContain('De 61 à 90 jours');
    expect(html).not.toContain('De 31 à 60 jours');
  });
});
