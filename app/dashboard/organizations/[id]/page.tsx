'use client';

import { useEffect, useState, use as usePromise } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ControlsTab } from '@/components/dossier/controls-tab';
import { RisksTab } from '@/components/dossier/risks-tab';
import { IncidentsTab } from '@/components/dossier/incidents-tab';
import { VulnerabilitiesTab } from '@/components/dossier/vulnerabilities-tab';
import { PoliciesTab } from '@/components/dossier/policies-tab';
import { SecurityAnswersTab } from '@/components/dossier/security-answers-tab';
import { GovernanceTab } from '@/components/dossier/governance-tab';
import { SuppliersTab } from '@/components/dossier/suppliers-tab';
import { BudgetTab } from '@/components/dossier/budget-tab';

type Organization = {
  id: string; name: string; sector: string | null; size: string | null;
  headcount: number | null; annualRevenue: number | null; missionScope: string | null;
  nis2Applicability: string | null; nis2Note: string | null;
  rgpdApplicability: string | null; rgpdNote: string | null;
  iso27001Status: string | null; iso27001Note: string | null;
  applicabilityAssessedAt: string | null;
};
type Contact = { id: string; name: string; role: string | null; email: string | null; phone: string | null; isPrimary: boolean };
type Decision = { id: string; title: string; description: string | null; decidedAt: string };
type InternalNote = { id: string; content: string; createdAt: string };

const SECTORS = ['Finance', 'Santé', 'Énergie', 'Transport', 'Numérique', 'Administration', 'Industrie', 'Commerce', 'Autre'];
const SIZES = ['TPE', 'PME', 'ETI', 'GE'];
const NIS2_OPTIONS = ['Oui', 'Non', 'Incertain'];
const RGPD_OPTIONS = ['Oui', 'Non'];
const ISO_OPTIONS = ['Non engagé', 'En cours', 'Certifié'];

export default function OrganizationDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = usePromise(params);

  const [org, setOrg] = useState<Organization | null>(null);
  const [draft, setDraft] = useState<Partial<Organization>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', role: '', email: '', phone: '' });
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [newDecision, setNewDecision] = useState({ title: '', description: '', decidedAt: '' });
  const [notes, setNotes] = useState<InternalNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetch(`/api/organizations/${id}`).then(async (r) => (r.ok ? setOrg(await r.json()) : setError('Chargement du profil impossible.')));
    fetch(`/api/organizations/${id}/contacts`).then((r) => r.json()).then(setContacts);
    fetch(`/api/organizations/${id}/decisions`).then((r) => r.json()).then(setDecisions);
    fetch(`/api/organizations/${id}/notes`).then((r) => r.json()).then(setNotes);
  };

  useEffect(load, [id]);

  async function saveProfile() {
    setFeedback(null);
    const res = await fetch(`/api/organizations/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    setOrg(await res.json());
    setDraft({});
    setFeedback('Profil enregistré.');
  }

  async function addContact() {
    const res = await fetch(`/api/organizations/${id}/contacts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newContact),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création du contact.'); return; }
    setNewContact({ name: '', role: '', email: '', phone: '' });
    load();
  }

  async function deleteContact(contactId: string) {
    await fetch(`/api/contacts/${contactId}`, { method: 'DELETE' });
    load();
  }

  async function setPrimary(contactId: string) {
    await fetch(`/api/contacts/${contactId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrimary: true }),
    });
    load();
  }

  async function addDecision() {
    const res = await fetch(`/api/organizations/${id}/decisions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newDecision, decidedAt: newDecision.decidedAt || undefined }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de l\'enregistrement.'); return; }
    setNewDecision({ title: '', description: '', decidedAt: '' });
    load();
  }

  async function addNote() {
    if (!newNote.trim()) return;
    const res = await fetch(`/api/organizations/${id}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newNote }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de l\'enregistrement.'); return; }
    setNewNote('');
    load();
  }

  if (error) return <div className="mx-auto max-w-4xl px-4 py-8"><p role="alert" className="text-sm text-red-600">{error}</p></div>;
  if (!org) return <div className="mx-auto max-w-4xl px-4 py-8"><p className="text-sm text-muted-foreground">Chargement…</p></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard/organizations" className="text-sm text-muted-foreground hover:underline">← Clients</Link>
      <div className="mt-2 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <Link href={`/dashboard/organizations/${id}/action-plan`}>
          <Button variant="outline">Plan d&apos;action →</Button>
        </Link>
      </div>

      {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}

      <Tabs defaultValue="profil">
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="controles">Contrôles</TabsTrigger>
          <TabsTrigger value="risques">Risques</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="vulnerabilites">Vulnérabilités</TabsTrigger>
          <TabsTrigger value="politiques">Politiques</TabsTrigger>
          <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
          <TabsTrigger value="gouvernance">Gouvernance</TabsTrigger>
          <TabsTrigger value="fournisseurs">Fournisseurs</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="decisions">Décisions ({decisions.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes internes ({notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Profil de l&apos;entreprise</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sector">Secteur</Label>
                <Select value={draft.sector ?? org.sector ?? undefined} onValueChange={(v) => setDraft((d) => ({ ...d, sector: v }))}>
                  <SelectTrigger id="sector"><SelectValue placeholder="Secteur" /></SelectTrigger>
                  <SelectContent>{SECTORS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="size">Taille</Label>
                <Select value={draft.size ?? org.size ?? undefined} onValueChange={(v) => setDraft((d) => ({ ...d, size: v }))}>
                  <SelectTrigger id="size"><SelectValue placeholder="Taille" /></SelectTrigger>
                  <SelectContent>{SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="headcount">Effectif</Label>
                <Input id="headcount" type="number" min={0} defaultValue={org.headcount ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, headcount: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : null }))} />
              </div>
              <div>
                <Label htmlFor="ca">Chiffre d&apos;affaires annuel (€)</Label>
                <Input id="ca" type="number" min={0} defaultValue={org.annualRevenue ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, annualRevenue: Number.isFinite(e.target.valueAsNumber) ? e.target.valueAsNumber : null }))} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="scope">Périmètre de mission</Label>
                <Textarea id="scope" rows={3} defaultValue={org.missionScope ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, missionScope: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test d&apos;applicabilité réglementaire</CardTitle>
              <p className="text-xs text-muted-foreground">
                Indicatif, à confirmer avec un juriste. La transposition française de NIS2 n&apos;est pas finalisée à ce jour.
                {org.applicabilityAssessedAt && ` Dernière évaluation : ${new Date(org.applicabilityAssessedAt).toLocaleDateString('fr-FR')}.`}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
                <div>
                  <Label htmlFor="nis2">NIS2</Label>
                  <Select value={draft.nis2Applicability ?? org.nis2Applicability ?? undefined} onValueChange={(v) => setDraft((d) => ({ ...d, nis2Applicability: v }))}>
                    <SelectTrigger id="nis2"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{NIS2_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Justification NIS2" rows={2} defaultValue={org.nis2Note ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, nis2Note: e.target.value }))} aria-label="Justification NIS2" />
              </div>
              <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
                <div>
                  <Label htmlFor="rgpd">RGPD</Label>
                  <Select value={draft.rgpdApplicability ?? org.rgpdApplicability ?? undefined} onValueChange={(v) => setDraft((d) => ({ ...d, rgpdApplicability: v }))}>
                    <SelectTrigger id="rgpd"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{RGPD_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Justification RGPD" rows={2} defaultValue={org.rgpdNote ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, rgpdNote: e.target.value }))} aria-label="Justification RGPD" />
              </div>
              <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
                <div>
                  <Label htmlFor="iso">ISO 27001</Label>
                  <Select value={draft.iso27001Status ?? org.iso27001Status ?? undefined} onValueChange={(v) => setDraft((d) => ({ ...d, iso27001Status: v }))}>
                    <SelectTrigger id="iso"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{ISO_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="Justification ISO 27001" rows={2} defaultValue={org.iso27001Note ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, iso27001Note: e.target.value }))} aria-label="Justification ISO 27001" />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveProfile} disabled={Object.keys(draft).length === 0}>Enregistrer le profil</Button>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <ul className="space-y-2">
            {contacts.map((c) => (
              <li key={c.id}>
                <Card>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="text-sm">
                      <p className="font-medium">{c.name} {c.isPrimary && <Badge className="ml-2">Principal</Badge>}</p>
                      <p className="text-muted-foreground">{c.role ?? '—'} · {c.email ?? '—'} · {c.phone ?? '—'}</p>
                    </div>
                    <div className="flex gap-2">
                      {!c.isPrimary && <Button size="sm" variant="outline" onClick={() => setPrimary(c.id)}>Définir principal</Button>}
                      <Button size="sm" variant="outline" onClick={() => deleteContact(c.id)}>Supprimer</Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <Card>
            <CardHeader><CardTitle className="text-base">Ajouter un contact</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="c-name">Nom</Label><Input id="c-name" value={newContact.name} onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))} /></div>
              <div><Label htmlFor="c-role">Fonction</Label><Input id="c-role" value={newContact.role} onChange={(e) => setNewContact((c) => ({ ...c, role: e.target.value }))} /></div>
              <div><Label htmlFor="c-email">Email</Label><Input id="c-email" type="email" value={newContact.email} onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))} /></div>
              <div><Label htmlFor="c-phone">Téléphone</Label><Input id="c-phone" value={newContact.phone} onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Button onClick={addContact} disabled={!newContact.name.trim()}>Ajouter</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="controles">
          <ControlsTab organizationId={id} />
        </TabsContent>

        <TabsContent value="risques">
          <RisksTab organizationId={id} />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentsTab organizationId={id} />
        </TabsContent>

        <TabsContent value="vulnerabilites">
          <VulnerabilitiesTab organizationId={id} />
        </TabsContent>

        <TabsContent value="politiques">
          <PoliciesTab organizationId={id} />
        </TabsContent>

        <TabsContent value="questionnaires">
          <SecurityAnswersTab organizationId={id} />
        </TabsContent>

        <TabsContent value="gouvernance">
          <GovernanceTab organizationId={id} />
        </TabsContent>

        <TabsContent value="fournisseurs">
          <SuppliersTab organizationId={id} />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetTab organizationId={id} />
        </TabsContent>

        <TabsContent value="decisions" className="space-y-4">
          <ul className="space-y-2">
            {decisions.map((d) => (
              <li key={d.id}>
                <Card>
                  <CardContent className="py-4 text-sm">
                    <p className="font-medium">{d.title} <span className="font-normal text-muted-foreground">— {new Date(d.decidedAt).toLocaleDateString('fr-FR')}</span></p>
                    {d.description && <p className="mt-1 text-muted-foreground">{d.description}</p>}
                  </CardContent>
                </Card>
              </li>
            ))}
            {decisions.length === 0 && <p className="text-sm text-muted-foreground">Aucune décision enregistrée.</p>}
          </ul>
          <Card>
            <CardHeader><CardTitle className="text-base">Enregistrer une décision</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="d-title">Titre</Label><Input id="d-title" value={newDecision.title} onChange={(e) => setNewDecision((d) => ({ ...d, title: e.target.value }))} /></div>
              <div><Label htmlFor="d-date">Date</Label><Input id="d-date" type="date" value={newDecision.decidedAt} onChange={(e) => setNewDecision((d) => ({ ...d, decidedAt: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label htmlFor="d-desc">Description</Label><Textarea id="d-desc" rows={2} value={newDecision.description} onChange={(e) => setNewDecision((d) => ({ ...d, description: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Button onClick={addDecision} disabled={!newDecision.title.trim()}>Enregistrer</Button></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <p className="text-xs text-muted-foreground">Ces notes ne sont jamais visibles par le client.</p>
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id}>
                <Card>
                  <CardContent className="py-4 text-sm">
                    <p>{n.content}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString('fr-FR')}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
            {notes.length === 0 && <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>}
          </ul>
          <Card>
            <CardContent className="space-y-3 pt-4">
              <Label htmlFor="note">Nouvelle note</Label>
              <Textarea id="note" rows={3} value={newNote} onChange={(e) => setNewNote(e.target.value)} />
              <Button onClick={addNote} disabled={!newNote.trim()}>Ajouter la note</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
