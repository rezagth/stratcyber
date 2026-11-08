import { describe, expect, it } from 'vitest';
import { BASE_DELAY_DAYS, WAVE_GAP_DAYS, WAVE_SIZE, priorityFor, prioritizeActions } from '@/lib/audit/prioritization';
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
