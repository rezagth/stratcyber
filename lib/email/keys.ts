/**
 * Briques des clés d'idempotence (type d'e-mail + objet + fenêtre) ; chaque type d'e-mail compose sa clé
 * avec ces fonctions. Deux appels avec la même clé ne produisent jamais deux envois réussis.
 */
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** Semaine ISO (ex. '2026-W43'), en UTC. */
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Mois (ex. '2026-10'), en UTC. */
export const monthKey = (date: Date) => date.toISOString().slice(0, 7);
