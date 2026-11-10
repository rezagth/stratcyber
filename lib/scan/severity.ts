/** Gravités d'un constat de campagne et correspondance avec le registre de vulnérabilités et le plan d'action. */

const RANK: Record<string, number> = { Critique: 0, Haute: 1, Moyenne: 2, Info: 3, OK: 4 };

export const severityRank = (severity: string) => RANK[severity] ?? 5;

/** Le registre de vulnérabilités ne connaît pas « Info » : c'est une gravité « Faible ». « OK » n'y entre jamais. */
export function toRegisterSeverity(severity: string): 'Critique' | 'Haute' | 'Moyenne' | 'Faible' {
  if (severity === 'Critique' || severity === 'Haute' || severity === 'Moyenne') return severity;
  return 'Faible';
}

export const toPlanPriority = toRegisterSeverity;

/** Constats à corriger : tout sauf « OK ». */
export const isActionable = (severity: string) => severity !== 'OK';
