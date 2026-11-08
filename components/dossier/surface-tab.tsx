'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Finding = { id: string; severity: string; title: string; detail: string };
type Result = { domain: string; findings: Finding[]; created: number };

const VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  Critique: 'destructive', Haute: 'destructive', Moyenne: 'secondary', Info: 'outline', OK: 'default',
};

/** Contrôle de la protection e-mail d'un domaine (SPF, DMARC, MX) : DNS public uniquement. */
export function SurfaceTab({ organizationId }: { organizationId: string }) {
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function run(addToPlan: boolean) {
    if (busy || !domain.trim()) return;
    setBusy(true); setError(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/surface-check`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain, addToPlan }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) { setError(typeof body?.error === 'string' ? body.error : 'Contrôle impossible.'); return; }
      setResult(body);
    } catch { setError('Connexion impossible, réessaie.'); }
    finally { setBusy(false); }
  }

  const toFix = result?.findings.filter((f) => ['Critique', 'Haute', 'Moyenne'].includes(f.severity)).length ?? 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Protection e-mail du domaine</CardTitle>
        <p className="text-xs text-muted-foreground">Vérifie SPF, DMARC et MX dans le DNS public du domaine du client. Aucune connexion n&apos;est faite vers ses serveurs.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="surface-domain">Domaine du client</Label>
          <Input id="surface-domain" placeholder="exemple.fr" value={domain} onChange={(e) => setDomain(e.target.value)} maxLength={253} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => run(false)} disabled={busy || !domain.trim()}>{busy ? 'Contrôle...' : 'Contrôler'}</Button>
          {result && toFix > 0 && <Button variant="outline" onClick={() => run(true)} disabled={busy}>Ajouter les {toFix} point(s) au plan d&apos;action</Button>}
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {result && (
          <div className="space-y-2" role="status">
            <p className="text-sm font-medium">Résultat pour {result.domain}</p>
            {result.created > 0 && <p className="text-sm">{result.created} action(s) ajoutée(s) au plan d&apos;action du client.</p>}
            <ul className="space-y-2">
              {result.findings.map((f) => (
                <li key={f.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2"><Badge variant={VARIANT[f.severity] ?? 'outline'}>{f.severity}</Badge><span className="font-medium">{f.title}</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
