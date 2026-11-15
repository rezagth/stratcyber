'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contractToHtml, contractToText, type ContractDoc } from '@/lib/contract/template';

type Contact = { id: string; name: string; email: string | null; isPrimary: boolean };
const CHECKLIST = [
  'Contrat et annexe RGPD relus (idéalement par un juriste) et signés par le client',
  'Lettre d’autorisation de scan signée, si des contrôles externes sont prévus',
  'Interlocuteur du client et contact principal renseignés dans le dossier',
  'Profil, périmètre et applicabilité du client complétés dans le dossier',
  'Audit lancé depuis le dossier, puis plan d’action et partage au client',
];

export function ContractLauncher({ organizationId }: { organizationId: string }) {
  const [orgName, setOrgName] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({
    priceHT: '', durationDays: '5', startDate: '', scope: '', clientSignatoryName: '', clientSignatoryRole: '', clientSiret: '', clientAddress: '', contactId: '',
  });
  const [prov, setProv] = useState({ legalName: '', representative: '', siret: '', address: '', email: '', insurer: '' });
  const [doc, setDoc] = useState<ContractDoc | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('infracyb-contract-provider');
      if (saved) setProv((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch { /* confort seulement */ }
  }, []);

  useEffect(() => {
    fetch(`/api/organizations/${organizationId}`).then((r) => (r.ok ? r.json() : null)).then((o) => {
      if (!o) return;
      setOrgName(o.name);
      setForm((f) => ({ ...f, scope: o.missionScope ?? '' }));
    });
    fetch(`/api/organizations/${organizationId}/contacts`).then((r) => (r.ok ? r.json() : [])).then((c: Contact[]) => {
      setContacts(c);
      const primary = c.find((x) => x.isPrimary && x.email) ?? c.find((x) => x.email);
      if (primary) setForm((f) => ({ ...f, contactId: primary.id }));
    });
  }, [organizationId]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const run = useCallback(async (action: 'preview' | 'send') => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/contract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, provider: prov, action, confirm: action === 'send' ? confirm : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.missing ? `${data.error} Manquant : ${data.missing.join(', ')}.` : data.error ?? 'Erreur.');
        return;
      }
      if (action === 'preview') setDoc(data.doc);
      else setMessage(data.simulated ? 'Envoi SIMULÉ : aucun e-mail réel n’est parti (fournisseur d’e-mail non configuré).' : 'Contrat envoyé au client.');
    } finally {
      setBusy(false);
    }
  }, [form, prov, confirm, organizationId]);

  const saveProv = () => { try { localStorage.setItem('infracyb-contract-provider', JSON.stringify(prov)); } catch { /* ignoré */ } };
  const setP = (k: keyof typeof prov) => (e: React.ChangeEvent<HTMLInputElement>) => setProv((p) => ({ ...p, [k]: e.target.value }));

  function download() {
    if (!doc) return;
    const blob = new Blob(['<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>' + doc.reference + '</title></head><body>' + contractToHtml(doc) + '</body></html>'], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = doc.reference + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  async function copy() {
    if (!doc) return;
    try { await navigator.clipboard.writeText(contractToText(doc)); setMessage('Contrat copié dans le presse-papiers.'); } catch { setMessage('Copie impossible : utilise le téléchargement.'); }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <style>{`@media print { body * { visibility: hidden } #contract-doc, #contract-doc * { visibility: visible } #contract-doc { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div className="print:hidden">
        <Link href={`/dashboard/organizations/${organizationId}`} className="text-sm text-muted-foreground hover:underline">← Dossier du client</Link>
        <h1 className="mt-2 text-2xl font-semibold">Lancer la mission — {orgName}</h1>
        <p className="text-sm text-muted-foreground">Modèle à faire relire par un juriste avant la première signature. Rien n’est envoyé sans ta confirmation.</p>
      </div>

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Prestataire (toi) — champs à la main</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="p-name">Raison sociale</Label><Input id="p-name" value={prov.legalName} onChange={setP('legalName')} onBlur={saveProv} /></div>
          <div><Label htmlFor="p-rep">Représentant</Label><Input id="p-rep" value={prov.representative} onChange={setP('representative')} onBlur={saveProv} /></div>
          <div><Label htmlFor="p-siret">SIRET</Label><Input id="p-siret" value={prov.siret} onChange={setP('siret')} onBlur={saveProv} /></div>
          <div><Label htmlFor="p-mail">E-mail de contact</Label><Input id="p-mail" value={prov.email} onChange={setP('email')} onBlur={saveProv} /></div>
          <div className="sm:col-span-2"><Label htmlFor="p-addr">Adresse</Label><Input id="p-addr" value={prov.address} onChange={setP('address')} onBlur={saveProv} /></div>
          <div className="sm:col-span-2"><Label htmlFor="p-ins">Assureur RC pro</Label><Input id="p-ins" value={prov.insurer} onChange={setP('insurer')} onBlur={saveProv} /></div>
          <p className="sm:col-span-2 text-xs text-muted-foreground">Mémorisé dans ce navigateur pour les prochains contrats.</p>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Conditions de la mission</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div><Label htmlFor="c-price">Prix (€ HT)</Label><Input id="c-price" inputMode="decimal" value={form.priceHT} onChange={set('priceHT')} /></div>
          <div><Label htmlFor="c-days">Durée (jours)</Label><Input id="c-days" inputMode="numeric" value={form.durationDays} onChange={set('durationDays')} /></div>
          <div><Label htmlFor="c-start">Date de démarrage</Label><Input id="c-start" type="date" value={form.startDate} onChange={set('startDate')} /></div>
          <div><Label htmlFor="c-siret">SIRET du client</Label><Input id="c-siret" value={form.clientSiret} onChange={set('clientSiret')} /></div>
          <div className="sm:col-span-2"><Label htmlFor="c-addr">Adresse du client</Label><Input id="c-addr" value={form.clientAddress} onChange={set('clientAddress')} /></div>
          <div><Label htmlFor="c-sig">Signataire du client</Label><Input id="c-sig" value={form.clientSignatoryName} onChange={set('clientSignatoryName')} /></div>
          <div><Label htmlFor="c-role">Fonction du signataire</Label><Input id="c-role" value={form.clientSignatoryRole} onChange={set('clientSignatoryRole')} /></div>
          <div className="sm:col-span-2"><Label htmlFor="c-scope">Périmètre de la mission</Label><textarea id="c-scope" rows={3} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={form.scope} onChange={set('scope')} /></div>
          <div className="sm:col-span-2">
            <Label htmlFor="c-contact">Envoyer à</Label>
            <select id="c-contact" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.contactId} onChange={set('contactId')}>
              <option value="">Contact principal</option>
              {contacts.filter((c) => c.email).map((c) => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
            </select>
            {contacts.every((c) => !c.email) && <p className="mt-1 text-xs text-amber-600">Aucun contact avec e-mail : ajoute-en un dans l’onglet Contacts du dossier.</p>}
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-2">
            <Button onClick={() => run('preview')} disabled={busy}>Générer / actualiser le contrat</Button>
            {doc && <Button variant="outline" onClick={() => window.print()}>Imprimer / enregistrer en PDF</Button>}
            {doc && <Button variant="outline" onClick={download}>Télécharger (.html, ouvrable dans Word)</Button>}
            {doc && <Button variant="outline" onClick={copy}>Copier le texte</Button>}
          </div>
        </CardContent>
      </Card>

      {message && <p role="status" className="text-sm print:hidden">{message}</p>}

      {doc && (
        <>
          {doc.missing.length > 0 && (
            <p role="alert" className="rounded-md border border-amber-300 p-3 text-sm text-amber-700 print:hidden">
              À compléter avant envoi : {doc.missing.join(', ')}. (Remplis-les à la main ci-dessus.)
            </p>
          )}
          <article id="contract-doc" className="space-y-3 bg-white p-8 text-sm leading-relaxed text-black shadow-sm print:shadow-none">
            <h2 className="text-xl font-bold">{doc.title}</h2>
            <p className="italic">Réf. {doc.reference}</p>
            {doc.articles.map((a) => (
              <section key={a.title}><h3 className="mt-3 font-semibold">{a.title}</h3>{a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</section>
            ))}
            <hr className="my-4" />
            <h2 className="text-lg font-bold">{doc.annex.title}</h2>
            <p>{doc.annex.intro}</p>
            {doc.annex.articles.map((a) => (
              <section key={a.title}><h3 className="mt-3 font-semibold">{a.title}</h3>{a.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</section>
            ))}
          </article>

          <Card className="print:hidden">
            <CardHeader><CardTitle className="text-base">Envoi par e-mail (facultatif — tu peux aussi envoyer le fichier toi-même)</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1" />
                <span>J’ai relu ce contrat et je confirme son envoi par e-mail au contact choisi.</span>
              </label>
              <Button onClick={() => run('send')} disabled={busy || !confirm || doc.missing.length > 0}>Envoyer le contrat par e-mail</Button>
            </CardContent>
          </Card>
        </>
      )}

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Checklist de lancement</CardTitle></CardHeader>
        <CardContent><ul className="list-disc space-y-1 pl-5 text-sm">{CHECKLIST.map((c) => <li key={c}>{c}</li>)}</ul></CardContent>
      </Card>
    </div>
  );
}
