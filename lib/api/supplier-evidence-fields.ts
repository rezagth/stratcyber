import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableString } from '@/lib/api/validators';

type SupplierEvidenceFields = {
  label: string;
  evidenceDate: unknown; // requise, jamais `null` — validée séparément
  expiresAt: string | null;
  link: string | null;
};
const WHITELIST: (keyof SupplierEvidenceFields)[] = ['label', 'evidenceDate', 'expiresAt', 'link'];

/** Valide les champs d'une preuve annuelle fournisseur (module H), partagé entre création et mise à jour. */
export function parseSupplierEvidenceFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<SupplierEvidenceFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.label !== undefined || isCreate) {
    const label = typeof picked.label === 'string' ? picked.label.trim() : '';
    if (!label || label.length > 200) return { error: 'Libellé invalide' };
    data.label = label;
  }
  if (picked.evidenceDate !== undefined || isCreate) {
    if (picked.evidenceDate == null) return { error: 'Date de la preuve requise' };
    const v = toNullableDate(picked.evidenceDate);
    if (!v) return { error: 'Date de la preuve invalide' };
    data.evidenceDate = v;
  }
  if (picked.expiresAt !== undefined) {
    const v = toNullableDate(picked.expiresAt);
    if (v === undefined) return { error: "Date d'expiration invalide" };
    data.expiresAt = v;
  }
  if (picked.link !== undefined) {
    const v = toNullableString(picked.link, 500);
    if (v === undefined) return { error: 'Lien invalide' };
    data.link = v;
  }

  return { data };
}

export const SUPPLIER_EVIDENCE_SELECT = {
  id: true, supplierId: true, organizationId: true, label: true,
  evidenceDate: true, expiresAt: true, link: true, createdAt: true, updatedAt: true,
};
