'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type OnboardingState = {
  profileComplete: boolean;
  hasDiagnostic: boolean;
  actionStarted: boolean;
  proofAdded: boolean;
  loaded: boolean;
};

const STORAGE_KEY = 'infracyb-onboarding-dismissed';

/** Parcours « Premiers pas » du client : les étapes se cochent d'elles-mêmes à partir de ses données réelles. */
export function OnboardingGuide({ state, userKey }: { state: OnboardingState; userKey?: string | null }) {
  const storageKey = `${STORAGE_KEY}:${userKey ?? 'anon'}`;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try { setDismissed(localStorage.getItem(storageKey) === '1'); } catch { setDismissed(false); }
  }, [storageKey]);

  const steps = [
    { done: state.profileComplete, title: 'Vérifiez votre profil', desc: 'Secteur, effectif et périmètre : signalez à votre RSSI toute erreur.', href: '/client/profile', cta: 'Voir mon profil' },
    { done: state.hasDiagnostic, title: 'Consultez votre diagnostic', desc: 'Votre niveau de sécurité et vos points faibles, expliqués simplement.', href: '/client', cta: 'Voir mes diagnostics' },
    { done: state.actionStarted, title: 'Démarrez une première action', desc: 'Passez une action du plan en « En cours » pour lancer la dynamique.', href: '/client/action-plan', cta: 'Ouvrir mon plan d’action' },
    { done: state.proofAdded, title: 'Ajoutez une première preuve', desc: 'Un lien ou une attestation prouve qu’une action est réalisée.', href: '/client/action-plan', cta: 'Ajouter une preuve' },
    { done: false, manual: true, title: 'Sécurisez votre compte', desc: 'Activez la double authentification pour protéger vos données.', href: '/account/security', cta: 'Sécuriser mon compte' },
  ] as { done: boolean; manual?: boolean; title: string; desc: string; href: string; cta: string }[];

  const autoSteps = steps.filter((s) => !s.manual);
  const doneCount = autoSteps.filter((s) => s.done).length;
  const allDone = doneCount === autoSteps.length;
  const firstTodo = steps.findIndex((s) => !s.done);

  if (!state.loaded || dismissed) return null;

  const dismiss = () => {
    try { localStorage.setItem(storageKey, '1'); } catch { /* stockage indisponible : on masque seulement pour cette visite */ }
    setDismissed(true);
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-accent via-card to-card p-5 shadow-sm sm:p-6" aria-label="Premiers pas">
      <button onClick={dismiss} aria-label="Masquer les premiers pas" className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Sparkles className="h-5 w-5" /></span>
        <div className="pr-8">
          <h2 className="text-base font-semibold">{allDone ? 'Bravo, vos premiers pas sont terminés' : 'Bienvenue dans votre espace InfraCyb'}</h2>
          <p className="text-sm text-muted-foreground">
            {allDone ? 'Il ne reste qu’à suivre votre plan d’action. Vous pouvez masquer ce guide.' : `Cinq étapes pour bien démarrer · ${doneCount}/${autoSteps.length} réalisées automatiquement.`}
          </p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(doneCount / autoSteps.length) * 100}%` }} />
      </div>

      <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {steps.map((s, i) => {
          const current = i === firstTodo;
          return (
            <li key={s.title} className={cn('flex flex-col rounded-xl border bg-card p-4 transition', current && 'border-primary/50 ring-2 ring-primary/15', s.done && 'opacity-75')}>
              <span className={cn('mb-3 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', s.done ? 'bg-success text-success-foreground' : current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                {s.done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <p className="text-sm font-medium">{s.title}</p>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{s.desc}</p>
              {!s.done && (
                <Button asChild variant={current ? 'default' : 'outline'} size="sm" className="mt-3 w-full">
                  <Link href={s.href}>{s.cta}<ArrowRight className="h-3.5 w-3.5" /></Link>
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
