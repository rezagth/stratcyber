import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { BUDGET_ENVELOPE_SELECT } from '@/lib/api/budget-envelope-fields';

/** Enveloppes budgétaires de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const envelopes = await prisma.budgetEnvelope.findMany({
      where,
      orderBy: { fiscalYear: 'desc' },
      select: BUDGET_ENVELOPE_SELECT,
    });
    return NextResponse.json(envelopes);
  },
  { roles: ['client'] }
);
