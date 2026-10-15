'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ClientAudit = { id: string; createdAt: string; score: number | null; maturity: string | null };

export default function ClientHomePage() {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<ClientAudit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/audits')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setAudits(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Espace client InfraCyb</h1>
          <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <Button variant="outline" onClick={() => signOut({ callbackUrl: '/auth/login' })}>
          Se déconnecter
        </Button>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/client/action-plan"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mon plan d&apos;action →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Suivez vos actions recommandées et mettez à jour votre avancement.
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/client/profile"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mon profil →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Votre profil, votre périmètre de mission et vos contacts.
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/client/controls"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mes contrôles et preuves →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Votre niveau de conformité et vos preuves de réalisation.
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/client/risks"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mes risques et incidents →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Votre registre des risques, vos incidents et vos vulnérabilités.
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/client/policies"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mes politiques et livrables →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Vos documents de politique à relire et à valider.
            </CardContent>
          </Card>
        </Link>
        <Link
          href="/client/security-answers"
          className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Card className="h-full transition hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Mes questionnaires de sécurité →</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Votre bibliothèque de réponses, réutilisable et exportable en CSV.
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="mb-3 text-lg font-medium">Vos diagnostics</h2>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && audits === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {audits?.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun diagnostic partagé pour le moment.</p>
      )}
      <ul className="space-y-3">
        {audits?.map((audit) => (
          <li key={audit.id}>
            <Link href={`/client/audits/${audit.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
              <Card className="transition hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">
                    Diagnostic du {new Date(audit.createdAt).toLocaleDateString('fr-FR')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  Score : <strong>{audit.score ?? '—'}</strong> / 100 — Maturité : <strong>{audit.maturity ?? '—'}</strong>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
