import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes /api accessibles sans session : NextAuth (login, session, csrf…) et l'inscription.
// /api/cron/ n'a pas de session : la route vérifie elle-même CRON_SECRET et reste fermée sans lui.
// /api/integrations/ : la route vérifie elle-même la signature HMAC du CRM et reste fermée sans secret.
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/cron/', '/api/integrations/'];

/**
 * Premier filet : exige une session valide sur les pages protégées et sur toute /api non publique.
 * Il ne vérifie PAS la propriété des ressources : cela reste le rôle de chaque route
 * (voir lib/auth/api-auth.ts et le filtre `userId` de chaque requête Prisma).
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    // Compte client : confiné à l'espace client (pages /client et API /api/client uniquement).
    if (token.role === 'client') {
      const allowed =
        pathname === '/client' ||
        pathname.startsWith('/client/') ||
        pathname.startsWith('/api/client/') ||
        // Sécurité de son propre compte (double authentification) : ouverte à tous les rôles.
        pathname === '/account' ||
        pathname.startsWith('/account/') ||
        pathname.startsWith('/api/account/');
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/client', request.url));
      }
      return NextResponse.next();
    }
    // Tant que les incidents, vulnérabilités et alertes ne sont pas rattachés à une organisation,
    // les données du tableau de bord ne doivent être lues que par l'administrateur.
    if (pathname.startsWith('/api/dashboard/') && token.role !== 'admin') {
      return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // API : réponse JSON 401 (une redirection HTML vers /auth/login n'aurait aucun sens pour un client fetch)
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  // Pages : redirection vers la connexion, comme l'ancien withAuth
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/strategie/:path*',
    '/audit/:path*',
    '/client/:path*',
    '/account/:path*',
    '/api/:path*',
  ],
};
