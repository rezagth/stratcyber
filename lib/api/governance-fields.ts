import { pickDefined } from '@/lib/api/whitelist';
import { toNullableDate, toNullableEnum, toNullableString } from '@/lib/api/validators';

export const MEETING_TYPES = ['Comité', 'Revue annuelle'] as const;
export const ADMIN_SETTABLE_STATUSES = ['Brouillon', 'À valider'] as const;

type MeetingFields = {
  type: string;
  title: string;
  meetingDate: string;
  attendees: string | null;
  summary: string | null;
  status: string;
};
const WHITELIST: (keyof MeetingFields)[] = ['type', 'title', 'meetingDate', 'attendees', 'summary', 'status'];

/**
 * Valide les champs d'une réunion de gouvernance (comité ou revue annuelle),
 * partagé entre création et mise à jour.
 */
export function parseGovernanceMeetingFields(
  body: unknown,
  { isCreate }: { isCreate: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<MeetingFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.type !== undefined) {
    const v = toNullableEnum(picked.type, MEETING_TYPES);
    if (v === undefined || v === null) return { error: `Type invalide (valeurs possibles : ${MEETING_TYPES.join(', ')})` };
    data.type = v;
  } else if (isCreate) {
    data.type = MEETING_TYPES[0];
  }
  if (picked.title !== undefined || isCreate) {
    const title = typeof picked.title === 'string' ? picked.title.trim() : '';
    if (!title || title.length > 300) return { error: 'Titre invalide' };
    data.title = title;
  }
  if (picked.meetingDate !== undefined || isCreate) {
    if (picked.meetingDate == null) return { error: 'Date de la réunion requise' };
    const v = toNullableDate(picked.meetingDate);
    if (!v) return { error: 'Date de la réunion invalide' };
    data.meetingDate = v;
  }
  if (picked.attendees !== undefined) {
    const v = toNullableString(picked.attendees, 2000);
    if (v === undefined) return { error: 'Participants invalides' };
    data.attendees = v;
  }
  if (picked.summary !== undefined) {
    const v = toNullableString(picked.summary, 8000);
    if (v === undefined) return { error: 'Compte rendu invalide' };
    data.summary = v;
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

  return { data };
}

export const MEETING_SELECT = {
  id: true, organizationId: true, type: true, title: true, meetingDate: true, attendees: true,
  summary: true, status: true, validatedByName: true, validatedAt: true, createdAt: true, updatedAt: true,
};
