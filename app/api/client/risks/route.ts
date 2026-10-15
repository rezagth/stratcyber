import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { RISK_SELECT } from '@/lib/api/risk-fields';

/** Registre des risques de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const risks = await prisma.risk.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: RISK_SELECT,
    });
    return NextResponse.json(risks);
  },
  { roles: ['client'] }
);
