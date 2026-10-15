import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * Rattache un audit à un client et le partage (ou non) dans son espace client.
 * Réservé à l'administrateur propriétaire de l'audit.
 * Corps : { organizationId: string, shared: boolean }
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
    const shared = body?.shared === true;
    if (!organizationId) return jsonError('Client requis', 400);

    const audit = await prisma.audit.findFirst({
      where: { id, userId: user.id },
      select: { id: true },
    });
    if (!audit) return jsonError('Audit non trouvé', 404);

    const organization = await prisma.organization.findFirst({
      where: { id: organizationId },
      select: { id: true },
    });
    if (!organization) return jsonError('Client non trouvé', 404);

    await prisma.audit.updateMany({
      where: { id, userId: user.id },
      data: { organizationId: organization.id, sharedWithClient: shared },
    });
    await logActivity(user, {
      action: shared ? 'audit.share' : 'audit.unshare',
      targetType: 'audit',
      targetId: id,
      organizationId: organization.id,
    });
    return NextResponse.json({ id, organizationId: organization.id, sharedWithClient: shared });
  },
  { roles: ['admin'] }
);
