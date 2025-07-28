'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './button';

export function Nav() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                StratCyber
              </Link>
            </div>
            {status === 'authenticated' && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Tableau de bord
                </Link>
                {/* <Link
                  href="/strategie"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Stratégie
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Audit
                </Link> */}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {session.user?.email}
                </span>
                <Button
                  onClick={() => signOut()}
                  variant="outline"
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link href="/auth/login">
                  <Button variant="outline">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>S&apos;inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}