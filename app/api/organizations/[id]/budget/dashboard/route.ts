import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { buildBudgetDashboard } from '@/lib/budget/dashboard';

/** Tableau de bord budgétaire d'un client pour un exercice donné : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (request, { params }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const yearParam = new URL(request.url).searchParams.get('year');
    const fiscalYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();
    if (!Number.isInteger(fiscalYear)) return jsonError('Exercice invalide', 400);

    const dashboard = await buildBudgetDashboard(organizationId, fiscalYear);
    return NextResponse.json(dashboard);
  },
  { roles: ['admin'] }
);
