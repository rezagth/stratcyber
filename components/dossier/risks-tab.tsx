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

const TREATMENTS = ['À traiter', 'Éviter', 'Réduire', 'Transférer', 'Accepter'];
const STATUSES = ['Ouvert', 'Traité', 'Accepté', 'Clos'];
const SCALE = [1, 2, 3, 4, 5];

type Risk = {
  id: string; title: string; description: string | null; likelihood: number; impact: number;
  treatment: string; owner: string | null; dueDate: string | null; status: string;
  actionPlanItemId: string | null; controlId: string | null;
};

function riskLevel(likelihood: number, impact: number): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } {
  const score = likelihood * impact;
  if (score >= 15) return { label: 'Critique', variant: 'destructive' };
  if (score >= 8) return { label: 'Élevé', variant: 'destructive' };
  if (score >= 4) return { label: 'Modéré', variant: 'secondary' };
  return { label: 'Faible', variant: 'outline' };
}

export function RisksTab({ organizationId }: { organizationId: string }) {
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newRisk, setNewRisk] = useState({ title: '', likelihood: '3', impact: '3', owner: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/risks`).then((r) => r.json()).then(setRisks);
  };
  useEffect(load, [organizationId]);

  async function addRisk() {
    const res = await fetch(`/api/organizations/${organizationId}/risks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newRisk.title, likelihood: Number(newRisk.likelihood), impact: Number(newRisk.impact), owner: newRisk.owner || undefined }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewRisk({ title: '', likelihood: '3', impact: '3', owner: '' });
    load();
  }

  async function updateRisk(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/risks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteRisk(id: string) {
    await fetch(`/api/risks/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}
      <ul className="space-y-3">
        {risks?.map((risk) => {
          const level = riskLevel(risk.likelihood, risk.impact);
          return (
            <li key={risk.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{risk.title}</CardTitle>
                      <Badge variant={level.variant}>{level.label}</Badge>
                      <span className="text-xs text-muted-foreground">P{risk.likelihood} × I{risk.impact}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteRisk(risk.id)}>Supprimer</Button>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label htmlFor={`treatment-${risk.id}`}>Traitement</Label>
                    <Select value={risk.treatment} onValueChange={(treatment) => updateRisk(risk.id, { treatment })}>
                      <SelectTrigger id={`treatment-${risk.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{TREATMENTS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`status-${risk.id}`}>Statut</Label>
                    <Select value={risk.status} onValueChange={(status) => updateRisk(risk.id, { status })}>
                      <SelectTrigger id={`status-${risk.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`owner-${risk.id}`}>Responsable</Label>
                    <Input id={`owner-${risk.id}`} defaultValue={risk.owner ?? ''}
                      onBlur={(e) => { if (e.target.value !== (risk.owner ?? '')) updateRisk(risk.id, { owner: e.target.value }); }} />
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
        {risks?.length === 0 && <p className="text-sm text-muted-foreground">Aucun risque pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Ajouter un risque</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="new-risk-title">Titre</Label>
            <Input id="new-risk-title" value={newRisk.title} onChange={(e) => setNewRisk((r) => ({ ...r, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="new-risk-likelihood">Probabilité (1-5)</Label>
            <Select value={newRisk.likelihood} onValueChange={(likelihood) => setNewRisk((r) => ({ ...r, likelihood }))}>
              <SelectTrigger id="new-risk-likelihood"><SelectValue /></SelectTrigger>
              <SelectContent>{SCALE.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="new-risk-impact">Impact (1-5)</Label>
            <Select value={newRisk.impact} onValueChange={(impact) => setNewRisk((r) => ({ ...r, impact }))}>
              <SelectTrigger id="new-risk-impact"><SelectValue /></SelectTrigger>
              <SelectContent>{SCALE.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="new-risk-owner">Responsable</Label>
            <Input id="new-risk-owner" value={newRisk.owner} onChange={(e) => setNewRisk((r) => ({ ...r, owner: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={addRisk} disabled={!newRisk.title.trim()}>Ajouter le risque</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
