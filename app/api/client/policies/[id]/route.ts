import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { logActivity } from '@/lib/activity-log';
import { DOCUMENT_SELECT } from '@/lib/api/policy-fields';

/**
 * Validation d'un document de politique par la direction du client : la SEULE action
 * que cette route autorise. Le nom du validateur et la date sont fixés par le serveur
 * à partir du compte connecté — jamais fournis dans le corps de la requête — pour que
 * la preuve de validation soit fiable. N'accepte que la transition "À valider" → "Validé".
 * Corps : {} (aucun champ attendu).
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const { id } = await params;
    const existing = await prisma.clientPolicyDocument.findFirst({ where: { id, ...where }, select: { id: true, organizationId: true, status: true } });
    if (!existing) return jsonError('Document non trouvé', 404);
    if (existing.status !== 'À valider') {
      return jsonError(`Impossible : ce document est à l'état "${existing.status}", pas "À valider"`, 409);
    }

    const document = await prisma.clientPolicyDocument.update({
      where: { id },
      data: { status: 'Validé', validatedByName: user.name ?? user.email, validatedAt: new Date() },
      select: DOCUMENT_SELECT,
    });
    await logActivity(user, { action: 'policy-document.validate', targetType: 'policy-document', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(document);
  },
  { roles: ['client'] }
);
