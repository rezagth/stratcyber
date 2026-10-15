import { pickDefined } from '@/lib/api/whitelist';
import { toNullableEnum, toNullableString } from '@/lib/api/validators';

export const POLICY_TYPES = ['Confidentialité', 'PSSI', 'Sauvegarde', 'Accès', 'Incident', 'PCA'] as const;
// Statuts qu'un admin peut choisir directement : jamais 'Validé', qui ne s'obtient
// qu'via la validation tracée du client (voir app/api/client/policies/[id]/route.ts).
export const ADMIN_SETTABLE_STATUSES = ['Brouillon', 'À valider'] as const;

type TemplateFields = { type: string; name: string; content: string };
const TEMPLATE_WHITELIST: (keyof TemplateFields)[] = ['type', 'name', 'content'];

export function parsePolicyTemplateFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<TemplateFields>(body, TEMPLATE_WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.type !== undefined || isCreate) {
    const v = toNullableEnum(picked.type, POLICY_TYPES);
    if (v === undefined || v === null) return { error: `Type invalide (valeurs possibles : ${POLICY_TYPES.join(', ')})` };
    data.type = v;
  }
  if (picked.name !== undefined || isCreate) {
    const name = typeof picked.name === 'string' ? picked.name.trim() : '';
    if (!name || name.length > 200) return { error: 'Nom du modèle invalide' };
    data.name = name;
  }
  if (picked.content !== undefined || isCreate) {
    const v = toNullableString(picked.content, 20000);
    if (!v) return { error: 'Contenu du modèle requis' };
    data.content = v;
  }

  return { data };
}

type DocumentUpdateFields = { title: string; content: string; status: string };
const DOCUMENT_WHITELIST: (keyof DocumentUpdateFields)[] = ['title', 'content', 'status'];

/** Met à jour un document existant (admin) : jamais le statut 'Validé', qui n'est accordé qu'au client. */
export function parsePolicyDocumentUpdate(body: unknown): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<DocumentUpdateFields>(body, DOCUMENT_WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.title !== undefined) {
    const title = typeof picked.title === 'string' ? picked.title.trim() : '';
    if (!title || title.length > 200) return { error: 'Titre invalide' };
    data.title = title;
  }
  if (picked.content !== undefined) {
    const v = toNullableString(picked.content, 20000);
    if (!v) return { error: 'Contenu invalide' };
    data.content = v;
  }
  if (picked.status !== undefined) {
    const v = toNullableEnum(picked.status, ADMIN_SETTABLE_STATUSES);
    if (v === undefined || v === null) {
      return { error: `Statut invalide côté admin (valeurs possibles : ${ADMIN_SETTABLE_STATUSES.join(', ')}) — la validation finale est réservée au client` };
    }
    data.status = v;
  }

  return { data };
}

export const TEMPLATE_SELECT = { id: true, type: true, name: true, content: true, createdAt: true, updatedAt: true };
export const DOCUMENT_SELECT = {
  id: true, organizationId: true, templateId: true, type: true, title: true, content: true,
  version: true, status: true, validatedByName: true, validatedAt: true, createdAt: true, updatedAt: true,
};
