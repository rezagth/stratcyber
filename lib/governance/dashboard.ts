import { prisma } from '@/lib/db';
import { riskLevel } from '@/lib/api/risk-fields';
import { computeDeadlines } from '@/lib/api/incident-fields';

/**
 * Tableau de bord de direction (module G) : agrège plusieurs modules existants
 * (risques, plan d'action, incidents, contrôles, gouvernance) en une synthèse
 * destinée aux dirigeants. Purement une lecture agrégée — n'écrit jamais rien,
 * ne duplique aucune donnée : toujours recalculé à la demande.
 */
export async function buildGovernanceDashboard(organizationId: string) {
  const [risks, actionItems, incidents, controls, meetings] = await Promise.all([
    prisma.risk.findMany({ where: { organizationId }, select: { likelihood: true, impact: true, status: true } }),
    prisma.actionPlanItem.findMany({ where: { organizationId }, select: { status: true, dueDate: true } }),
    prisma.incidentCase.findMany({ where: { organizationId }, select: { status: true, detectedAt: true, earlyWarningSentAt: true, notificationSentAt: true, finalReportSentAt: true } }),
    prisma.control.findMany({ where: { organizationId }, select: { status: true } }),
    prisma.governanceMeeting.findMany({ where: { organizationId }, select: { id: true, type: true, title: true, meetingDate: true, status: true } }),
  ]);

  const now = Date.now();

  const openRisks = risks.filter((r) => r.status !== 'Clos' && r.status !== 'Accepté');
  const risksByLevel: Record<string, number> = { Faible: 0, Modéré: 0, Élevé: 0, Critique: 0 };
  for (const r of openRisks) risksByLevel[riskLevel(r.likelihood, r.impact)] += 1;

  const overdueActions = actionItems.filter((a) => a.status !== 'Terminé' && a.dueDate && new Date(a.dueDate).getTime() < now).length;

  const openIncidents = incidents.filter((i) => i.status !== 'Clos');
  const incidentsWithLateDeadline = incidents.filter((i) => {
    const deadlines = computeDeadlines(new Date(i.detectedAt), {
      earlyWarningSentAt: i.earlyWarningSentAt ? new Date(i.earlyWarningSentAt) : null,
      notificationSentAt: i.notificationSentAt ? new Date(i.notificationSentAt) : null,
      finalReportSentAt: i.finalReportSentAt ? new Date(i.finalReportSentAt) : null,
    });
    return Object.values(deadlines).some((d) => d.state === 'late');
  }).length;

  const controlsByStatus: Record<string, number> = {};
  for (const c of controls) controlsByStatus[c.status] = (controlsByStatus[c.status] ?? 0) + 1;

  const futureCommittees = meetings
    .filter((m) => m.type === 'Comité' && new Date(m.meetingDate).getTime() >= now)
    .sort((a, b) => +new Date(a.meetingDate) - +new Date(b.meetingDate));
  const pastAnnualReviews = meetings
    .filter((m) => m.type === 'Revue annuelle')
    .sort((a, b) => +new Date(b.meetingDate) - +new Date(a.meetingDate));

  return {
    risks: { open: openRisks.length, total: risks.length, byLevel: risksByLevel },
    actions: { total: actionItems.length, overdue: overdueActions },
    incidents: { open: openIncidents.length, total: incidents.length, withLateDeadline: incidentsWithLateDeadline },
    controls: { total: controls.length, byStatus: controlsByStatus },
    nextCommittee: futureCommittees[0] ?? null,
    lastAnnualReview: pastAnnualReviews[0] ?? null,
  };
}
