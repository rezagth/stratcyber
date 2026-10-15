'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type EvidenceItem = {
  id: string; origin: 'control' | 'supplier'; source: string; label: string;
  evidenceDate: string; expiresAt: string | null; link: string | null;
};

function expiryState(expiresAt: string | null): 'expired' | 'soon' | null {
  if (!expiresAt) return null;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return null;
}

export default function ClientEvidencePage() {
  const [items, setItems] = useState<EvidenceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/evidence')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setItems(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mes preuves</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && items === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {items?.length === 0 && <p className="text-sm text-muted-foreground">Aucune preuve enregistrée pour le moment.</p>}

      <ul className="space-y-2">
        {items?.map((item) => {
          const state = expiryState(item.expiresAt);
          return (
            <li key={item.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                  <div>
                    <p className="font-medium">
                      {item.label}
                      {state === 'expired' && <Badge variant="destructive" className="ml-2">Expirée</Badge>}
                      {state === 'soon' && <Badge className="ml-2">Expire bientôt</Badge>}
                    </p>
                    <p className="text-muted-foreground">
                      {item.origin === 'control' ? 'Contrôle' : 'Fournisseur'} : {item.source}
                      {' · '}{new Date(item.evidenceDate).toLocaleDateString('fr-FR')}
                      {item.expiresAt && ` · expire le ${new Date(item.expiresAt).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-sm underline">Voir</a>}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
