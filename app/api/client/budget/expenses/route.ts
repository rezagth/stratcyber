import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { BUDGET_EXPENSE_SELECT } from '@/lib/api/budget-expense-fields';

/** Dépenses budgétaires de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const expenses = await prisma.budgetExpense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      select: BUDGET_EXPENSE_SELECT,
    });
    return NextResponse.json(expenses);
  },
  { roles: ['client'] }
);
