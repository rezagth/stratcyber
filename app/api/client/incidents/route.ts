import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { INCIDENT_SELECT } from '@/lib/api/incident-fields';

/** Registre d'incidents de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const incidents = await prisma.incidentCase.findMany({
      where,
      orderBy: { detectedAt: 'desc' },
      select: INCIDENT_SELECT,
    });
    return NextResponse.json(incidents);
  },
  { roles: ['client'] }
);
