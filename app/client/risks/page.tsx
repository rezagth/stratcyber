'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Risk = {
  id: string; title: string; description: string | null; likelihood: number; impact: number;
  treatment: string; owner: string | null; dueDate: string | null; status: string;
};
type Incident = {
  id: string; title: string; severity: string; status: string; detectedAt: string; personalDataInvolved: boolean;
};
type Vulnerability = { id: string; title: string; severity: string; cvssScore: number | null; status: string; discoveredAt: string };

function riskLevel(likelihood: number, impact: number): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' } {
  const score = likelihood * impact;
  if (score >= 15) return { label: 'Critique', variant: 'destructive' };
  if (score >= 8) return { label: 'Élevé', variant: 'destructive' };
  if (score >= 4) return { label: 'Modéré', variant: 'secondary' };
  return { label: 'Faible', variant: 'outline' };
}

const SEVERITY_VARIANT = (s: string): 'default' | 'destructive' | 'secondary' | 'outline' =>
  s === 'Critique' || s === 'Haute' ? 'destructive' : 'secondary';

export default function ClientRisksPage() {
  const [risks, setRisks] = useState<Risk[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [vulns, setVulns] = useState<Vulnerability[] | null>(null);

  useEffect(() => {
    fetch('/api/client/risks').then((r) => r.json()).then(setRisks);
    fetch('/api/client/incidents').then((r) => r.json()).then(setIncidents);
    fetch('/api/client/vulnerabilities').then((r) => r.json()).then(setVulns);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Mes risques et incidents</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">Registre des risques</h2>
        {risks === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {risks?.length === 0 && <p className="text-sm text-muted-foreground">Aucun risque enregistré.</p>}
        <ul className="space-y-2">
          {risks?.map((risk) => {
            const level = riskLevel(risk.likelihood, risk.impact);
            return (
              <li key={risk.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{risk.title}</span>
                      <Badge variant={level.variant}>{level.label}</Badge>
                    </div>
                    <span className="text-muted-foreground">{risk.treatment} · {risk.status}</span>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-medium">Registre d&apos;incidents</h2>
        {incidents === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {incidents?.length === 0 && <p className="text-sm text-muted-foreground">Aucun incident déclaré.</p>}
        <ul className="space-y-2">
          {incidents?.map((incident) => (
            <li key={incident.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{incident.title}</span>
                    <Badge variant={SEVERITY_VARIANT(incident.severity)}>{incident.severity}</Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(incident.detectedAt).toLocaleDateString('fr-FR')} · {incident.status}
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Vulnérabilités</h2>
        {vulns === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {vulns?.length === 0 && <p className="text-sm text-muted-foreground">Aucune vulnérabilité enregistrée.</p>}
        <ul className="space-y-2">
          {vulns?.map((vuln) => (
            <li key={vuln.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{vuln.title}</span>
                    <Badge variant={SEVERITY_VARIANT(vuln.severity)}>{vuln.severity}</Badge>
                  </div>
                  <span className="text-muted-foreground">{vuln.status}</span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
