'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ClientAccount = { id: string; email: string; name: string | null; createdAt: string };

export function ClientAccountsTab({ organizationId }: { organizationId: string }) {
  const [accounts, setAccounts] = useState<ClientAccount[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/users`).then((r) => r.json()).then(setAccounts);
  };
  useEffect(load, [organizationId]);

  async function createAccount() {
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name || undefined, email: form.email, password: form.password, organizationId }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setForm({ name: '', email: '', password: '' });
    setFeedback('Compte créé.');
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <ul className="space-y-2">
        {accounts?.map((a) => (
          <li key={a.id}>
            <Card>
              <CardContent className="py-4 text-sm">
                <p className="font-medium">{a.name ?? a.email}</p>
                <p className="text-muted-foreground">{a.email} · créé le {new Date(a.createdAt).toLocaleDateString('fr-FR')}</p>
              </CardContent>
            </Card>
          </li>
        ))}
        {accounts?.length === 0 && <p className="text-sm text-muted-foreground">Aucun compte client pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Créer un compte client</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="acc-name">Nom</Label><Input id="acc-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div><Label htmlFor="acc-email">Email</Label><Input id="acc-email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div className="sm:col-span-2">
            <Label htmlFor="acc-password">Mot de passe (12 caractères minimum)</Label>
            <Input id="acc-password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={createAccount} disabled={!form.email.trim() || form.password.length < 12}>Créer le compte</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
