import { describe, expect, it } from 'vitest';
import { BASE_DELAY_DAYS, PHASE1_DAYS, PHASE1_MAX, WAVE_GAP_DAYS, WAVE_SIZE, estimateEffort, planActions, priorityFor, prioritizeActions } from '@/lib/audit/prioritization';
import { buildActionPlanFromAudit } from '@/lib/audit/action-plan-generator';

const DAY = 86_400_000;
const from = new Date('2026-01-01T00:00:00Z');

describe('priorityFor', () => {
  it('classe les mesures techniques de base et les incidents en Critique', () => {
    expect(priorityFor({ title: 'Mettre en place des sauvegardes hors ligne', category: 'Technique' })).toBe('Critique');
    expect(priorityFor({ title: 'Activer la double authentification', category: 'Gouvernance' })).toBe('Critique');
    expect(priorityFor({ title: 'Procédure de notification des violations dans les 72h', category: 'RGPD' })).toBe('Critique');
  });
  it('classe les obligations réglementaires en Haute, la gouvernance en Moyenne, la maturité en Faible', () => {
    expect(priorityFor({ title: 'Désigner un DPO', category: 'RGPD' })).toBe('Haute');
    expect(priorityFor({ title: 'Définir une charte', category: 'Gouvernance' })).toBe('Moyenne');
    expect(priorityFor({ title: 'Préparer la certification', category: 'ISO27001' })).toBe('Faible');
  });
});

describe('prioritizeActions', () => {
  it('trie par priorité décroissante et fixe les échéances selon la priorité', () => {
    const out = prioritizeActions([
      { title: 'Préparer la certification', category: 'ISO27001' },
      { title: 'Désigner un DPO', category: 'RGPD' },
      { title: 'Activer la double authentification', category: 'Technique' },
    ], from);
    expect(out.map((a) => a.priority)).toEqual(['Critique', 'Haute', 'Faible']);
    expect(out[0].dueDate.getTime()).toBe(from.getTime() + BASE_DELAY_DAYS.Critique * DAY);
    expect(out[2].dueDate.getTime()).toBe(from.getTime() + BASE_DELAY_DAYS.Faible * DAY);
  });

  it('étale les échéances par vagues pour ne pas tout demander le même jour', () => {
    const many = Array.from({ length: WAVE_SIZE * 2 + 1 }, (_, i) => ({ title: `Politique ${i}`, category: 'Gouvernance' }));
    const out = prioritizeActions(many, from);
    const days = out.map((a) => Math.round((a.dueDate.getTime() - from.getTime()) / DAY));
    expect(new Set(days).size).toBe(3);
    expect(days[0]).toBe(BASE_DELAY_DAYS.Moyenne);
    expect(days[WAVE_SIZE]).toBe(BASE_DELAY_DAYS.Moyenne + WAVE_GAP_DAYS);
    expect(days[WAVE_SIZE * 2]).toBe(BASE_DELAY_DAYS.Moyenne + 2 * WAVE_GAP_DAYS);
  });

  it('conserve l\'ordre relatif à priorité égale', () => {
    const out = prioritizeActions([{ title: 'B', category: 'Gouvernance' }, { title: 'A', category: 'Gouvernance' }], from);
    expect(out.map((a) => a.title)).toEqual(['B', 'A']);
  });
});

describe('buildActionPlanFromAudit : le plan n\'est plus uniformément Haute', () => {
  it('produit plusieurs niveaux de priorité et des échéances différentes à partir de réponses négatives', async () => {
    const { auditQuestions } = await import('@/lib/audit/questions');
    const { rgpdQuestions } = await import('@/lib/audit/questions-extended');
    const responses = [...auditQuestions, ...rgpdQuestions]
      .filter((q) => q.type === 'boolean' && q.actionRecommendations?.negativeAnswer?.length)
      .map((q) => ({ question: q.id, answer: 'Non', score: 0 }));
    const plan = buildActionPlanFromAudit({ id: 'a', organizationId: 'o', createdAt: from, responses });
    expect(plan.length).toBeGreaterThan(5);
    expect(new Set(plan.map((p) => p.priority)).size).toBeGreaterThan(1);
    expect(new Set(plan.map((p) => p.dueDate.getTime())).size).toBeGreaterThan(1);
    // Triées : la première action n'est jamais moins prioritaire que la dernière.
    const rank = { Critique: 0, Haute: 1, Moyenne: 2, Faible: 3 } as const;
    expect(rank[plan[0].priority]).toBeLessThanOrEqual(rank[plan[plan.length - 1].priority]);
  });
});

describe('planActions : plan réaliste', () => {
  const many = [
    ...Array.from({ length: 20 }, (_, i) => ({ title: `Documenter la procédure ${i}`, category: 'RGPD' })),
    { title: 'Activer la double authentification', category: 'Technique' },
    { title: 'Mettre à jour les correctifs de sécurité', category: 'Technique' },
    { title: 'Préparer la certification', category: 'ISO27001' },
  ];

  it('estime l\'effort : gain rapide, moyen ou lourd', () => {
    expect(estimateEffort('Activer la double authentification')).toBe('rapide');
    expect(estimateEffort('Préparer la certification ISO 27001')).toBe('lourd');
    expect(estimateEffort('Former les équipes')).toBe('moyen');
  });

  it('limite la phase 1 à PHASE1_MAX actions, toutes dues dans les 90 jours', () => {
    const out = planActions(many, from);
    const p1 = out.filter((a) => a.phase === 1);
    expect(p1).toHaveLength(PHASE1_MAX);
    for (const a of p1) expect(a.dueDate.getTime()).toBeLessThanOrEqual(from.getTime() + PHASE1_DAYS * DAY);
  });

  it('place les gains rapides critiques en premier, avec une échéance de 14 jours', () => {
    const out = planActions(many, from);
    expect(out[0].effort).toBe('rapide');
    expect(out[0].priority).toBe('Critique');
    expect(out[0].dueDate.getTime()).toBe(from.getTime() + 14 * DAY);
  });

  it('phase 2 : après 90 jours, et les actions Haute y deviennent Moyenne', () => {
    const out = planActions(many, from);
    const p2 = out.filter((a) => a.phase === 2);
    expect(p2.length).toBe(many.length - PHASE1_MAX);
    for (const a of p2) {
      expect(a.dueDate.getTime()).toBeGreaterThan(from.getTime() + PHASE1_DAYS * DAY);
      expect(a.priority).not.toBe('Haute');
    }
  });

  it('chaque action a une description avec phase, effort et preuve attendue', () => {
    for (const a of planActions(many, from)) {
      expect(a.description).toMatch(/Phase [12]/);
      expect(a.description).toMatch(/Effort estimé/);
      expect(a.description).toMatch(/Preuve attendue/);
    }
  });

  it('le plan d\'un audit au pire sur toutes les questions reste lisible : au plus PHASE1_MAX actions « Critique/Haute » en phase 1', async () => {
    const { auditQuestions } = await import('@/lib/audit/questions');
    const { rgpdQuestions, nis2Questions } = await import('@/lib/audit/questions-extended');
    const responses = [...auditQuestions, ...rgpdQuestions, ...nis2Questions].map((q) => ({
      question: q.id, answer: q.type === 'boolean' ? 'non' : 'x', score: 0,
    }));
    const plan = buildActionPlanFromAudit({ id: 'a', organizationId: 'o', createdAt: from, responses });
    const p1 = plan.filter((p) => p.description.startsWith('Phase 1'));
    expect(p1).toHaveLength(PHASE1_MAX);
    expect(plan.filter((p) => p.priority === 'Haute').length).toBeLessThanOrEqual(PHASE1_MAX);
  });
});
