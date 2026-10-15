import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';

// POST /api/audits/[id]/duplicate - Dupliquer un audit de l'utilisateur connecté
export const POST = withApiAuth<{ id: string }>(async (_request, { params, user }) => {
  const { id } = await params;

  // Seul le propriétaire peut lire (donc dupliquer) l'audit.
  const originalAudit = await prisma.audit.findFirst({
    where: { id, userId: user.id },
    include: { responses: true },
  });

  if (!originalAudit) {
    return jsonError('Audit non trouvé', 404);
  }

  const duplicatedAudit = await prisma.audit.create({
    data: {
      userId: user.id, // la copie appartient à l'utilisateur connecté, jamais à une valeur externe
      score: originalAudit.score,
      maturity: originalAudit.maturity,
      recommendations: originalAudit.recommendations,
      companyProfile: originalAudit.companyProfile,
      responses: {
        create: originalAudit.responses.map((response) => ({
          question: response.question,
          answer: response.answer,
          score: response.score,
          category: response.category,
        })),
      },
    },
    include: {
      responses: {
        select: {
          question: true,
          answer: true,
          score: true,
          category: true,
        },
      },
    },
  });

  return NextResponse.json(duplicatedAudit);
});
