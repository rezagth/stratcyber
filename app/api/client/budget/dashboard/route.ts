import { NextResponse } from 'next/server';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { buildBudgetDashboard } from '@/lib/budget/dashboard';

/** Tableau de bord budgétaire de l'organisation du client connecté, pour un exercice donné. */
export const GET = withApiAuth(
  async (request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const yearParam = new URL(request.url).searchParams.get('year');
    const fiscalYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (!Number.isInteger(fiscalYear)) return jsonError('Exercice invalide', 400);

    const dashboard = await buildBudgetDashboard(where.organizationId, fiscalYear);
    return NextResponse.json(dashboard);
  },
  { roles: ['client'] }
);
