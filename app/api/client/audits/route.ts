import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { clientAuditWhere } from '@/lib/auth/access';

/** Audits partagés avec le client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = clientAuditWhere(user);
    if (!where) return jsonError('Accès interdit', 403);

    const audits = await prisma.audit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, createdAt: true, score: true, maturity: true },
    });
    return NextResponse.json(audits);
  },
  { roles: ['client'] }
);
