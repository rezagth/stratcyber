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

const CRITICALITIES = ['Faible', 'Moyenne', 'Haute', 'Critique'];
const STATUSES = ['Actif', 'Inactif'];

type SupplierEvidence = { id: string; label: string; evidenceDate: string; expiresAt: string | null; link: string | null };
type Supplier = {
  id: string; name: string; description: string | null; dataLocation: string | null;
  criticality: string; hasSecurityClause: boolean; securityClauseReference: string | null;
  lastReviewDate: string | null; status: string; evidences: SupplierEvidence[];
};

function expiryState(expiresAt: string | null): 'expired' | 'soon' | null {
  if (!expiresAt) return null;
  const days = (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return 'expired';
  if (days <= 30) return 'soon';
  return null;
}

function reviewLate(lastReviewDate: string | null): boolean {
  if (!lastReviewDate) return true;
  const days = (Date.now() - new Date(lastReviewDate).getTime()) / (1000 * 60 * 60 * 24);
  return days > 365;
}

export function SuppliersTab({ organizationId }: { organizationId: string }) {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', description: '', dataLocation: '', criticality: 'Moyenne' });
  const [evidenceDrafts, setEvidenceDrafts] = useState<Record<string, { label: string; evidenceDate: string; expiresAt: string; link: string }>>({});

  const load = () => {
    fetch(`/api/organizations/${organizationId}/suppliers`).then((r) => r.json()).then(setSuppliers);
  };
  useEffect(load, [organizationId]);

  async function addSupplier() {
    const res = await fetch(`/api/organizations/${organizationId}/suppliers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newSupplier.name, description: newSupplier.description || undefined,
        dataLocation: newSupplier.dataLocation || undefined, criticality: newSupplier.criticality,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewSupplier({ name: '', description: '', dataLocation: '', criticality: 'Moyenne' });
    load();
  }

  async function updateSupplier(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/suppliers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteSupplier(id: string) {
    await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
    load();
  }

  async function addEvidence(supplierId: string) {
    const draft = evidenceDrafts[supplierId];
    if (!draft?.label || !draft?.evidenceDate) { setFeedback('Libellé et date de la preuve requis.'); return; }
    const res = await fetch(`/api/suppliers/${supplierId}/evidences`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: draft.label, evidenceDate: draft.evidenceDate,
        expiresAt: draft.expiresAt || undefined, link: draft.link || undefined,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? "Échec de l'ajout de la preuve."); return; }
    setEvidenceDrafts((d) => ({ ...d, [supplierId]: { label: '', evidenceDate: '', expiresAt: '', link: '' } }));
    load();
  }

  async function deleteEvidence(id: string) {
    await fetch(`/api/supplier-evidences/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <ul className="space-y-3">
        {suppliers?.map((supplier) => {
          const draft = evidenceDrafts[supplier.id] ?? { label: '', evidenceDate: '', expiresAt: '', link: '' };
          return (
            <li key={supplier.id}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{supplier.name}</CardTitle>
                      <Badge variant="outline">{supplier.criticality}</Badge>
                      <Badge variant={supplier.status === 'Actif' ? 'default' : 'secondary'}>{supplier.status}</Badge>
                      {supplier.hasSecurityClause ? (
                        <Badge variant="outline">Clause de sécurité</Badge>
                      ) : (
                        <Badge variant="destructive">Pas de clause de sécurité</Badge>
                      )}
                      {reviewLate(supplier.lastReviewDate) && <Badge variant="destructive">Revue en retard</Badge>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteSupplier(supplier.id)}>Supprimer</Button>
                  </div>
                  {supplier.description && <p className="text-sm text-muted-foreground">{supplier.description}</p>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <Label htmlFor={`criticality-${supplier.id}`}>Criticité</Label>
                      <Select value={supplier.criticality} onValueChange={(criticality) => updateSupplier(supplier.id, { criticality })}>
                        <SelectTrigger id={`criticality-${supplier.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>{CRITICALITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`status-${supplier.id}`}>Statut</Label>
                      <Select value={supplier.status} onValueChange={(status) => updateSupplier(supplier.id, { status })}>
                        <SelectTrigger id={`status-${supplier.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`data-location-${supplier.id}`}>Localisation des données</Label>
                      <Input id={`data-location-${supplier.id}`} defaultValue={supplier.dataLocation ?? ''}
                        onBlur={(e) => { if (e.target.value !== (supplier.dataLocation ?? '')) updateSupplier(supplier.id, { dataLocation: e.target.value }); }} />
                    </div>
                    <div>
                      <Label htmlFor={`last-review-${supplier.id}`}>Dernière revue</Label>
                      <Input id={`last-review-${supplier.id}`} type="date" defaultValue={supplier.lastReviewDate?.slice(0, 10) ?? ''}
                        onBlur={(e) => { if (e.target.value !== (supplier.lastReviewDate?.slice(0, 10) ?? '')) updateSupplier(supplier.id, { lastReviewDate: e.target.value || null }); }} />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        id={`clause-${supplier.id}`}
                        type="checkbox"
                        checked={supplier.hasSecurityClause}
                        onChange={(e) => updateSupplier(supplier.id, { hasSecurityClause: e.target.checked })}
                        className="h-4 w-4 rounded border-input"
                      />
                      <Label htmlFor={`clause-${supplier.id}`}>Clause de sécurité présente au contrat</Label>
                    </div>
                    <div>
                      <Label htmlFor={`clause-ref-${supplier.id}`}>Référence de la clause</Label>
                      <Input id={`clause-ref-${supplier.id}`} defaultValue={supplier.securityClauseReference ?? ''}
                        onBlur={(e) => { if (e.target.value !== (supplier.securityClauseReference ?? '')) updateSupplier(supplier.id, { securityClauseReference: e.target.value }); }} />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium">Preuves annuelles ({supplier.evidences.length})</p>
                    <ul className="space-y-2">
                      {supplier.evidences.map((ev) => {
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
                                {ev.expiresAt && ` · expire le ${new Date(ev.expiresAt).toLocaleDateString('fr-FR')}`}
                                {ev.link && <> · <a href={ev.link} target="_blank" rel="noreferrer" className="underline">lien</a></>}
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => deleteEvidence(ev.id)}>Supprimer</Button>
                          </li>
                        );
                      })}
                      {supplier.evidences.length === 0 && <p className="text-xs text-muted-foreground">Aucune preuve enregistrée.</p>}
                    </ul>
                  </div>

                  <div className="grid gap-2 rounded-md border p-3 sm:grid-cols-3">
                    <Input placeholder="Libellé" value={draft.label}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [supplier.id]: { ...draft, label: e.target.value } }))} />
                    <Input type="date" aria-label="Date de la preuve" value={draft.evidenceDate}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [supplier.id]: { ...draft, evidenceDate: e.target.value } }))} />
                    <Input type="date" aria-label="Date d'expiration" value={draft.expiresAt}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [supplier.id]: { ...draft, expiresAt: e.target.value } }))} />
                    <Input className="sm:col-span-2" placeholder="Lien" value={draft.link}
                      onChange={(e) => setEvidenceDrafts((d) => ({ ...d, [supplier.id]: { ...draft, link: e.target.value } }))} />
                    <div>
                      <Button size="sm" onClick={() => addEvidence(supplier.id)}>Ajouter la preuve</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          );
        })}
        {suppliers?.length === 0 && <p className="text-sm text-muted-foreground">Aucun fournisseur pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Ajouter un fournisseur</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-supplier-name">Nom</Label>
              <Input id="new-supplier-name" value={newSupplier.name} onChange={(e) => setNewSupplier((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="new-supplier-criticality">Criticité</Label>
              <Select value={newSupplier.criticality} onValueChange={(criticality) => setNewSupplier((s) => ({ ...s, criticality }))}>
                <SelectTrigger id="new-supplier-criticality"><SelectValue /></SelectTrigger>
                <SelectContent>{CRITICALITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-supplier-location">Localisation des données</Label>
              <Input id="new-supplier-location" value={newSupplier.dataLocation} onChange={(e) => setNewSupplier((s) => ({ ...s, dataLocation: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="new-supplier-description">Description (service fourni)</Label>
              <Textarea id="new-supplier-description" rows={2} value={newSupplier.description} onChange={(e) => setNewSupplier((s) => ({ ...s, description: e.target.value }))} />
            </div>
          </div>
          <Button onClick={addSupplier} disabled={!newSupplier.name.trim()}>
            Ajouter le fournisseur
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
