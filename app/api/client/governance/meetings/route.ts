import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { MEETING_SELECT } from '@/lib/api/governance-fields';

/** Comités et revues annuelles de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const meetings = await prisma.governanceMeeting.findMany({
      where,
      orderBy: { meetingDate: 'desc' },
      select: MEETING_SELECT,
    });
    return NextResponse.json(meetings);
  },
  { roles: ['client'] }
);
