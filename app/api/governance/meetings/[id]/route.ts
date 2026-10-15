import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseGovernanceMeetingFields, MEETING_SELECT } from '@/lib/api/governance-fields';

/**
 * Met à jour un comité/une revue annuelle : administrateur uniquement. Un document
 * déjà validé ne peut plus être modifié (409) — la preuve d'implication de la
 * direction porte sur un contenu figé, contrairement à la bibliothèque de réponses
 * du module F qui se corrige en continu.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.governanceMeeting.findFirst({ where: { id }, select: { id: true, organizationId: true, status: true } });
    if (!existing) return jsonError('Réunion non trouvée', 404);
    if (existing.status === 'Validé') {
      return jsonError('Cette réunion est déjà validée : créez un nouvel enregistrement pour la corriger', 409);
    }

    const body = await request.json().catch(() => null);
    const parsed = parseGovernanceMeetingFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const meeting = await prisma.governanceMeeting.update({ where: { id }, data: parsed.data, select: MEETING_SELECT });
    await logActivity(user, { action: 'governance-meeting.update', targetType: 'governance-meeting', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(meeting);
  },
  { roles: ['admin'] }
);

/** Supprime un comité/une revue annuelle : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.governanceMeeting.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Réunion non trouvée', 404);

    await prisma.governanceMeeting.deleteMany({ where: { id } });
    await logActivity(user, { action: 'governance-meeting.delete', targetType: 'governance-meeting', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
