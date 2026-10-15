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

/**
 * Filtre Prisma générique par organisation, réutilisable pour tout modèle qui porte un
 * champ `organizationId` (plan d'action, contrôles, risques...) : le "moteur commun" de
 * cloisonnement par client.
 *
 * - Compte client : toujours restreint à SA organisation ; une tentative de préciser
 *   `requestedOrgId` pour une AUTRE organisation renvoie `null` (accès refusé), jamais
 *   un filtre élargi.
 * - Compte admin : filtré sur `requestedOrgId` s'il est fourni, sinon aucun filtre
 *   (visibilité sur toutes les organisations).
 * - Tout autre rôle (ex. 'user', compte interne sans organisation) : `null`, accès refusé.
 *
 * Renvoie toujours soit `{ organizationId: string }`, soit `{}` (admin, aucune org
 * précisée), jamais un objet avec `organizationId: undefined` qu'un `where` Prisma
 * ignorerait silencieusement.
 */
export function organizationScopeWhere(
  user: AuthedUser,
  requestedOrgId?: string | null
): { organizationId: string } | Record<string, never> | null {
  if (user.role === 'client') {
    if (!user.organizationId) return null;
    if (requestedOrgId && requestedOrgId !== user.organizationId) return null;
    return { organizationId: user.organizationId };
  }
  if (user.role === 'admin') {
    return requestedOrgId ? { organizationId: requestedOrgId } : {};
  }
  return null;
}
