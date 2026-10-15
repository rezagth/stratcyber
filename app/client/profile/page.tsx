'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Organization = {
  id: string; name: string; sector: string | null; size: string | null;
  headcount: number | null; annualRevenue: number | null; missionScope: string | null;
  nis2Applicability: string | null; nis2Note: string | null;
  rgpdApplicability: string | null; rgpdNote: string | null;
  iso27001Status: string | null; iso27001Note: string | null;
  applicabilityAssessedAt: string | null;
};
type Contact = { id: string; name: string; role: string | null; email: string | null; phone: string | null; isPrimary: boolean };

export default function ClientProfilePage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/organization')
      .then(async (r) => {
        if (!r.ok) throw new Error('Chargement impossible.');
        setOrg(await r.json());
      })
      .catch((e: Error) => setError(e.message));
    fetch('/api/client/contacts').then((r) => r.json()).then(setContacts);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mon profil</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && !org && <p className="text-sm text-muted-foreground">Chargement…</p>}

      {org && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Entreprise</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">Secteur : </span>{org.sector ?? '—'}</div>
              <div><span className="text-muted-foreground">Taille : </span>{org.size ?? '—'}</div>
              <div><span className="text-muted-foreground">Effectif : </span>{org.headcount ?? '—'}</div>
              <div><span className="text-muted-foreground">CA annuel : </span>{org.annualRevenue != null ? `${org.annualRevenue.toLocaleString('fr-FR')} €` : '—'}</div>
              {org.missionScope && (
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Périmètre de mission : </span>{org.missionScope}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test d&apos;applicabilité réglementaire</CardTitle>
              <p className="text-xs text-muted-foreground">
                Indicatif, à confirmer avec un juriste. La transposition française de NIS2 n&apos;est pas finalisée à ce jour.
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">NIS2</Badge>
                <div>
                  <p>{org.nis2Applicability ?? 'Non évalué'}</p>
                  {org.nis2Note && <p className="text-muted-foreground">{org.nis2Note}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">RGPD</Badge>
                <div>
                  <p>{org.rgpdApplicability ?? 'Non évalué'}</p>
                  {org.rgpdNote && <p className="text-muted-foreground">{org.rgpdNote}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">ISO 27001</Badge>
                <div>
                  <p>{org.iso27001Status ?? 'Non évalué'}</p>
                  {org.iso27001Note && <p className="text-muted-foreground">{org.iso27001Note}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contacts</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {contacts.length === 0 && <p className="text-muted-foreground">Aucun contact enregistré.</p>}
              {contacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between">
                  <span>{c.name} {c.isPrimary && <Badge className="ml-1">Principal</Badge>}</span>
                  <span className="text-muted-foreground">{c.role ?? '—'} · {c.email ?? '—'}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
