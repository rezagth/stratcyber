import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { DOCUMENT_SELECT } from '@/lib/api/policy-fields';

/**
 * Documents de politique du client connecté (lecture seule) : uniquement la dernière
 * version de chaque type — l'historique des versions précédentes reste un outil admin.
 */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const documents = await prisma.clientPolicyDocument.findMany({
      where,
      orderBy: [{ type: 'asc' }, { version: 'desc' }],
      select: DOCUMENT_SELECT,
    });

    const latestByType = new Map<string, (typeof documents)[number]>();
    for (const doc of documents) {
      if (!latestByType.has(doc.type)) latestByType.set(doc.type, doc);
    }
    return NextResponse.json(Array.from(latestByType.values()));
  },
  { roles: ['client'] }
);
