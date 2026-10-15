import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseBudgetExpenseFields, BUDGET_EXPENSE_SELECT } from '@/lib/api/budget-expense-fields';

/** Dépenses budgétaires d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const expenses = await prisma.budgetExpense.findMany({
      where: { organizationId },
      orderBy: { expenseDate: 'desc' },
      select: BUDGET_EXPENSE_SELECT,
    });
    return NextResponse.json(expenses);
  },
  { roles: ['admin'] }
);

/** Enregistre une dépense budgétaire pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseBudgetExpenseFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const expense = await prisma.budgetExpense.create({
      // `isCreate: true` garantit que `parsed.data.fiscalYear`, `.label`, `.amount` et `.expenseDate` sont présents.
      data: { ...parsed.data, organizationId } as Prisma.BudgetExpenseUncheckedCreateInput,
      select: BUDGET_EXPENSE_SELECT,
    });
    await logActivity(user, { action: 'budget-expense.create', targetType: 'budget-expense', targetId: expense.id, organizationId });
    return NextResponse.json(expense, { status: 201 });
  },
  { roles: ['admin'] }
);
