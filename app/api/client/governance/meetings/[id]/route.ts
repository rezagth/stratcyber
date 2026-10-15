import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { logActivity } from '@/lib/activity-log';
import { MEETING_SELECT } from '@/lib/api/governance-fields';

/**
 * Validation d'un compte rendu de comité ou d'une revue annuelle par la direction
 * du client — c'est la preuve d'implication exigée par NIS2 (article 20). Nom et
 * date du validateur fixés côté serveur à partir du compte connecté, jamais fournis
 * dans le corps de la requête. N'accepte que la transition "À valider" → "Validé".
 * Corps : {} (aucun champ attendu).
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const { id } = await params;
    const existing = await prisma.governanceMeeting.findFirst({ where: { id, ...where }, select: { id: true, organizationId: true, status: true } });
    if (!existing) return jsonError('Réunion non trouvée', 404);
    if (existing.status !== 'À valider') {
      return jsonError(`Impossible : cette réunion est à l'état "${existing.status}", pas "À valider"`, 409);
    }

    const meeting = await prisma.governanceMeeting.update({
      where: { id },
      data: { status: 'Validé', validatedByName: user.name ?? user.email, validatedAt: new Date() },
      select: MEETING_SELECT,
    });
    await logActivity(user, { action: 'governance-meeting.validate', targetType: 'governance-meeting', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(meeting);
  },
  { roles: ['client'] }
);
