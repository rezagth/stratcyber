import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseLeadershipTrainingFields, TRAINING_SELECT } from '@/lib/api/leadership-training-fields';

/** Met à jour une formation dirigeant : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.leadershipTraining.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Formation non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseLeadershipTrainingFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const training = await prisma.leadershipTraining.update({ where: { id }, data: parsed.data, select: TRAINING_SELECT });
    await logActivity(user, { action: 'leadership-training.update', targetType: 'leadership-training', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(training);
  },
  { roles: ['admin'] }
);

/** Supprime une formation dirigeant : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.leadershipTraining.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Formation non trouvée', 404);

    await prisma.leadershipTraining.deleteMany({ where: { id } });
    await logActivity(user, { action: 'leadership-training.delete', targetType: 'leadership-training', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
