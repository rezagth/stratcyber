import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticate } from '@/lib/auth/authenticate';
import { clientIp } from '@/lib/auth/login-guard';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // Versions de types différentes entre @auth/prisma-adapter et next-auth v4 : même contrat à l'exécution.
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totp: { label: 'Code de vérification', type: 'text' },
      },
      // Mot de passe + second facteur + limitation des tentatives : voir lib/auth/authenticate.ts
      async authorize(credentials, req) {
        return authenticate(
          { email: credentials?.email, password: credentials?.password, totp: credentials?.totp },
          clientIp(req?.headers as Record<string, string | string[] | undefined> | undefined)
        );
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = (token.organizationId as string | null | undefined) ?? null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
