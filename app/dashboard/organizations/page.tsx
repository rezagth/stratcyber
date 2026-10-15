'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Organization = { id: string; name: string; sector: string | null; size: string | null };

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/organizations')
      .then(async (res) => {
        if (!res.ok) throw new Error('Chargement impossible.');
        setOrganizations(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Clients</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && organizations === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {organizations?.length === 0 && <p className="text-sm text-muted-foreground">Aucun client pour le moment.</p>}

      <ul className="space-y-3">
        {organizations?.map((org) => (
          <li key={org.id}>
            <Link
              href={`/dashboard/organizations/${org.id}/action-plan`}
              className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="transition hover:shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">{org.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {org.sector ?? '—'} · {org.size ?? '—'}
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
