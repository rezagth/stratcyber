'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { prefillValues, type VariableDef } from '@/lib/policy/library-variables';

type LibraryDoc = { id: string; type: string; name: string; description: string; variables: string[] };
type Library = { documents: LibraryDoc[]; variables: Record<string, VariableDef> };
type Result = { id: string; title: string; version: number; unresolved: string[] };

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Assistant guidé : on choisit les documents, on répond une seule fois aux questions (les mêmes
 * réponses servent à tous les documents), et on génère des brouillons à relire avant envoi au client.
 */
export function CompliancePack({ organizationId, onGenerated }: { organizationId: string; onGenerated: () => void }) {
  const [library, setLibrary] = useState<Library | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Result[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch('/api/policy-library')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('library'))))
      .then(setLibrary)
      .catch(() => setLoadError(true));
    // Le pré-remplissage est un confort : s'il échoue, l'assistant reste utilisable à la main.
    fetch(`/api/organizations/${organizationId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((org) => { if (org) setValues((v) => ({ ...prefillValues(org, todayIso()), ...v })); })
      .catch(() => undefined);
  }, [organizationId]);

  const chosen = useMemo(() => library?.documents.filter((d) => selected[d.id]) ?? [], [library, selected]);
  const questions = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ key: string; def: VariableDef }> = [];
    for (const doc of chosen) {
      for (const key of doc.variables) {
        const def = library?.variables[key];
        if (def && !seen.has(key)) { seen.add(key); list.push({ key, def }); }
      }
    }
    return list;
  }, [chosen, library]);
  const missing = questions.filter((q) => !(values[q.key] ?? '').trim()).length;

  async function generate() {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    setResults(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/policies/generate-pack`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: chosen.map((d) => d.id), values }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setFeedback(typeof body?.error === 'string' ? body.error : 'Échec de la génération.');
        return;
      }
      setResults((await res.json()).documents);
      setSelected({});
      onGenerated();
    } catch {
      setFeedback('Connexion impossible : rien n\'a été créé, réessaie.');
    } finally {
      setBusy(false);
    }
  }

  if (loadError) return <p role="status" className="text-sm text-muted-foreground">Assistant de conformité indisponible pour le moment (bibliothèque non chargée). Recharge la page.</p>;
  if (!library) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dossier de conformité guidé</CardTitle>
        <p className="text-xs text-muted-foreground">
          Choisis les documents, réponds une fois aux questions : des brouillons sont créés, à relire avant de les envoyer au client. Ce sont des modèles à adapter, pas du conseil juridique.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback && <p role="status" className="text-sm">{feedback}</p>}

        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-medium">1. Documents à produire</legend>
          <div className="mb-1">
            <Button type="button" size="sm" variant="outline"
              onClick={() => setSelected(chosen.length === library.documents.length ? {} : Object.fromEntries(library.documents.map((d) => [d.id, true])))}>
              {chosen.length === library.documents.length ? 'Tout désélectionner' : 'Tout sélectionner'}</Button>
          </div>
          {library.documents.map((doc) => (
            <label key={doc.id} className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" checked={!!selected[doc.id]}
                onChange={(e) => setSelected((s) => ({ ...s, [doc.id]: e.target.checked }))} />
              <span><span className="font-medium">{doc.name}</span> <Badge variant="outline">{doc.type}</Badge>
                <span className="block text-xs text-muted-foreground">{doc.description}</span></span>
            </label>
          ))}
        </fieldset>

        {questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">2. Questions ({questions.length})</h3>
            {questions.map(({ key, def }) => (
              <div key={key}>
                <Label htmlFor={`pack-${key}`}>{def.label}</Label>
                {def.long
                  ? <Textarea id={`pack-${key}`} rows={3} placeholder={def.placeholder} value={values[key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />
                  : <Input id={`pack-${key}`} placeholder={def.placeholder} value={values[key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} />}
                {def.help && <p className="mt-0.5 text-xs text-muted-foreground">{def.help}</p>}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              {missing === 0 ? 'Toutes les questions sont renseignées.' : `${missing} question(s) sans réponse : le texte correspondant restera visible entre {{ }} dans le brouillon.`}
            </p>
          </div>
        )}

        <Button onClick={generate} disabled={busy || chosen.length === 0}>
          {busy ? 'Génération...' : `Générer ${chosen.length || ''} brouillon${chosen.length > 1 ? 's' : ''}`}
        </Button>

        {results && (
          <div className="space-y-2 rounded-md border p-3 text-sm" role="status">
            <p className="font-medium">{results.length} brouillon(s) créé(s) : ils apparaissent ci-dessus, onglet Politiques.</p>
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.id}>
                  {r.title} (v{r.version})
                  {r.unresolved.length > 0 && <span className="text-muted-foreground"> : à compléter ({r.unresolved.map((k) => library.variables[k]?.label ?? k).join(', ')})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
