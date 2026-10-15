import type { Prisma } from '@prisma/client';
import type { AuthedUser } from '@/lib/auth/api-auth';

/**
 * Préfixe d'auteur des ebooks personnalisés créés AVANT l'ajout de `Ebook.ownerId`.
 * Tant qu'ils n'ont pas de propriétaire (voir le backfill), ils ne sont visibles de personne.
 */
export const LEGACY_PERSONAL_AUTHOR_PREFIX = 'Système - ';

/**
 * Filtre Prisma : ebooks que `user` a le droit de voir.
 *  - ses propres ebooks personnalisés (ownerId = user.id) ;
 *  - le catalogue commun (ownerId null, hors ebooks personnalisés historiques) ;
 *  - un utilisateur simple ne voit que les ebooks publiés ; un admin voit aussi les brouillons du catalogue.
 */
export function ebookVisibleTo(
  user: Pick<AuthedUser, 'id' | 'role'>
): Prisma.EbookWhereInput {
  const reach: Prisma.EbookWhereInput = {
    OR: [
      { ownerId: user.id },
      {
        ownerId: null,
        NOT: { author: { startsWith: LEGACY_PERSONAL_AUTHOR_PREFIX } },
      },
    ],
  };
  return user.role === 'admin' ? reach : { AND: [{ isPublished: true }, reach] };
}

export function parseEbookTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return raw.includes(',') ? raw.split(',').map((tag) => tag.trim()) : [];
  }
}

export function parseEbookContent(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw; // contenu en texte brut
  }
}
