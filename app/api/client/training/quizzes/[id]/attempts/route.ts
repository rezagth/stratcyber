import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo } from '@/lib/training/ebooks';
import { parseQuizAttemptFields } from '@/lib/api/training-quiz-attempt-fields';

/**
 * Enregistre la tentative de quiz du client connecté. `passed` est toujours redérivé
 * du score et du seuil de passage du quiz, jamais accepté du corps de la requête.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: quizId } = await params;
    const quiz = await prisma.ebookQuiz.findFirst({ where: { id: quizId, ebook: ebookVisibleTo(user) }, select: { id: true, passingScore: true } });
    if (!quiz) return jsonError('Quiz non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseQuizAttemptFields(body);
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const attempt = await prisma.ebookQuizAttempt.create({
      data: {
        userId: user.id,
        quizId,
        answers: parsed.data.answers,
        score: parsed.data.score,
        passed: parsed.data.score >= quiz.passingScore,
        completedAt: new Date(),
      } as Prisma.EbookQuizAttemptUncheckedCreateInput,
      select: { id: true, quizId: true, score: true, passed: true, completedAt: true },
    });
    return NextResponse.json(attempt, { status: 201 });
  },
  { roles: ['client'] }
);
