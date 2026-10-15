'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Template = { id: string; type: string; name: string; content: string; variables: string[] };
type PolicyDocument = {
  id: string; type: string; title: string; content: string; version: number; status: string;
  validatedByName: string | null; validatedAt: string | null; templateId: string | null;
};

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Validé': 'default',
  'À valider': 'secondary',
  'Brouillon': 'outline',
};

export function PoliciesTab({ organizationId }: { organizationId: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [documents, setDocuments] = useState<PolicyDocument[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [title, setTitle] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});

  const load = () => {
    fetch('/api/policy-templates').then((r) => r.json()).then(setTemplates);
    fetch(`/api/organizations/${organizationId}/policies`).then((r) => r.json()).then(setDocuments);
  };
  useEffect(load, [organizationId]);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null;

  const byType = useMemo(() => {
    const groups = new Map<string, PolicyDocument[]>();
    for (const doc of documents ?? []) {
      if (!groups.has(doc.type)) groups.set(doc.type, []);
      groups.get(doc.type)!.push(doc);
    }
    for (const list of groups.values()) list.sort((a, b) => b.version - a.version);
    return groups;
  }, [documents]);

  async function generate() {
    if (!selectedTemplateId) { setFeedback('Choisissez un modèle.'); return; }
    const res = await fetch(`/api/organizations/${organizationId}/policies/generate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: selectedTemplateId, title: title || undefined, values }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la génération.'); return; }
    setTitle('');
    setValues({});
    load();
  }

  async function updateDocument(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/policies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteDocument(id: string) {
    await fetch(`/api/policies/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted-foreground">
        Modèles à adapter, à faire relire par un juriste — ceci n&apos;est pas du conseil juridique.
      </p>
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <ul className="space-y-3">
        {Array.from(byType.entries()).map(([type, docs]) => {
          const [current, ...history] = docs;
          const expanded = expandedHistory[type];
          return (
            <li key={type}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{type}</Badge>
                      <CardTitle className="text-base">{current.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">v{current.version}</span>
                      <Badge variant={STATUS_VARIANT[current.status] ?? 'outline'}>{current.status}</Badge>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => deleteDocument(current.id)}>Supprimer</Button>
                  </div>
                  {current.status === 'Validé' && current.validatedByName && (
                    <p className="text-xs text-muted-foreground">
                      Validé par {current.validatedByName} le {new Date(current.validatedAt!).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {current.status === 'Brouillon' ? (
                    <>
                      <Label htmlFor={`content-${current.id}`}>Contenu</Label>
                      <Textarea id={`content-${current.id}`} rows={6} defaultValue={current.content}
                        onBlur={(e) => { if (e.target.value !== current.content) updateDocument(current.id, { content: e.target.value }); }} />
                      <Button size="sm" onClick={() => updateDocument(current.id, { status: 'À valider' })}>
                        Envoyer au client pour validation
                      </Button>
                    </>
                  ) : (
                    <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{current.content}</pre>
                  )}
                  {current.status === 'À valider' && (
                    <p className="text-xs text-muted-foreground">En attente de validation par la direction du client.</p>
                  )}

                  {history.length > 0 && (
                    <div>
                      <button type="button" className="text-xs text-muted-foreground underline"
                        onClick={() => setExpandedHistory((e) => ({ ...e, [type]: !e[type] }))}>
                        {expanded ? 'Masquer' : 'Voir'} l&apos;historique ({history.length} version{history.length > 1 ? 's' : ''})
                      </button>
                      {expanded && (
                        <ul className="mt-2 space-y-2">
                          {history.map((doc) => (
                            <li key={doc.id} className="rounded-md border p-2 text-xs">
                              <div className="mb-1 flex items-center gap-2">
                                <span>v{doc.version}</span>
                                <Badge variant={STATUS_VARIANT[doc.status] ?? 'outline'}>{doc.status}</Badge>
                                {doc.validatedByName && <span className="text-muted-foreground">validé par {doc.validatedByName}</span>}
                              </div>
                              <pre className="whitespace-pre-wrap text-muted-foreground">{doc.content}</pre>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
        {documents?.length === 0 && <p className="text-sm text-muted-foreground">Aucun document de politique pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Générer un document depuis un modèle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="policy-template">Modèle</Label>
            <Select value={selectedTemplateId} onValueChange={(id) => { setSelectedTemplateId(id); setValues({}); }}>
              <SelectTrigger id="policy-template"><SelectValue placeholder="Choisir un modèle" /></SelectTrigger>
              <SelectContent>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.type} — {t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {selectedTemplate && (
            <>
              <div>
                <Label htmlFor="policy-title">Titre (optionnel)</Label>
                <Input id="policy-title" placeholder={selectedTemplate.name} value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              {selectedTemplate.variables.map((v) => (
                <div key={v}>
                  <Label htmlFor={`var-${v}`}>{v}</Label>
                  <Input id={`var-${v}`} value={values[v] ?? ''} onChange={(e) => setValues((vals) => ({ ...vals, [v]: e.target.value }))} />
                </div>
              ))}
              <Button onClick={generate}>Générer le document</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
