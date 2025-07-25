"use server";
import { prisma } from '../../lib/db';
import { AuditAnswer, AuditResult } from '../../types/audit';
import { auditQuestions } from '../../lib/audit/questions';

export async function saveAudit(
  answers: AuditAnswer[],
  result: AuditResult
) {
  // Utilisateur fictif (à remplacer par l'auth réelle)
  const userId = 'demo-user-id';
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