import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo } from '@/lib/training/ebooks';

// GET /api/training/quiz/[id] - Un quiz dont l'ebook est visible par l'utilisateur connecté
export const GET = withApiAuth<{ id: string }>(async (_request, { params, user }) => {
  const { id } = await params;

  // Le quiz hérite des droits de son ebook.
  const quiz = await prisma.ebookQuiz.findFirst({
    where: { id, ebook: ebookVisibleTo(user) },
    include: {
      ebook: {
        select: {
          id: true,
          title: true,
          author: true,
        },
      },
    },
  });

  if (!quiz) {
    return jsonError('Quiz non trouvé', 404);
  }

  return NextResponse.json(
    {
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : [],
    },
    { status: 200 }
  );
});
