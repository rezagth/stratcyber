import { prisma } from '@/lib/db';

/**
 * Tableau de bord budgétaire (module I) pour un exercice donné : enveloppe allouée,
 * coût prévisionnel des actions (ActionPlanItem.estimatedCost, déjà saisi au module D,
 * jamais dupliqué ici) et dépenses réelles de l'exercice. Purement une lecture
 * agrégée — recalculée à la demande, jamais stockée.
 */
export async function buildBudgetDashboard(organizationId: string, fiscalYear: number) {
  const [envelope, actionItems, expenses] = await Promise.all([
    prisma.budgetEnvelope.findFirst({ where: { organizationId, fiscalYear }, select: { allocatedAmount: true } }),
    prisma.actionPlanItem.findMany({ where: { organizationId }, select: { estimatedCost: true } }),
    prisma.budgetExpense.findMany({ where: { organizationId, fiscalYear }, select: { amount: true, category: true } }),
  ]);

  const plannedCost = actionItems.reduce((sum, a) => sum + (a.estimatedCost ?? 0), 0);
  const actualSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const allocated = envelope?.allocatedAmount ?? 0;

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    const key = e.category ?? 'Non catégorisé';
    byCategory[key] = (byCategory[key] ?? 0) + e.amount;
  }

  return {
    fiscalYear,
    allocated,
    plannedCost,
    actualSpent,
    remaining: allocated - actualSpent,
    byCategory,
  };
}
