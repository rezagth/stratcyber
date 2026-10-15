import { prisma } from '@/lib/db';
import { buildGovernanceDashboard } from '@/lib/governance/dashboard';
import { buildBudgetDashboard } from '@/lib/budget/dashboard';
import { buildTrainingDashboard } from '@/lib/training/dashboard';

const MONTH_LABELS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

/**
 * Rapport mensuel d'un client (module K) : synthèse du mois agrégeant les modules
 * existants (gouvernance, budget, formation, vulnérabilités, politiques, questionnaires,
 * fournisseurs) plus les événements survenus dans le mois (incidents détectés, actions
 * terminées). Purement une lecture agrégée, recalculée à la demande.
 */
export async function buildMonthlyReportData(organizationId: string, month: number, year: number) {
  const organization = await prisma.organization.findFirst({
    where: { id: organizationId },
    select: { id: true, name: true, sector: true, size: true, missionScope: true },
  });
  if (!organization) return null;

  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 1); // exclusif

  const [
    governance, budget, training,
    vulnerabilities, policies, securityAnswers, suppliers,
    incidentsInPeriod, actionsCompletedInPeriod,
  ] = await Promise.all([
    buildGovernanceDashboard(organizationId),
    buildBudgetDashboard(organizationId, year),
    buildTrainingDashboard(organizationId),
    prisma.clientVulnerability.findMany({ where: { organizationId }, select: { status: true, severity: true } }),
    prisma.clientPolicyDocument.findMany({ where: { organizationId }, select: { status: true } }),
    prisma.securityAnswer.findMany({ where: { organizationId }, select: { status: true } }),
    prisma.supplier.findMany({ where: { organizationId }, select: { status: true, hasSecurityClause: true, lastReviewDate: true } }),
    prisma.incidentCase.findMany({
      where: { organizationId, detectedAt: { gte: periodStart, lt: periodEnd } },
      select: { title: true, severity: true, status: true, detectedAt: true },
      orderBy: { detectedAt: 'asc' },
    }),
    prisma.actionPlanItem.findMany({
      where: { organizationId, status: 'Terminé', proofDate: { gte: periodStart, lt: periodEnd } },
      select: { title: true, category: true, proofDate: true },
      orderBy: { proofDate: 'asc' },
    }),
  ]);

  const reviewLate = (lastReviewDate: Date | null) => {
    if (!lastReviewDate) return true;
    return (Date.now() - new Date(lastReviewDate).getTime()) / (1000 * 60 * 60 * 24) > 365;
  };

  return {
    organization,
    period: { month, year, label: `${MONTH_LABELS[month - 1]} ${year}` },
    governance,
    budget,
    training,
    vulnerabilities: {
      total: vulnerabilities.length,
      open: vulnerabilities.filter((v) => v.status === 'Ouverte').length,
      critical: vulnerabilities.filter((v) => v.severity === 'Critique' && v.status !== 'Corrigée').length,
    },
    policies: {
      total: policies.length,
      validated: policies.filter((p) => p.status === 'Validé').length,
    },
    securityAnswers: {
      total: securityAnswers.length,
      validated: securityAnswers.filter((a) => a.status === 'Validé').length,
    },
    suppliers: {
      total: suppliers.length,
      withSecurityClause: suppliers.filter((s) => s.hasSecurityClause).length,
      reviewLate: suppliers.filter((s) => s.status === 'Actif' && reviewLate(s.lastReviewDate)).length,
    },
    incidentsInPeriod,
    actionsCompletedInPeriod,
  };
}

export type MonthlyReportData = NonNullable<Awaited<ReturnType<typeof buildMonthlyReportData>>>;
