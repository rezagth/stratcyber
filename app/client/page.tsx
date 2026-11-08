'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingGuide } from '@/components/client/onboarding-guide';
import { Panel, Donut, Trend } from '@/components/dashboard/DashboardOverview';
import { AlertTriangle, ArrowRight, CheckCircle2, ClipboardList, FileText, FolderCheck, Landmark, ListChecks, ShieldCheck, TrendingUp, User2, Wallet, Building2, BookOpen } from 'lucide-react';
import { MonthlyReportButton } from '@/components/monthly-report-button';

type ClientAction = { id: string; priority: string; status: string; dueDate: string | null; proofOfCompletion?: string | null };
type ClientAudit = { id: string; createdAt: string; score: number | null; maturity: string | null };

export default function ClientHomePage() {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<ClientAudit[] | null>(null);
  const [actions, setActions] = useState<ClientAction[]>([]);
  const [profile, setProfile] = useState<{ sector: string | null; headcount: number | null; missionScope: string | null } | null>(null);
  const [actionsLoaded, setActionsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/audits')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setAudits(await res.json());
      })
      .catch((e: Error) => setError(e.message));
    fetch('/api/client/action-plan')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setActions(Array.isArray(d) ? d : []))
      .catch(() => setActions([]))
      .finally(() => setActionsLoaded(true));
    fetch('/api/client/organization')
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  const latest = audits && audits.length ? [...audits].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0] : null;
  const total = actions.length;
  const done = actions.filter((a) => a.status === 'Terminé').length;
  const inProgress = actions.filter((a) => a.status === 'En cours').length;
  const blocked = actions.filter((a) => a.status === 'Bloqué').length;
  const todo = total - done - inProgress - blocked;
  const overdue = actions.filter((a) => a.status !== 'Terminé' && a.dueDate && new Date(a.dueDate) < new Date()).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const history = audits ? [...audits].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)).slice(-8).map((a) => ({ date: new Date(a.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), score: Math.round(a.score ?? 0) })) : [];
  const shortcuts = [
    { href: '/client/action-plan', label: 'Plan d\'action', desc: 'Suivez vos actions et votre avancement', icon: ListChecks },
    { href: '/client/controls', label: 'Contrôles', desc: 'Niveau de conformité et preuves', icon: ShieldCheck },
    { href: '/client/risks', label: 'Risques et incidents', desc: 'Registre des risques et vulnérabilités', icon: AlertTriangle },
    { href: '/client/evidence', label: 'Mes preuves', desc: 'Triées par échéance', icon: FolderCheck },
    { href: '/client/policies', label: 'Politiques', desc: 'Documents à relire et valider', icon: FileText },
    { href: '/client/security-answers', label: 'Questionnaires', desc: 'Réponses réutilisables, export CSV', icon: ClipboardList },
    { href: '/client/governance', label: 'Gouvernance', desc: 'Comités et revue annuelle', icon: Landmark },
    { href: '/client/suppliers', label: 'Fournisseurs', desc: 'Registre et clauses de sécurité', icon: Building2 },
    { href: '/client/budget', label: 'Budget', desc: 'Prévisionnel et dépenses', icon: Wallet },
    { href: '/client/training', label: 'Formation', desc: 'Ebooks et quiz', icon: BookOpen },
    { href: '/client/profile', label: 'Profil', desc: 'Périmètre et contacts', icon: User2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Espace client InfraCyb</h1>
          <p className="mt-1 text-sm text-muted-foreground">{session?.user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthlyReportButton apiBase="/api/client/monthly-report" />
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/auth/login' })}>Se déconnecter</Button>
        </div>
      </header>

      <OnboardingGuide userKey={session?.user?.email} state={{
        loaded: actionsLoaded && audits !== null && profile !== null,
        profileComplete: Boolean(profile?.sector && profile?.headcount),
        hasDiagnostic: (audits?.length ?? 0) > 0,
        actionStarted: actions.some((a) => a.status !== 'Non commencé'),
        proofAdded: actions.some((a) => Boolean(a.proofOfCompletion)),
      }} />

      {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.1_266)] to-[oklch(0.22_0.07_270)] p-6 text-white shadow-md lg:col-span-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm text-white/70">Niveau de sécurité</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">{latest?.score != null ? Math.round(latest.score) : '—'}<span className="text-2xl text-white/60">/100</span></p>
          <p className="mt-1 text-sm text-white/70">Maturité : {latest?.maturity ?? 'non évaluée'}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/90" style={{ width: `${Math.min(latest?.score ?? 0, 100)}%` }} />
          </div>
          <Link href={latest ? `/client/audits/${latest.id}` : '/client'} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white">
            Voir mon dernier diagnostic<ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:col-span-8">
          <div className="rounded-2xl border bg-gradient-to-br from-success/15 to-card p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" />Actions terminées</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{done}<span className="text-lg text-muted-foreground">/{total}</span></p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} /></div>
            <p className="mt-1.5 text-xs text-muted-foreground">{pct}% du plan réalisé</p>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-accent to-card p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><ListChecks className="h-4 w-4" />En cours</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{inProgress}</p>
            <p className="mt-3 text-xs text-muted-foreground">{todo} à démarrer{blocked ? ` · ${blocked} bloquée(s)` : ''}</p>
          </div>
          <div className={`rounded-2xl border bg-gradient-to-br p-5 ${overdue ? 'from-destructive/15' : 'from-muted'} to-card`}>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4" />En retard</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight" style={overdue ? { color: 'var(--destructive)' } : undefined}>{overdue}</p>
            <div className="mt-3">{overdue ? <Badge variant="destructive">À traiter</Badge> : <Badge variant="success">Dans les temps</Badge>}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Avancement du plan d'action" subtitle="Par statut" icon={ListChecks} className="lg:col-span-5"
          action={<Button asChild variant="ghost" size="sm"><Link href="/client/action-plan">Ouvrir<ArrowRight className="h-3.5 w-3.5" /></Link></Button>}>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Donut center={`${pct}%`} label="réalisé" parts={[
              { value: done, color: 'var(--success)' },
              { value: inProgress, color: 'var(--info)' },
              { value: blocked, color: 'var(--destructive)' },
              { value: todo, color: 'var(--muted-foreground)' },
            ]} />
            <ul className="w-full space-y-2.5 text-sm">
              {[['Terminé', done, 'var(--success)'], ['En cours', inProgress, 'var(--info)'], ['Bloqué', blocked, 'var(--destructive)'], ['Non commencé', todo, 'var(--muted-foreground)']].map(([l, v, c]) => (
                <li key={String(l)} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: String(c) }} />{l}</span>
                  <span className="font-semibold tabular-nums">{v as number}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel title="Évolution de mon score" subtitle={history.length > 1 ? 'Diagnostic après diagnostic' : 'Un second diagnostic affichera la tendance'} icon={TrendingUp} className="lg:col-span-7">
          {history.length > 0 ? <Trend points={history} /> : <p className="text-sm text-muted-foreground">{audits === null ? 'Chargement…' : 'Aucun diagnostic partagé pour le moment.'}</p>}
        </Panel>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Accès rapide</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shortcuts.map(({ href, label, desc, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground transition group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {audits && audits.length > 0 && (
        <Panel title="Mes diagnostics" icon={ShieldCheck}>
          <ul className="divide-y">
            {audits.map((audit) => (
              <li key={audit.id}>
                <Link href={`/client/audits/${audit.id}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">
                  <span>Diagnostic du {new Date(audit.createdAt).toLocaleDateString('fr-FR')}</span>
                  <span className="text-muted-foreground">Score <strong className="text-foreground">{audit.score ?? '—'}</strong>/100 · {audit.maturity ?? '—'}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
