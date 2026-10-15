'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PlanItem = {
  id?: string;
  title?: string;
  description?: string;
  priority?: string;
  owner?: string;
  estimatedDuration?: string;
};
type ClientAuditDetail = {
  id: string;
  createdAt: string;
  score: number | null;
  maturity: string | null;
  recommendations: string | null;
  actionPlan: string | null;
};

const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: 'Critique',
  HIGH: 'Haute',
  MEDIUM: 'Moyenne',
  LOW: 'Basse',
};

function parsePlan(raw: string | null): PlanItem[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function ClientAuditPage() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<ClientAuditDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/client/audits/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Diagnostic introuvable.');
        setAudit(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, [id]);

  const plan = parsePlan(audit?.actionPlan ?? null);
  const recommendations = (audit?.recommendations ?? '').split('\n').filter((r) => r.trim());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm underline">← Retour à mes diagnostics</Link>
      {error && <p role="alert" className="mt-6 text-sm text-red-600">{error}</p>}
      {!error && !audit && <p className="mt-6 text-sm text-muted-foreground">Chargement…</p>}
      {audit && (
        <div className="mt-4 space-y-6">
          <h1 className="text-2xl font-semibold">
            Diagnostic du {new Date(audit.createdAt).toLocaleDateString('fr-FR')}
          </h1>
          <Card>
            <CardContent className="pt-6 text-lg">
              Score : <strong>{audit.score ?? '—'}</strong> / 100 — Maturité : <strong>{audit.maturity ?? '—'}</strong>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Recommandations</CardTitle></CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ol>
              </CardContent>
            </Card>
          )}

          {plan.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Plan d'action</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  {plan.map((item, i) => (
                    <li key={item.id ?? i} className="rounded border p-3">
                      <div className="font-medium">{item.title}</div>
                      {item.description && <p className="mt-1 text-muted-foreground">{item.description}</p>}
                      <p className="mt-1 text-xs">
                        {item.priority && <>Priorité : {PRIORITY_LABEL[item.priority] ?? item.priority}</>}
                        {item.estimatedDuration && <> · Durée estimée : {item.estimatedDuration}</>}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
