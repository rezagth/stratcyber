import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { DOCUMENT_SELECT } from '@/lib/api/policy-fields';
import { getLibraryDocument, sanitizeValues } from '@/lib/policy/library';
import { fillTemplate, unresolvedVariables } from '@/lib/policy/template-engine';

/**
 * Génère plusieurs documents de conformité d'un coup depuis la bibliothèque intégrée, pour un client.
 * Chaque document est une NOUVELLE VERSION en "Brouillon" (jamais "Validé", qui n'est accordé que par
 * le client) ; les versions précédentes ne sont pas touchées. Les variables non renseignées restent
 * visibles dans le texte et sont listées dans `unresolved`, pour relecture avant envoi au client.
 * Corps : { documentIds: string[], values: Record<string, string> }
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = (await request.json().catch(() => null)) as { documentIds?: unknown; values?: unknown } | null;
    const ids = Array.isArray(body?.documentIds) ? body.documentIds : null;
    if (!ids || ids.length === 0 || ids.length > 20 || ids.some((id) => typeof id !== 'string')) {
      return jsonError('Choisissez au moins un document', 400);
    }
    const uniqueIds = Array.from(new Set(ids as string[]));
    const documents = uniqueIds.map((id) => getLibraryDocument(id));
    if (documents.some((doc) => !doc)) return jsonError('Document inconnu dans la bibliothèque', 400);

    const values = sanitizeValues(body?.values);
    const created = [];
    for (const doc of documents) {
      if (!doc) continue;
      const content = fillTemplate(doc.content, values);
      const previous = await prisma.clientPolicyDocument.findFirst({
        where: { organizationId, type: doc.type },
        orderBy: { version: 'desc' },
        select: { version: true },
      });
      const version = (previous?.version ?? 0) + 1;
      const document = await prisma.clientPolicyDocument.create({
        data: { organizationId, templateId: null, type: doc.type, title: doc.name, content, version, status: 'Brouillon' },
        select: DOCUMENT_SELECT,
      });
      created.push({ ...document, unresolved: unresolvedVariables(content) });
    }

    await logActivity(user, {
      action: 'policy-document.generate-pack',
      targetType: 'organization',
      targetId: organizationId,
      organizationId,
      metadata: { documents: created.length },
    });
    return NextResponse.json({ documents: created }, { status: 201 });
  },
  { roles: ['admin'] }
);
