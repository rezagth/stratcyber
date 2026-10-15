import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableString } from '@/lib/api/validators';

type TrainingFields = {
  participantName: string;
  role: string | null;
  trainingTitle: string;
  completedAt: string;
  evidenceLink: string | null;
};
const WHITELIST: (keyof TrainingFields)[] = ['participantName', 'role', 'trainingTitle', 'completedAt', 'evidenceLink'];

/** Valide les champs d'une formation dirigeant (module G), partagé entre création et mise à jour. */
export function parseLeadershipTrainingFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<TrainingFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.participantName !== undefined || isCreate) {
    const name = typeof picked.participantName === 'string' ? picked.participantName.trim() : '';
    if (!name || name.length > 200) return { error: 'Nom du participant invalide' };
    data.participantName = name;
  }
  if (picked.role !== undefined) {
    const v = toNullableString(picked.role, 120);
    if (v === undefined) return { error: 'Fonction invalide' };
    data.role = v;
  }
  if (picked.trainingTitle !== undefined || isCreate) {
    const title = typeof picked.trainingTitle === 'string' ? picked.trainingTitle.trim() : '';
    if (!title || title.length > 300) return { error: 'Titre de la formation invalide' };
    data.trainingTitle = title;
  }
  if (picked.completedAt !== undefined || isCreate) {
    if (picked.completedAt == null) return { error: 'Date de réalisation requise' };
    const v = toNullableDate(picked.completedAt);
    if (!v) return { error: 'Date de réalisation invalide' };
    data.completedAt = v;
  }
  if (picked.evidenceLink !== undefined) {
    const v = toNullableString(picked.evidenceLink, 500);
    if (v === undefined) return { error: 'Lien de preuve invalide' };
    data.evidenceLink = v;
  }

  return { data };
}

export const TRAINING_SELECT = {
  id: true, organizationId: true, participantName: true, role: true, trainingTitle: true,
  completedAt: true, evidenceLink: true, createdAt: true, updatedAt: true,
};
