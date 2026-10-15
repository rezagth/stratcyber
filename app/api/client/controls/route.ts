import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { CONTROL_SELECT, withParsedFrameworks } from '@/lib/api/control-fields';
import { EVIDENCE_SELECT } from '@/lib/api/evidence-fields';

/** Contrôles et preuves de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const controls = await prisma.control.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { ...CONTROL_SELECT, evidences: { orderBy: { evidenceDate: 'desc' }, select: EVIDENCE_SELECT } },
    });
    return NextResponse.json(controls.map(withParsedFrameworks));
  },
  { roles: ['client'] }
);
