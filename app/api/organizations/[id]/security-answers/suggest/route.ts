import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { suggestAnswers } from '@/lib/security-answers/suggest';
import { generateText, isAiConfigured } from '@/lib/ai/provider';

const MAX_QUESTION = 1000;

/**
 * Propose des réponses à une question de questionnaire à partir de la banque du client.
 * Administrateur uniquement. Le brouillon rédigé par l'IA n'est produit que si `useAi: true` est demandé
 * explicitement ET que l'IA est configurée ; il n'est jamais enregistré automatiquement.
 * Seules les réponses retenues de CE client sont transmises à l'IA.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params }) => {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (question.length < 5 || question.length > MAX_QUESTION) return jsonError(`Question invalide (5 à ${MAX_QUESTION} caractères)`, 400);

    const organization = await prisma.organization.findFirst({ where: { id }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const stored = await prisma.securityAnswer.findMany({
      where: { organizationId: id },
      select: { id: true, question: true, answer: true, isNotApplicable: true, notApplicableReason: true, status: true, answeredAt: true },
    });
    const matches = suggestAnswers(question, stored);

    let draft: string | null = null;
    const wantsAi = body?.useAi === true;
    if (wantsAi && matches.length > 0 && isAiConfigured()) {
      const context = matches.map((m, i) => `Réponse ${i + 1} (${m.answer.status}, ${m.answer.answeredAt.toISOString().slice(0, 10)}) : ${m.answer.isNotApplicable ? `Non applicable — ${m.answer.notApplicableReason ?? ''}` : m.answer.answer ?? ''}`).join('\n');
      draft = await generateText({
        system: "Tu aides à répondre à un questionnaire de sécurité. Rédige une réponse courte en français, uniquement à partir des réponses existantes fournies. N'invente aucun fait ni aucune mesure ; si les réponses ne suffisent pas, dis ce qui manque.",
        user: `Question : ${question}\n\nRéponses existantes du client :\n${context}`,
        maxTokens: 400,
      });
    }

    return NextResponse.json({
      matches: matches.map((m) => ({
        id: m.answer.id, question: m.answer.question, answer: m.answer.answer, isNotApplicable: m.answer.isNotApplicable,
        notApplicableReason: m.answer.notApplicableReason, status: m.answer.status, answeredAt: m.answer.answeredAt, score: Math.round(m.score * 100) / 100,
      })),
      draft,
      aiAvailable: isAiConfigured(),
    });
  },
  { roles: ['admin'] }
);
