import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const ADMIN_SETTABLE_STATUSES = ['Brouillon', 'À valider'] as const;

type AnswerFields = {
  question: string;
  answer: string | null;
  isNotApplicable: boolean;
  notApplicableReason: string | null;
  category: string | null;
  answeredAt: string;
  status: string;
};
const WHITELIST: (keyof AnswerFields)[] = ['question', 'answer', 'isNotApplicable', 'notApplicableReason', 'category', 'answeredAt', 'status'];

/**
 * Valide les champs d'une réponse (module F), partagé entre création et mise à jour.
 * Un "non applicable" doit toujours être motivé — jamais silencieux.
 */
export function parseSecurityAnswerFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<AnswerFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.question !== undefined || isCreate) {
    const question = typeof picked.question === 'string' ? picked.question.trim() : '';
    if (!question || question.length > 1000) return { error: 'Question invalide' };
    data.question = question;
  }
  if (picked.isNotApplicable !== undefined) {
    if (typeof picked.isNotApplicable !== 'boolean') return { error: 'isNotApplicable doit être un booléen' };
    data.isNotApplicable = picked.isNotApplicable;
  }
  if (picked.answer !== undefined) {
    const v = toNullableString(picked.answer, 4000);
    if (v === undefined) return { error: 'Réponse invalide' };
    data.answer = v;
  }
  if (picked.notApplicableReason !== undefined) {
    const v = toNullableString(picked.notApplicableReason, 1000);
    if (v === undefined) return { error: 'Motif invalide' };
    data.notApplicableReason = v;
  }
  if (picked.category !== undefined) {
    const v = toNullableString(picked.category, 120);
    if (v === undefined) return { error: 'Catégorie invalide' };
    data.category = v;
  }
  if (picked.answeredAt !== undefined) {
    const v = toNullableDate(picked.answeredAt);
    if (v === undefined || v === null) return { error: 'Date de réponse invalide' };
    data.answeredAt = v;
  } else if (isCreate) {
    data.answeredAt = new Date();
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, ADMIN_SETTABLE_STATUSES);
    if (v === undefined || v === null) {
      return { error: `Statut invalide côté admin (valeurs possibles : ${ADMIN_SETTABLE_STATUSES.join(', ')}) — la validation finale est réservée au client` };
    }
    data.status = v;
  } else if (isCreate) {
    data.status = ADMIN_SETTABLE_STATUSES[0];
  }

  // Cohérence "non applicable" / réponse : vérifiée sur l'état FINAL (champs déjà
  // modifiés fusionnés avec l'existant), donc le routeur complète `data` avant d'appeler
  // cette vérification — voir `validateNotApplicableConsistency`.
  return { data };
}

/**
 * Vérifie, sur l'état final d'une réponse (après fusion des champs modifiés avec
 * l'existant), qu'un "non applicable" est motivé et qu'une réponse normale a un
 * contenu — jamais un N/A silencieux, jamais une réponse vide non assumée.
 */
export function validateNotApplicableConsistency(final: {
  isNotApplicable: boolean;
  answer: string | null;
  notApplicableReason: string | null;
}): string | null {
  if (final.isNotApplicable) {
    if (!final.notApplicableReason || !final.notApplicableReason.trim()) {
      return 'Un "non applicable" doit être motivé (notApplicableReason requis)';
    }
  } else if (!final.answer || !final.answer.trim()) {
    return 'Réponse requise (ou cochez "non applicable" avec un motif)';
  }
  return null;
}

export const ANSWER_SELECT = {
  id: true, organizationId: true, question: true, answer: true, isNotApplicable: true,
  notApplicableReason: true, category: true, answeredAt: true, status: true,
  validatedByName: true, validatedAt: true, createdAt: true, updatedAt: true,
};
