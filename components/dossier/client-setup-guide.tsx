'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, Compass, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  organizationId: string;
  profileComplete: boolean;
  applicabilityAssessed: boolean;
  hasContact: boolean;
  /** Bascule l'onglet du dossier (profil, contacts, comptes, politiques…). */
  goToTab: (tab: string, anchor?: string) => void;
};

type Step = {
  key: string;
  done: boolean;
  title: string;
  why: string;
  action: { label: string; tab?: string; anchor?: string; href?: string };
};

/** Parcours de mise en route d'un nouveau client, côté admin : chaque étape dit quoi faire et pourquoi, et se coche toute seule. */
export function ClientSetupGuide({ organizationId, profileComplete, applicabilityAssessed, hasContact, goToTab }: Props) {
  const storageKey = `infracyb-setup-guide-hidden:${organizationId}`;
  const [hidden, setHidden] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [facts, setFacts] = useState({ audit: false, shared: false, actions: false, policies: false, sent: false, account: false, control: false, risk: false, loaded: false });

  useEffect(() => {
    try { setHidden(localStorage.getItem(storageKey) === '1'); } catch { setHidden(false); }
  }, [storageKey]);

  useEffect(() => {
    const json = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    Promise.all([
      json('/api/audits'),
      json(`/api/organizations/${organizationId}/action-plan`),
      json(`/api/organizations/${organizationId}/policies`),
      json(`/api/organizations/${organizationId}/users`),
      json(`/api/organizations/${organizationId}/controls`),
      json(`/api/organizations/${organizationId}/risks`),
    ]).then(([audits, actions, policies, users, controls, risks]) => {
      const mine = (Array.isArray(audits) ? audits : []).filter((a: { organizationId?: string }) => a.organizationId === organizationId);
      const pol = Array.isArray(policies) ? policies : [];
      setFacts({
        audit: mine.length > 0,
        shared: mine.some((a: { sharedWithClient?: boolean }) => a.sharedWithClient),
        actions: Array.isArray(actions) && actions.length > 0,
        policies: pol.length > 0,
        sent: pol.some((d: { status?: string }) => d.status === 'À valider' || d.status === 'Validé'),
        account: Array.isArray(users) && users.length > 0,
        control: Array.isArray(controls) && controls.length > 0,
        risk: Array.isArray(risks) && risks.length > 0,
        loaded: true,
      });
    });
  }, [organizationId]);

  const steps: Step[] = [
    { key: 'profil', done: profileComplete, title: 'Cadrer la mission', why: 'Renseignez secteur, taille, effectif et surtout le périmètre de mission (ce qui est inclus et exclu). C’est la base de votre contrat et ce qui limite votre responsabilité : sans périmètre écrit, tout devient discutable.', action: { label: 'Compléter le profil', tab: 'profil', anchor: 'section-profil' } },
    { key: 'applic', done: applicabilityAssessed, title: 'Évaluer les réglementations applicables', why: 'NIS2, RGPD, ISO 27001 : indiquez ce qui s’applique. C’est indicatif, à confirmer avec un juriste : la transposition française de NIS2 n’est pas finalisée. Cela décide des référentiels suivis dans l’audit.', action: { label: 'Évaluer l’applicabilité', tab: 'profil', anchor: 'section-applicabilite' } },
    { key: 'contact', done: hasContact, title: 'Identifier le contact principal', why: 'La personne qui décide et valide chez le client (souvent le dirigeant). Elle recevra les relances et validera les politiques.', action: { label: 'Ajouter un contact', tab: 'contacts', anchor: 'section-nouveau-contact' } },
    { key: 'audit', done: facts.audit, title: 'Réaliser l’audit', why: 'Le questionnaire donne le score, la maturité et les points faibles. Choisissez ce client dans la liste « Client audité » pour que l’audit soit rattaché à son dossier.', action: { label: 'Lancer l’audit', href: `/strategie?client=${organizationId}` } },
    { key: 'plan', done: facts.actions, title: 'Générer le plan d’action', why: 'Transforme l’audit en actions priorisées avec échéances. Vérifiez les responsables et les dates : ils sont proposés automatiquement, à ajuster selon la réalité du client.', action: { label: 'Ouvrir le plan d’action', href: `/dashboard/organizations/${organizationId}/action-plan` } },
    { key: 'controls', done: facts.control && facts.risk, title: 'Saisir contrôles et risques', why: 'Au moins un contrôle (avec son niveau de conformité) et un risque dans le registre. C’est ce qui rend le suivi mensuel et le rapport utiles.', action: { label: 'Saisir les contrôles', tab: 'controles' } },
    { key: 'policies', done: facts.policies, title: 'Préparer les politiques', why: 'Générez les documents depuis la bibliothèque : ce sont des brouillons à adapter. Remplissez les variables {{…}} et faites relire par un juriste avant tout envoi.', action: { label: 'Générer le dossier', tab: 'politiques' } },
    { key: 'sendpol', done: facts.sent, title: 'Envoyer les politiques à valider', why: 'Tant qu’un document est en brouillon, le client ne le voit pas. Passez-le en « À valider » : le client pourra alors le valider, avec son nom et la date comme preuve.', action: { label: 'Voir les politiques', tab: 'politiques' } },
    { key: 'share', done: facts.shared, title: 'Partager le diagnostic', why: 'Le client ne voit son audit que si vous le partagez. Relisez le rapport PDF d’abord, puis cliquez « Partager avec le client ».', action: { label: 'Partager l’audit', href: `/dashboard/organizations/${organizationId}/action-plan` } },
    { key: 'account', done: facts.account, title: 'Créer l’accès du client (en dernier)', why: 'Faites-le quand tout le reste est prêt : il verra immédiatement ce que vous avez partagé. Transmettez le mot de passe par un autre canal que l’e-mail de l’identifiant, et recommandez la double authentification.', action: { label: 'Créer le compte', tab: 'comptes' } },
  ];

  if (hidden || !facts.loaded) return null;

  const done = steps.filter((s) => s.done).length;
  const next = steps.findIndex((s) => !s.done);
  const all = done === steps.length;

  const hide = () => {
    try { localStorage.setItem(storageKey, '1'); } catch { /* indisponible */ }
    setHidden(true);
  };

  return (
    <section className="mb-6 rounded-2xl border bg-gradient-to-br from-accent via-card to-card p-5 shadow-sm" aria-label="Mise en route du client">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Compass className="h-5 w-5" /></span>
        <div className="flex-1">
          <h2 className="text-base font-semibold">{all ? 'Client prêt : tout est en place' : 'Mettre ce client en route'}</h2>
          <p className="text-sm text-muted-foreground">{done}/{steps.length} étapes · {all ? 'vous pouvez masquer ce guide.' : 'suivez l’ordre proposé, chaque étape se coche toute seule.'}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={hide}>Masquer</Button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>

      <div className="mt-4 flex gap-2 rounded-xl border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p><strong>Avant de commencer :</strong> une lettre de mission ou un contrat signé, qui reprend le périmètre. N’enregistrez ici aucune donnée sensible inutile (mots de passe, données de santé) et ne partagez que ce que le client doit voir.</p>
      </div>

      <ol className="mt-4 space-y-2">
        {steps.map((s, i) => {
          const isNext = i === next;
          const expanded = open === s.key || (isNext && open === null);
          return (
            <li key={s.key} className={cn('rounded-xl border bg-card', isNext && 'border-primary/50 ring-2 ring-primary/10')}>
              <button type="button" onClick={() => setOpen(expanded ? '' : s.key)} className="flex w-full items-center gap-3 p-3 text-left" aria-expanded={expanded}>
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold', s.done ? 'bg-success text-success-foreground' : isNext ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {s.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn('flex-1 text-sm font-medium', s.done && 'text-muted-foreground line-through')}>{s.title}</span>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition', expanded && 'rotate-180')} />
              </button>
              {expanded && (
                <div className="border-t px-3 pb-3 pt-2 pl-13">
                  <p className="text-sm text-muted-foreground">{s.why}</p>
                  {!s.done && (
                    <div className="mt-3">
                      {s.action.href ? (
                        <Button asChild size="sm"><Link href={s.action.href}>{s.action.label}<ArrowRight className="h-3.5 w-3.5" /></Link></Button>
                      ) : (
                        <Button size="sm" onClick={() => goToTab(s.action.tab!, s.action.anchor)}>{s.action.label}<ArrowRight className="h-3.5 w-3.5" /></Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
