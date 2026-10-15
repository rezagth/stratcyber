import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseBudgetExpenseFields, BUDGET_EXPENSE_SELECT } from '@/lib/api/budget-expense-fields';

/** Met à jour une dépense budgétaire : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.budgetExpense.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Dépense non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseBudgetExpenseFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const expense = await prisma.budgetExpense.update({ where: { id }, data: parsed.data, select: BUDGET_EXPENSE_SELECT });
    await logActivity(user, { action: 'budget-expense.update', targetType: 'budget-expense', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(expense);
  },
  { roles: ['admin'] }
);

/** Supprime une dépense budgétaire : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.budgetExpense.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Dépense non trouvée', 404);

    await prisma.budgetExpense.deleteMany({ where: { id } });
    await logActivity(user, { action: 'budget-expense.delete', targetType: 'budget-expense', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
