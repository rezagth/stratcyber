import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { buildGovernanceDashboard } from '@/lib/governance/dashboard';

/** Tableau de bord de direction d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const dashboard = await buildGovernanceDashboard(organizationId);
    return NextResponse.json(dashboard);
  },
  { roles: ['admin'] }
);
