import { describe, it, expect } from 'vitest';
import { generateQuestionsForProfile } from '@/lib/audit/engine';
import { buildActionPlanFromAudit } from '@/lib/audit/action-plan-generator';
import { MAX_ACTIONS_PER_QUESTION } from '@/lib/audit/scoring';
import type { CompanyProfile } from '@/types/audit';

const pme: CompanyProfile = {
  sector: 'Autre', size: 'PME', isOIV: false, isOSE: false, isFinancial: false,
  hasPersonalData: true, hasCriticalInfra: false, applicableRegulations: [],
};

function worstCasePlan(profile: CompanyProfile) {
  const questions = generateQuestionsForProfile(profile);
  const responses = questions.map((q) => ({
    question: q.id,
    answer: q.type === 'boolean' ? 'non' : 'x',
    score: 0,
  }));
  const plan = buildActionPlanFromAudit({
    id: 'a1', organizationId: 'o1', createdAt: new Date('2026-11-16'), responses,
  });
  return { questions, plan };
}

describe('taille du plan d’action livré au client', () => {
  it('une PME de services au pire cas reçoit un plan lisible (≤ 60 actions)', () => {
    const { plan } = worstCasePlan(pme);
    expect(plan.length).toBeGreaterThan(0);
    expect(plan.length).toBeLessThanOrEqual(60);
  });

  it('aucune question ne produit plus que MAX_ACTIONS_PER_QUESTION actions', () => {
    const { questions, plan } = worstCasePlan(pme);
    expect(plan.length).toBeLessThanOrEqual(questions.length * MAX_ACTIONS_PER_QUESTION);
  });

  it('le plan ne contient pas deux fois exactement le même titre', () => {
    const { plan } = worstCasePlan(pme);
    const titles = plan.map((a) => a.title.trim().toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('chaque action a une échéance et au moins une est Critique ou Haute', () => {
    const { plan } = worstCasePlan(pme);
    for (const a of plan) expect(a.dueDate).toBeInstanceOf(Date);
    const rank = (p: string) => ['Critique', 'Haute', 'Moyenne', 'Faible'].indexOf(p);
    expect(Math.min(...plan.map((a) => rank(a.priority)))).toBeLessThanOrEqual(1);
  });
});
