import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { DOCUMENT_SELECT } from '@/lib/api/policy-fields';

/**
 * Documents de politique d'un client, toutes versions confondues (triés du plus
 * récent au plus ancien par type) : administrateur uniquement. L'UI regroupe par
 * type et ne montre l'historique qu'à la demande.
 */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const documents = await prisma.clientPolicyDocument.findMany({
      where: { organizationId },
      orderBy: [{ type: 'asc' }, { version: 'desc' }],
      select: DOCUMENT_SELECT,
    });
    return NextResponse.json(documents);
  },
  { roles: ['admin'] }
);
