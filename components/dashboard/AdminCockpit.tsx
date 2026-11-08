'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardX, FileWarning, Plus, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/dashboard/DashboardOverview';
import { NewClientForm } from '@/components/dossier/new-client-form';
import { cn } from '@/lib/utils';

type Org = {
  id: string; name: string; sector: string | null; size: string | null;
  score: number | null; maturity: string | null; overdueActions: number; expiringEvidence: number;
};

const tone = (v: number) => (v < 40 ? 'var(--destructive)' : v < 70 ? 'var(--warning)' : 'var(--success)');

/** Accueil de l'admin : la santé de son portefeuille de clients, pas un score personnel. */
export function AdminCockpit() {
  const [orgs, setOrgs] = useState<Org[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch('/api/organizations')
      .then(async (r) => { if (!r.ok) throw new Error('Chargement impossible.'); setOrgs(await r.json()); })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;
  if (!orgs) return <p className="text-sm text-muted-foreground">Chargement…</p>;

  const scored = orgs.filter((o) => o.score !== null);
  const avg = scored.length ? Math.round(scored.reduce((s, o) => s + (o.score ?? 0), 0) / scored.length) : null;
  const overdue = orgs.reduce((s, o) => s + o.overdueActions, 0);
  const expiring = orgs.reduce((s, o) => s + o.expiringEvidence, 0);
  const noDiag = orgs.filter((o) => o.score === null).length;
  const urgent = orgs.filter((o) => o.overdueActions > 0 || o.expiringEvidence > 0)
    .sort((a, b) => b.overdueActions + b.expiringEvidence - (a.overdueActions + a.expiringEvidence));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Vos clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ce qui demande votre attention aujourd&apos;hui, client par client.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/strategie">Nouvel audit</Link></Button>
          <Button onClick={() => setAdding((v) => !v)}><Plus className="h-4 w-4" />Nouveau client</Button>
        </div>
      </div>

      {adding && <div className="rounded-2xl border bg-card p-4 shadow-sm"><NewClientForm /></div>}

      {orgs.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">Aucun client pour le moment</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Créez votre premier client : un guide pas à pas vous accompagne ensuite, du cadrage de la mission jusqu&apos;à l&apos;accès du client.</p>
          <Button className="mt-4" onClick={() => setAdding(true)}><Plus className="h-4 w-4" />Créer mon premier client</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.1_266)] to-[oklch(0.22_0.07_270)] p-5 text-white shadow-md">
              <p className="flex items-center gap-2 text-sm text-white/70"><Users className="h-4 w-4" />Clients suivis</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{orgs.length}</p>
              <p className="mt-2 text-xs text-white/70">{avg !== null ? `Score moyen ${avg}/100` : 'Aucun diagnostic partagé'}</p>
            </div>
            <div className={cn('rounded-2xl border bg-gradient-to-br to-card p-5', overdue ? 'from-destructive/15' : 'from-success/15')}>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4" />Actions en retard</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight" style={overdue ? { color: 'var(--destructive)' } : undefined}>{overdue}</p>
              <p className="mt-2 text-xs text-muted-foreground">tous clients confondus</p>
            </div>
            <div className={cn('rounded-2xl border bg-gradient-to-br to-card p-5', expiring ? 'from-warning/25' : 'from-success/15')}>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><FileWarning className="h-4 w-4" />Preuves qui expirent</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{expiring}</p>
              <p className="mt-2 text-xs text-muted-foreground">sous 30 jours ou déjà expirées</p>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-accent to-card p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><ClipboardX className="h-4 w-4" />Sans diagnostic partagé</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight">{noDiag}</p>
              <p className="mt-2 text-xs text-muted-foreground">audit à réaliser ou à partager</p>
            </div>
          </div>

          <Panel title="À traiter en priorité" subtitle="Clients avec une échéance dépassée" icon={AlertTriangle}>
            {urgent.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" />Rien d&apos;urgent : aucune action en retard, aucune preuve qui expire.</p>
            ) : (
              <ul className="divide-y">
                {urgent.slice(0, 6).map((o) => (
                  <li key={o.id}>
                    <Link href={`/dashboard/organizations/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:text-primary">
                      <span className="font-medium">{o.name}</span>
                      <span className="flex flex-wrap items-center gap-1.5">
                        {o.overdueActions > 0 && <Badge variant="destructive">{o.overdueActions} action{o.overdueActions > 1 ? 's' : ''} en retard</Badge>}
                        {o.expiringEvidence > 0 && <Badge variant="warning">{o.expiringEvidence} preuve{o.expiringEvidence > 1 ? 's' : ''} à renouveler</Badge>}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Tous vos clients" subtitle="Score du dernier diagnostic partagé" icon={ShieldCheck}
            action={<Button asChild variant="ghost" size="sm"><Link href="/dashboard/organizations">Gérer<ArrowRight className="h-3.5 w-3.5" /></Link></Button>}>
            <ul className="divide-y">
              {orgs.map((o) => (
                <li key={o.id}>
                  <Link href={`/dashboard/organizations/${o.id}`} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 hover:text-primary sm:grid-cols-[1.4fr_1fr_auto]">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{o.name}</span>
                      <span className="block text-xs text-muted-foreground">{o.sector ?? '—'} · {o.size ?? '—'}</span>
                    </span>
                    <span className="hidden sm:block">
                      {o.score !== null ? (
                        <span className="flex items-center gap-2">
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full" style={{ width: `${o.score}%`, background: tone(o.score) }} /></span>
                          <span className="w-16 text-right text-xs tabular-nums"><strong>{Math.round(o.score)}</strong>/100</span>
                        </span>
                      ) : <span className="text-xs text-muted-foreground">Pas de diagnostic partagé</span>}
                    </span>
                    <span className="flex items-center gap-1.5">
                      {o.overdueActions > 0 && <Badge variant="destructive">{o.overdueActions}</Badge>}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </>
      )}
    </div>
  );
}
