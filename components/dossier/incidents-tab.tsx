'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const SEVERITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'];
const STATUSES = ['Ouvert', 'En cours', 'Clos'];

type Incident = {
  id: string; title: string; description: string | null; severity: string; status: string; owner: string | null;
  detectedAt: string; earlyWarningSentAt: string | null; notificationSentAt: string | null; finalReportSentAt: string | null;
  personalDataInvolved: boolean;
};

const HOUR = 60 * 60 * 1000;
const STEPS = [
  { key: 'earlyWarningSentAt' as const, label: 'Alerte précoce (24h)', afterMs: 24 * HOUR },
  { key: 'notificationSentAt' as const, label: 'Notification (72h)', afterMs: 72 * HOUR },
  { key: 'finalReportSentAt' as const, label: 'Rapport final (1 mois)', afterMs: 30 * 24 * HOUR },
];

function deadlineState(detectedAt: string, sentAt: string | null, afterMs: number): 'done' | 'late' | 'pending' {
  const deadline = new Date(detectedAt).getTime() + afterMs;
  if (sentAt) return new Date(sentAt).getTime() <= deadline ? 'done' : 'late';
  return Date.now() > deadline ? 'late' : 'pending';
}

export function IncidentsTab({ organizationId }: { organizationId: string }) {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newIncident, setNewIncident] = useState({ title: '', severity: 'Moyenne', detectedAt: '', personalDataInvolved: false });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/incidents`).then((r) => r.json()).then(setIncidents);
  };
  useEffect(load, [organizationId]);

  async function addIncident() {
    if (!newIncident.title.trim() || !newIncident.detectedAt) { setFeedback('Titre et date de détection requis.'); return; }
    const res = await fetch(`/api/organizations/${organizationId}/incidents`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIncident, detectedAt: new Date(newIncident.detectedAt).toISOString() }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewIncident({ title: '', severity: 'Moyenne', detectedAt: '', personalDataInvolved: false });
    load();
  }

  async function updateIncident(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/incidents/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteIncident(id: string) {
    await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}
      <ul className="space-y-3">
        {incidents?.map((incident) => (
          <li key={incident.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{incident.title}</CardTitle>
                    <Badge variant={incident.severity === 'Critique' || incident.severity === 'Haute' ? 'destructive' : 'secondary'}>{incident.severity}</Badge>
                    {incident.personalDataInvolved && <Badge variant="outline">Données personnelles</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteIncident(incident.id)}>Supprimer</Button>
                </div>
                <p className="text-xs text-muted-foreground">Détecté le {new Date(incident.detectedAt).toLocaleString('fr-FR')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`status-${incident.id}`}>Statut</Label>
                  <Select value={incident.status} onValueChange={(status) => updateIncident(incident.id, { status })}>
                    <SelectTrigger id={`status-${incident.id}`} className="max-w-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {STEPS.map((step) => {
                    const sentAt = incident[step.key];
                    const state = deadlineState(incident.detectedAt, sentAt, step.afterMs);
                    return (
                      <div key={step.key} className="rounded-md border p-2 text-sm">
                        <div className="mb-1 flex items-center justify-between">
                          <span>{step.label}</span>
                          {state === 'done' && <Badge>À jour</Badge>}
                          {state === 'late' && <Badge variant="destructive">En retard</Badge>}
                          {state === 'pending' && <Badge variant="outline">En attente</Badge>}
                        </div>
                        <Input
                          type="datetime-local" aria-label={`Date d'envoi — ${step.label}`}
                          defaultValue={sentAt ? sentAt.slice(0, 16) : ''}
                          onBlur={(e) => updateIncident(incident.id, { [step.key]: e.target.value ? new Date(e.target.value).toISOString() : null })}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
        {incidents?.length === 0 && <p className="text-sm text-muted-foreground">Aucun incident pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Déclarer un incident</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="new-incident-title">Titre</Label>
            <Input id="new-incident-title" value={newIncident.title} onChange={(e) => setNewIncident((i) => ({ ...i, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="new-incident-severity">Sévérité</Label>
            <Select value={newIncident.severity} onValueChange={(severity) => setNewIncident((i) => ({ ...i, severity }))}>
              <SelectTrigger id="new-incident-severity"><SelectValue /></SelectTrigger>
              <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-incident-detected">Date de détection</Label>
            <Input id="new-incident-detected" type="datetime-local" value={newIncident.detectedAt}
              onChange={(e) => setNewIncident((i) => ({ ...i, detectedAt: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 rounded border-input"
              checked={newIncident.personalDataInvolved}
              onChange={(e) => setNewIncident((i) => ({ ...i, personalDataInvolved: e.target.checked }))} />
            Données personnelles concernées
          </label>
          <div className="sm:col-span-2">
            <Button onClick={addIncident} disabled={!newIncident.title.trim() || !newIncident.detectedAt}>Déclarer l&apos;incident</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
