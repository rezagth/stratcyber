'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Dashboard = {
  risks: { open: number; total: number; byLevel: Record<string, number> };
  actions: { total: number; overdue: number };
  incidents: { open: number; total: number; withLateDeadline: number };
  controls: { total: number; byStatus: Record<string, number> };
  nextCommittee: { id: string; title: string; meetingDate: string } | null;
  lastAnnualReview: { id: string; title: string; meetingDate: string; status: string } | null;
};
type Meeting = {
  id: string; type: string; title: string; meetingDate: string; attendees: string | null;
  summary: string | null; status: string; validatedByName: string | null; validatedAt: string | null;
};
type Training = { id: string; participantName: string; role: string | null; trainingTitle: string; completedAt: string; evidenceLink: string | null };

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Validé': 'default',
  'À valider': 'secondary',
  'Brouillon': 'outline',
};

export function GovernanceTab({ organizationId }: { organizationId: string }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [trainings, setTrainings] = useState<Training[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newMeeting, setNewMeeting] = useState({ type: 'Comité', title: '', meetingDate: '', attendees: '', summary: '' });
  const [newTraining, setNewTraining] = useState({ participantName: '', role: '', trainingTitle: '', completedAt: '', evidenceLink: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/governance/dashboard`).then((r) => r.json()).then(setDashboard);
    fetch(`/api/organizations/${organizationId}/governance/meetings`).then((r) => r.json()).then(setMeetings);
    fetch(`/api/organizations/${organizationId}/governance/trainings`).then((r) => r.json()).then(setTrainings);
  };
  useEffect(load, [organizationId]);

  async function addMeeting() {
    const res = await fetch(`/api/organizations/${organizationId}/governance/meetings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMeeting),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewMeeting({ type: 'Comité', title: '', meetingDate: '', attendees: '', summary: '' });
    load();
  }

  async function updateMeeting(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/governance/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteMeeting(id: string) {
    await fetch(`/api/governance/meetings/${id}`, { method: 'DELETE' });
    load();
  }

  async function addTraining() {
    const res = await fetch(`/api/organizations/${organizationId}/governance/trainings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTraining),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewTraining({ participantName: '', role: '', trainingTitle: '', completedAt: '', evidenceLink: '' });
    load();
  }

  async function deleteTraining(id: string) {
    await fetch(`/api/governance/trainings/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-6">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      {dashboard && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tableau de bord de direction</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div><p className="text-muted-foreground">Risques ouverts</p><p className="text-xl font-semibold">{dashboard.risks.open}</p><p className="text-xs text-muted-foreground">dont {dashboard.risks.byLevel.Critique} critique(s)</p></div>
            <div><p className="text-muted-foreground">Actions en retard</p><p className="text-xl font-semibold">{dashboard.actions.overdue}</p><p className="text-xs text-muted-foreground">sur {dashboard.actions.total} au total</p></div>
            <div><p className="text-muted-foreground">Incidents ouverts</p><p className="text-xl font-semibold">{dashboard.incidents.open}</p><p className="text-xs text-muted-foreground">{dashboard.incidents.withLateDeadline} échéance(s) NIS2 en retard</p></div>
            <div><p className="text-muted-foreground">Contrôles conformes</p><p className="text-xl font-semibold">{dashboard.controls.byStatus['Conforme'] ?? 0}</p><p className="text-xs text-muted-foreground">sur {dashboard.controls.total} au total</p></div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Prochain comité</p>
              <p>{dashboard.nextCommittee ? `${dashboard.nextCommittee.title} — ${new Date(dashboard.nextCommittee.meetingDate).toLocaleDateString('fr-FR')}` : 'Aucun planifié'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Dernière revue annuelle</p>
              <p>{dashboard.lastAnnualReview ? `${dashboard.lastAnnualReview.title} — ${new Date(dashboard.lastAnnualReview.meetingDate).toLocaleDateString('fr-FR')} (${dashboard.lastAnnualReview.status})` : 'Aucune enregistrée'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium">Comités et revue annuelle</h3>
        <ul className="space-y-3">
          {meetings?.map((m) => (
            <li key={m.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{m.type}</Badge>
                      <CardTitle className="text-base">{m.title}</CardTitle>
                      <Badge variant={STATUS_VARIANT[m.status] ?? 'outline'}>{m.status}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteMeeting(m.id)}>Supprimer</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.meetingDate).toLocaleDateString('fr-FR')}
                    {m.attendees && ` · ${m.attendees}`}
                    {m.status === 'Validé' && m.validatedByName && ` · validé par ${m.validatedByName} le ${new Date(m.validatedAt!).toLocaleDateString('fr-FR')}`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {m.status !== 'Validé' ? (
                    <Textarea rows={2} placeholder="Compte rendu" defaultValue={m.summary ?? ''}
                      onBlur={(e) => { if (e.target.value !== (m.summary ?? '')) updateMeeting(m.id, { summary: e.target.value }); }} />
                  ) : (
                    m.summary && <p className="text-sm">{m.summary}</p>
                  )}
                  {m.status === 'Brouillon' && <Button size="sm" onClick={() => updateMeeting(m.id, { status: 'À valider' })}>Envoyer au client pour validation</Button>}
                  {m.status === 'À valider' && <p className="text-xs text-muted-foreground">En attente de validation par la direction du client.</p>}
                </CardContent>
              </Card>
            </li>
          ))}
          {meetings?.length === 0 && <p className="text-sm text-muted-foreground">Aucun comité ni revue annuelle pour le moment.</p>}
        </ul>

        <Card className="mt-3">
          <CardHeader><CardTitle className="text-base">Enregistrer un comité ou une revue annuelle</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="m-type">Type</Label>
              <Select value={newMeeting.type} onValueChange={(type) => setNewMeeting((m) => ({ ...m, type }))}>
                <SelectTrigger id="m-type"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Comité">Comité</SelectItem><SelectItem value="Revue annuelle">Revue annuelle</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="m-date">Date</Label><Input id="m-date" type="date" value={newMeeting.meetingDate} onChange={(e) => setNewMeeting((m) => ({ ...m, meetingDate: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label htmlFor="m-title">Titre</Label><Input id="m-title" value={newMeeting.title} onChange={(e) => setNewMeeting((m) => ({ ...m, title: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label htmlFor="m-attendees">Participants</Label><Input id="m-attendees" value={newMeeting.attendees} onChange={(e) => setNewMeeting((m) => ({ ...m, attendees: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label htmlFor="m-summary">Compte rendu</Label><Textarea id="m-summary" rows={2} value={newMeeting.summary} onChange={(e) => setNewMeeting((m) => ({ ...m, summary: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Button onClick={addMeeting} disabled={!newMeeting.title.trim() || !newMeeting.meetingDate}>Enregistrer</Button></div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Formation des dirigeants</h3>
        <ul className="space-y-2">
          {trainings?.map((t) => (
            <li key={t.id}>
              <Card>
                <CardContent className="flex items-center justify-between py-4 text-sm">
                  <div>
                    <p className="font-medium">{t.participantName} {t.role && `(${t.role})`} — {t.trainingTitle}</p>
                    <p className="text-muted-foreground">
                      {new Date(t.completedAt).toLocaleDateString('fr-FR')}
                      {t.evidenceLink && <> · <a href={t.evidenceLink} target="_blank" rel="noreferrer" className="underline">preuve</a></>}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteTraining(t.id)}>Supprimer</Button>
                </CardContent>
              </Card>
            </li>
          ))}
          {trainings?.length === 0 && <p className="text-sm text-muted-foreground">Aucune formation enregistrée.</p>}
        </ul>

        <Card className="mt-3">
          <CardHeader><CardTitle className="text-base">Enregistrer une formation</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="t-name">Participant</Label><Input id="t-name" value={newTraining.participantName} onChange={(e) => setNewTraining((t) => ({ ...t, participantName: e.target.value }))} /></div>
            <div><Label htmlFor="t-role">Fonction</Label><Input id="t-role" value={newTraining.role} onChange={(e) => setNewTraining((t) => ({ ...t, role: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label htmlFor="t-title">Formation suivie</Label><Input id="t-title" value={newTraining.trainingTitle} onChange={(e) => setNewTraining((t) => ({ ...t, trainingTitle: e.target.value }))} /></div>
            <div><Label htmlFor="t-date">Date</Label><Input id="t-date" type="date" value={newTraining.completedAt} onChange={(e) => setNewTraining((t) => ({ ...t, completedAt: e.target.value }))} /></div>
            <div><Label htmlFor="t-link">Lien de preuve (optionnel)</Label><Input id="t-link" value={newTraining.evidenceLink} onChange={(e) => setNewTraining((t) => ({ ...t, evidenceLink: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Button onClick={addTraining} disabled={!newTraining.participantName.trim() || !newTraining.trainingTitle.trim() || !newTraining.completedAt}>Enregistrer</Button></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
