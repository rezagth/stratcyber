import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

function defaultMessage(title: string, dueDate: Date | null): string {
  const deadline = dueDate ? dueDate.toLocaleDateString('fr-FR') : 'non définie';
  return `Rappel : l'action "${title}" est due le ${deadline} et n'est pas encore terminée. Merci de nous indiquer son avancement ou la preuve de réalisation dès que possible.`;
}

/**
 * Prépare une relance pour une action en retard (brouillon). Jamais envoyée
 * automatiquement : reste à l'état 'draft' tant qu'un admin ne l'approuve pas
 * explicitement (PATCH /api/action-plan/reminders/[id]). Aucun envoi d'email réel
 * n'est câblé pour l'instant (pas de fournisseur d'emailing configuré) : "approuvée"
 * signifie prête à être envoyée manuellement par l'admin.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: actionPlanItemId } = await params;
    const item = await prisma.actionPlanItem.findFirst({
      where: { id: actionPlanItemId },
      select: { id: true, title: true, dueDate: true, organizationId: true },
    });
    if (!item) return jsonError('Action non trouvée', 404);

    const body = await request.json().catch(() => null);
    const customMessage = typeof body?.message === 'string' ? body.message.trim() : '';
    const message = customMessage ? customMessage.slice(0, 2000) : defaultMessage(item.title, item.dueDate);

    const reminder = await prisma.actionReminder.create({
      data: {
        actionPlanItemId: item.id,
        organizationId: item.organizationId,
        message,
        status: 'draft',
      },
    });
    await logActivity(user, {
      action: 'action-plan.reminder.draft',
      targetType: 'action-reminder',
      targetId: reminder.id,
      organizationId: item.organizationId,
    });
    return NextResponse.json(reminder, { status: 201 });
  },
  { roles: ['admin'] }
);
