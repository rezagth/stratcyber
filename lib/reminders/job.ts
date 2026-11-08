import { prisma } from '@/lib/db';
import { sendEmailOnce } from '@/lib/email/send';
import { dayKey } from '@/lib/email/keys';
import { computeCrisisDeadlines, formatRemaining } from '@/lib/incidents/deadlines';

export type ReminderJobResult = {
  adminDigests: { sent: number; skipped: number; failed: number };
  clientReminders: { sent: number; skipped: number; failed: number };
  overdueActions: number;
  urgentDeadlines: number;
};

const fmt = (d: Date) => d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Europe/Paris' });
const MAX_LINES = 15;

function tally(counter: { sent: number; skipped: number; failed: number }, status: 'sent' | 'skipped' | 'failed') {
  counter[status] += 1;
}

/**
 * Tâche quotidienne :
 *  1. résumé pour chaque administrateur (délais NIS2/CNIL urgents ou dépassés, actions en retard) ;
 *  2. envoi des relances client approuvées par l'administrateur (jamais un brouillon).
 * Idempotente : les clés d'envoi (admin + jour, relance + destinataire) empêchent tout doublon si la tâche
 * est relancée. N'envoie rien s'il n'y a rien à signaler.
 */
export async function runReminderJob(now: Date = new Date()): Promise<ReminderJobResult> {
  const result: ReminderJobResult = {
    adminDigests: { sent: 0, skipped: 0, failed: 0 },
    clientReminders: { sent: 0, skipped: 0, failed: 0 },
    overdueActions: 0,
    urgentDeadlines: 0,
  };

  const organizations = await prisma.organization.findMany({ select: { id: true, name: true } });
  const orgName = new Map(organizations.map((o) => [o.id, o.name]));
  const nameOf = (id: string) => orgName.get(id) ?? 'Client inconnu';

  // 1. Résumé administrateur.
  const overdue = await prisma.actionPlanItem.findMany({
    where: { status: { not: 'Terminé' }, dueDate: { lt: now } },
    select: { organizationId: true, title: true, priority: true, dueDate: true },
  });
  result.overdueActions = overdue.length;

  const incidents = await prisma.incidentCase.findMany({
    where: { status: { not: 'Clos' } },
    select: {
      organizationId: true, title: true, detectedAt: true, personalDataInvolved: true,
      earlyWarningSentAt: true, notificationSentAt: true, finalReportSentAt: true, cnilNotifiedAt: true,
    },
  });
  const urgentLines: string[] = [];
  for (const incident of incidents) {
    const deadlines = computeCrisisDeadlines({
      detectedAt: incident.detectedAt,
      personalDataInvolved: incident.personalDataInvolved,
      earlyWarningSentAt: incident.earlyWarningSentAt ?? null,
      notificationSentAt: incident.notificationSentAt ?? null,
      finalReportSentAt: incident.finalReportSentAt ?? null,
      cnilNotifiedAt: incident.cnilNotifiedAt ?? null,
    }, now);
    for (const d of deadlines) {
      if (d.state !== 'overdue' && d.state !== 'urgent') continue;
      urgentLines.push(`- ${nameOf(incident.organizationId)} : « ${incident.title} » — ${d.label} — ${d.state === 'overdue' ? 'DÉPASSÉE' : `reste ${formatRemaining(d.remainingMs ?? 0)}`} (échéance ${fmt(d.deadline)})`);
    }
  }
  result.urgentDeadlines = urgentLines.length;

  if (urgentLines.length > 0 || overdue.length > 0) {
    const byOrg = new Map<string, typeof overdue>();
    for (const item of overdue) byOrg.set(item.organizationId, [...(byOrg.get(item.organizationId) ?? []), item]);
    const actionLines = [...byOrg.entries()].flatMap(([orgId, items]) =>
      [`${nameOf(orgId)} : ${items.length} action(s) en retard`,
        ...items.sort((a, b) => (a.dueDate?.getTime() ?? 0) - (b.dueDate?.getTime() ?? 0)).slice(0, 5)
          .map((i) => `  - [${i.priority}] ${i.title} (échue le ${i.dueDate ? fmt(i.dueDate) : '?'})`)]);

    const text = [
      'Résumé StratCyber',
      '',
      urgentLines.length > 0 ? `Délais réglementaires à traiter (${urgentLines.length}) :\n${urgentLines.slice(0, MAX_LINES).join('\n')}` : 'Aucun délai réglementaire urgent.',
      '',
      overdue.length > 0 ? `Actions en retard (${overdue.length}) :\n${actionLines.slice(0, MAX_LINES * 2).join('\n')}` : 'Aucune action en retard.',
      '',
      'Les délais sont un aide-mémoire : vérifie leur applicabilité avec le client.',
    ].join('\n');

    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true, email: true } });
    for (const admin of admins) {
      const sent = await sendEmailOnce({
        key: `admin_digest:${admin.id}:${dayKey(now)}`,
        kind: 'admin_digest',
        to: admin.email,
        subject: `StratCyber : ${urgentLines.length} délai(s) à traiter, ${overdue.length} action(s) en retard`,
        text,
      }, now);
      tally(result.adminDigests, sent.status === 'sent' ? 'sent' : sent.status === 'failed' ? 'failed' : 'skipped');
    }
  }

  // 2. Relances client approuvées.
  const approved = await prisma.actionReminder.findMany({
    where: { status: 'approved' },
    select: { id: true, message: true, organizationId: true, actionPlanItem: { select: { title: true } } },
  });
  for (const reminder of approved) {
    const recipients = await prisma.user.findMany({
      where: { role: 'client', organizationId: reminder.organizationId },
      select: { id: true, email: true },
    });
    for (const user of recipients) {
      const sent = await sendEmailOnce({
        key: `action_reminder:${reminder.id}:${user.id}`,
        kind: 'action_reminder',
        organizationId: reminder.organizationId,
        to: user.email,
        subject: `Rappel : ${reminder.actionPlanItem?.title ?? "action du plan d'action"}`,
        text: reminder.message,
      }, now);
      tally(result.clientReminders, sent.status === 'sent' ? 'sent' : sent.status === 'failed' ? 'failed' : 'skipped');
    }
  }

  return result;
}
