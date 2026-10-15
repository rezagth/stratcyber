import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth } from '@/lib/auth/api-auth';

/** Journal des actions (administrateur uniquement). ?organizationId= pour filtrer, ?limit= (max 200). */
export const GET = withApiAuth(
  async (request) => {
    const params = new URL(request.url).searchParams;
    const organizationId = params.get('organizationId');
    const limit = Math.min(200, Math.max(1, Number(params.get('limit')) || 50));
    const logs = await prisma.activityLog.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json(logs);
  },
  { roles: ['admin'] }
);
