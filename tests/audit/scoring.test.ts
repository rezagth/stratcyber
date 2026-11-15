import { describe, expect, it } from 'vitest';
import { computeAuditResult } from '@/lib/audit/scoring';

// Les 10 questions RGPD adossées à une source CNIL vérifiée (voir lib/audit/sources.ts).
// Toutes comptent pour un poids égal : max de la catégorie si les 10 sont répondues = 5 × 10 = 50.
const RGPD = ['rgpd1', 'rgpd2', 'rgpd3', 'rgpd4', 'rgpd5', 'rgpd6', 'rgpd7', 'rgpd8', 'rgpd9', 'rgpd10'];
const all = (score: number) => RGPD.map((questionId) => ({ questionId, answer: 'x', score }));

describe('computeAuditResult', () => {
  it('calcule la moyenne attendue, poids égal : (4 + 2 + 0×8) / 50 = 12 %', () => {
    // 8 questions volontairement non répondues : elles comptent comme 0, jamais ignorées.
    const r = computeAuditResult([
      { questionId: 'rgpd1', answer: 'x', score: 4 },
      { questionId: 'rgpd2', answer: 'x', score: 2 },
    ]);
    expect(r.globalScore).toBe(12);
    expect(r.maturity).toBe('Faible');
    expect(r.scoresByCategory.RGPD).toBe(12);
  });

  it('tout à 5 → 100 % et maturité Élevée ; tout à 0 → 0 % et Faible', () => {
    const top = computeAuditResult(all(5));
    expect(top.globalScore).toBe(100);
    expect(top.maturity).toBe('Élevée');
    const low = computeAuditResult(all(0));
    expect(low.globalScore).toBe(0);
    expect(low.maturity).toBe('Faible');
  });

  it('une question applicable mais non répondue compte comme 0 (jamais ignorée du dénominateur)', () => {
    const r = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: 5 }]);
    // 5 / 50 = 10 %, et non 100 % comme le calculerait une formule qui ignore les questions non répondues.
    expect(r.globalScore).toBe(10);
    expect(r.unansweredByCategory?.RGPD).toBe(9);
  });

  it('tous les poids sont égaux : une question « poids 3 » et une « poids 2 » pèsent pareil', () => {
    const a = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: 5 }]); // ancien poids 3
    const b = computeAuditResult([{ questionId: 'rgpd6', answer: 'x', score: 5 }]); // ancien poids 2
    expect(a.globalScore).toBe(b.globalScore);
  });

  it("une catégorie jamais abordée par l'audit n'est pas pénalisée", () => {
    const r = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: 5 }]);
    expect(r.unansweredByCategory?.DORA ?? 0).toBe(0);
    expect(r.scoresByCategory.DORA).toBeUndefined();
  });

  it('seuils de maturité : 39 → Faible, 40 → Moyenne, 69 → Moyenne, 70 → Élevée', () => {
    const at = (pct: number) => computeAuditResult(all((pct / 100) * 5));
    expect(at(39).maturity).toBe('Faible');
    expect(at(40).maturity).toBe('Moyenne');
    expect(at(69).maturity).toBe('Moyenne');
    expect(at(70).maturity).toBe('Élevée');
  });

  it('sans réponse exploitable : score 0, jamais NaN', () => {
    for (const answers of [[], [{ questionId: 'inconnue', answer: 'x', score: 5 }]]) {
      const r = computeAuditResult(answers);
      expect(r.globalScore).toBe(0);
      expect(Number.isNaN(r.globalScore)).toBe(false);
      expect(r.maturity).toBe('Faible');
    }
  });

  it('une note hors échelle ne fausse pas le score (plafonnée à 5, minorée à 0)', () => {
    const rest = RGPD.slice(1).map((questionId) => ({ questionId, answer: 'x', score: 5 }));
    const inflated = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: 500 }, ...rest]);
    expect(inflated.globalScore).toBe(100);
    const negative = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: -50 }, ...rest]);
    expect(negative.globalScore).toBe(90); // (0 + 9×5) / 50
    const notANumber = computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: Number.NaN }]);
    expect(notANumber.globalScore).toBe(0);
  });

  it('les catégories sous 70 % déclenchent des recommandations, pas celles au-dessus', () => {
    expect(computeAuditResult([{ questionId: 'rgpd1', answer: 'x', score: 1 }]).recommendations.length).toBeGreaterThan(0);
    expect(computeAuditResult(all(5)).recommendations).toHaveLength(0);
  });
});

describe('computeAuditResult — pas de source vérifiée, pas de calcul', () => {
  it('ignore les réponses aux questions sans source vérifiée (ISO 27001, NIS 2, gouvernance…)', () => {
    for (const questionId of ['iso_1', 'nis2_1', 'dora_1', 'ebios_1', 'g2', 'h4']) {
      const r = computeAuditResult([{ questionId, answer: 'x', score: 5 }]);
      expect(r.globalScore, questionId).toBe(0);
    }
    const r = computeAuditResult([{ questionId: 'iso_1', answer: 'x', score: 5 }]);
    expect(r.scoresByCategory.ISO27001).toBeUndefined();
  });
});

describe('points « à valider par le consultant » : actions au plan, jamais de note', () => {
  it('génèrent une action marquée « sans source officielle vérifiée » sans changer le score', async () => {
    const { generateActionPlan, UNSOURCED_ACTION_MARK } = await import('@/lib/audit/scoring');
    const { estimateEffort } = await import('@/lib/audit/prioritization');
    const answers = [
      { questionId: 'g2', answer: 'Non', score: 0 },
      { questionId: 'h4', answer: 'x', score: 0 },
      { questionId: 's1', answer: 'Non', score: 0 },
    ];
    const result = computeAuditResult(answers);
    expect(result.globalScore).toBe(0); // aucune question sourcée répondue : le score n'est pas influencé
    const plan = generateActionPlan(result, answers);
    expect(plan.length).toBe(3);
    for (const a of plan) {
      expect(a.action.endsWith(UNSOURCED_ACTION_MARK), a.action).toBe(true);
      // le suffixe ne doit pas changer l'effort estimé de l'action
      const base = a.action.slice(0, -UNSOURCED_ACTION_MARK.length);
      expect(estimateEffort(a.action)).toBe(estimateEffort(base));
    }
  });

  it('une action issue d’une question sourcée n’est pas marquée', async () => {
    const { generateActionPlan, UNSOURCED_ACTION_MARK } = await import('@/lib/audit/scoring');
    const answers = [{ questionId: 't2', answer: 'Non', score: 0 }];
    const plan = generateActionPlan(computeAuditResult(answers), answers);
    expect(plan.length).toBeGreaterThan(0);
    for (const a of plan) expect(a.action.includes(UNSOURCED_ACTION_MARK)).toBe(false);
  });
});
