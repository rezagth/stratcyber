import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { toCsv } from '@/lib/security-answers/csv';

/** Export CSV de la bibliothèque de réponses d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true, name: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const answers = await prisma.securityAnswer.findMany({
      where: { organizationId },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });

    const csv = toCsv(answers);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="reponses-securite-${organization.name.replace(/[^a-z0-9]+/gi, '-')}.csv"`,
      },
    });
  },
  { roles: ['admin'] }
);
