'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Target = { id: string; host: string; checkDns: boolean };
type Finding = { id: string; targetHost: string; severity: string; title: string; detail: string; evidence: string | null; status: string };
type Detail = {
  id: string; name: string; status: string; authorizedByName: string | null; authorizedByRole: string | null; authorizationRef: string | null;
  authorizedAt: string | null; windowStart: string | null; windowEnd: string | null; targets: Target[]; findings: Finding[];
};

const dateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : null);
const Fill = ({ children }: { children: ReactNode }) => <mark className="bg-yellow-200 px-1 text-black print:bg-transparent print:underline">[{children}]</mark>;
const SEVERITY_ORDER = ['Critique', 'Haute', 'Moyenne', 'Info'];
const DELAY: Record<string, string> = {
  Critique: 'immédiatement (sous 7 jours)', Haute: 'sous 15 jours', Moyenne: 'sous 60 jours', Info: 'au fil de l\'eau, lors d\'une prochaine maintenance',
};

/** Lettre d'autorisation et rapport d'une campagne, mis en page pour l'impression ou l'enregistrement en PDF. */
export function ScanDocument({ organizationId, campaignId, doc }: { organizationId: string; campaignId: string; doc: 'lettre' | 'rapport' }) {
  const [campaign, setCampaign] = useState<Detail | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(`/api/scan-campaigns/${campaignId}`).then((r) => (r.ok ? r.json() : Promise.reject())).then(setCampaign).catch(() => setFailed(true));
    fetch(`/api/organizations/${organizationId}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((o) => setOrgName(o.name)).catch(() => setFailed(true));
  }, [campaignId, organizationId]);

  if (failed) return <p role="alert" className="p-6 text-sm text-red-600">Document indisponible (accès administrateur requis).</p>;
  if (!campaign || !orgName) return <p className="p-6 text-sm text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-4 p-4">
      <style>{`@media print { body * { visibility: hidden } #scan-doc, #scan-doc * { visibility: visible } #scan-doc { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button onClick={() => window.print()}>Imprimer / enregistrer en PDF</Button>
        <Link className="text-sm text-blue-600 underline" href={`/dashboard/organizations/${organizationId}`}>Retour au dossier du client</Link>
        {doc === 'lettre' && <span className="text-xs text-muted-foreground">Complète les champs surlignés avant d&apos;imprimer.</span>}
      </div>
      <article id="scan-doc" className="mx-auto max-w-3xl space-y-4 bg-white p-8 text-sm leading-relaxed text-black shadow-sm print:shadow-none">
        {doc === 'lettre' ? <Letter campaign={campaign} orgName={orgName} /> : <Report campaign={campaign} orgName={orgName} />}
      </article>
    </div>
  );
}

function Letter({ campaign, orgName }: { campaign: Detail; orgName: string }) {
  const start = dateFr(campaign.windowStart);
  const end = dateFr(campaign.windowEnd);
  return (
    <>
      <h1 className="text-xl font-bold">Autorisation de réaliser des contrôles de sécurité externes</h1>
      <p>
        <strong>Le Client :</strong> {orgName}, représenté par {campaign.authorizedByName ?? <Fill>nom du signataire</Fill>}, {campaign.authorizedByRole ?? <Fill>fonction</Fill>}.<br />
        <strong>Le Prestataire :</strong> InfraCyb, <Fill>nom et prénom de l&apos;entrepreneur</Fill>, SIRET <Fill>à compléter</Fill>, <Fill>adresse</Fill>.
      </p>

      <h2 className="font-semibold">Article 1 — Objet</h2>
      <p>Le Client autorise le Prestataire à réaliser, pour son compte, des contrôles de sécurité <strong>externes et non intrusifs</strong> sur les seuls éléments listés à l&apos;article 2, afin d&apos;établir un état des lieux de leur sécurité (campagne « {campaign.name} »).</p>

      <h2 className="font-semibold">Article 2 — Périmètre autorisé</h2>
      {campaign.targets.length > 0 ? (
        <ul className="list-disc pl-6">{campaign.targets.map((t) => <li key={t.id}>{t.host}</li>)}</ul>
      ) : <p><Fill>liste des noms de domaine autorisés, un par ligne</Fill></p>}
      <p>Tout autre nom de domaine, adresse IP ou système, notamment ceux de ses prestataires et hébergeurs, est exclu du périmètre.</p>

      <h2 className="font-semibold">Article 3 — Nature des contrôles</h2>
      <p><strong>Inclus :</strong> lecture des enregistrements DNS publics (dont la protection de la messagerie : SPF, DKIM, DMARC) ; lecture du certificat HTTPS ; lecture des en-têtes de réponse de la page d&apos;accueil ; vérification de la redirection de HTTP vers HTTPS ; lecture du fichier public security.txt.</p>
      <p><strong>Exclu :</strong> toute tentative d&apos;intrusion ou d&apos;exploitation de faille ; tout test de mots de passe ou d&apos;identifiants ; tout déni de service ou envoi de trafic massif ; tout accès à des données, comptes ou systèmes internes ; tout contrôle sans l&apos;accord écrit complémentaire du Client (scan de ports, scan applicatif...).</p>

      <h2 className="font-semibold">Article 4 — Période</h2>
      <p>Du {start ?? <Fill>date de début</Fill>} au {end ?? <Fill>date de fin</Fill>} inclus. En dehors de cette période, aucun contrôle n&apos;est réalisé.</p>

      <h2 className="font-semibold">Article 5 — Origine des contrôles</h2>
      <p>Les contrôles proviennent des serveurs du Prestataire (hébergement Vercel, adresses IP variables) et, pour d&apos;éventuels outils complémentaires convenus par écrit, de l&apos;adresse IP <Fill>adresse IP du VPS ou « aucune »</Fill>. Les requêtes portent l&apos;identifiant « StratCyber-ControleExterne/1.0 ».</p>

      <h2 className="font-semibold">Article 6 — Engagements du Prestataire</h2>
      <ul className="list-disc pl-6">
        <li>Respecter strictement le périmètre, la période et la nature des contrôles ci-dessus.</li>
        <li>Cesser immédiatement tout contrôle sur simple demande du Client.</li>
        <li>Prévenir sans délai le Client de toute faille critique découverte, avant toute autre communication.</li>
        <li>Ne collecter ni conserver de mots de passe, de données personnelles ou de contenus : seuls des constats techniques sont conservés.</li>
        <li>Garder les résultats strictement confidentiels et ne les remettre qu&apos;au Client.</li>
        <li>Supprimer les constats bruts au plus tard <Fill>12</Fill> mois après la fin de la mission, sauf demande contraire du Client.</li>
      </ul>

      <h2 className="font-semibold">Article 7 — Engagements du Client</h2>
      <ul className="list-disc pl-6">
        <li>Déclarer être titulaire des noms de domaine de l&apos;article 2 ou avoir qualité pour autoriser ces contrôles.</li>
        <li>Informer, si ses conditions l&apos;exigent, ses prestataires et hébergeurs de la réalisation de ces contrôles.</li>
        <li>Désigner un contact joignable pendant la période : <Fill>nom, téléphone, e-mail</Fill>.</li>
      </ul>

      <h2 className="font-semibold">Article 8 — Limites et responsabilité</h2>
      <p>Ces contrôles ne constituent ni un test d&apos;intrusion ni un audit complet : l&apos;absence de constat ne garantit pas l&apos;absence de vulnérabilité. La responsabilité des parties est précisée par le contrat de prestation <Fill>référence du contrat ou de la lettre de mission</Fill>.</p>

      <h2 className="font-semibold">Article 9 — Données personnelles</h2>
      <p>Les contrôles ne visent aucune donnée personnelle. Les éléments techniques observés (adresses IP des serveurs, en-têtes, noms de cookies) ne sont utilisés que pour la présente mission.</p>

      <p className="pt-4">Fait à <Fill>lieu</Fill>, le <Fill>date</Fill>, en deux exemplaires.</p>
      <div className="grid grid-cols-2 gap-8 pt-2">
        <div><p className="font-semibold">Pour le Client</p><p>{campaign.authorizedByName ?? <Fill>nom</Fill>}, {campaign.authorizedByRole ?? <Fill>fonction</Fill>}</p><p className="mt-12 border-t pt-1 text-xs">Signature précédée de la mention « Bon pour accord »</p></div>
        <div><p className="font-semibold">Pour le Prestataire</p><p>InfraCyb</p><p className="mt-12 border-t pt-1 text-xs">Signature</p></div>
      </div>
      <p className="pt-4 text-xs text-gray-600">Modèle à faire relire par un juriste avant usage ; il ne constitue pas un conseil juridique. Conserve l&apos;exemplaire signé : sa référence est à saisir dans StratCyber avant tout contrôle.</p>
    </>
  );
}

function Report({ campaign, orgName }: { campaign: Detail; orgName: string }) {
  const kept = campaign.findings.filter((f) => f.severity !== 'OK' && f.status !== 'Écarté');
  const good = campaign.findings.filter((f) => f.severity === 'OK');
  const hosts = Array.from(new Set(campaign.findings.map((f) => f.targetHost)));
  const count = (severity: string) => kept.filter((f) => f.severity === severity).length;
  return (
    <>
      <h1 className="text-xl font-bold">Rapport de contrôle de sécurité externe</h1>
      <p><strong>Client :</strong> {orgName}<br /><strong>Campagne :</strong> {campaign.name}<br /><strong>Période autorisée :</strong> {dateFr(campaign.windowStart) ?? '—'} au {dateFr(campaign.windowEnd) ?? '—'}<br /><strong>Rapport édité le :</strong> {new Date().toLocaleDateString('fr-FR')}<br /><strong>Établi par :</strong> InfraCyb</p>

      <h2 className="font-semibold">1. Ce qui a été contrôlé</h2>
      <p>Contrôles externes non intrusifs des domaines suivants : {campaign.targets.map((t) => t.host).join(', ') || '—'}. Ont été lus : DNS public et protection de la messagerie, certificat HTTPS, en-têtes de sécurité de la page d&apos;accueil, redirection HTTP vers HTTPS, fichier security.txt. Aucune attaque, aucun test de mot de passe, aucun accès aux données n&apos;a été réalisé.</p>

      <h2 className="font-semibold">2. Synthèse</h2>
      <table className="w-full border-collapse text-left">
        <thead><tr className="border-b"><th className="py-1">Gravité</th><th>Nombre</th><th>À traiter</th></tr></thead>
        <tbody>
          {SEVERITY_ORDER.map((s) => <tr key={s} className="border-b"><td className="py-1">{s}</td><td>{count(s)}</td><td>{DELAY[s]}</td></tr>)}
        </tbody>
      </table>
      <p>{good.length} point(s) conforme(s) relevé(s).</p>

      <h2 className="font-semibold">3. Constats à traiter</h2>
      {kept.length === 0 && <p>Aucun constat à traiter.</p>}
      {hosts.map((h) => {
        const mine = kept.filter((f) => f.targetHost === h).sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
        if (mine.length === 0) return null;
        return (
          <div key={h} className="space-y-2">
            <h3 className="font-medium">{h}</h3>
            {mine.map((f) => (
              <div key={f.id} className="break-inside-avoid rounded border p-2">
                <p><strong>[{f.severity}] {f.title}</strong></p>
                <p>{f.detail}</p>
                {f.evidence && <p className="mt-1 break-all font-mono text-xs">Preuve : {f.evidence}</p>}
              </div>
            ))}
          </div>
        );
      })}

      <h2 className="font-semibold">4. Points conformes</h2>
      {good.length === 0 ? <p>—</p> : <ul className="list-disc pl-6">{good.map((f) => <li key={f.id}>{f.targetHost} : {f.title}</li>)}</ul>}

      <h2 className="font-semibold">5. Limites de ce rapport</h2>
      <p>Ce document décrit ce qu&apos;un visiteur d&apos;Internet peut observer au moment des contrôles. Il ne remplace ni un test d&apos;intrusion ni un audit complet : l&apos;absence de constat ne garantit pas l&apos;absence de vulnérabilité. Les corrections doivent être planifiées avec votre prestataire informatique ; un nouveau contrôle après correction est recommandé.</p>
      <p className="text-xs text-gray-600">Document confidentiel, destiné uniquement à {orgName}.</p>
    </>
  );
}
