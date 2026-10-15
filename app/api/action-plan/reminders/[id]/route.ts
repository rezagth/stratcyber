import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

const ALLOWED_TRANSITIONS: Record<string, string> = {
  approved: 'draft',
  dismissed: 'draft',
};

/**
 * Approuve ou rejette une relance en brouillon. Aucun envoi d'email réel : "approved"
 * marque la relance comme prête à être envoyée manuellement (pas de fournisseur
 * d'emailing configuré pour l'instant — voir le fichier reminders/route.ts).
 * Corps : { status: 'approved' | 'dismissed' }
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const status = typeof body?.status === 'string' ? body.status : '';

    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TRANSITIONS, status)) {
      return jsonError("Statut invalide (valeurs possibles : 'approved', 'dismissed')", 400);
    }

    const reminder = await prisma.actionReminder.findFirst({ where: { id }, select: { id: true, status: true, organizationId: true } });
    if (!reminder) return jsonError('Relance non trouvée', 404);
    if (reminder.status !== ALLOWED_TRANSITIONS[status]) {
      return jsonError(`Impossible : la relance est à l'état "${reminder.status}"`, 409);
    }

    const updated = await prisma.actionReminder.update({
      where: { id },
      data: {
        status,
        approvedBy: status === 'approved' ? user.email : null,
        approvedAt: status === 'approved' ? new Date() : null,
      },
    });
    await logActivity(user, {
      action: `action-plan.reminder.${status}`,
      targetType: 'action-reminder',
      targetId: id,
      organizationId: reminder.organizationId,
    });
    return NextResponse.json(updated);
  },
  { roles: ['admin'] }
);
