"use server";
import { prisma } from '../../lib/db';
import { AuditResult, CompanyProfile, ActionItem } from '../../types/audit';
import { auditQuestions } from '../../lib/audit/questions';
import { computeAuditResult } from '../../lib/audit/scoring';
import { rgpdQuestions, nis2Questions, doraQuestions, lmpQuestions, incidentQuestions, supplyChainQuestions, cloudQuestions, craQuestions, sectorSpecificQuestions } from '../../lib/audit/questions-extended';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }
  return session.user.id;
}

interface AuditData {
  profile: CompanyProfile;
  answers: { questionId: string; answer: string; score: number }[];
  result: AuditResult;
  actionPlan: ActionItem[];
}

export async function saveAudit(auditData: AuditData) {
  try {
    const userId = await getUserId();

    // Le score, la maturité et les recommandations sont RECALCULÉS côté serveur à partir des réponses :
    // on ne fait pas confiance à un résultat calculé dans le navigateur.
    const answers = auditData.answers.map((a) => ({
      ...a,
      score: Math.min(5, Math.max(0, Number.isFinite(a.score) ? a.score : 0)),
    }));
    const result = computeAuditResult(answers);

    const audit = await prisma.audit.create({
      data: {
        userId,
        score: result.globalScore,
        maturity: result.maturity,
        recommendations: result.recommendations.join('\n'),
        // Stocker le profil de l'entreprise en JSON
        companyProfile: JSON.stringify(auditData.profile),
        // Stocker le plan d'action en JSON
        actionPlan: JSON.stringify(auditData.actionPlan),
        responses: {
          create: answers.map(a => {
            // Create a combined array of all possible questions
            const allQuestions = [
              ...auditQuestions,
              ...rgpdQuestions,
              ...nis2Questions,
              ...doraQuestions,
              ...lmpQuestions,
              ...incidentQuestions,
              ...supplyChainQuestions,
              ...cloudQuestions,
              ...craQuestions,
              // Add sector specific questions
              ...Object.values(sectorSpecificQuestions).flat()
            ];
            
            // Find the question to get its category
            const question = allQuestions.find(q => q.id === a.questionId);
            
            return {
              question: a.questionId,
              category: question?.category || 'Autre',
              answer: a.answer,
              score: a.score,
            };
          }),
        },
      },
    });
    
    return { success: true, auditId: audit.id };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'audit:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
}