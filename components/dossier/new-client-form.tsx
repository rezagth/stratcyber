'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SECTORS, SIZES } from '@/lib/api/organization-profile';

/**
 * Création d'un client (organisation) depuis la liste des clients. Seul le nom est obligatoire :
 * le reste (périmètre, NIS2, RGPD...) se complète ensuite dans le dossier du client.
 */
export function NewClientForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', sector: '', size: '', headcount: '' });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const name = form.name.trim();
    if (name.length < 2) { setError('Le nom du client doit faire au moins 2 caractères.'); return; }
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { name };
      if (form.sector) body.sector = form.sector;
      if (form.size) body.size = form.size;
      if (form.headcount.trim()) body.headcount = Number(form.headcount);
      const res = await fetch('/api/organizations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === 'string' ? data.error : 'Création impossible.');
        return;
      }
      const created = await res.json();
      router.push(`/dashboard/organizations/${created.id}`);
    } catch {
      setError('Connexion impossible : rien n\'a été créé, réessaie.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return <Button onClick={() => setOpen(true)}>Nouveau client</Button>;
  }

  const selectClass = 'h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm';
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2"><CardTitle className="text-base">Nouveau client</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div>
            <Label htmlFor="client-name">Nom du client *</Label>
            <Input id="client-name" value={form.name} onChange={set('name')} maxLength={120} required autoFocus />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="client-sector">Secteur</Label>
              <select id="client-sector" className={selectClass} value={form.sector} onChange={set('sector')}>
                <option value="">Non précisé</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="client-size">Taille</Label>
              <select id="client-size" className={selectClass} value={form.size} onChange={set('size')}>
                <option value="">Non précisée</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label htmlFor="client-headcount">Effectif</Label>
              <Input id="client-headcount" type="number" min={0} value={form.headcount} onChange={set('headcount')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? 'Création...' : 'Créer le client'}</Button>
            <Button type="button" variant="outline" disabled={busy} onClick={() => { setOpen(false); setError(null); }}>Annuler</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
