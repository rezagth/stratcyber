'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CHECKLIST_PHASES } from '@/lib/incidents/checklist-template';
import {
  computeCrisisDeadlines, formatRemaining, type CrisisDeadline, type CrisisDeadlineKey,
} from '@/lib/incidents/deadlines';

type Incident = {
  id: string; title: string; description: string | null; severity: string; status: string; owner: string | null;
  detectedAt: string; earlyWarningSentAt: string | null; notificationSentAt: string | null;
  finalReportSentAt: string | null; cnilNotifiedAt: string | null; personalDataInvolved: boolean;
};
type ChecklistItem = { id: string; templateKey: string; phase: string; label: string; position: number; done: boolean; doneAt: string | null };
type LogEntry = { id: string; kind: string; message: string; authorName: string | null; occurredAt: string; createdAt: string };

const KIND_LABELS: Record<string, string> = { decision: 'Décision', action: 'Action', communication: 'Communication', note: 'Note' };
const SENT_FIELD: Record<CrisisDeadlineKey, string> = {
  earlyWarning: 'earlyWarningSentAt', notification: 'notificationSentAt', cnil: 'cnilNotifiedAt', finalReport: 'finalReportSentAt',
};
const STATUSES = ['Ouvert', 'En cours', 'Clos'];

async function errorOf(res: Response, fallback: string) {
  try { const body = await res.json(); return typeof body?.error === 'string' ? body.error : fallback; } catch { return fallback; }
}

const toDate = (value: string | null) => (value ? new Date(value) : null);
const fmt = (value: string | Date) => new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

function stateBadge(d: CrisisDeadline) {
  switch (d.state) {
    case 'done': return <Badge>Fait</Badge>;
    case 'doneLate': return <Badge variant="destructive">Fait en retard</Badge>;
    case 'overdue': return <Badge variant="destructive">Dépassée</Badge>;
    case 'urgent': return <Badge variant="destructive">Urgent</Badge>;
    default: return <Badge variant="outline">À venir</Badge>;
  }
}

export function CrisisRoom({ organizationId, incidentId }: { organizationId: string; incidentId: string }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [entry, setEntry] = useState({ kind: 'decision', message: '', occurredAt: '' });
  // Évite les doubles clics : le journal est en ajout seul, un doublon ne pourrait pas être retiré.
  const [busy, setBusy] = useState(false);
  const [sentAt, setSentAt] = useState<Partial<Record<CrisisDeadlineKey, string>>>({});

  const loadIncident = useCallback(async () => {
    const res = await fetch(`/api/organizations/${organizationId}/incidents`);
    if (!res.ok) { setFeedback(await errorOf(res, 'Chargement impossible.')); return; }
    const found = ((await res.json()) as Incident[]).find((i) => i.id === incidentId) ?? null;
    if (!found) setNotFound(true);
    setIncident(found);
  }, [organizationId, incidentId]);
  const loadChecklist = useCallback(async () => {
    const res = await fetch(`/api/incidents/${incidentId}/checklist`);
    if (res.ok) setChecklist(await res.json()); else setFeedback(await errorOf(res, 'Checklist indisponible.'));
  }, [incidentId]);
  const loadLog = useCallback(async () => {
    const res = await fetch(`/api/incidents/${incidentId}/log`);
    if (res.ok) setLog(await res.json()); else setFeedback(await errorOf(res, 'Journal indisponible.'));
  }, [incidentId]);

  useEffect(() => { void loadIncident(); void loadChecklist(); void loadLog(); }, [loadIncident, loadChecklist, loadLog]);
  // Le compte à rebours se met à jour toutes les 30 s.
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(t); }, []);

  const deadlines = useMemo(() => incident ? computeCrisisDeadlines({
    detectedAt: new Date(incident.detectedAt),
    personalDataInvolved: incident.personalDataInvolved,
    earlyWarningSentAt: toDate(incident.earlyWarningSentAt),
    notificationSentAt: toDate(incident.notificationSentAt),
    finalReportSentAt: toDate(incident.finalReportSentAt),
    cnilNotifiedAt: toDate(incident.cnilNotifiedAt),
  }, now) : [], [incident, now]);

  async function addLog(kind: string, message: string, occurredAt?: string) {
    const res = await fetch(`/api/incidents/${incidentId}/log`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, message, ...(occurredAt ? { occurredAt: new Date(occurredAt).toISOString() } : {}) }),
    });
    if (!res.ok) { setFeedback(await errorOf(res, "Échec de l'ajout au journal.")); return false; }
    await loadLog();
    return true;
  }

  async function patchIncident(data: Record<string, unknown>) {
    const res = await fetch(`/api/incidents/${incidentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback(await errorOf(res, 'Échec de la mise à jour.')); return false; }
    await loadIncident();
    if ('personalDataInvolved' in data) await loadChecklist();
    return true;
  }

  async function markSent(d: CrisisDeadline) {
    if (busy) return;
    const chosen = sentAt[d.key];
    const when = chosen ? new Date(chosen) : new Date();
    if (Number.isNaN(when.getTime()) || when.getTime() > Date.now() + 60_000) { setFeedback("L'heure d'envoi ne peut pas être dans le futur."); return; }
    setBusy(true); setFeedback(null);
    try {
      if (await patchIncident({ [SENT_FIELD[d.key]]: when.toISOString() })) {
        await addLog('communication', `${d.label} : envoyée`, chosen ? chosen : undefined);
        setSentAt((s) => ({ ...s, [d.key]: '' }));
      }
    } finally { setBusy(false); }
  }

  async function changeStatus(status: string) {
    if (busy || status === incident?.status) return;
    setBusy(true); setFeedback(null);
    try { if (await patchIncident({ status })) await addLog('action', `Statut de l'incident : ${status}`); }
    finally { setBusy(false); }
  }

  async function toggle(item: ChecklistItem) {
    const res = await fetch(`/api/incidents/${incidentId}/checklist`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId: item.id, done: !item.done }),
    });
    if (!res.ok) { setFeedback(await errorOf(res, 'Échec de la mise à jour.')); return; }
    await Promise.all([loadChecklist(), loadLog()]);
  }

  async function submitEntry() {
    if (!entry.message.trim() || busy) return;
    setBusy(true); setFeedback(null);
    try { if (await addLog(entry.kind, entry.message.trim(), entry.occurredAt || undefined)) setEntry((e) => ({ ...e, message: '', occurredAt: '' })); }
    finally { setBusy(false); }
  }

  async function copyTimeline() {
    if (!incident) return;
    const lines = [
      `Chronologie de l'incident : ${incident.title}`,
      `Détecté le ${fmt(incident.detectedAt)} (gravité : ${incident.severity})`,
      '',
      ...log.map((l) => `${fmt(l.occurredAt)} - ${KIND_LABELS[l.kind] ?? l.kind} - ${l.message}${l.authorName ? ` (${l.authorName})` : ''}`),
    ];
    try { await navigator.clipboard.writeText(lines.join('\n')); setFeedback('Chronologie copiée.'); }
    catch { setFeedback('Copie impossible : sélectionne le texte du journal à la main.'); }
  }

  if (notFound) return <p className="p-6 text-sm">Incident introuvable. <Link className="underline" href={`/dashboard/organizations/${organizationId}`}>Retour au dossier</Link></p>;
  if (!incident) return <p className="p-6 text-sm text-muted-foreground">Chargement...</p>;

  const done = checklist.filter((c) => c.done).length;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link className="text-sm underline" href={`/dashboard/organizations/${organizationId}`}>← Dossier du client</Link>
          <h1 className="mt-1 text-2xl font-semibold">Mode urgence : {incident.title}</h1>
          <p className="text-sm text-muted-foreground">Détecté le {fmt(incident.detectedAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={incident.severity === 'Critique' || incident.severity === 'Haute' ? 'destructive' : 'secondary'}>{incident.severity}</Badge>
          <Select value={incident.status} onValueChange={changeStatus} disabled={busy}>
            <SelectTrigger className="w-36" aria-label="Statut de l'incident"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Délais réglementaires</CardTitle>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-input" checked={incident.personalDataInvolved}
                onChange={(e) => patchIncident({ personalDataInvolved: e.target.checked })} />
              Données personnelles concernées
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculés à partir de l&apos;heure de détection. Aide-mémoire : vérifie avec le client s&apos;il est soumis à NIS2 et si la violation doit être notifiée à la CNIL.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {deadlines.map((d) => (
            <div key={d.key} className="rounded-md border p-3 text-sm">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium">{d.label}</span>
                {stateBadge(d)}
              </div>
              <p className="text-xs text-muted-foreground">Échéance : {fmt(d.deadline)}</p>
              {d.sentAt
                ? <p className="mt-1 text-xs">Envoyé le {fmt(d.sentAt)}</p>
                : (
                  <>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={d.state === 'pending' ? 'text-sm' : 'text-sm font-semibold text-destructive'}>
                      {d.remainingMs !== null ? formatRemaining(d.remainingMs) : ''}
                    </span>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => markSent(d)}>{sentAt[d.key] ? "Enregistrer l'envoi" : 'Marquer envoyé maintenant'}</Button>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor={`sent-${d.key}`} className="text-xs text-muted-foreground">Envoyé plus tôt ? Heure réelle (vide = maintenant)</Label>
                    <Input id={`sent-${d.key}`} type="datetime-local" className="h-8 text-xs" value={sentAt[d.key] ?? ''}
                      onChange={(e) => setSentAt((s) => ({ ...s, [d.key]: e.target.value }))} />
                  </div>
                  </>
                )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Checklist de réponse ({done}/{checklist.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CHECKLIST_PHASES.map((phase) => {
              const items = checklist.filter((c) => c.phase === phase);
              if (items.length === 0) return null;
              return (
                <div key={phase}>
                  <h3 className="mb-1 text-sm font-medium">{phase}</h3>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.id}>
                        <label className="flex items-start gap-2 text-sm">
                          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" checked={item.done} onChange={() => toggle(item)} />
                          <span className={item.done ? 'text-muted-foreground line-through' : ''}>{item.label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">Journal de crise</CardTitle>
              <Button size="sm" variant="outline" onClick={copyTimeline} disabled={log.length === 0}>Copier la chronologie</Button>
            </div>
            <p className="text-xs text-muted-foreground">Les lignes ne peuvent être ni modifiées ni supprimées : en cas d&apos;erreur, ajoute une ligne de correction.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-md border p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor="log-kind">Type</Label>
                  <Select value={entry.kind} onValueChange={(kind) => setEntry((e) => ({ ...e, kind }))}>
                    <SelectTrigger id="log-kind"><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(KIND_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="log-when">Heure réelle (vide = maintenant)</Label>
                  <Input id="log-when" type="datetime-local" value={entry.occurredAt} onChange={(e) => setEntry((x) => ({ ...x, occurredAt: e.target.value }))} />
                </div>
              </div>
              <Label htmlFor="log-message">Décision, action ou communication</Label>
              <Textarea id="log-message" rows={2} value={entry.message} onChange={(e) => setEntry((x) => ({ ...x, message: e.target.value }))} />
              <Button onClick={submitEntry} disabled={!entry.message.trim() || busy}>Ajouter au journal</Button>
            </div>
            <ol className="space-y-2">
              {[...log].reverse().map((l) => (
                <li key={l.id} className="rounded-md border p-2 text-sm">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{fmt(l.occurredAt)}{l.authorName ? ` · ${l.authorName}` : ''}</span>
                    <Badge variant="outline">{KIND_LABELS[l.kind] ?? l.kind}</Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap">{l.message}</p>
                </li>
              ))}
              {log.length === 0 && <p className="text-sm text-muted-foreground">Aucune entrée pour le moment.</p>}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
