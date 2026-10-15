import { pickDefined } from '@/lib/api/whitelist';
import { toNullableString } from '@/lib/api/validators';

type ContactFields = { name: string; role: string | null; email: string | null; phone: string | null; isPrimary: boolean };
const WHITELIST: (keyof ContactFields)[] = ['name', 'role', 'email', 'phone', 'isPrimary'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valide les champs d'un contact (module A), partagé entre la création et la mise à jour. */
export function parseContactFields(
  body: unknown,
  { requireName }: { requireName: boolean }
): { data: Record<string, unknown> } | { error: string } {
  const picked = pickDefined<ContactFields>(body, WHITELIST);
  const data: Record<string, unknown> = {};

  if (picked.name !== undefined || requireName) {
    const name = typeof picked.name === 'string' ? picked.name.trim() : '';
    if (!name || name.length > 120) return { error: 'Nom du contact invalide' };
    data.name = name;
  }
  if (picked.role !== undefined) {
    const v = toNullableString(picked.role, 120);
    if (v === undefined) return { error: 'Fonction invalide' };
    data.role = v;
  }
  if (picked.email !== undefined) {
    if (picked.email === null) {
      data.email = null;
    } else if (typeof picked.email === 'string' && EMAIL_RE.test(picked.email.trim())) {
      data.email = picked.email.trim().toLowerCase();
    } else {
      return { error: 'Email invalide' };
    }
  }
  if (picked.phone !== undefined) {
    const v = toNullableString(picked.phone, 40);
    if (v === undefined) return { error: 'Téléphone invalide' };
    data.phone = v;
  }
  if (picked.isPrimary !== undefined) {
    if (typeof picked.isPrimary !== 'boolean') return { error: 'isPrimary doit être un booléen' };
    data.isPrimary = picked.isPrimary;
  }

  return { data };
}

export const CONTACT_SELECT = {
  id: true, organizationId: true, name: true, role: true, email: true, phone: true, isPrimary: true,
  createdAt: true, updatedAt: true,
};
