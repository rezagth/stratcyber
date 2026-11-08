/**
 * Échéances réglementaires d'un incident, calculées à partir de `detectedAt` (jamais stockées).
 *  - NIS2 : alerte précoce sous 24 h, notification de l'incident sous 72 h, rapport final sous 1 mois.
 *  - RGPD (art. 33) : notification à la CNIL sous 72 h, seulement si des données personnelles sont concernées.
 * `detectedAt` joue le rôle du moment où l'on « a pris connaissance » de l'incident.
 * « 1 mois » est approximé à 30 jours (aucun texte ne précise un nombre de jours exact).
 */
export const HOUR_MS = 60 * 60 * 1000;

export type CrisisDeadlineKey = 'earlyWarning' | 'notification' | 'cnil' | 'finalReport';
export type CrisisDeadlineState = 'done' | 'doneLate' | 'overdue' | 'urgent' | 'pending';

export type CrisisDeadline = {
  key: CrisisDeadlineKey;
  label: string;
  regulation: 'NIS2' | 'RGPD';
  deadline: Date;
  sentAt: Date | null;
  /** Millisecondes restantes avant l'échéance (négatif si dépassée). Null si déjà envoyé. */
  remainingMs: number | null;
  state: CrisisDeadlineState;
};

export type CrisisDeadlineInput = {
  detectedAt: Date;
  personalDataInvolved: boolean;
  earlyWarningSentAt: Date | null;
  notificationSentAt: Date | null;
  finalReportSentAt: Date | null;
  cnilNotifiedAt: Date | null;
};

/** En dessous de ce temps restant, une échéance non tenue passe en « urgent ». */
export const URGENT_THRESHOLD_MS = 6 * HOUR_MS;

const DEFINITIONS: Array<{
  key: CrisisDeadlineKey;
  label: string;
  regulation: 'NIS2' | 'RGPD';
  afterMs: number;
  sentKey: keyof CrisisDeadlineInput;
  onlyIfPersonalData?: boolean;
}> = [
  { key: 'earlyWarning', label: 'Alerte précoce (NIS2, 24 h)', regulation: 'NIS2', afterMs: 24 * HOUR_MS, sentKey: 'earlyWarningSentAt' },
  { key: 'notification', label: "Notification de l'incident (NIS2, 72 h)", regulation: 'NIS2', afterMs: 72 * HOUR_MS, sentKey: 'notificationSentAt' },
  { key: 'cnil', label: 'Notification à la CNIL (RGPD, 72 h)', regulation: 'RGPD', afterMs: 72 * HOUR_MS, sentKey: 'cnilNotifiedAt', onlyIfPersonalData: true },
  { key: 'finalReport', label: 'Rapport final (NIS2, 1 mois)', regulation: 'NIS2', afterMs: 30 * 24 * HOUR_MS, sentKey: 'finalReportSentAt' },
];

export function computeCrisisDeadlines(input: CrisisDeadlineInput, now: Date = new Date()): CrisisDeadline[] {
  const result: CrisisDeadline[] = [];
  for (const def of DEFINITIONS) {
    if (def.onlyIfPersonalData && !input.personalDataInvolved) continue;
    const deadline = new Date(input.detectedAt.getTime() + def.afterMs);
    const sentAt = input[def.sentKey] as Date | null;
    let state: CrisisDeadlineState;
    let remainingMs: number | null = null;
    if (sentAt) {
      state = sentAt.getTime() <= deadline.getTime() ? 'done' : 'doneLate';
    } else {
      remainingMs = deadline.getTime() - now.getTime();
      state = remainingMs < 0 ? 'overdue' : remainingMs <= URGENT_THRESHOLD_MS ? 'urgent' : 'pending';
    }
    result.push({ key: def.key, label: def.label, regulation: def.regulation, deadline, sentAt, remainingMs, state });
  }
  return result;
}

/** « 23 h 59 min », « 2 j 4 h », « dépassée de 3 h 10 min ». */
export function formatRemaining(ms: number): string {
  const abs = Math.abs(ms);
  const totalMinutes = Math.floor(abs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const text = days > 0 ? `${days} j ${hours} h` : `${hours} h ${String(minutes).padStart(2, '0')} min`;
  return ms < 0 ? `dépassée de ${text}` : text;
}
