import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { VULNERABILITY_SELECT } from '@/lib/api/vulnerability-fields';

/** Vulnérabilités de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const vulnerabilities = await prisma.clientVulnerability.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: VULNERABILITY_SELECT,
    });
    return NextResponse.json(vulnerabilities);
  },
  { roles: ['client'] }
);
