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

const CATEGORIES = ['Outils et licences', 'Formation', 'Audit et conseil', 'Assurance cyber', 'Personnel', 'Autre'];

type Dashboard = {
  fiscalYear: number; allocated: number; plannedCost: number; actualSpent: number;
  remaining: number; byCategory: Record<string, number>;
};
type Envelope = { id: string; fiscalYear: number; allocatedAmount: number; note: string | null };
type Expense = { id: string; fiscalYear: number; category: string | null; label: string; amount: number; expenseDate: string; note: string | null };

const currentYear = new Date().getFullYear();
const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export function BudgetTab({ organizationId }: { organizationId: string }) {
  const [year, setYear] = useState(currentYear);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [envelopes, setEnvelopes] = useState<Envelope[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [newEnvelope, setNewEnvelope] = useState({ fiscalYear: String(currentYear), allocatedAmount: '', note: '' });
  const [newExpense, setNewExpense] = useState({ fiscalYear: String(currentYear), category: '', label: '', amount: '', expenseDate: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/budget/dashboard?year=${year}`).then((r) => r.json()).then(setDashboard);
    fetch(`/api/organizations/${organizationId}/budget/envelopes`).then((r) => r.json()).then(setEnvelopes);
    fetch(`/api/organizations/${organizationId}/budget/expenses`).then((r) => r.json()).then(setExpenses);
  };
  useEffect(load, [organizationId, year]);

  async function addEnvelope() {
    const res = await fetch(`/api/organizations/${organizationId}/budget/envelopes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fiscalYear: parseInt(newEnvelope.fiscalYear, 10), allocatedAmount: parseFloat(newEnvelope.allocatedAmount),
        note: newEnvelope.note || undefined,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewEnvelope({ fiscalYear: String(currentYear), allocatedAmount: '', note: '' });
    load();
  }

  async function updateEnvelope(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/budget/envelopes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteEnvelope(id: string) {
    await fetch(`/api/budget/envelopes/${id}`, { method: 'DELETE' });
    load();
  }

  async function addExpense() {
    const res = await fetch(`/api/organizations/${organizationId}/budget/expenses`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fiscalYear: parseInt(newExpense.fiscalYear, 10), category: newExpense.category || undefined,
        label: newExpense.label, amount: parseFloat(newExpense.amount), expenseDate: newExpense.expenseDate,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? "Échec de l'ajout."); return; }
    setNewExpense({ fiscalYear: String(currentYear), category: '', label: '', amount: '', expenseDate: '' });
    load();
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/budget/expenses/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-6">
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <div className="flex items-center gap-2">
        <Label htmlFor="budget-year">Exercice</Label>
        <Input id="budget-year" type="number" className="w-28" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)} />
      </div>

      {dashboard && (
        <Card>
          <CardHeader><CardTitle className="text-base">Tableau de bord {dashboard.fiscalYear}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div><p className="text-muted-foreground">Budget alloué</p><p className="text-xl font-semibold">{eur(dashboard.allocated)}</p></div>
            <div><p className="text-muted-foreground">Coût prévisionnel (actions)</p><p className="text-xl font-semibold">{eur(dashboard.plannedCost)}</p></div>
            <div><p className="text-muted-foreground">Dépenses réelles</p><p className="text-xl font-semibold">{eur(dashboard.actualSpent)}</p></div>
            <div>
              <p className="text-muted-foreground">Reste disponible</p>
              <p className={`text-xl font-semibold ${dashboard.remaining < 0 ? 'text-red-600' : ''}`}>{eur(dashboard.remaining)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium">Enveloppes budgétaires</h3>
        <ul className="space-y-2">
          {envelopes?.map((e) => (
            <li key={e.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline">{e.fiscalYear}</Badge>
                    <Input className="w-32" type="number" defaultValue={e.allocatedAmount}
                      onBlur={(ev) => { const v = parseFloat(ev.target.value); if (!Number.isNaN(v) && v !== e.allocatedAmount) updateEnvelope(e.id, { allocatedAmount: v }); }} />
                    {e.note && <span className="text-muted-foreground">{e.note}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteEnvelope(e.id)}>Supprimer</Button>
                </CardContent>
              </Card>
            </li>
          ))}
          {envelopes?.length === 0 && <p className="text-sm text-muted-foreground">Aucune enveloppe pour le moment.</p>}
        </ul>

        <Card className="mt-3">
          <CardHeader><CardTitle className="text-base">Créer une enveloppe</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div><Label htmlFor="env-year">Exercice</Label><Input id="env-year" type="number" value={newEnvelope.fiscalYear} onChange={(e) => setNewEnvelope((v) => ({ ...v, fiscalYear: e.target.value }))} /></div>
            <div><Label htmlFor="env-amount">Montant alloué (€)</Label><Input id="env-amount" type="number" value={newEnvelope.allocatedAmount} onChange={(e) => setNewEnvelope((v) => ({ ...v, allocatedAmount: e.target.value }))} /></div>
            <div className="sm:col-span-3"><Label htmlFor="env-note">Note</Label><Textarea id="env-note" rows={2} value={newEnvelope.note} onChange={(e) => setNewEnvelope((v) => ({ ...v, note: e.target.value }))} /></div>
            <div className="sm:col-span-3"><Button onClick={addEnvelope} disabled={!newEnvelope.fiscalYear || !newEnvelope.allocatedAmount}>Créer l&apos;enveloppe</Button></div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium">Dépenses</h3>
        <ul className="space-y-2">
          {expenses?.map((e) => (
            <li key={e.id}>
              <Card>
                <CardContent className="flex items-center justify-between py-4 text-sm">
                  <div>
                    <p className="font-medium">{e.label} — {eur(e.amount)}</p>
                    <p className="text-muted-foreground">
                      {e.fiscalYear} · {new Date(e.expenseDate).toLocaleDateString('fr-FR')}
                      {e.category && ` · ${e.category}`}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteExpense(e.id)}>Supprimer</Button>
                </CardContent>
              </Card>
            </li>
          ))}
          {expenses?.length === 0 && <p className="text-sm text-muted-foreground">Aucune dépense enregistrée.</p>}
        </ul>

        <Card className="mt-3">
          <CardHeader><CardTitle className="text-base">Enregistrer une dépense</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="exp-year">Exercice</Label><Input id="exp-year" type="number" value={newExpense.fiscalYear} onChange={(e) => setNewExpense((v) => ({ ...v, fiscalYear: e.target.value }))} /></div>
            <div>
              <Label htmlFor="exp-category">Catégorie</Label>
              <Select value={newExpense.category || undefined} onValueChange={(category) => setNewExpense((v) => ({ ...v, category }))}>
                <SelectTrigger id="exp-category"><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2"><Label htmlFor="exp-label">Libellé</Label><Input id="exp-label" value={newExpense.label} onChange={(e) => setNewExpense((v) => ({ ...v, label: e.target.value }))} /></div>
            <div><Label htmlFor="exp-amount">Montant (€)</Label><Input id="exp-amount" type="number" value={newExpense.amount} onChange={(e) => setNewExpense((v) => ({ ...v, amount: e.target.value }))} /></div>
            <div><Label htmlFor="exp-date">Date</Label><Input id="exp-date" type="date" value={newExpense.expenseDate} onChange={(e) => setNewExpense((v) => ({ ...v, expenseDate: e.target.value }))} /></div>
            <div className="sm:col-span-2">
              <Button onClick={addExpense} disabled={!newExpense.label.trim() || !newExpense.amount || !newExpense.expenseDate}>Enregistrer la dépense</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
