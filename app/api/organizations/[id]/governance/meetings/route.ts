import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseGovernanceMeetingFields, MEETING_SELECT } from '@/lib/api/governance-fields';

/** Comités et revues annuelles d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const meetings = await prisma.governanceMeeting.findMany({
      where: { organizationId },
      orderBy: { meetingDate: 'desc' },
      select: MEETING_SELECT,
    });
    return NextResponse.json(meetings);
  },
  { roles: ['admin'] }
);

/** Enregistre un comité ou une revue annuelle : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseGovernanceMeetingFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const meeting = await prisma.governanceMeeting.create({
      data: { ...parsed.data, organizationId } as Prisma.GovernanceMeetingUncheckedCreateInput,
      select: MEETING_SELECT,
    });
    await logActivity(user, { action: 'governance-meeting.create', targetType: 'governance-meeting', targetId: meeting.id, organizationId, metadata: { type: meeting.type } });
    return NextResponse.json(meeting, { status: 201 });
  },
  { roles: ['admin'] }
);
