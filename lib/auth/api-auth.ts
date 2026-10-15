import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export type Role = 'admin' | 'user' | 'client';

export type AuthedUser = {
  id: string;
  role: string;
  email: string;
  name?: string | null;
  /** Renseigné pour les comptes 'client' : organisation à laquelle ils sont rattachés. */
  organizationId?: string | null;
};

type AuthedContext<P> = { params: Promise<P>; user: AuthedUser };

type AuthedHandler<P> = (
  request: NextRequest,
  context: AuthedContext<P>
) => Promise<Response>;

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Utilisateur courant, lu UNIQUEMENT depuis la session NextAuth (cookie JWT signé).
 * Ne jamais lui substituer une valeur venant de l'URL, du body ou d'un header.
 */
export async function getSessionUser(): Promise<AuthedUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) return null;
  return {
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    organizationId: user.organizationId ?? null,
  };
}

/**
 * Enveloppe un handler de route API :
 *  - 401 si pas de session valide ;
 *  - 403 si `options.roles` est fourni et que le rôle n'en fait pas partie ;
 *  - 500 générique (sans détail interne) si le handler lève une exception.
 *
 * Le handler reçoit `user` (issu de la session) en plus de `params`.
 * Il reste responsable de filtrer chaque requête Prisma sur `user.id`.
 */
export function withApiAuth<P = Record<string, never>>(
  handler: AuthedHandler<P>,
  options: { roles?: Role[] } = {}
) {
  return async (
    request: NextRequest,
    context: { params: Promise<P> }
  ): Promise<Response> => {
    try {
      const user = await getSessionUser();
      if (!user) return jsonError('Non autorisé', 401);

      if (options.roles && !options.roles.includes(user.role as Role)) {
        return jsonError('Accès interdit', 403);
      }

      return await handler(request, { params: context?.params, user });
    } catch (error) {
      console.error('[api] erreur non gérée :', error);
      return jsonError('Erreur interne du serveur', 500);
    }
  };
}
