'use client';

import { useEffect, useState, use as usePromise } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Reminder = { id: string; message: string; status: string; approvedBy: string | null; approvedAt: string | null; createdAt: string };
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
  reminders: Reminder[];
};
type Audit = { id: string; organizationId: string | null; createdAt: string; score: number | null };
type Organization = { id: string; name: string };

const PRIORITIES = ['Critique', 'Haute', 'Moyenne', 'Faible'];
const STATUSES = ['Non commencé', 'En cours', 'Terminé', 'Bloqué'];

function isOverdue(item: ActionItem): boolean {
  if (!item.dueDate || item.status === 'Terminé') return false;
  return new Date(item.dueDate) < new Date();
}

function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export default function OrganizationActionPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: organizationId } = usePromise(params);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [items, setItems] = useState<ActionItem[] | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Partial<ActionItem>>>({});

  const loadPlan = () => {
    fetch(`/api/organizations/${organizationId}/action-plan`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Chargement du plan impossible.');
        setItems(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  };

  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((orgs: Organization[]) => setOrganization(orgs.find((o) => o.id === organizationId) ?? null));
    fetch('/api/audits')
      .then((r) => r.json())
      .then((all: Audit[]) => setAudits(all.filter((a) => a.organizationId === organizationId)));
    loadPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  async function generate(auditId: string) {
    setGenerating(auditId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/audits/${auditId}/action-plan/generate`, { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Échec de la génération.');
      setFeedback(`${body.created} action(s) créée(s), ${body.skipped} déjà existante(s).`);
      loadPlan();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Erreur inattendue.');
    } finally {
      setGenerating(null);
    }
  }

  async function save(id: string, data: Record<string, unknown>) {
    setSavingId(id);
    try {
      const res = await fetch(`/api/action-plan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('La mise à jour a échoué.');
      loadPlan();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Erreur inattendue.');
    } finally {
      setSavingId(null);
    }
  }

  async function draftReminder(itemId: string) {
    await fetch(`/api/action-plan/${itemId}/reminders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    loadPlan();
  }

  async function reviewReminder(reminderId: string, status: 'approved' | 'dismissed') {
    await fetch(`/api/action-plan/reminders/${reminderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadPlan();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/dashboard/organizations" className="text-sm text-muted-foreground hover:underline">
        ← Clients
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        Plan d&apos;action — {organization?.name ?? organizationId}
      </h1>

      {feedback && <p className="mb-4 text-sm" role="status">{feedback}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <section className="mb-8">
        <h2 className="mb-2 text-lg font-medium">Générer depuis un audit</h2>
        {audits.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun audit rattaché à ce client pour l&apos;instant.</p>
        )}
        <ul className="space-y-2">
          {audits.map((audit) => (
            <li key={audit.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>
                Audit du {new Date(audit.createdAt).toLocaleDateString('fr-FR')} — score {audit.score ?? '—'}
              </span>
              <Button
                size="sm"
                disabled={generating === audit.id}
                onClick={() => generate(audit.id)}
              >
                {generating === audit.id ? 'Génération…' : "Générer le plan d'action"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Actions ({items?.length ?? 0})</h2>
        {items === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
        <ul className="space-y-4">
          {items?.map((item) => {
            const draft = drafts[item.id] ?? {};
            const latestReminder = item.reminders[0];
            return (
              <li key={item.id}>
                <Card className={isOverdue(item) ? 'border-red-400' : undefined}>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      {item.category && <Badge variant="outline">{item.category}</Badge>}
                      {isOverdue(item) && <Badge variant="destructive">En retard</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor={`priority-${item.id}`}>Priorité</Label>
                      <Select
                        value={draft.priority ?? item.priority}
                        onValueChange={(priority) => setDrafts((d) => ({ ...d, [item.id]: { ...d[item.id], priority } }))}
                      >
                        <SelectTrigger id={`priority-${item.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`status-${item.id}`}>Statut</Label>
                      <Select
                        value={draft.status ?? item.status}
                        onValueChange={(status) => setDrafts((d) => ({ ...d, [item.id]: { ...d[item.id], status } }))}
                      >
                        <SelectTrigger id={`status-${item.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`responsible-${item.id}`}>Responsable (client)</Label>
                      <Input
                        id={`responsible-${item.id}`}
                        defaultValue={item.responsible ?? ''}
                        onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...d[item.id], responsible: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`due-${item.id}`}>Échéance</Label>
                      <Input
                        id={`due-${item.id}`}
                        type="date"
                        defaultValue={toDateInputValue(item.dueDate)}
                        onChange={(e) => setDrafts((d) => ({ ...d, [item.id]: { ...d[item.id], dueDate: e.target.value } }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`cost-${item.id}`}>Coût estimé (€)</Label>
                      <Input
                        id={`cost-${item.id}`}
                        type="number"
                        min={0}
                        defaultValue={item.estimatedCost ?? ''}
                        onChange={(e) => {
                          const v = e.target.valueAsNumber;
                          setDrafts((d) => ({ ...d, [item.id]: { ...d[item.id], estimatedCost: Number.isFinite(v) ? v : null } }));
                        }}
                      />
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Preuve de réalisation</p>
                      <p>{item.proofOfCompletion ?? '—'}</p>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2">
                      <Button size="sm" disabled={savingId === item.id} onClick={() => save(item.id, draft)}>
                        Enregistrer
                      </Button>
                      {isOverdue(item) && !latestReminder && (
                        <Button size="sm" variant="outline" onClick={() => draftReminder(item.id)}>
                          Préparer une relance
                        </Button>
                      )}
                    </div>

                    {latestReminder && (
                      <div className="sm:col-span-2 lg:col-span-4 rounded-md border bg-muted/30 p-3 text-sm">
                        <p className="mb-2">{latestReminder.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={latestReminder.status === 'approved' ? 'default' : latestReminder.status === 'dismissed' ? 'secondary' : 'outline'}>
                            {latestReminder.status}
                          </Badge>
                          {latestReminder.status === 'draft' && (
                            <>
                              <Button size="sm" onClick={() => reviewReminder(latestReminder.id, 'approved')}>Approuver</Button>
                              <Button size="sm" variant="outline" onClick={() => reviewReminder(latestReminder.id, 'dismissed')}>Rejeter</Button>
                            </>
                          )}
                          {latestReminder.status === 'approved' && (
                            <span className="text-xs text-muted-foreground">
                              Prête à être envoyée manuellement (aucun envoi automatique configuré).
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
