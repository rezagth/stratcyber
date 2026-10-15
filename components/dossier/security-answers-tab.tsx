'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Answer = {
  id: string; question: string; answer: string | null; isNotApplicable: boolean;
  notApplicableReason: string | null; category: string | null; answeredAt: string; status: string;
  validatedByName: string | null; validatedAt: string | null;
};

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Validé': 'default',
  'À valider': 'secondary',
  'Brouillon': 'outline',
};

export function SecurityAnswersTab({ organizationId }: { organizationId: string }) {
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState({ question: '', answer: '', category: '', isNotApplicable: false, notApplicableReason: '' });

  const load = () => {
    fetch(`/api/organizations/${organizationId}/security-answers`).then((r) => r.json()).then(setAnswers);
  };
  useEffect(load, [organizationId]);

  async function addAnswer() {
    const res = await fetch(`/api/organizations/${organizationId}/security-answers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: newAnswer.question,
        category: newAnswer.category || undefined,
        isNotApplicable: newAnswer.isNotApplicable,
        answer: newAnswer.isNotApplicable ? undefined : newAnswer.answer,
        notApplicableReason: newAnswer.isNotApplicable ? newAnswer.notApplicableReason : undefined,
      }),
    });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la création.'); return; }
    setNewAnswer({ question: '', answer: '', category: '', isNotApplicable: false, notApplicableReason: '' });
    load();
  }

  async function updateAnswer(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/security-answers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la mise à jour.'); return; }
    load();
  }

  async function deleteAnswer(id: string) {
    await fetch(`/api/security-answers/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Réponses datées et honnêtes, réutilisables pour vos questionnaires grands comptes et assureurs.</p>
        <a href={`/api/organizations/${organizationId}/security-answers/export`} className="text-sm underline">Exporter en CSV</a>
      </div>
      {feedback && <p role="status" className="text-sm">{feedback}</p>}

      <ul className="space-y-3">
        {answers?.map((a) => (
          <li key={a.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {a.category && <Badge variant="outline">{a.category}</Badge>}
                    <CardTitle className="text-base">{a.question}</CardTitle>
                    <Badge variant={STATUS_VARIANT[a.status] ?? 'outline'}>{a.status}</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => deleteAnswer(a.id)}>Supprimer</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Réponse du {new Date(a.answeredAt).toLocaleDateString('fr-FR')}
                  {a.status === 'Validé' && a.validatedByName && ` · validée par ${a.validatedByName} le ${new Date(a.validatedAt!).toLocaleDateString('fr-FR')}`}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {a.isNotApplicable ? (
                  <p className="text-sm"><span className="font-medium">Non applicable</span> — {a.notApplicableReason}</p>
                ) : (
                  <Textarea rows={2} defaultValue={a.answer ?? ''} aria-label="Réponse"
                    onBlur={(e) => { if (e.target.value !== (a.answer ?? '')) updateAnswer(a.id, { answer: e.target.value }); }} />
                )}
                {a.status === 'Brouillon' && (
                  <Button size="sm" onClick={() => updateAnswer(a.id, { status: 'À valider' })}>Envoyer au client pour validation</Button>
                )}
                {a.status === 'À valider' && <p className="text-xs text-muted-foreground">En attente de validation par la direction du client.</p>}
              </CardContent>
            </Card>
          </li>
        ))}
        {answers?.length === 0 && <p className="text-sm text-muted-foreground">Aucune réponse pour le moment.</p>}
      </ul>

      <Card>
        <CardHeader><CardTitle className="text-base">Ajouter une réponse</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="new-q">Question</Label>
            <Input id="new-q" value={newAnswer.question} onChange={(e) => setNewAnswer((a) => ({ ...a, question: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="new-cat">Catégorie (optionnel)</Label>
            <Input id="new-cat" value={newAnswer.category} onChange={(e) => setNewAnswer((a) => ({ ...a, category: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 rounded border-input" checked={newAnswer.isNotApplicable}
              onChange={(e) => setNewAnswer((a) => ({ ...a, isNotApplicable: e.target.checked }))} />
            Non applicable
          </label>
          {newAnswer.isNotApplicable ? (
            <div>
              <Label htmlFor="new-na-reason">Motif (requis)</Label>
              <Textarea id="new-na-reason" rows={2} value={newAnswer.notApplicableReason}
                onChange={(e) => setNewAnswer((a) => ({ ...a, notApplicableReason: e.target.value }))} />
            </div>
          ) : (
            <div>
              <Label htmlFor="new-answer">Réponse</Label>
              <Textarea id="new-answer" rows={2} value={newAnswer.answer}
                onChange={(e) => setNewAnswer((a) => ({ ...a, answer: e.target.value }))} />
            </div>
          )}
          <Button
            onClick={addAnswer}
            disabled={!newAnswer.question.trim() || (newAnswer.isNotApplicable ? !newAnswer.notApplicableReason.trim() : !newAnswer.answer.trim())}
          >
            Ajouter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
