import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';

/** Plan d'action exécutable du client connecté (lecture seule, restreint à son organisation). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where) return jsonError('Accès interdit', 403);

    const items = await prisma.actionPlanItem.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        priority: true,
        responsible: true,
        dueDate: true,
        estimatedCost: true,
        status: true,
        proofOfCompletion: true,
        proofDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(items);
  },
  { roles: ['client'] }
);
