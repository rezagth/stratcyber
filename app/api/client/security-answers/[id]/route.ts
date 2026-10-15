import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { logActivity } from '@/lib/activity-log';
import { ANSWER_SELECT } from '@/lib/api/security-answer-fields';

/**
 * Validation d'une réponse par la direction du client : la SEULE action que cette
 * route autorise. Nom et date du validateur fixés côté serveur à partir du compte
 * connecté, jamais fournis dans le corps de la requête. N'accepte que la transition
 * "À valider" → "Validé". Corps : {} (aucun champ attendu).
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const { id } = await params;
    const existing = await prisma.securityAnswer.findFirst({ where: { id, ...where }, select: { id: true, organizationId: true, status: true } });
    if (!existing) return jsonError('Réponse non trouvée', 404);
    if (existing.status !== 'À valider') {
      return jsonError(`Impossible : cette réponse est à l'état "${existing.status}", pas "À valider"`, 409);
    }

    const answer = await prisma.securityAnswer.update({
      where: { id },
      data: { status: 'Validé', validatedByName: user.name ?? user.email, validatedAt: new Date() },
      select: ANSWER_SELECT,
    });
    await logActivity(user, { action: 'security-answer.validate', targetType: 'security-answer', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(answer);
  },
  { roles: ['client'] }
);
