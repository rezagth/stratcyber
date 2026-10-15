/**
 * Validateurs génériques pour les champs optionnels d'un `PATCH` (module D, module A, et
 * les suivants) : convertissent une valeur brute de requête en valeur Prisma, ou
 * `undefined` si invalide (le routeur doit alors répondre 400 plutôt que d'écrire une
 * valeur douteuse). `null` explicite efface toujours le champ.
 */

export function toNullableDate(value: unknown): Date | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string' || !value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function toNullableNumber(value: unknown, { min = 0 }: { min?: number } = {}): number | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) return undefined;
  return value;
}

export function toNullableString(value: unknown, maxLength: number): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

/** `null` ou une des valeurs autorisées ; toute autre valeur (y compris absente du body) est invalide. */
export function toNullableEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null | undefined {
  if (value === null) return null;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  return undefined;
}
