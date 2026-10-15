import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const TREATMENTS = ['À traiter', 'Éviter', 'Réduire', 'Transférer', 'Accepter'] as const;
export const RISK_STATUSES = ['Ouvert', 'Traité', 'Accepté', 'Clos'] as const;

type RiskFields = {
  title: string;
  description: string | null;
  likelihood: number;
  impact: number;
  treatment: string;
  owner: string | null;
  dueDate: string | null;
  status: string;
  actionPlanItemId: string | null;
  controlId: string | null;
};
const WHITELIST: (keyof RiskFields)[] = [
  'title', 'description', 'likelihood', 'impact', 'treatment', 'owner', 'dueDate', 'status',
  'actionPlanItemId', 'controlId',
];

function toScale(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) return undefined;
  return value;
}

/** Niveau de risque dérivé de la probabilité × impact, jamais stocké (toujours recalculé). */
export function riskLevel(likelihood: number, impact: number): 'Faible' | 'Modéré' | 'Élevé' | 'Critique' {
  const score = likelihood * impact;
  if (score >= 15) return 'Critique';
  if (score >= 8) return 'Élevé';
  if (score >= 4) return 'Modéré';
  return 'Faible';
}

export function parseRiskFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<RiskFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.title !== undefined || isCreate) {
    const title = typeof picked.title === 'string' ? picked.title.trim() : '';
    if (!title || title.length > 300) return { error: 'Titre invalide' };
    data.title = title;
  }
  if (picked.description !== undefined) {
    const v = toNullableString(picked.description, 2000);
    if (v === undefined) return { error: 'Description invalide' };
    data.description = v;
  }
  if (picked.likelihood !== undefined || isCreate) {
    const v = toScale(picked.likelihood);
    if (v === undefined) return { error: 'Probabilité invalide (1 à 5)' };
    data.likelihood = v;
  }
  if (picked.impact !== undefined || isCreate) {
    const v = toScale(picked.impact);
    if (v === undefined) return { error: 'Impact invalide (1 à 5)' };
    data.impact = v;
  }
  if (picked.treatment !== undefined) {
    const v = toNullableEnum(picked.treatment, TREATMENTS);
    if (v === undefined || v === null) return { error: `Traitement invalide (valeurs possibles : ${TREATMENTS.join(', ')})` };
    data.treatment = v;
  } else if (isCreate) {
    data.treatment = TREATMENTS[0];
  }
  if (picked.owner !== undefined) {
    const v = toNullableString(picked.owner, 120);
    if (v === undefined) return { error: 'Responsable invalide' };
    data.owner = v;
  }
  if (picked.dueDate !== undefined) {
    const v = toNullableDate(picked.dueDate);
    if (v === undefined) return { error: 'Échéance invalide' };
    data.dueDate = v;
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, RISK_STATUSES);
    if (v === undefined || v === null) return { error: `Statut invalide (valeurs possibles : ${RISK_STATUSES.join(', ')})` };
    data.status = v;
  } else if (isCreate) {
    data.status = RISK_STATUSES[0];
  }
  if (picked.actionPlanItemId !== undefined) {
    const v = toNullableString(picked.actionPlanItemId, 60);
    if (v === undefined) return { error: 'Action liée invalide' };
    data.actionPlanItemId = v;
  }
  if (picked.controlId !== undefined) {
    const v = toNullableString(picked.controlId, 60);
    if (v === undefined) return { error: 'Contrôle lié invalide' };
    data.controlId = v;
  }

  return { data };
}

export const RISK_SELECT = {
  id: true, organizationId: true, title: true, description: true, likelihood: true, impact: true,
  treatment: true, owner: true, dueDate: true, status: true, actionPlanItemId: true, controlId: true,
  createdAt: true, updatedAt: true,
};
