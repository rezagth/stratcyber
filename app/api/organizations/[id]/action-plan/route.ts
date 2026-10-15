import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';

/** Plan d'action exécutable complet d'un client, toutes sources confondues. Administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;

    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const items = await prisma.actionPlanItem.findMany({
      where: { organizationId },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      include: { reminders: { orderBy: { createdAt: 'desc' } } },
    });
    return NextResponse.json(items);
  },
  { roles: ['admin'] }
);
