import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo, parseEbookTags } from '@/lib/training/ebooks';

// GET /api/training/ebook/[id] - Un ebook visible par l'utilisateur connecté
export const GET = withApiAuth<{ id: string }>(async (_request, { params, user }) => {
  const { id } = await params;

  // Ebook absent OU non visible par cet utilisateur : même 404.
  const ebook = await prisma.ebook.findFirst({
    where: { AND: [{ id }, ebookVisibleTo(user)] },
    include: {
      readingSessions: {
        where: { userId: user.id },
        select: {
          id: true,
          progress: true,
          completed: true,
          timeSpent: true,
        },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      },
    },
  });

  if (!ebook) {
    return jsonError('Ebook non trouvé', 404);
  }

  return NextResponse.json(
    {
      ...ebook,
      tags: parseEbookTags(ebook.tags),
      // Le contenu reste une chaîne, traitée côté client
    },
    { status: 200 }
  );
});
