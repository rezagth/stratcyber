'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** Sélecteur de mois/exercice + lien de téléchargement du rapport mensuel PDF (module K). */
export function MonthlyReportButton({ apiBase }: { apiBase: string }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={month} onValueChange={setMonth}>
        <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input type="number" className="w-24" value={year} onChange={(e) => setYear(e.target.value)} />
      <a href={`${apiBase}?month=${month}&year=${year}`} target="_blank" rel="noreferrer">
        <Button variant="outline">Rapport mensuel (PDF)</Button>
      </a>
    </div>
  );
}
