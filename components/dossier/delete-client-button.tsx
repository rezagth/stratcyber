'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Suppression définitive d'un client (admin) : exige de retaper le nom exact. */
export function DeleteClientButton({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Suppression impossible.');
        return;
      }
      router.push('/dashboard/organizations');
      router.refresh();
    } catch {
      setError('Erreur réseau, réessayez.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" className="text-red-600" onClick={() => setOpen(true)}>
        Supprimer ce client
      </Button>
    );
  }

  return (
    <div role="alertdialog" aria-label="Confirmer la suppression du client" className="w-full rounded-md border border-red-300 p-3 text-sm space-y-2">
      <p>
        Suppression <strong>définitive</strong> du client, de ses audits, réponses, rapports et données du dossier. Action irréversible.
      </p>
      <Label htmlFor="delete-confirm">Tapez le nom exact du client : <strong>{organizationName}</strong></Label>
      <Input id="delete-confirm" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} autoComplete="off" />
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button variant="destructive" disabled={busy || confirmName !== organizationName} onClick={remove}>
          {busy ? 'Suppression…' : 'Supprimer définitivement'}
        </Button>
        <Button variant="outline" onClick={() => { setOpen(false); setConfirmName(''); setError(null); }}>Annuler</Button>
      </div>
    </div>
  );
}
