'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const TYPES = ['Confidentialité', 'PSSI', 'Sauvegarde', 'Accès', 'Incident', 'PCA'];

type Template = { id: string; type: string; name: string; content: string; variables: string[] };

export default function PolicyTemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ type: 'PSSI', name: '', content: '' });

  const load = () => {
    fetch('/api/policy-templates').then((r) => r.json()).then(setTemplates);
  };
  useEffect(load, []);

  async function addTemplate() {
    const res = await fetch('/api/policy-templates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTemplate),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewTemplate({ type: 'PSSI', name: '', content: '' });
    load();
  }

  async function updateTemplate(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/policy-templates/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/policy-templates/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard/organizations" className="text-sm text-muted-foreground hover:underline">← Clients</Link>
      <h1 className="mt-2 mb-2 text-2xl font-semibold">Modèles de politiques</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Modèles à adapter, à faire relire par un juriste — ceci n&apos;est pas du conseil juridique.
        Utilisez <code>{'{{nom_variable}}'}</code> pour les parties à personnaliser par client.
      </p>

      {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}

      <ul className="space-y-3">
        {templates?.map((tpl) => (
          <li key={tpl.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tpl.type}</Badge>
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteTemplate(tpl.id)}>Supprimer</Button>
                </div>
                {tpl.variables.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Variables : {tpl.variables.map((v) => `{{${v}}}`).join(', ')}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <Label htmlFor={`content-${tpl.id}`}>Contenu</Label>
                <Textarea id={`content-${tpl.id}`} rows={8} defaultValue={tpl.content}
                  onBlur={(e) => { if (e.target.value !== tpl.content) updateTemplate(tpl.id, { content: e.target.value }); }} />
              </CardContent>
            </Card>
          </li>
        ))}
        {templates?.length === 0 && <p className="text-sm text-muted-foreground">Aucun modèle pour le moment.</p>}
      </ul>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Ajouter un modèle</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="new-tpl-type">Type</Label>
              <Select value={newTemplate.type} onValueChange={(type) => setNewTemplate((t) => ({ ...t, type }))}>
                <SelectTrigger id="new-tpl-type"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-tpl-name">Nom</Label>
              <Input id="new-tpl-name" value={newTemplate.name} onChange={(e) => setNewTemplate((t) => ({ ...t, name: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="new-tpl-content">Contenu (utilisez {'{{variable}}'} pour les parties à personnaliser)</Label>
            <Textarea id="new-tpl-content" rows={8} value={newTemplate.content} onChange={(e) => setNewTemplate((t) => ({ ...t, content: e.target.value }))} />
          </div>
          <Button onClick={addTemplate} disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}>Ajouter le modèle</Button>
        </CardContent>
      </Card>
    </div>
  );
}
