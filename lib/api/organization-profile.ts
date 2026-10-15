import { pickDefined } from '@/lib/api/whitelist';
import { toNullableEnum, toNullableNumber, toNullableString } from '@/lib/api/validators';

export const SECTORS = [
  'Finance', 'Santé', 'Énergie', 'Transport', 'Numérique', 'Administration', 'Industrie', 'Commerce', 'Autre',
] as const;
export const SIZES = ['TPE', 'PME', 'ETI', 'GE'] as const;
export const NIS2_APPLICABILITY = ['Oui', 'Non', 'Incertain'] as const;
export const RGPD_APPLICABILITY = ['Oui', 'Non'] as const;
export const ISO27001_STATUS = ['Non engagé', 'En cours', 'Certifié'] as const;

type ProfileFields = {
  name: string;
  sector: string | null;
  size: string | null;
  headcount: number | null;
  annualRevenue: number | null;
  missionScope: string | null;
  nis2Applicability: string | null;
  nis2Note: string | null;
  rgpdApplicability: string | null;
  rgpdNote: string | null;
  iso27001Status: string | null;
  iso27001Note: string | null;
};

const PROFILE_WHITELIST: (keyof ProfileFields)[] = [
  'name', 'sector', 'size', 'headcount', 'annualRevenue', 'missionScope',
  'nis2Applicability', 'nis2Note', 'rgpdApplicability', 'rgpdNote', 'iso27001Status', 'iso27001Note',
];

/**
 * Valide et prépare les champs du profil client (module A) à partir d'un corps de requête
 * brut, en appliquant une liste blanche : aucun champ non listé ici n'est jamais écrit.
 * Partagé entre la création (`POST /api/organizations`) et la mise à jour
 * (`PATCH /api/organizations/[id]`).
 *
 * Renvoie soit `{ data }` (les champs Prisma prêts à écrire), soit `{ error }` (message à
 * renvoyer tel quel en 400).
 */
export function parseOrganizationProfile(
  body: unknown,
  { requireName }: { requireName: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<ProfileFields>(body, PROFILE_WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.name !== undefined || requireName) {
    const name = typeof picked.name === 'string' ? picked.name.trim() : '';
    if (name.length < 2 || name.length > 120) {
      return { error: 'Nom du client invalide (2 à 120 caractères)' };
    }
    data.name = name;
  }

  if (picked.sector !== undefined) {
    const v = toNullableEnum(picked.sector, SECTORS);
    if (v === undefined) return { error: `Secteur invalide (valeurs possibles : ${SECTORS.join(', ')})` };
    data.sector = v;
  }
  if (picked.size !== undefined) {
    const v = toNullableEnum(picked.size, SIZES);
    if (v === undefined) return { error: `Taille invalide (valeurs possibles : ${SIZES.join(', ')})` };
    data.size = v;
  }
  if (picked.headcount !== undefined) {
    const v = toNullableNumber(picked.headcount, { min: 0 });
    if (v === undefined) return { error: 'Effectif invalide' };
    data.headcount = v === null ? null : Math.round(v);
  }
  if (picked.annualRevenue !== undefined) {
    const v = toNullableNumber(picked.annualRevenue, { min: 0 });
    if (v === undefined) return { error: "Chiffre d'affaires invalide" };
    data.annualRevenue = v;
  }
  if (picked.missionScope !== undefined) {
    const v = toNullableString(picked.missionScope, 4000);
    if (v === undefined) return { error: 'Périmètre de mission invalide' };
    data.missionScope = v;
  }

  let touchesApplicability = false;
  if (picked.nis2Applicability !== undefined) {
    const v = toNullableEnum(picked.nis2Applicability, NIS2_APPLICABILITY);
    if (v === undefined) return { error: `Applicabilité NIS2 invalide (valeurs possibles : ${NIS2_APPLICABILITY.join(', ')})` };
    data.nis2Applicability = v;
    touchesApplicability = true;
  }
  if (picked.nis2Note !== undefined) {
    const v = toNullableString(picked.nis2Note, 2000);
    if (v === undefined) return { error: 'Justification NIS2 invalide' };
    data.nis2Note = v;
  }
  if (picked.rgpdApplicability !== undefined) {
    const v = toNullableEnum(picked.rgpdApplicability, RGPD_APPLICABILITY);
    if (v === undefined) return { error: `Applicabilité RGPD invalide (valeurs possibles : ${RGPD_APPLICABILITY.join(', ')})` };
    data.rgpdApplicability = v;
    touchesApplicability = true;
  }
  if (picked.rgpdNote !== undefined) {
    const v = toNullableString(picked.rgpdNote, 2000);
    if (v === undefined) return { error: 'Justification RGPD invalide' };
    data.rgpdNote = v;
  }
  if (picked.iso27001Status !== undefined) {
    const v = toNullableEnum(picked.iso27001Status, ISO27001_STATUS);
    if (v === undefined) return { error: `Statut ISO 27001 invalide (valeurs possibles : ${ISO27001_STATUS.join(', ')})` };
    data.iso27001Status = v;
    touchesApplicability = true;
  }
  if (picked.iso27001Note !== undefined) {
    const v = toNullableString(picked.iso27001Note, 2000);
    if (v === undefined) return { error: 'Justification ISO 27001 invalide' };
    data.iso27001Note = v;
  }
  if (touchesApplicability) {
    data.applicabilityAssessedAt = new Date();
  }

  return { data };
}
