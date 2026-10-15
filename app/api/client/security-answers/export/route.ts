import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { toCsv } from '@/lib/security-answers/csv';

/** Export CSV de la bibliothèque de réponses du client connecté. */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const answers = await prisma.securityAnswer.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
    });

    const csv = toCsv(answers);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mes-reponses-securite.csv"',
      },
    });
  },
  { roles: ['client'] }
);
