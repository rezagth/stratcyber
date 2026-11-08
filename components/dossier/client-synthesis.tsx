'use client';

import { useEffect, useState } from 'react';
import { ListChecks, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Panel, Donut, Trend } from '@/components/dashboard/DashboardOverview';

type Audit = { id: string; organizationId: string | null; createdAt: string; score: number | null; maturity: string | null; sharedWithClient?: boolean };
type Item = { status: string; priority: string; dueDate: string | null };
type Control = { status: string };

/** Synthèse d'UN client : score, avancement du plan, conformité des contrôles. Le score se lit ici, par client. */
export function ClientSynthesis({ organizationId }: { organizationId: string }) {
  const [audits, setAudits] = useState<Audit[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [controls, setControls] = useState<Control[]>([]);

  useEffect(() => {
    const json = (u: string) => fetch(u).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    json('/api/audits').then((a: Audit[]) => setAudits(a.filter((x) => x.organizationId === organizationId)));
    json(`/api/organizations/${organizationId}/action-plan`).then((d) => setItems(Array.isArray(d) ? d : []));
    json(`/api/organizations/${organizationId}/controls`).then((d) => setControls(Array.isArray(d) ? d : []));
  }, [organizationId]);

  if (audits === null) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  const sorted = [...audits].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const latest = sorted[0];
  const total = items.length;
  const done = items.filter((i) => i.status === 'Terminé').length;
  const doing = items.filter((i) => i.status === 'En cours').length;
  const blocked = items.filter((i) => i.status === 'Bloqué').length;
  const todo = total - done - doing - blocked;
  const overdue = items.filter((i) => i.status !== 'Terminé' && i.dueDate && new Date(i.dueDate) < new Date()).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const ctl = (s: string) => controls.filter((c) => c.status === s).length;
  const history = [...audits].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)).slice(-8)
    .map((a) => ({ date: new Date(a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), score: Math.round(a.score ?? 0) }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.1_266)] to-[oklch(0.22_0.07_270)] p-5 text-white shadow-md">
          <p className="text-sm text-white/70">Score du dernier diagnostic</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{latest?.score != null ? Math.round(latest.score) : '—'}<span className="text-xl text-white/60">/100</span></p>
          <p className="mt-1 text-xs text-white/70">{latest ? `Maturité : ${latest.maturity ?? 'N/A'}` : 'Aucun audit rattaché à ce client'}</p>
          {latest && <div className="mt-3"><Badge variant={latest.sharedWithClient ? 'success' : 'warning'}>{latest.sharedWithClient ? 'Partagé avec le client' : 'Non partagé'}</Badge></div>}
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-success/15 to-card p-5">
          <p className="text-sm text-muted-foreground">Plan d&apos;action réalisé</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{pct}<span className="text-xl text-muted-foreground">%</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{done}/{total} actions · {overdue} en retard</p>
        </div>
        <div className="rounded-2xl border bg-gradient-to-br from-accent to-card p-5">
          <p className="text-sm text-muted-foreground">Contrôles conformes</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{ctl('Conforme')}<span className="text-xl text-muted-foreground">/{controls.length}</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{ctl('Non conforme')} non conforme(s) · {ctl('Partiellement conforme')} partiel(s)</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Avancement du plan d'action" subtitle="Par statut" icon={ListChecks}>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Donut center={`${pct}%`} label="réalisé" parts={[
              { value: done, color: 'var(--success)' }, { value: doing, color: 'var(--info)' },
              { value: blocked, color: 'var(--destructive)' }, { value: todo, color: 'var(--muted-foreground)' },
            ]} />
            <ul className="w-full space-y-2 text-sm">
              {[['Terminé', done, 'var(--success)'], ['En cours', doing, 'var(--info)'], ['Bloqué', blocked, 'var(--destructive)'], ['Non commencé', todo, 'var(--muted-foreground)']].map(([l, v, c]) => (
                <li key={String(l)} className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: String(c) }} />{l}</span><strong className="tabular-nums">{v as number}</strong></li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel title="Évolution du score" subtitle={history.length > 1 ? 'Audit après audit' : 'Un second audit affichera la tendance'} icon={TrendingUp}>
          {history.length ? <Trend points={history} /> : <p className="text-sm text-muted-foreground">Pas encore d&apos;audit pour ce client.</p>}
        </Panel>
      </div>

      <Panel title="Conformité des contrôles" icon={ShieldCheck}>
        {controls.length === 0 ? <p className="text-sm text-muted-foreground">Aucun contrôle saisi.</p> : (
          <div className="flex flex-wrap gap-2">
            {['Conforme', 'Partiellement conforme', 'Non conforme', 'Non évalué', 'Non applicable'].map((s) => (
              <Badge key={s} variant={s === 'Conforme' ? 'success' : s === 'Non conforme' ? 'destructive' : s === 'Partiellement conforme' ? 'warning' : 'secondary'}>{ctl(s)} {s.toLowerCase()}</Badge>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
