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

const FRAMEWORKS = ['RGPD', 'NIS2', 'DORA', 'CRA', 'LPM', 'HDS', 'PCI_DSS', 'ISO27001', 'EBIOS'];
const STATUSES = ['Non évalué', 'Conforme', 'Partiellement conforme', 'Non conforme', 'Non applicable'];

type Evidence = {
  id: string; label: string; source: string | null; owner: string | null;
  evidenceDate: string; expiresAt: string | null; link: string | null;
};
type Control = {
  id: string; title: string; description: string | null; status: string; owner: string | null;
  frameworks: string[]; evidences: Evidence[];
};

function expiryState(expiresAt: string | null): 'expired' | 'soon' | null {
  if (!expiresAt) return null;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return null;
}

export function ControlsTab({ organizationId }: { organizationId: string }) {
  const [controls, setControls] = useState<Control[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newControl, setNewControl] = useState<{ title: string; owner: string; frameworks: string[] }>({ title: '', owner: '', frameworks: [] });
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, { label: string; source: string; owner: string; evidenceDate: string; expiresAt: string; link: string }>>({});

  const load = () => {
    fetch(`/api/organizations/${organizationId}/controls`).then((r) => r.json()).then(setControls);
  };
  useEffect(load, [organizationId]);

  function toggleFramework(fw: string) {
    setNewControl((c) => ({
      ...c,
      frameworks: c.frameworks.includes(fw) ? c.frameworks.filter((f) => f !== fw) : [...c.frameworks, fw],
    }));
  }

  async function addControl() {
    const res = await fetch(`/api/organizations/${organizationId}/controls`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newControl.title, owner: newControl.owner || undefined, frameworks: newControl.frameworks }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewControl({ title: '', owner: '', frameworks: [] });
    load();
  }

  async function updateControl(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/controls/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteControl(id: string) {
    await fetch(`/api/controls/${id}`, { method: 'DELETE' });
    load();
  }

  async function addEvidence(controlId: string) {
    const draft = evidenceDrafts[controlId];
    if (!draft?.label || !draft?.evidenceDate) { setFeedback('Libellé et date de la preuve requis.'); return; }
    const res = await fetch(`/api/controls/${controlId}/evidences`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: draft.label, source: draft.source || undefined, owner: draft.owner || undefined,
        evidenceDate: draft.evidenceDate, expiresAt: draft.expiresAt || undefined, link: draft.link || undefined,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? "Échec de l'ajout de la preuve."); return; }
    setEvidenceDrafts((d) => ({ ...d, [controlId]: { label: '', source: '', owner: '', evidenceDate: '', expiresAt: '', link: '' } }));
    load();
  }

  async function deleteEvidence(id: string) {
    await fetch(`/api/evidences/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <ul className="space-y-3">
        {controls?.map((control) => {
          const draft = evidenceDrafts[control.id] ?? { label: '', source: '', owner: '', evidenceDate: '', expiresAt: '', link: '' };
          return (
            <li key={control.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{control.title}</CardTitle>
                      {control.frameworks.map((fw) => <Badge key={fw} variant="outline">{fw}</Badge>)}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteControl(control.id)}>Supprimer</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor={`status-${control.id}`}>Statut</Label>
                      <Select value={control.status} onValueChange={(status) => updateControl(control.id, { status })}>
                        <SelectTrigger id={`status-${control.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`owner-${control.id}`}>Responsable</Label>
                      <Input id={`owner-${control.id}`} defaultValue={control.owner ?? ''}
                        onBlur={(e) => { if (e.target.value !== (control.owner ?? '')) updateControl(control.id, { owner: e.target.value }); }} />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Preuves ({control.evidences.length})</p>
                    <ul className="space-y-2">
                      {control.evidences.map((ev) => {
                        const state = expiryState(ev.expiresAt);
                        return (
                          <li key={ev.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                            <div>
                              <p>
                                {ev.label}
                                {state === 'expired' && <Badge variant="destructive" className="ml-2">Expirée</Badge>}
                                {state === 'soon' && <Badge className="ml-2">Expire bientôt</Badge>}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(ev.evidenceDate).toLocaleDateString('fr-FR')}
                                {ev.source && ` · ${ev.source}`}
                                {ev.owner && ` · ${ev.owner}`}
                                {ev.expiresAt && ` · expire le ${new Date(ev.expiresAt).toLocaleDateString('fr-FR')}`}
                                {ev.link && <> · <a href={ev.link} target="_blank" rel="noreferrer" className="underline">lien</a></>}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => deleteEvidence(ev.id)}>Supprimer</Button>
                          </li>
                        );
                      })}
                      {control.evidences.length === 0 && <p className="text-xs text-muted-foreground">Aucune preuve enregistrée.</p>}
                    </ul>
                  </div>

                  <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
                    <Input placeholder="Libellé" value={draft.label}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, label: e.target.value } }))} />
                    <Input placeholder="Source" value={draft.source}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, source: e.target.value } }))} />
                    <Input placeholder="Responsable" value={draft.owner}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, owner: e.target.value } }))} />
                    <Input type="date" aria-label="Date de la preuve" value={draft.evidenceDate}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, evidenceDate: e.target.value } }))} />
                    <Input type="date" aria-label="Date d'expiration" value={draft.expiresAt}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, expiresAt: e.target.value } }))} />
                    <Input placeholder="Lien" value={draft.link}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [control.id]: { ...draft, link: e.target.value } }))} />
                    <div className="sm:col-span-3">
                      <Button size="sm" onClick={() => addEvidence(control.id)}>Ajouter la preuve</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
        {controls?.length === 0 && <p className="text-sm text-muted-foreground">Aucun contrôle pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Ajouter un contrôle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-control-title">Titre</Label>
              <Input id="new-control-title" value={newControl.title} onChange={(e) => setNewControl((c) => ({ ...c, title: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="new-control-owner">Responsable</Label>
              <Input id="new-control-owner" value={newControl.owner} onChange={(e) => setNewControl((c) => ({ ...c, owner: e.target.value }))} />
            </div>
          </div>
          <fieldset>
            <legend className="mb-1 text-sm font-medium">Référentiels (au moins un)</legend>
            <div className="flex flex-wrap gap-3">
              {FRAMEWORKS.map((fw) => (
                <label key={fw} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={newControl.frameworks.includes(fw)}
                    onChange={() => toggleFramework(fw)}
                    className="h-4 w-4 rounded border-input"
                  />
                  {fw}
                </label>
              ))}
            </div>
          </fieldset>
          <Button onClick={addControl} disabled={!newControl.title.trim() || newControl.frameworks.length === 0}>
            Ajouter le contrôle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
