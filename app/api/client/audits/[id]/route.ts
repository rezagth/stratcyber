import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { clientAuditWhere } from '@/lib/auth/access';
import { logActivity } from '@/lib/activity-log';

/** Détail d'un audit partagé avec le client connecté (lecture seule, champs limités). */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const where = clientAuditWhere(user);
    if (!where) return jsonError('Accès interdit', 403);

    const { id } = await params;
    const audit = await prisma.audit.findFirst({
      where: { id, ...where },
      select: {
        id: true,
        createdAt: true,
        score: true,
        maturity: true,
        recommendations: true,
        actionPlan: true,
      },
    });
    if (!audit) return jsonError('Audit non trouvé', 404);
    await logActivity(user, { action: 'client.audit.view', targetType: 'audit', targetId: audit.id, organizationId: user.organizationId });
    return NextResponse.json(audit);
  },
  { roles: ['client'] }
);
