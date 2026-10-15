import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const SEVERITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'] as const;
export const INCIDENT_STATUSES = ['Ouvert', 'En cours', 'Clos'] as const;

type IncidentFields = {
  title: string;
  description: string | null;
  severity: string;
  category: string | null;
  status: string;
  owner: string | null;
  detectedAt: string;
  earlyWarningSentAt: string | null;
  notificationSentAt: string | null;
  finalReportSentAt: string | null;
  personalDataInvolved: boolean;
};
const WHITELIST: (keyof IncidentFields)[] = [
  'title', 'description', 'severity', 'category', 'status', 'owner', 'detectedAt',
  'earlyWarningSentAt', 'notificationSentAt', 'finalReportSentAt', 'personalDataInvolved',
];

export function parseIncidentFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<IncidentFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.title !== undefined || isCreate) {
    const title = typeof picked.title === 'string' ? picked.title.trim() : '';
    if (!title || title.length > 300) return { error: 'Titre invalide' };
    data.title = title;
  }
  if (picked.description !== undefined) {
    const v = toNullableString(picked.description, 4000);
    if (v === undefined) return { error: 'Description invalide' };
    data.description = v;
  }
  if (picked.severity !== undefined) {
    const v = toNullableEnum(picked.severity, SEVERITIES);
    if (v === undefined || v === null) return { error: `Sévérité invalide (valeurs possibles : ${SEVERITIES.join(', ')})` };
    data.severity = v;
  } else if (isCreate) {
    data.severity = 'Moyenne';
  }
  if (picked.category !== undefined) {
    const v = toNullableString(picked.category, 120);
    if (v === undefined) return { error: 'Catégorie invalide' };
    data.category = v;
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, INCIDENT_STATUSES);
    if (v === undefined || v === null) return { error: `Statut invalide (valeurs possibles : ${INCIDENT_STATUSES.join(', ')})` };
    data.status = v;
  } else if (isCreate) {
    data.status = INCIDENT_STATUSES[0];
  }
  if (picked.owner !== undefined) {
    const v = toNullableString(picked.owner, 120);
    if (v === undefined) return { error: 'Responsable invalide' };
    data.owner = v;
  }
  if (picked.detectedAt !== undefined || isCreate) {
    if (picked.detectedAt == null) return { error: 'Date de détection requise' };
    const v = toNullableDate(picked.detectedAt);
    if (!v) return { error: 'Date de détection invalide' };
    data.detectedAt = v;
  }
  for (const key of ['earlyWarningSentAt', 'notificationSentAt', 'finalReportSentAt'] as const) {
    if (picked[key] !== undefined) {
      const v = toNullableDate(picked[key]);
      if (v === undefined) return { error: 'Date invalide' };
      data[key] = v;
    }
  }
  if (picked.personalDataInvolved !== undefined) {
    if (typeof picked.personalDataInvolved !== 'boolean') return { error: 'personalDataInvolved doit être un booléen' };
    data.personalDataInvolved = picked.personalDataInvolved;
  }

  return { data };
}

export const INCIDENT_SELECT = {
  id: true, organizationId: true, title: true, description: true, severity: true, category: true,
  status: true, owner: true, detectedAt: true, earlyWarningSentAt: true, notificationSentAt: true,
  finalReportSentAt: true, personalDataInvolved: true, createdAt: true, updatedAt: true,
};

const HOUR = 60 * 60 * 1000;
const DEADLINES = {
  earlyWarning: { afterMs: 24 * HOUR, sentKey: 'earlyWarningSentAt' as const },
  notification: { afterMs: 72 * HOUR, sentKey: 'notificationSentAt' as const },
  // "1 mois" : approximé à 30 jours (aucune réglementation ne précise un nombre de jours exact).
  finalReport: { afterMs: 30 * 24 * HOUR, sentKey: 'finalReportSentAt' as const },
};

export type DeadlineState = 'done' | 'onTime' | 'late' | 'pending';

/**
 * Calcule l'état des 3 échéances NIS2 (alerte précoce 24h, notification 72h, rapport
 * final 1 mois) à partir de `detectedAt`, jamais stocké :
 * - 'done' : envoyé avant l'échéance.
 * - 'late' : envoyé après l'échéance, ou pas encore envoyé alors que l'échéance est dépassée.
 * - 'pending' : pas encore envoyé, échéance pas encore dépassée.
 */
export function computeDeadlines(detectedAt: Date, incident: Record<string, Date | null>) {
  const now = Date.now();
  const result: Record<string, { deadline: Date; state: DeadlineState }> = {};
  for (const [key, { afterMs, sentKey }] of Object.entries(DEADLINES)) {
    const deadline = new Date(detectedAt.getTime() + afterMs);
    const sentAt = incident[sentKey];
    let state: DeadlineState;
    if (sentAt) {
      state = sentAt.getTime() <= deadline.getTime() ? 'done' : 'late';
    } else {
      state = now > deadline.getTime() ? 'late' : 'pending';
    }
    result[key] = { deadline, state };
  }
  return result;
}
