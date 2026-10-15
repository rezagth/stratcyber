'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SupplierEvidence = { id: string; label: string; evidenceDate: string; expiresAt: string | null; link: string | null };
type Supplier = {
  id: string; name: string; description: string | null; dataLocation: string | null;
  criticality: string; hasSecurityClause: boolean; securityClauseReference: string | null;
  lastReviewDate: string | null; status: string; evidences: SupplierEvidence[];
};

function expiryState(expiresAt: string | null): 'expired' | 'soon' | null {
  if (!expiresAt) return null;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return null;
}

export default function ClientSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/suppliers')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setSuppliers(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mes fournisseurs</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && suppliers === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {suppliers?.length === 0 && <p className="text-sm text-muted-foreground">Aucun fournisseur enregistré pour le moment.</p>}

      <ul className="space-y-3">
        {suppliers?.map((supplier) => (
          <li key={supplier.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{supplier.name}</CardTitle>
                  <Badge variant="outline">{supplier.criticality}</Badge>
                  <Badge variant={supplier.status === 'Actif' ? 'default' : 'secondary'}>{supplier.status}</Badge>
                  {supplier.hasSecurityClause ? (
                    <Badge variant="outline">Clause de sécurité</Badge>
                  ) : (
                    <Badge variant="destructive">Pas de clause de sécurité</Badge>
                  )}
                </div>
                {supplier.description && <p className="text-sm text-muted-foreground">{supplier.description}</p>}
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <p><span className="text-muted-foreground">Localisation des données : </span>{supplier.dataLocation ?? '—'}</p>
                  <p><span className="text-muted-foreground">Dernière revue : </span>{supplier.lastReviewDate ? new Date(supplier.lastReviewDate).toLocaleDateString('fr-FR') : '—'}</p>
                </div>
                {supplier.securityClauseReference && (
                  <p><span className="text-muted-foreground">Référence de la clause : </span>{supplier.securityClauseReference}</p>
                )}
                <div>
                  <p className="mb-1 font-medium">Preuves annuelles ({supplier.evidences.length})</p>
                  <ul className="space-y-1">
                    {supplier.evidences.map((ev) => {
                      const state = expiryState(ev.expiresAt);
                      return (
                        <li key={ev.id} className="text-xs text-muted-foreground">
                          {ev.label} — {new Date(ev.evidenceDate).toLocaleDateString('fr-FR')}
                          {ev.expiresAt && ` · expire le ${new Date(ev.expiresAt).toLocaleDateString('fr-FR')}`}
                          {state === 'expired' && <Badge variant="destructive" className="ml-2">Expirée</Badge>}
                          {state === 'soon' && <Badge className="ml-2">Expire bientôt</Badge>}
                          {ev.link && <> · <a href={ev.link} target="_blank" rel="noreferrer" className="underline">lien</a></>}
                        </li>
                      );
                    })}
                    {supplier.evidences.length === 0 && <li className="text-xs text-muted-foreground">Aucune preuve enregistrée.</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
