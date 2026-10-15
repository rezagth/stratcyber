'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
type Training = { id: string; participantName: string; role: string | null; trainingTitle: string; completedAt: string };

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Validé': 'default',
  'À valider': 'secondary',
  'Brouillon': 'outline',
};

export default function ClientGovernancePage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [trainings, setTrainings] = useState<Training[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = () => {
    fetch('/api/client/governance/dashboard').then((r) => r.json()).then(setDashboard);
    fetch('/api/client/governance/meetings').then((r) => r.json()).then(setMeetings);
    fetch('/api/client/governance/trainings').then((r) => r.json()).then(setTrainings);
  };
  useEffect(load, []);

  async function validate(id: string) {
    const res = await fetch(`/api/client/governance/meetings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la validation.'); return; }
    setFeedback('Validé.');
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Gouvernance</h1>

      {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}

      {dashboard && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Tableau de bord</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
            <div><p className="text-muted-foreground">Risques ouverts</p><p className="text-xl font-semibold">{dashboard.risks.open}</p></div>
            <div><p className="text-muted-foreground">Actions en retard</p><p className="text-xl font-semibold">{dashboard.actions.overdue}</p></div>
            <div><p className="text-muted-foreground">Incidents ouverts</p><p className="text-xl font-semibold">{dashboard.incidents.open}</p></div>
            <div><p className="text-muted-foreground">Contrôles conformes</p><p className="text-xl font-semibold">{dashboard.controls.byStatus['Conforme'] ?? 0}</p></div>
          </CardContent>
        </Card>
      )}

      <h2 className="mb-3 text-lg font-medium">Comités et revue annuelle</h2>
      <ul className="mb-6 space-y-3">
        {meetings?.map((m) => (
          <li key={m.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{m.type}</Badge>
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  <Badge variant={STATUS_VARIANT[m.status] ?? 'outline'}>{m.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(m.meetingDate).toLocaleDateString('fr-FR')}
                  {m.status === 'Validé' && m.validatedByName && ` · validé par ${m.validatedByName} le ${new Date(m.validatedAt!).toLocaleDateString('fr-FR')}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {m.summary && <p className="text-sm">{m.summary}</p>}
                {m.status === 'À valider' && <Button size="sm" onClick={() => validate(m.id)}>Valider</Button>}
              </CardContent>
            </Card>
          </li>
        ))}
        {meetings?.length === 0 && <p className="text-sm text-muted-foreground">Aucun comité ni revue annuelle pour le moment.</p>}
      </ul>

      <h2 className="mb-3 text-lg font-medium">Formation des dirigeants</h2>
      <ul className="space-y-2">
        {trainings?.map((t) => (
          <li key={t.id}>
            <Card>
              <CardContent className="py-4 text-sm">
                <p className="font-medium">{t.participantName} {t.role && `(${t.role})`} — {t.trainingTitle}</p>
                <p className="text-muted-foreground">{new Date(t.completedAt).toLocaleDateString('fr-FR')}</p>
              </CardContent>
            </Card>
          </li>
        ))}
        {trainings?.length === 0 && <p className="text-sm text-muted-foreground">Aucune formation enregistrée.</p>}
      </ul>
    </div>
  );
}
