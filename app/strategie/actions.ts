"use server";
import { prisma } from '../../lib/db';
import { AuditAnswer, AuditResult } from '../../types/audit';
import { auditQuestions } from '../../lib/audit/questions';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Non autorisé');
  }
  return session.user.id;
}

export async function saveAudit(
  answers: AuditAnswer[],
  result: AuditResult
) {
  const userId = await getUserId();
  const audit = await prisma.audit.create({
    data: {
      userId,
      score: result.globalScore,
      maturity: result.maturity,
      recommendations: result.recommendations.join('\n'),
      responses: {
        create: answers.map(a => ({
          question: a.questionId,
          category: auditQuestions.find(q => q.id === a.questionId)?.category || '',
          answer: a.answer,
          score: a.score ?? 0,
        })),
      },
    },
  });
  return audit.id;
}