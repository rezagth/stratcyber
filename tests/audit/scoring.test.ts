import { describe, expect, it } from 'vitest';
import { computeAuditResult } from '@/lib/audit/scoring';

// g1, g2, g3 : les 3 questions « Gouvernance » du catalogue de base, poids 2 chacune
// (voir lib/audit/questions.ts). Max de la catégorie si les 3 sont répondues : 5×2×3 = 30.
describe('computeAuditResult', () => {
  it('calcule le score pondéré attendu sur les 3 questions de la catégorie : (4×2 + 2×2 + 0×2) / 30 = 40 %', () => {
    // g3 n'est volontairement pas répondue : elle doit compter comme 0, pas être ignorée.
    const r = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: 4 },
      { questionId: 'g2', answer: 'x', score: 2 },
    ]);
    expect(r.globalScore).toBe(40);
    expect(r.maturity).toBe('Moyenne');
    expect(r.scoresByCategory.Gouvernance).toBe(40);
  });

  it('tout à 5 (les 3 questions répondues) → 100 % et maturité Élevée ; tout à 0 → 0 % et Faible', () => {
    const top = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: 5 },
      { questionId: 'g2', answer: 'x', score: 5 },
      { questionId: 'g3', answer: 'x', score: 5 },
    ]);
    expect(top.globalScore).toBe(100);
    expect(top.maturity).toBe('Élevée');
    const low = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: 0 },
      { questionId: 'g2', answer: 'x', score: 0 },
      { questionId: 'g3', answer: 'x', score: 0 },
    ]);
    expect(low.globalScore).toBe(0);
    expect(low.maturity).toBe('Faible');
  });

  it('une question applicable mais non répondue compte comme 0 (jamais ignorée du dénominateur)', () => {
    // Seule g1 est répondue (parfaitement) ; g2 et g3 appartiennent à la même catégorie,
    // donc au périmètre de cet audit, mais restent muettes.
    const r = computeAuditResult([{ questionId: 'g1', answer: 'x', score: 5 }]);
    // (5×2 + 0×2 + 0×2) / 30 = 33 %, et non 100 % comme le calculerait une formule qui
    // ignore silencieusement les questions non répondues.
    expect(r.globalScore).toBe(33);
    expect(r.unansweredByCategory?.Gouvernance).toBe(2);
  });

  it("une catégorie jamais abordée par l'audit n'est pas pénalisée (pas de pollution inter-réglementation)", () => {
    // Aucune question RGPD/NIS2/DORA/... n'est posée : ces catégories ne doivent pas
    // apparaître comme des questions "non répondues" dans un audit qui ne les couvre pas.
    const r = computeAuditResult([{ questionId: 'g1', answer: 'x', score: 5 }]);
    expect(r.unansweredByCategory?.DORA ?? 0).toBe(0);
    expect(r.scoresByCategory.DORA).toBeUndefined();
  });

  it('seuils de maturité : 39 → Faible, 40 → Moyenne, 69 → Moyenne, 70 → Élevée', () => {
    // On répond aux 3 questions de la catégorie avec la même note pour contrôler le %.
    const at = (pct: number) => {
      const score = (pct / 100) * 5;
      return computeAuditResult([
        { questionId: 'g1', answer: 'x', score },
        { questionId: 'g2', answer: 'x', score },
        { questionId: 'g3', answer: 'x', score },
      ]);
    };
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

  it("une note hors échelle ne fausse pas le score (plafonnée à 5, minorée à 0)", () => {
    const inflated = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: 500 },
      { questionId: 'g2', answer: 'x', score: 5 },
      { questionId: 'g3', answer: 'x', score: 5 },
    ]);
    expect(inflated.globalScore).toBe(100);
    const negative = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: -50 },
      { questionId: 'g2', answer: 'x', score: 5 },
      { questionId: 'g3', answer: 'x', score: 5 },
    ]);
    // (0×2 + 5×2 + 5×2) / 30 = 67 %
    expect(negative.globalScore).toBe(67);
    const notANumber = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: Number.NaN },
      { questionId: 'g2', answer: 'x', score: 0 },
      { questionId: 'g3', answer: 'x', score: 0 },
    ]);
    expect(notANumber.globalScore).toBe(0);
  });

  it('les catégories sous 70 % déclenchent des recommandations, pas celles au-dessus', () => {
    const weak = computeAuditResult([{ questionId: 'g1', answer: 'x', score: 1 }]);
    expect(weak.recommendations.length).toBeGreaterThan(0);
    const strong = computeAuditResult([
      { questionId: 'g1', answer: 'x', score: 5 },
      { questionId: 'g2', answer: 'x', score: 5 },
      { questionId: 'g3', answer: 'x', score: 5 },
    ]);
    expect(strong.recommendations).toHaveLength(0);
  });
});
