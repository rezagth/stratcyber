import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseLeadershipTrainingFields, TRAINING_SELECT } from '@/lib/api/leadership-training-fields';

/** Formations cybersécurité suivies par les dirigeants d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const trainings = await prisma.leadershipTraining.findMany({
      where: { organizationId },
      orderBy: { completedAt: 'desc' },
      select: TRAINING_SELECT,
    });
    return NextResponse.json(trainings);
  },
  { roles: ['admin'] }
);

/** Enregistre une formation suivie par un dirigeant : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseLeadershipTrainingFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const training = await prisma.leadershipTraining.create({
      data: { ...parsed.data, organizationId } as Prisma.LeadershipTrainingUncheckedCreateInput,
      select: TRAINING_SELECT,
    });
    await logActivity(user, { action: 'leadership-training.create', targetType: 'leadership-training', targetId: training.id, organizationId });
    return NextResponse.json(training, { status: 201 });
  },
  { roles: ['admin'] }
);
