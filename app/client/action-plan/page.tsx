'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type ActionItem = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  responsible: string | null;
  dueDate: string | null;
  estimatedCost: number | null;
  status: string;
  proofOfCompletion: string | null;
  proofDate: string | null;
};

const STATUSES = ['Non commencé', 'En cours', 'Terminé', 'Bloqué'];

const PRIORITY_VARIANT: Record<string, 'destructive' | 'default' | 'secondary' | 'outline'> = {
  Critique: 'destructive',
  Haute: 'destructive',
  Moyenne: 'default',
  Faible: 'secondary',
};

function isOverdue(item: ActionItem): boolean {
  if (!item.dueDate || item.status === 'Terminé') return false;
  return new Date(item.dueDate) < new Date();
}

export default function ClientActionPlanPage() {
  const [items, setItems] = useState<ActionItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [proofDrafts, setProofDrafts] = useState<Record<string, string>>({});

  const load = () => {
    fetch('/api/client/action-plan')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setItems(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  };

  useEffect(load, []);

  async function updateItem(id: string, data: Record<string, unknown>) {
    setSavingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/client/action-plan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('La mise à jour a échoué.');
      const updated = await res.json();
      setItems((prev) => prev?.map((i) => (i.id === id ? { ...i, ...updated } : i)) ?? null);
      setFeedback('Mise à jour enregistrée.');
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Erreur inattendue.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <Link href="/client" className="text-sm text-muted-foreground hover:underline">
          ← Retour à l&apos;espace client
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Mon plan d&apos;action</h1>
        <p className="text-sm text-muted-foreground">
          Les actions recommandées suite à votre audit. Mettez à jour l&apos;avancement et ajoutez une preuve de réalisation quand une action est terminée.
        </p>
      </header>

      <div aria-live="polite" className="sr-only">{feedback}</div>
      {feedback && <p className="mb-4 text-sm text-foreground">{feedback}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && items === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {items?.length === 0 && <p className="text-sm text-muted-foreground">Aucune action pour le moment.</p>}

      <ul className="space-y-4">
        {items?.map((item) => (
          <li key={item.id}>
            <Card className={isOverdue(item) ? 'border-red-400' : undefined}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  {item.category && <Badge variant="outline">{item.category}</Badge>}
                  <Badge variant={PRIORITY_VARIANT[item.priority] ?? 'default'}>{item.priority}</Badge>
                  {isOverdue(item) && <Badge variant="destructive">En retard</Badge>}
                </div>
                {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <dl className="text-sm">
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Responsable</dt>
                    <dd>{item.responsible ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground">Échéance</dt>
                    <dd>{item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : '—'}</dd>
                  </div>
                  {item.estimatedCost != null && (
                    <div className="flex justify-between py-1">
                      <dt className="text-muted-foreground">Coût estimé</dt>
                      <dd>{item.estimatedCost.toLocaleString('fr-FR')} €</dd>
                    </div>
                  )}
                </dl>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor={`status-${item.id}`}>Statut</Label>
                    <Select
                      value={item.status}
                      onValueChange={(status) => updateItem(item.id, { status })}
                    >
                      <SelectTrigger id={`status-${item.id}`} disabled={savingId === item.id} aria-label={`Statut de l'action : ${item.title}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor={`proof-${item.id}`}>Preuve de réalisation (lien ou attestation)</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`proof-${item.id}`}
                        placeholder="https://..."
                        defaultValue={item.proofOfCompletion ?? ''}
                        onChange={(e) => setProofDrafts((d) => ({ ...d, [item.id]: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={savingId === item.id}
                        onClick={() => updateItem(item.id, {
                          proofOfCompletion: proofDrafts[item.id] ?? item.proofOfCompletion ?? '',
                          proofDate: new Date().toISOString(),
                        })}
                      >
                        Enregistrer
                      </Button>
                    </div>
                    {item.proofDate && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Preuve enregistrée le {new Date(item.proofDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
