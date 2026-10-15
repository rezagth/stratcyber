import { pickDefined } from '@/lib/api/whitelist';
import { toNullableEnum, toNullableString } from '@/lib/api/validators';

export const FRAMEWORKS = ['RGPD', 'NIS2', 'DORA', 'CRA', 'LPM', 'HDS', 'PCI_DSS', 'ISO27001', 'EBIOS'] as const;
export const CONTROL_STATUSES = ['Non évalué', 'Conforme', 'Partiellement conforme', 'Non conforme', 'Non applicable'] as const;

type ControlFields = {
  title: string;
  description: string | null;
  status: string;
  owner: string | null;
  frameworks: unknown; // validé séparément : tableau, pas un scalaire
};
const WHITELIST: (keyof ControlFields)[] = ['title', 'description', 'status', 'owner', 'frameworks'];

/**
 * Valide les champs d'un contrôle (module B) : un contrôle peut compter pour plusieurs
 * référentiels à la fois (`frameworks`, stocké en JSON), jamais un seul. Partagé entre la
 * création et la mise à jour.
 */
export function parseControlFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<ControlFields>(body, WHITELIST);
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
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, CONTROL_STATUSES);
    if (v === undefined || v === null) return { error: `Statut invalide (valeurs possibles : ${CONTROL_STATUSES.join(', ')})` };
    data.status = v;
  } else if (isCreate) {
    // Valeur explicite plutôt que de compter sur le défaut du schéma Prisma.
    data.status = CONTROL_STATUSES[0];
  }
  if (picked.owner !== undefined) {
    const v = toNullableString(picked.owner, 120);
    if (v === undefined) return { error: 'Responsable invalide' };
    data.owner = v;
  }
  if (picked.frameworks !== undefined) {
    const list = picked.frameworks;
    const valid = Array.isArray(list) && list.length > 0 && list.every((f) => (FRAMEWORKS as readonly string[]).includes(f));
    if (!valid) return { error: `Référentiels invalides (au moins un, parmi : ${FRAMEWORKS.join(', ')})` };
    data.frameworks = JSON.stringify(list);
  } else if (isCreate) {
    return { error: 'Au moins un référentiel requis' };
  }

  return { data };
}

export const CONTROL_SELECT = {
  id: true, organizationId: true, title: true, description: true, status: true, owner: true,
  frameworks: true, createdAt: true, updatedAt: true,
};

/** Les lignes Prisma stockent `frameworks` en JSON : toujours re-parser avant de répondre au client HTTP. */
export function withParsedFrameworks<T extends { frameworks: string }>(control: T): Omit<T, 'frameworks'> & { frameworks: string[] } {
  let frameworks: string[];
  try {
    frameworks = JSON.parse(control.frameworks);
  } catch {
    frameworks = [];
  }
  return { ...control, frameworks };
}
