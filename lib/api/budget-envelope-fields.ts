import { pickDefined } from '@/lib/api/whitelist';
import { toNullableString } from '@/lib/api/validators';

type BudgetEnvelopeFields = {
  fiscalYear: unknown; // entier requis à la création, validé séparément
  allocatedAmount: unknown; // nombre positif requis à la création, validé séparément
  note: string | null;
};
const WHITELIST: (keyof BudgetEnvelopeFields)[] = ['fiscalYear', 'allocatedAmount', 'note'];

/** Valide les champs d'une enveloppe budgétaire (module I), partagé entre création et mise à jour. */
export function parseBudgetEnvelopeFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<BudgetEnvelopeFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.fiscalYear !== undefined || isCreate) {
    const year = picked.fiscalYear;
    if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return { error: 'Exercice invalide' };
    }
    data.fiscalYear = year;
  }
  if (picked.allocatedAmount !== undefined || isCreate) {
    const amount = picked.allocatedAmount;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      return { error: 'Montant alloué invalide' };
    }
    data.allocatedAmount = amount;
  }
  if (picked.note !== undefined) {
    const v = toNullableString(picked.note, 2000);
    if (v === undefined) return { error: 'Note invalide' };
    data.note = v;
  }

  return { data };
}

export const BUDGET_ENVELOPE_SELECT = {
  id: true, organizationId: true, fiscalYear: true, allocatedAmount: true, note: true, createdAt: true, updatedAt: true,
};
