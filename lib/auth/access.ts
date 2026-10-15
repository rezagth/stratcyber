import type { AuthedUser } from '@/lib/auth/api-auth';

/**
 * Filtre Prisma des audits qu'un compte CLIENT a le droit de lire :
 * ceux de SON organisation ET explicitement partagés par l'administrateur.
 *
 * Retourne `null` si le compte n'a pas d'organisation : l'appelant doit alors refuser l'accès.
 * (Un `organizationId: undefined` dans un `where` Prisma serait ignoré et ouvrirait TOUS les audits.)
 */
export function clientAuditWhere(user: AuthedUser) {
  if (user.role !== 'client' || !user.organizationId) return null;
  return { organizationId: user.organizationId, sharedWithClient: true };
}
