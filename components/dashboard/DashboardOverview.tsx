'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarClock, ListChecks, Scale, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type OverviewReg = { key: string; name: string; score: number; deadline: string; color: string };
export type OverviewProps = {
  globalScore: number;
  maturity: string;
  crazy: { score: number; label: string; emoji?: string } | null;
  legalRisk: number;
  legalRiskLevel: string;
  regs: OverviewReg[];
  actionCounts: { critical: number; high: number; medium: number; low: number; total: number };
  scores: Record<string, number>;
  history: { date: string; score: number }[];
  answersCount: number;
  radar?: React.ReactNode;
};

const tone = (v: number) => (v < 40 ? 'var(--destructive)' : v < 70 ? 'var(--warning)' : 'var(--success)');

export function Panel({ title, subtitle, icon: Icon, children, className, action }: {
  title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode; className?: string; action?: React.ReactNode;
}) {
  return (
    <section className={cn('rounded-2xl border bg-card p-5 shadow-sm', className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Donut({ parts, center, label }: { parts: { value: number; color: string }[]; center: string; label: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 52, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0" role="img" aria-label={`${label} : ${center}`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--muted)" strokeWidth="16" />
      {parts.filter((p) => p.value > 0).map((p, i) => {
        const len = (p.value / total) * c;
        const el = (
          <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={p.color} strokeWidth="16"
            strokeDasharray={`${Math.max(len - 2, 0)} ${c}`} strokeDashoffset={-offset}
            transform="rotate(-90 70 70)" strokeLinecap="butt" />
        );
        offset += len;
        return el;
      })}
      <text x="70" y="66" textAnchor="middle" className="fill-foreground text-[26px] font-semibold">{center}</text>
      <text x="70" y="84" textAnchor="middle" className="fill-muted-foreground text-[10px]">{label}</text>
    </svg>
  );
}

export function Trend({ points }: { points: { date: string; score: number }[] }) {
  const W = 600, H = 180, pad = 28;
  const xs = (i: number) => pad + (points.length === 1 ? (W - 2 * pad) / 2 : (i * (W - 2 * pad)) / (points.length - 1));
  const ys = (v: number) => H - pad - (Math.min(Math.max(v, 0), 100) / 100) * (H - 2 * pad);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xs(i)},${ys(p.score)}`).join(' ');
  const area = `${line} L${xs(points.length - 1)},${H - pad} L${xs(0)},${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="Évolution du score global">
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={W - pad} y1={ys(g)} y2={ys(g)} stroke="var(--border)" strokeDasharray="3 4" />
          <text x={pad - 6} y={ys(g) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">{g}</text>
        </g>
      ))}
      {points.length > 1 && <path d={area} fill="url(#trendFill)" />}
      {points.length > 1 && <path d={line} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={xs(i)} cy={ys(p.score)} r="4.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2.5" />
          <text x={xs(i)} y={ys(p.score) - 10} textAnchor="middle" className="fill-foreground text-[10px] font-semibold">{p.score}</text>
          <text x={xs(i)} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[9px]">{p.date}</text>
        </g>
      ))}
    </svg>
  );
}

export function DashboardOverview(p: OverviewProps) {
  const riskTone = p.legalRisk >= 80 ? 'destructive' : p.legalRisk >= 60 ? 'warning' : 'success';
  const riskBg: Record<string, string> = {
    destructive: 'from-destructive/15 to-destructive/5 border-destructive/25',
    warning: 'from-warning/25 to-warning/5 border-warning/30',
    success: 'from-success/15 to-success/5 border-success/25',
  };
  const domains = Object.entries(p.scores).sort((a, b) => a[1] - b[1]);
  const critical = domains.filter(([, v]) => v < 50).length;

  return (
    <div className="space-y-6">
      {/* Bandeau de synthèse */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.3_0.1_266)] to-[oklch(0.22_0.07_270)] p-6 text-white shadow-md lg:col-span-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <p className="text-sm text-white/70">Score global</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight">{p.globalScore}<span className="text-2xl text-white/60">%</span></p>
          <p className="mt-1 text-sm text-white/70">Maturité : {p.maturity || 'N/A'}</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/90" style={{ width: `${Math.min(p.globalScore, 100)}%` }} />
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-sm">
            <span className="text-white/70">Crazy Score {p.crazy?.emoji}</span>
            <span className="font-semibold">{p.crazy ? `${p.crazy.score} · ${p.crazy.label}` : 'N/A'}</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5">
          <div className="rounded-2xl border bg-gradient-to-br from-accent to-card p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><ListChecks className="h-4 w-4" />Actions recommandées</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{p.actionCounts.total}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge variant="destructive">{p.actionCounts.critical} critique</Badge>
              <Badge variant="destructive">{p.actionCounts.high} haute</Badge>
              <Badge variant="warning">{p.actionCounts.medium} moyenne</Badge>
              <Badge variant="info">{p.actionCounts.low} basse</Badge>
            </div>
          </div>
          <div className="rounded-2xl border bg-gradient-to-br from-warning/20 to-card p-5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-4 w-4" />Domaines critiques</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight">{critical}</p>
            <p className="mt-3 text-xs text-muted-foreground">sur {domains.length} domaines évalués · {p.answersCount} réponses</p>
          </div>
        </div>

        <div className={cn('rounded-2xl border bg-gradient-to-br p-5 lg:col-span-3', riskBg[riskTone])}>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><Scale className="h-4 w-4" />Risque légal</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight" style={{ color: `var(--${riskTone})` }}>
            {p.legalRisk}<span className="text-lg text-muted-foreground">/100</span>
          </p>
          <Badge className="mt-3" variant={riskTone === 'destructive' ? 'destructive' : riskTone === 'warning' ? 'warning' : 'success'}>{p.legalRiskLevel}</Badge>
          <p className="mt-3 text-xs text-muted-foreground">Plus la conformité est basse, plus le risque est élevé.</p>
        </div>
      </div>

      {/* Conformité + répartition actions */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Conformité par réglementation" subtitle="Score sur 100 et échéance" icon={ShieldCheck} className="lg:col-span-7">
          <ul className="space-y-3.5">
            {p.regs.map((r) => {
              const status = r.score < 40 ? 'Critique' : r.score < 70 ? 'À améliorer' : 'Conforme';
              const urgent = new Date(r.deadline) < new Date(Date.now() + 90 * 86400000);
              return (
                <li key={r.key} className="flex items-center gap-3">
                  <span className={cn('flex h-9 w-12 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white', r.color)}>{r.key.slice(0, 5)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{r.name}</span>
                      <span className="font-semibold tabular-nums">{r.score}<span className="text-muted-foreground">/100</span></span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: tone(r.score) }} />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{new Date(r.deadline).toLocaleDateString('fr-FR')}{urgent && ' · urgent'}</span>
                      <span>{status}</span>
                    </div>
                  </div>
                </li>
              );
            })}
            {p.regs.length === 0 && <li className="text-sm text-muted-foreground">Aucune réglementation applicable renseignée.</li>}
          </ul>
        </Panel>

        <Panel title="Répartition des actions" subtitle="Par niveau de priorité" icon={ListChecks} className="lg:col-span-5"
          action={<Button asChild variant="ghost" size="sm"><Link href="/dashboard/roadmap">Roadmap<ArrowRight className="h-3.5 w-3.5" /></Link></Button>}>
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <Donut center={String(p.actionCounts.total)} label="actions" parts={[
              { value: p.actionCounts.critical, color: 'oklch(0.42 0.2 25)' },
              { value: p.actionCounts.high, color: 'var(--destructive)' },
              { value: p.actionCounts.medium, color: 'var(--warning)' },
              { value: p.actionCounts.low, color: 'var(--info)' },
            ]} />
            <ul className="w-full space-y-2.5 text-sm">
              {[
                ['Critique', p.actionCounts.critical, 'oklch(0.42 0.2 25)'],
                ['Haute', p.actionCounts.high, 'var(--destructive)'],
                ['Moyenne', p.actionCounts.medium, 'var(--warning)'],
                ['Basse', p.actionCounts.low, 'var(--info)'],
              ].map(([l, v, c]) => (
                <li key={String(l)} className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: String(c) }} />{l}</span>
                  <span className="font-semibold tabular-nums">{v as number}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">{p.actionCounts.total ? Math.round(((v as number) / p.actionCounts.total) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Domaines + radar */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel title="Score par domaine" subtitle="Du plus faible au plus solide" icon={ShieldCheck} className="lg:col-span-7">
          <ul className="space-y-3">
            {domains.map(([name, v]) => (
              <li key={name} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_2.5rem]">
                <span className="truncate text-muted-foreground">{name}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(v, 100)}%`, background: tone(v) }} />
                </div>
                <span className="text-right font-semibold tabular-nums">{Math.round(v)}</span>
              </li>
            ))}
            {domains.length === 0 && <li className="text-sm text-muted-foreground">Aucun score disponible.</li>}
          </ul>
        </Panel>
        <Panel title="Vue radar" subtitle="Équilibre entre les domaines" className="lg:col-span-5">
          {p.radar}
        </Panel>
      </div>

      {/* Tendance */}
      <Panel title="Évolution du score global" subtitle={p.history.length > 1 ? 'Audit après audit' : 'Réalisez un second audit pour voir la tendance'} icon={TrendingUp}>
        {p.history.length > 0 ? <Trend points={p.history} /> : <p className="text-sm text-muted-foreground">Pas encore d&apos;historique.</p>}
      </Panel>
    </div>
  );
}
