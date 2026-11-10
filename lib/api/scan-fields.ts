import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';
import { CAMPAIGN_STATUSES } from '@/lib/scan/authorization';

export const MANUAL_SEVERITIES = ['Critique', 'Haute', 'Moyenne', 'Info'] as const;
export const FINDING_STATUSES = ['Nouveau', 'Retenu', 'Écarté'] as const;

/** Champs d'autorisation : leur modification remet une campagne « Autorisée » en « Brouillon » (à reconfirmer). */
export const AUTHORIZATION_KEYS = ['authorizedByName', 'authorizedByRole', 'authorizationRef', 'authorizedAt', 'windowStart', 'windowEnd'] as const;

type CampaignFields = {
  name: string; notes: string | null; status: string;
  authorizedByName: string | null; authorizedByRole: string | null; authorizationRef: string | null;
  authorizedAt: string | null; windowStart: string | null; windowEnd: string | null;
};
const CAMPAIGN_WHITELIST: (keyof CampaignFields)[] = ['name', 'notes', 'status', ...AUTHORIZATION_KEYS];

export function parseCampaignFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<CampaignFields>(body, CAMPAIGN_WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.name !== undefined || isCreate) {
    const name = typeof picked.name === 'string' ? picked.name.trim() : '';
    if (!name || name.length > 120) return { error: 'Nom de campagne invalide (1 à 120 caractères)' };
    data.name = name;
  }
  if (picked.notes !== undefined) {
    const v = toNullableString(picked.notes, 2000);
    if (v === undefined) return { error: 'Notes invalides' };
    data.notes = v;
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, CAMPAIGN_STATUSES);
    if (v === undefined || v === null) return { error: `Statut invalide (valeurs possibles : ${CAMPAIGN_STATUSES.join(', ')})` };
    data.status = v;
  }
  for (const key of ['authorizedByName', 'authorizedByRole'] as const) {
    if (picked[key] !== undefined) {
      const v = toNullableString(picked[key], 120);
      if (v === undefined) return { error: 'Champ d\'autorisation invalide' };
      data[key] = v;
    }
  }
  if (picked.authorizationRef !== undefined) {
    const v = toNullableString(picked.authorizationRef, 200);
    if (v === undefined) return { error: 'Référence du document invalide' };
    data.authorizationRef = v;
  }
  for (const key of ['authorizedAt', 'windowStart', 'windowEnd'] as const) {
    if (picked[key] !== undefined) {
      const v = toNullableDate(picked[key]);
      if (v === undefined) return { error: 'Date invalide' };
      data[key] = v;
    }
  }
  return { data };
}

type ManualFindingFields = { targetHost: string; title: string; detail: string; severity: string; evidence: string | null };

export function parseManualFinding(body: unknown): { data: { targetHost: string; title: string; detail: string; severity: string; evidence: string | null } } | { error: string } {
  const picked = pickDefined<ManualFindingFields>(body, ['targetHost', 'title', 'detail', 'severity', 'evidence']);
  const title = typeof picked.title === 'string' ? picked.title.trim() : '';
  if (!title || title.length > 200) return { error: 'Titre invalide (1 à 200 caractères)' };
  const detail = typeof picked.detail === 'string' ? picked.detail.trim() : '';
  if (!detail || detail.length > 2000) return { error: 'Description invalide (1 à 2000 caractères)' };
  const severity = toNullableEnum(picked.severity, MANUAL_SEVERITIES);
  if (!severity) return { error: `Gravité invalide (valeurs possibles : ${MANUAL_SEVERITIES.join(', ')})` };
  const evidence = picked.evidence === undefined ? null : toNullableString(picked.evidence, 500);
  if (evidence === undefined) return { error: 'Preuve invalide' };
  const targetHost = typeof picked.targetHost === 'string' ? picked.targetHost.trim().toLowerCase() : '';
  if (!targetHost) return { error: 'Cible manquante' };
  return { data: { targetHost, title, detail, severity, evidence } };
}

export const CAMPAIGN_SELECT = {
  id: true, organizationId: true, name: true, status: true, notes: true,
  authorizedByName: true, authorizedByRole: true, authorizationRef: true, authorizedAt: true, windowStart: true, windowEnd: true,
  createdAt: true, updatedAt: true,
};
