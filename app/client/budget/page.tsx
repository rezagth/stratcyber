'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Dashboard = {
  fiscalYear: number; allocated: number; plannedCost: number; actualSpent: number;
  remaining: number; byCategory: Record<string, number>;
};
type Expense = { id: string; fiscalYear: number; category: string | null; label: string; amount: number; expenseDate: string; note: string | null };

const currentYear = new Date().getFullYear();
const eur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

export default function ClientBudgetPage() {
  const [year, setYear] = useState(currentYear);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/client/budget/dashboard?year=${year}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setDashboard(await res.json());
      })
      .catch((e: Error) => setError(e.message));
    fetch('/api/client/budget/expenses').then((r) => r.json()).then(setExpenses);
  }, [year]);

  const yearExpenses = expenses?.filter((e) => e.fiscalYear === year) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mon budget cybersécurité</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="client-budget-year">Exercice</Label>
        <Input id="client-budget-year" type="number" className="w-28" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10) || currentYear)} />
      </div>

      {dashboard && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-base">Tableau de bord {dashboard.fiscalYear}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
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

      <h2 className="mb-3 text-lg font-medium">Dépenses de l&apos;exercice</h2>
      <ul className="space-y-2">
        {yearExpenses.map((e) => (
          <li key={e.id}>
            <Card>
              <CardContent className="py-4 text-sm">
                <p className="font-medium">{e.label} — {eur(e.amount)}</p>
                <p className="text-muted-foreground">
                  {new Date(e.expenseDate).toLocaleDateString('fr-FR')}
                  {e.category && ` · ${e.category}`}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
        {expenses !== null && yearExpenses.length === 0 && <p className="text-sm text-muted-foreground">Aucune dépense enregistrée pour cet exercice.</p>}
      </ul>
    </div>
  );
}
