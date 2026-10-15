import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { TRAINING_SELECT } from '@/lib/api/leadership-training-fields';

/** Formations des dirigeants de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const trainings = await prisma.leadershipTraining.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      select: TRAINING_SELECT,
    });
    return NextResponse.json(trainings);
  },
  { roles: ['client'] }
);
