import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';

// GET /api/audits/[id] - Récupérer un audit de l'utilisateur connecté
export const GET = withApiAuth<{ id: string }>(async (_request, { params, user }) => {
  const { id } = await params;

  // Le propriétaire vient de la session, jamais de l'URL.
  // Audit absent OU appartenant à un autre : même réponse 404 (pas d'énumération).
  const audit = await prisma.audit.findFirst({
    where: { id, userId: user.id },
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

  if (!audit) {
    return jsonError('Audit non trouvé', 404);
  }

  return NextResponse.json(audit);
});

// DELETE /api/audits/[id] - Supprimer un audit de l'utilisateur connecté
export const DELETE = withApiAuth<{ id: string }>(async (_request, { params, user }) => {
  const { id } = await params;

  const audit = await prisma.audit.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!audit) {
    return jsonError('Audit non trouvé', 404);
  }

  // Les deux suppressions portent aussi le filtre propriétaire, et sont atomiques.
  await prisma.$transaction([
    prisma.auditResponse.deleteMany({
      where: { auditId: id, audit: { userId: user.id } },
    }),
    prisma.audit.deleteMany({
      where: { id, userId: user.id },
    }),
  ]);

  return NextResponse.json({ message: 'Audit supprimé avec succès' });
});
