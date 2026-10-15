import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { ANSWER_SELECT } from '@/lib/api/security-answer-fields';

/** Bibliothèque de réponses du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const answers = await prisma.securityAnswer.findMany({
      where,
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
      select: ANSWER_SELECT,
    });
    return NextResponse.json(answers);
  },
  { roles: ['client'] }
);
