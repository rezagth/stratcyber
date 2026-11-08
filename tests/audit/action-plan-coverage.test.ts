import { describe, expect, it } from 'vitest';
import { computeAuditResult, generateActionPlan } from '@/lib/audit/scoring';
import { auditQuestions } from '@/lib/audit/questions';
import {
  rgpdQuestions, nis2Questions, doraQuestions, lmpQuestions, incidentQuestions,
  supplyChainQuestions, cloudQuestions, craQuestions, isoQuestions, ebiosQuestions,
  sectorSpecificQuestions,
} from '@/lib/audit/questions-extended';
import { DEFAULT_RECOMMENDATIONS } from '@/lib/audit/default-recommendations';
import type { AuditQuestion } from '@/types/audit';

const all: AuditQuestion[] = [
  ...auditQuestions, ...rgpdQuestions, ...nis2Questions, ...doraQuestions, ...lmpQuestions,
  ...incidentQuestions, ...supplyChainQuestions, ...cloudQuestions, ...craQuestions,
  ...isoQuestions, ...ebiosQuestions, ...Object.values(sectorSpecificQuestions).flat(),
];

describe('couverture du plan d’actions', () => {
  it('chaque question du catalogue a une recommandation (propre ou par défaut), du bon type', () => {
    for (const q of all) {
      const r = q.actionRecommendations ?? DEFAULT_RECOMMENDATIONS[q.id];
      expect(r, `question ${q.id} sans recommandation`).toBeDefined();
      if (q.type === 'boolean') expect(r!.negativeAnswer?.length, q.id).toBeGreaterThan(0);
      else expect(r!.lowScore?.length, q.id).toBeGreaterThan(0);
    }
  });

  it('aucune recommandation par défaut ne vise un id inconnu', () => {
    const ids = new Set(all.map((q) => q.id));
    for (const id of Object.keys(DEFAULT_RECOMMENDATIONS)) expect(ids.has(id), id).toBe(true);
  });

  it('une mauvaise réponse sur t3 (sauvegardes) produit une action', () => {
    const answers = [{ questionId: 't3', answer: 'x', score: 0 }];
    const plan = generateActionPlan(computeAuditResult(answers), answers);
    expect(plan.some((a) => /sauvegarde/i.test(a.action))).toBe(true);
  });

  it('toutes les questions au pire → au moins une action par question', () => {
    const answers = all.map((q) => ({
      questionId: q.id, answer: q.type === 'boolean' ? 'non' : 'x', score: 0,
    }));
    const plan = generateActionPlan(computeAuditResult(answers), answers);
    expect(plan.length).toBeGreaterThanOrEqual(all.length);
  });
});
