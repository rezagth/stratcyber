import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const SUPPLIER_CRITICALITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'] as const;
export const SUPPLIER_STATUSES = ['Actif', 'Inactif'] as const;

type SupplierFields = {
  name: string;
  description: string | null;
  dataLocation: string | null;
  criticality: string;
  hasSecurityClause: unknown; // booléen, validé séparément
  securityClauseReference: string | null;
  lastReviewDate: string | null;
  status: string;
};
const WHITELIST: (keyof SupplierFields)[] = [
  'name', 'description', 'dataLocation', 'criticality', 'hasSecurityClause',
  'securityClauseReference', 'lastReviewDate', 'status',
];

/**
 * Valide les champs d'un fournisseur (module H : risque tiers / chaîne
 * d'approvisionnement). Partagé entre la création et la mise à jour.
 */
export function parseSupplierFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<SupplierFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.name !== undefined || isCreate) {
    const name = typeof picked.name === 'string' ? picked.name.trim() : '';
    if (!name || name.length > 200) return { error: 'Nom invalide' };
    data.name = name;
  }
  if (picked.description !== undefined) {
    const v = toNullableString(picked.description, 2000);
    if (v === undefined) return { error: 'Description invalide' };
    data.description = v;
  }
  if (picked.dataLocation !== undefined) {
    const v = toNullableString(picked.dataLocation, 200);
    if (v === undefined) return { error: 'Localisation des données invalide' };
    data.dataLocation = v;
  }
  if (picked.criticality !== undefined) {
    const v = toNullableEnum(picked.criticality, SUPPLIER_CRITICALITIES);
    if (v === undefined || v === null) return { error: `Criticité invalide (valeurs possibles : ${SUPPLIER_CRITICALITIES.join(', ')})` };
    data.criticality = v;
  } else if (isCreate) {
    // Valeur explicite plutôt que de compter sur le défaut du schéma Prisma.
    data.criticality = 'Moyenne';
  }
  if (picked.hasSecurityClause !== undefined) {
    if (typeof picked.hasSecurityClause !== 'boolean') return { error: 'Clause de sécurité invalide' };
    data.hasSecurityClause = picked.hasSecurityClause;
  } else if (isCreate) {
    data.hasSecurityClause = false;
  }
  if (picked.securityClauseReference !== undefined) {
    const v = toNullableString(picked.securityClauseReference, 500);
    if (v === undefined) return { error: 'Référence de la clause de sécurité invalide' };
    data.securityClauseReference = v;
  }
  if (picked.lastReviewDate !== undefined) {
    const v = toNullableDate(picked.lastReviewDate);
    if (v === undefined) return { error: 'Date de dernière revue invalide' };
    data.lastReviewDate = v;
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, SUPPLIER_STATUSES);
    if (v === undefined || v === null) return { error: `Statut invalide (valeurs possibles : ${SUPPLIER_STATUSES.join(', ')})` };
    data.status = v;
  } else if (isCreate) {
    data.status = SUPPLIER_STATUSES[0];
  }

  return { data };
}

export const SUPPLIER_SELECT = {
  id: true, organizationId: true, name: true, description: true, dataLocation: true,
  criticality: true, hasSecurityClause: true, securityClauseReference: true,
  lastReviewDate: true, status: true, createdAt: true, updatedAt: true,
};
