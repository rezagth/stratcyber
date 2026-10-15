'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Evidence = {
  id: string; label: string; source: string | null; owner: string | null;
  evidenceDate: string; expiresAt: string | null; link: string | null;
};
type Control = {
  id: string; title: string; description: string | null; status: string; owner: string | null;
  frameworks: string[]; evidences: Evidence[];
};

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Conforme': 'default',
  'Partiellement conforme': 'secondary',
  'Non conforme': 'destructive',
  'Non applicable': 'outline',
  'Non évalué': 'outline',
};

function expiryState(expiresAt: string | null): 'expired' | 'soon' | null {
  if (!expiresAt) return null;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return null;
}

export default function ClientControlsPage() {
  const [controls, setControls] = useState<Control[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/controls')
      .then(async (r) => {
        if (!r.ok) throw new Error('Chargement impossible.');
        setControls(await r.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mes contrôles et preuves</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && controls === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {controls?.length === 0 && <p className="text-sm text-muted-foreground">Aucun contrôle enregistré pour le moment.</p>}

      <ul className="space-y-3">
        {controls?.map((control) => (
          <li key={control.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{control.title}</CardTitle>
                  <Badge variant={STATUS_VARIANT[control.status] ?? 'outline'}>{control.status}</Badge>
                  {control.frameworks.map((fw) => <Badge key={fw} variant="outline">{fw}</Badge>)}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {control.evidences.map((ev) => {
                    const state = expiryState(ev.expiresAt);
                    return (
                      <li key={ev.id} className="flex items-center justify-between border-t py-2 first:border-t-0">
                        <span>
                          {ev.label}
                          {state === 'expired' && <Badge variant="destructive" className="ml-2">Expirée</Badge>}
                          {state === 'soon' && <Badge className="ml-2">Expire bientôt</Badge>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ev.evidenceDate).toLocaleDateString('fr-FR')}
                          {ev.link && <> · <a href={ev.link} target="_blank" rel="noreferrer" className="underline">lien</a></>}
                        </span>
                      </li>
                    );
                  })}
                  {control.evidences.length === 0 && <p className="text-xs text-muted-foreground">Aucune preuve enregistrée.</p>}
                </ul>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
