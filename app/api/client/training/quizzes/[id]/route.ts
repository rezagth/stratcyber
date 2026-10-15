import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo } from '@/lib/training/ebooks';

/** Un quiz dont l'ebook est visible par le client connecté. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const quiz = await prisma.ebookQuiz.findFirst({
      where: { id, ebook: ebookVisibleTo(user) },
      include: { ebook: { select: { id: true, title: true, author: true } } },
    });
    if (!quiz) return jsonError('Quiz non trouvé', 404);

    return NextResponse.json({ ...quiz, questions: quiz.questions ? JSON.parse(quiz.questions) : [] });
  },
  { roles: ['client'] }
);
