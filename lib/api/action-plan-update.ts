import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError } from '@/lib/auth/api-auth';
import type { AuthedUser } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { pickDefined } from '@/lib/api/whitelist';
import { logActivity } from '@/lib/activity-log';

const PRIORITIES = ['Critique', 'Haute', 'Moyenne', 'Faible'];
const STATUSES = ['Non commencé', 'En cours', 'Terminé', 'Bloqué'];

type AdminFields = {
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  responsible: string | null;
  dueDate: Date | null;
  estimatedCost: number | null;
};
type SharedFields = {
  status: string;
  proofOfCompletion: string | null;
  proofDate: Date | null;
};

const ADMIN_WHITELIST: (keyof AdminFields)[] = [
  'title', 'description', 'category', 'priority', 'responsible', 'dueDate', 'estimatedCost',
];
const CLIENT_WHITELIST: (keyof SharedFields)[] = ['status', 'proofOfCompletion', 'proofDate'];

function toNullableDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string' || !value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toNullableNumber(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return undefined;
  return value;
}

function toNullableString(value: unknown, maxLength: number): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

/**
 * Met à jour une action du plan (module D). Partagé par les deux routes qui l'exposent :
 * /api/action-plan/[id] (admin) et /api/client/action-plan/[id] (client) — le middleware
 * confine les comptes client à /client et /api/client/*, donc le client a besoin de sa
 * propre route, mais la logique (et la liste blanche par rôle) ne doit exister qu'une fois.
 *
 * - Administrateur : peut modifier la définition de l'action (titre, échéance, coût, responsable...).
 * - Client : peut uniquement mettre à jour son avancement (statut, preuve de réalisation),
 *   jamais la définition de l'action elle-même.
 * Toujours cloisonné par organisation via `organizationScopeWhere`.
 */
export async function updateActionPlanItem(user: AuthedUser, id: string, body: unknown) {
  const where = organizationScopeWhere(user);
  if (!where) return jsonError('Accès interdit', 403);

  const existing = await prisma.actionPlanItem.findFirst({ where: { id, ...where }, select: { id: true, organizationId: true } });
  if (!existing) return jsonError('Action non trouvée', 404);

  const data: Record<string, unknown> = {};

  if (user.role === 'admin') {
    const picked = pickDefined<AdminFields>(body, ADMIN_WHITELIST);
    if (picked.title !== undefined) {
      const title = typeof picked.title === 'string' ? picked.title.trim() : '';
      if (!title || title.length > 300) return jsonError('Titre invalide', 400);
      data.title = title;
    }
    if (picked.description !== undefined) {
      const v = toNullableString(picked.description, 2000);
      if (v === undefined) return jsonError('Description invalide', 400);
      data.description = v;
    }
    if (picked.category !== undefined) {
      const v = toNullableString(picked.category, 60);
      if (v === undefined) return jsonError('Catégorie invalide', 400);
      data.category = v;
    }
    if (picked.priority !== undefined) {
      if (typeof picked.priority !== 'string' || !PRIORITIES.includes(picked.priority)) {
        return jsonError(`Priorité invalide (valeurs possibles : ${PRIORITIES.join(', ')})`, 400);
      }
      data.priority = picked.priority;
    }
    if (picked.responsible !== undefined) {
      const v = toNullableString(picked.responsible, 120);
      if (v === undefined) return jsonError('Responsable invalide', 400);
      data.responsible = v;
    }
    if (picked.dueDate !== undefined) {
      const v = toNullableDate(picked.dueDate);
      if (v === undefined) return jsonError('Échéance invalide', 400);
      data.dueDate = v;
    }
    if (picked.estimatedCost !== undefined) {
      const v = toNullableNumber(picked.estimatedCost);
      if (v === undefined) return jsonError('Coût estimé invalide', 400);
      data.estimatedCost = v;
    }
  }

  // Le statut et la preuve de réalisation sont modifiables par l'admin ET le client.
  const sharedPicked = pickDefined<SharedFields>(body, CLIENT_WHITELIST);
  if (sharedPicked.status !== undefined) {
    if (typeof sharedPicked.status !== 'string' || !STATUSES.includes(sharedPicked.status)) {
      return jsonError(`Statut invalide (valeurs possibles : ${STATUSES.join(', ')})`, 400);
    }
    data.status = sharedPicked.status;
  }
  if (sharedPicked.proofOfCompletion !== undefined) {
    const v = toNullableString(sharedPicked.proofOfCompletion, 500);
    if (v === undefined) return jsonError('Preuve de réalisation invalide', 400);
    data.proofOfCompletion = v;
  }
  if (sharedPicked.proofDate !== undefined) {
    const v = toNullableDate(sharedPicked.proofDate);
    if (v === undefined) return jsonError('Date de preuve invalide', 400);
    data.proofDate = v;
  }

  if (Object.keys(data).length === 0) {
    return jsonError('Aucun champ valide à mettre à jour', 400);
  }

  const updated = await prisma.actionPlanItem.update({ where: { id }, data });
  await logActivity(user, {
    action: 'action-plan.update',
    targetType: 'action-plan-item',
    targetId: id,
    organizationId: existing.organizationId,
    metadata: { fields: Object.keys(data).join(',') },
  });
  return NextResponse.json(updated);
}
