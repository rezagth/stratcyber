import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSecurityAnswerFields, validateNotApplicableConsistency, ANSWER_SELECT } from '@/lib/api/security-answer-fields';

const CONTENT_FIELDS = ['question', 'answer', 'isNotApplicable', 'notApplicableReason', 'category', 'answeredAt'] as const;

/**
 * Met à jour une réponse : administrateur uniquement. Si la réponse était "Validée"
 * et que son contenu change, le statut repasse automatiquement à "Brouillon" (la
 * validation précédente ne portait pas sur ce nouveau contenu) — jamais un contenu
 * modifié qui resterait affiché comme validé.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.securityAnswer.findFirst({ where: { id }, select: ANSWER_SELECT });
    if (!existing) return jsonError('Réponse non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSecurityAnswerFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const final = {
      isNotApplicable: (parsed.data.isNotApplicable as boolean) ?? existing.isNotApplicable,
      answer: parsed.data.answer !== undefined ? (parsed.data.answer as string | null) : existing.answer,
      notApplicableReason: parsed.data.notApplicableReason !== undefined
        ? (parsed.data.notApplicableReason as string | null) : existing.notApplicableReason,
    };
    const consistencyError = validateNotApplicableConsistency(final);
    if (consistencyError) return jsonError(consistencyError, 400);

    const touchesContent = CONTENT_FIELDS.some((f) => f in parsed.data);
    if (existing.status === 'Validé' && touchesContent && parsed.data.status === undefined) {
      parsed.data.status = 'Brouillon';
      parsed.data.validatedByName = null;
      parsed.data.validatedAt = null;
    }

    const answer = await prisma.securityAnswer.update({ where: { id }, data: parsed.data, select: ANSWER_SELECT });
    await logActivity(user, { action: 'security-answer.update', targetType: 'security-answer', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(answer);
  },
  { roles: ['admin'] }
);

/** Supprime une réponse : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.securityAnswer.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Réponse non trouvée', 404);

    await prisma.securityAnswer.deleteMany({ where: { id } });
    await logActivity(user, { action: 'security-answer.delete', targetType: 'security-answer', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
