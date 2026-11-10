'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { OWN_SIDE_HOWTO, OWN_SIDE_TOOLS, SCAN_INTRO, STEP_HELP } from '@/lib/scan/guide';

type Campaign = {
  id: string; name: string; status: string; notes: string | null;
  authorizedByName: string | null; authorizedByRole: string | null; authorizationRef: string | null;
  authorizedAt: string | null; windowStart: string | null; windowEnd: string | null;
  targetCount?: number; findingCount?: number;
};
type Target = { id: string; host: string; checkDns: boolean; lastRunAt: string | null };
type Finding = {
  id: string; targetHost: string; checkId: string; source: string; severity: string; title: string;
  detail: string; evidence: string | null; status: string; vulnerabilityId: string | null;
};
type Detail = Campaign & { targets: Target[]; findings: Finding[]; launchProblem: string | null };

const VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  Critique: 'destructive', Haute: 'destructive', Moyenne: 'secondary', Info: 'outline', OK: 'default',
};
const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  Brouillon: 'outline', 'Autorisée': 'default', 'Terminée': 'secondary', 'Annulée': 'destructive',
};
const dateOnly = (iso: string | null) => (iso ? iso.slice(0, 10) : '');
const dateFr = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '—');

async function call<T = Record<string, unknown>>(method: string, url: string, body?: unknown) {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: 'Connexion impossible, réessaie.' } as T & { error?: string } };
  }
}

/** Campagne de scan externe non intrusif : autorisation écrite, périmètre, contrôles, constats, rapport. */
export function ScanTab({ organizationId }: { organizationId: string }) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const { ok, data } = await call<Campaign[]>('GET', `/api/organizations/${organizationId}/scan-campaigns`);
    if (ok && Array.isArray(data)) setCampaigns(data);
  }, [organizationId]);
  useEffect(() => { void loadList(); }, [loadList]);

  async function create() {
    setError(null);
    const { ok, data } = await call<Campaign>('POST', `/api/organizations/${organizationId}/scan-campaigns`, { name });
    if (!ok || !data) { setError(data?.error ?? 'Création impossible.'); return; }
    setName('');
    await loadList();
    setSelected(data.id);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Campagne de scan de vulnérabilités</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>{SCAN_INTRO}</p>
          <details className="rounded-md border p-2">
            <summary className="cursor-pointer font-medium">Ce que tu fais de ton côté (StratCyber tourne sur Vercel, il ne peut pas tout faire)</summary>
            <div className="mt-2 space-y-3">
              {OWN_SIDE_TOOLS.map((tool) => (
                <div key={tool.name} className="space-y-1">
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.when}</p>
                  {tool.command && <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">{tool.command}</pre>}
                  <p className="text-xs">{tool.caution}</p>
                </div>
              ))}
              <p className="text-xs">{OWN_SIDE_HOWTO}</p>
            </div>
          </details>
        </CardContent>
      </Card>

      {selected ? (
        <CampaignView
          key={selected} organizationId={organizationId} campaignId={selected}
          onBack={() => { setSelected(null); void loadList(); }}
        />
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Campagnes de ce client</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {campaigns?.length === 0 && <p className="text-sm text-muted-foreground">Aucune campagne pour ce client.</p>}
            <ul className="space-y-2">
              {campaigns?.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[c.status] ?? 'outline'}>{c.status}</Badge>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.targetCount ?? 0} domaine(s), {c.findingCount ?? 0} constat(s)</span>
                  </div>
                  <Button variant="outline" onClick={() => setSelected(c.id)}>Ouvrir</Button>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[16rem] flex-1">
                <Label htmlFor="scan-new-name">Nouvelle campagne</Label>
                <Input id="scan-new-name" placeholder="Ex. Contrôle externe — novembre 2026" value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
              </div>
              <Button onClick={create} disabled={!name.trim()}>Créer la campagne</Button>
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StepTitle({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <CardTitle className="text-base">{label}</CardTitle>
      <Badge variant={done ? 'default' : 'outline'}>{done ? 'Fait' : 'À faire'}</Badge>
    </div>
  );
}

function CampaignView({ organizationId, campaignId, onBack }: { organizationId: string; campaignId: string; onBack: () => void }) {
  const base = `/api/scan-campaigns/${campaignId}`;
  const docBase = `/dashboard/organizations/${organizationId}/scan/${campaignId}`;
  const [detail, setDetail] = useState<Detail | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', role: '', ref: '', signed: '', start: '', end: '' });
  const [host, setHost] = useState('');
  const [checkDns, setCheckDns] = useState(true);
  const [manual, setManual] = useState({ targetHost: '', title: '', severity: 'Moyenne', detail: '', evidence: '' });

  const load = useCallback(async () => {
    const { ok, data } = await call<Detail>('GET', base);
    if (!ok || !data) return;
    setDetail(data);
    setForm({
      name: data.authorizedByName ?? '', role: data.authorizedByRole ?? '', ref: data.authorizationRef ?? '',
      signed: dateOnly(data.authorizedAt), start: dateOnly(data.windowStart), end: dateOnly(data.windowEnd),
    });
  }, [base]);
  useEffect(() => { void load(); }, [load]);

  async function act(label: string, method: string, url: string, body?: unknown, okMessage?: string) {
    setBusy(label); setMessage(null);
    const { ok, data } = await call(method, url, body);
    setBusy(null);
    if (!ok) { setMessage(data?.error ?? 'Action impossible.'); return false; }
    setMessage(okMessage ?? ((data as { authorizationReset?: boolean } | null)?.authorizationReset
      ? "Domaine ajouté. L'autorisation est repassée en brouillon : fais couvrir ce domaine par le client puis reconfirme-la." : null));
    await load();
    return true;
  }

  if (!detail) return <p className="text-sm text-muted-foreground">Chargement...</p>;

  const closed = detail.status === 'Terminée' || detail.status === 'Annulée';
  const authorized = detail.status === 'Autorisée';
  const dirty =
    form.name !== (detail.authorizedByName ?? '') || form.role !== (detail.authorizedByRole ?? '') || form.ref !== (detail.authorizationRef ?? '') ||
    form.signed !== dateOnly(detail.authorizedAt) || form.start !== dateOnly(detail.windowStart) || form.end !== dateOnly(detail.windowEnd);
  const actionable = detail.findings.filter((f) => f.severity !== 'OK');
  const hosts = Array.from(new Set(detail.findings.map((f) => f.targetHost)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>Retour</Button>
          <h3 className="text-base font-semibold">{detail.name}</h3>
          <Badge variant={STATUS_VARIANT[detail.status] ?? 'outline'}>{detail.status}</Badge>
        </div>
      </div>
      {message && <p role="status" className="rounded-md border p-2 text-sm">{message}</p>}

      <Card>
        <CardHeader className="pb-2"><StepTitle label="1. Autorisation écrite du client" done={authorized || closed} /></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{STEP_HELP.autorisation}</p>
          <a className="inline-block text-blue-600 underline" href={`${docBase}/lettre`} target="_blank" rel="noreferrer">Ouvrir la lettre d&apos;autorisation à faire signer (imprimable)</a>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="sc-name">Nom du signataire (client)</Label><Input id="sc-name" value={form.name} maxLength={120} disabled={closed} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label htmlFor="sc-role">Fonction du signataire</Label><Input id="sc-role" value={form.role} maxLength={120} disabled={closed} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label htmlFor="sc-ref">Référence du document signé (nom du fichier conservé)</Label><Input id="sc-ref" value={form.ref} maxLength={200} disabled={closed} onChange={(e) => setForm({ ...form, ref: e.target.value })} /></div>
            <div><Label htmlFor="sc-signed">Date de signature</Label><Input id="sc-signed" type="date" value={form.signed} disabled={closed} onChange={(e) => setForm({ ...form, signed: e.target.value })} /></div>
            <div />
            <div><Label htmlFor="sc-start">Début de la période autorisée</Label><Input id="sc-start" type="date" value={form.start} disabled={closed} onChange={(e) => setForm({ ...form, start: e.target.value })} /></div>
            <div><Label htmlFor="sc-end">Fin de la période autorisée (jour inclus, 90 jours maximum)</Label><Input id="sc-end" type="date" value={form.end} disabled={closed} onChange={(e) => setForm({ ...form, end: e.target.value })} /></div>
          </div>
          {!closed && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline" disabled={!dirty || busy !== null}
                onClick={() => act('auth', 'PATCH', base, {
                  authorizedByName: form.name || null, authorizedByRole: form.role || null, authorizationRef: form.ref || null,
                  authorizedAt: form.signed || null, windowStart: form.start || null, windowEnd: form.end || null,
                }, "Autorisation enregistrée. Si elle était confirmée, elle repasse en brouillon : reconfirme-la.")}
              >Enregistrer l&apos;autorisation</Button>
              <Button disabled={authorized || dirty || busy !== null} onClick={() => act('confirm', 'PATCH', base, { status: 'Autorisée' }, 'Autorisation confirmée : les contrôles sont possibles pendant la période indiquée.')}>
                J&apos;ai reçu la lettre signée : confirmer l&apos;autorisation
              </Button>
            </div>
          )}
          {authorized && <p className="text-xs text-muted-foreground">Autorisation confirmée. Si tu modifies ces champs ou ajoutes un domaine, elle repasse en brouillon.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><StepTitle label="2. Périmètre (domaines autorisés)" done={detail.targets.length > 0} /></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{STEP_HELP.perimetre}</p>
          <ul className="space-y-1">
            {detail.targets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                <span><span className="font-medium">{t.host}</span> <span className="text-xs text-muted-foreground">{t.checkDns ? 'avec contrôles DNS et messagerie' : 'sans contrôles DNS'}</span></span>
                {!closed && <Button variant="outline" disabled={busy !== null} onClick={() => act('rm', 'DELETE', `${base}/targets/${t.id}`)}>Retirer</Button>}
              </li>
            ))}
          </ul>
          {!closed && (
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[14rem] flex-1"><Label htmlFor="sc-host">Domaine</Label><Input id="sc-host" placeholder="exemple.fr" value={host} maxLength={253} onChange={(e) => setHost(e.target.value)} /></div>
              <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={checkDns} onChange={(e) => setCheckDns(e.target.checked)} />Contrôles DNS et messagerie (domaine principal)</label>
              <Button disabled={!host.trim() || busy !== null} onClick={async () => { if (await act('add', 'POST', `${base}/targets`, { host, checkDns })) setHost(''); }}>Ajouter au périmètre</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><StepTitle label="3. Lancer les contrôles" done={detail.targets.some((t) => t.lastRunAt)} /></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{STEP_HELP.controles}</p>
          {detail.launchProblem && <p className="rounded-md border border-amber-400 p-2 text-xs">Lancement impossible pour l&apos;instant : {detail.launchProblem}</p>}
          <ul className="space-y-1">
            {detail.targets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2">
                <span><span className="font-medium">{t.host}</span> <span className="text-xs text-muted-foreground">dernier contrôle : {t.lastRunAt ? new Date(t.lastRunAt).toLocaleString('fr-FR') : 'jamais'}</span></span>
                <Button disabled={detail.launchProblem !== null || busy !== null} onClick={() => act(`run-${t.id}`, 'POST', `${base}/run`, { targetId: t.id }, `Contrôle de ${t.host} terminé.`)}>
                  {busy === `run-${t.id}` ? 'Contrôle en cours (jusqu\'à 30 s)...' : 'Lancer le contrôle'}
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><StepTitle label="4. Constats" done={detail.findings.length > 0 && actionable.every((f) => f.status !== 'Nouveau')} /></CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>{STEP_HELP.constats}</p>
          {hosts.length === 0 && <p className="text-muted-foreground">Aucun constat pour l&apos;instant.</p>}
          {hosts.map((h) => {
            const mine = detail.findings.filter((f) => f.targetHost === h);
            const todo = mine.filter((f) => f.severity !== 'OK');
            const ok = mine.filter((f) => f.severity === 'OK');
            return (
              <div key={h} className="space-y-2">
                <p className="font-medium">{h}</p>
                <ul className="space-y-2">
                  {todo.map((f) => (
                    <li key={f.id} className="rounded-md border p-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={VARIANT[f.severity] ?? 'outline'}>{f.severity}</Badge>
                        <span className="font-medium">{f.title}</span>
                        {f.source === 'manuel' && <Badge variant="outline">saisi à la main</Badge>}
                        <Badge variant={f.status === 'Retenu' ? 'default' : 'outline'}>{f.status}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                      {f.evidence && <p className="mt-1 break-all rounded bg-muted p-1 font-mono text-xs">{f.evidence}</p>}
                      {!closed && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {f.status !== 'Retenu' && <Button disabled={busy !== null} onClick={() => act(`f-${f.id}`, 'PATCH', `/api/scan-findings/${f.id}`, { status: 'Retenu' }, 'Constat retenu : ajouté au registre de vulnérabilités et au plan d\'action du client.')}>Retenir</Button>}
                          {f.status !== 'Écarté' && <Button variant="outline" disabled={busy !== null} onClick={() => act(`f-${f.id}`, 'PATCH', `/api/scan-findings/${f.id}`, { status: 'Écarté' })}>Écarter</Button>}
                          {f.status !== 'Nouveau' && <Button variant="outline" disabled={busy !== null} onClick={() => act(`f-${f.id}`, 'PATCH', `/api/scan-findings/${f.id}`, { status: 'Nouveau' })}>Remettre en nouveau</Button>}
                          {f.source === 'manuel' && <Button variant="outline" disabled={busy !== null} onClick={() => act(`f-${f.id}`, 'DELETE', `/api/scan-findings/${f.id}`)}>Supprimer</Button>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {ok.length > 0 && (
                  <details className="text-xs"><summary className="cursor-pointer">Points conformes ({ok.length})</summary>
                    <ul className="mt-1 list-disc pl-5">{ok.map((f) => <li key={f.id}>{f.title}</li>)}</ul>
                  </details>
                )}
              </div>
            );
          })}

          {!closed && detail.targets.length > 0 && (
            <details className="rounded-md border p-2">
              <summary className="cursor-pointer font-medium">Ajouter un constat saisi à la main (outil lancé de ton côté)</summary>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="mf-host">Domaine</Label>
                  <select id="mf-host" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={manual.targetHost} onChange={(e) => setManual({ ...manual, targetHost: e.target.value })}>
                    <option value="">Choisir...</option>
                    {detail.targets.map((t) => <option key={t.id} value={t.host}>{t.host}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="mf-sev">Gravité</Label>
                  <select id="mf-sev" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={manual.severity} onChange={(e) => setManual({ ...manual, severity: e.target.value })}>
                    {['Critique', 'Haute', 'Moyenne', 'Info'].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2"><Label htmlFor="mf-title">Titre</Label><Input id="mf-title" maxLength={200} value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label htmlFor="mf-detail">Explication</Label><Textarea id="mf-detail" maxLength={2000} value={manual.detail} onChange={(e) => setManual({ ...manual, detail: e.target.value })} /></div>
                <div className="sm:col-span-2"><Label htmlFor="mf-evidence">Preuve (ligne exacte du résultat, sans mot de passe ni donnée personnelle)</Label><Input id="mf-evidence" maxLength={500} value={manual.evidence} onChange={(e) => setManual({ ...manual, evidence: e.target.value })} /></div>
                <div>
                  <Button
                    disabled={busy !== null || !manual.targetHost || !manual.title.trim() || !manual.detail.trim()}
                    onClick={async () => {
                      const ok = await act('manual', 'POST', `${base}/findings`, { ...manual, evidence: manual.evidence || null }, 'Constat ajouté.');
                      if (ok) setManual({ targetHost: manual.targetHost, title: '', severity: 'Moyenne', detail: '', evidence: '' });
                    }}
                  >Ajouter le constat</Button>
                </div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><StepTitle label="5. Rapport et clôture" done={closed} /></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{STEP_HELP.rapport}</p>
          <a className="inline-block text-blue-600 underline" href={`${docBase}/rapport`} target="_blank" rel="noreferrer">Ouvrir le rapport (imprimable en PDF)</a>
          <div className="space-y-1">
            <Label htmlFor="sc-notes">Notes internes sur la campagne</Label>
            <Textarea id="sc-notes" maxLength={2000} defaultValue={detail.notes ?? ''} onBlur={(e) => { if (e.target.value !== (detail.notes ?? '')) void act('notes', 'PATCH', base, { notes: e.target.value }, 'Notes enregistrées.'); }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {!closed && <Button disabled={busy !== null} onClick={() => { if (window.confirm('Terminer la campagne ? Plus aucun contrôle ne pourra être lancé.')) void act('end', 'PATCH', base, { status: 'Terminée' }, 'Campagne terminée.'); }}>Terminer la campagne</Button>}
            {!closed && <Button variant="outline" disabled={busy !== null} onClick={() => { if (window.confirm('Annuler la campagne ? Plus aucun contrôle ne pourra être lancé.')) void act('cancel', 'PATCH', base, { status: 'Annulée' }, 'Campagne annulée.'); }}>Annuler la campagne</Button>}
            <Button variant="outline" disabled={busy !== null} onClick={async () => { if (window.confirm('Supprimer définitivement la campagne et ses constats ? Les vulnérabilités déjà retenues restent au registre.')) { if (await act('del', 'DELETE', base)) onBack(); } }}>Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
