import { prisma } from '@/lib/db';
import { clientAuditWhere } from '@/lib/auth/access';
import type { AuthedUser } from '@/lib/auth/api-auth';

export type AuditReportPlanItem = {
  title: string;
  description: string | null;
  priority: string | null;
  owner: string | null;
  estimatedDuration: string | null;
};

function parsePlan(raw: string | null): AuditReportPlanItem[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter((item) => item && typeof item.title === 'string')
      .map((item) => ({
        title: item.title,
        description: typeof item.description === 'string' ? item.description : null,
        priority: typeof item.priority === 'string' ? item.priority : null,
        owner: typeof item.owner === 'string' ? item.owner : null,
        estimatedDuration: typeof item.estimatedDuration === 'string' ? item.estimatedDuration : null,
      }));
  } catch {
    return [];
  }
}

/**
 * Données du rapport PDF d'un audit. Le périmètre vient de la session, jamais de l'URL :
 * - admin / user : leurs propres audits (userId) ; rapport complet (domaines, conformité, réponses) ;
 * - client : les audits de SON organisation explicitement partagés ; rapport limité aux champs
 *   que l'espace client expose déjà (score, maturité, recommandations, plan d'action).
 * Renvoie null si l'audit est absent OU hors périmètre (même réponse : pas d'énumération).
 */
export async function buildAuditReportData(user: AuthedUser, auditId: string) {
  const isClient = user.role === 'client';
  let where;
  if (isClient) {
    const scope = clientAuditWhere(user);
    if (!scope) return null;
    where = { id: auditId, ...scope };
  } else {
    where = { id: auditId, userId: user.id };
  }

  const audit = await prisma.audit.findFirst({
    where,
    include: isClient
      ? undefined
      : { responses: true, complianceScores: true },
  });
  if (!audit) return null;

  const responses = 'responses' in audit && Array.isArray(audit.responses) ? audit.responses : [];
  const compliance = 'complianceScores' in audit && Array.isArray(audit.complianceScores) ? audit.complianceScores : [];

  const byCategory = new Map<string, number[]>();
  for (const r of responses) {
    byCategory.set(r.category, [...(byCategory.get(r.category) ?? []), r.score ?? 0]);
  }
  const categoryScores = [...byCategory.entries()].map(([category, scores]) => ({
    category,
    // Score de réponse sur 5 → pourcentage
    percent: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length / 5) * 100),
  }));

  return {
    detail: isClient ? ('summary' as const) : ('full' as const),
    audit: {
      id: audit.id,
      createdAt: audit.createdAt,
      score: audit.score ?? null,
      maturity: audit.maturity ?? null,
    },
    recommendations: (audit.recommendations ?? '')
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean),
    plan: parsePlan(audit.actionPlan ?? null),
    categoryScores,
    compliance: compliance.map((c) => ({ regulation: c.regulation, score: c.score, status: c.status })),
    responses: responses.map((r) => ({
      question: r.question,
      answer: r.answer,
      category: r.category,
      score: r.score ?? null,
    })),
  };
}

export type AuditReportData = NonNullable<Awaited<ReturnType<typeof buildAuditReportData>>>;
