import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parsePolicyDocumentUpdate, DOCUMENT_SELECT } from '@/lib/api/policy-fields';

/**
 * Met à jour un document de politique (titre, contenu, ou passage en "À valider") :
 * administrateur uniquement. Le statut "Validé" ne peut être posé que par le client
 * (voir /api/client/policies/[id]) — un document déjà validé ne peut plus être modifié
 * ici sans d'abord générer une nouvelle version.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.clientPolicyDocument.findFirst({ where: { id }, select: { id: true, organizationId: true, status: true } });
    if (!existing) return jsonError('Document non trouvé', 404);
    if (existing.status === 'Validé') {
      return jsonError('Ce document est déjà validé : générez une nouvelle version pour le modifier', 409);
    }

    const body = await request.json().catch(() => null);
    const parsed = parsePolicyDocumentUpdate(body);
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const document = await prisma.clientPolicyDocument.update({ where: { id }, data: parsed.data, select: DOCUMENT_SELECT });
    await logActivity(user, { action: 'policy-document.update', targetType: 'policy-document', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(document);
  },
  { roles: ['admin'] }
);

/** Supprime un document de politique (ex. brouillon créé par erreur) : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.clientPolicyDocument.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Document non trouvé', 404);

    await prisma.clientPolicyDocument.deleteMany({ where: { id } });
    await logActivity(user, { action: 'policy-document.delete', targetType: 'policy-document', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
