import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const BUDGET_CATEGORIES = ['Outils et licences', 'Formation', 'Audit et conseil', 'Assurance cyber', 'Personnel', 'Autre'] as const;

type BudgetExpenseFields = {
  fiscalYear: unknown; // entier requis à la création, validé séparément
  category: string | null;
  label: string;
  amount: unknown; // nombre positif requis à la création, validé séparément
  expenseDate: unknown; // requise, jamais `null` — validée séparément
  note: string | null;
};
const WHITELIST: (keyof BudgetExpenseFields)[] = ['fiscalYear', 'category', 'label', 'amount', 'expenseDate', 'note'];

/** Valide les champs d'une dépense budgétaire (module I), partagé entre création et mise à jour. */
export function parseBudgetExpenseFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<BudgetExpenseFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.fiscalYear !== undefined || isCreate) {
    const year = picked.fiscalYear;
    if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return { error: 'Exercice invalide' };
    }
    data.fiscalYear = year;
  }
  if (picked.category !== undefined) {
    const v = toNullableEnum(picked.category, BUDGET_CATEGORIES);
    if (v === undefined) return { error: `Catégorie invalide (valeurs possibles : ${BUDGET_CATEGORIES.join(', ')})` };
    data.category = v;
  }
  if (picked.label !== undefined || isCreate) {
    const label = typeof picked.label === 'string' ? picked.label.trim() : '';
    if (!label || label.length > 200) return { error: 'Libellé invalide' };
    data.label = label;
  }
  if (picked.amount !== undefined || isCreate) {
    const amount = picked.amount;
    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      return { error: 'Montant invalide' };
    }
    data.amount = amount;
  }
  if (picked.expenseDate !== undefined || isCreate) {
    if (picked.expenseDate == null) return { error: 'Date de la dépense requise' };
    const v = toNullableDate(picked.expenseDate);
    if (!v) return { error: 'Date de la dépense invalide' };
    data.expenseDate = v;
  }
  if (picked.note !== undefined) {
    const v = toNullableString(picked.note, 2000);
    if (v === undefined) return { error: 'Note invalide' };
    data.note = v;
  }

  return { data };
}

export const BUDGET_EXPENSE_SELECT = {
  id: true, organizationId: true, fiscalYear: true, category: true, label: true, amount: true,
  expenseDate: true, note: true, createdAt: true, updatedAt: true,
};
