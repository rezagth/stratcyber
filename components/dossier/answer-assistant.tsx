'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Match = { id: string; question: string; answer: string | null; isNotApplicable: boolean; notApplicableReason: string | null; status: string; answeredAt: string; score: number };
type Suggestion = { matches: Match[]; draft: string | null; aiAvailable: boolean };

/** Aide à la réponse : retrouve les réponses déjà données au client pour une question de questionnaire. */
export function AnswerAssistant({ organizationId }: { organizationId: string }) {
  const [question, setQuestion] = useState('');
  const [useAi, setUseAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Suggestion | null>(null);

  async function search() {
    if (busy || question.trim().length < 5) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const res = await fetch(`/api/organizations/${organizationId}/security-answers/suggest`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, useAi }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) { setError(typeof body?.error === 'string' ? body.error : 'Recherche impossible.'); return; }
      setResult(body);
    } catch { setError('Connexion impossible, réessaie.'); }
    finally { setBusy(false); }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Aide à la réponse</CardTitle>
        <p className="text-xs text-muted-foreground">Colle une question reçue (grand compte, assureur) : les réponses déjà données à ce client qui s&apos;en rapprochent s&apos;affichent. Rien n&apos;est ajouté sans ton accord.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor="assist-q">Question reçue</Label>
          <Textarea id="assist-q" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={1000} />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
          <span>Rédiger un brouillon avec l&apos;IA<span className="block text-xs text-muted-foreground">Envoie à l&apos;IA les réponses retenues de ce client. Disponible seulement si l&apos;IA est configurée.</span></span>
        </label>
        <Button onClick={search} disabled={busy || question.trim().length < 5}>{busy ? 'Recherche...' : 'Chercher dans les réponses existantes'}</Button>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {result && (
          <div className="space-y-2" role="status">
            {result.matches.length === 0 && <p className="text-sm text-muted-foreground">Aucune réponse proche : ajoute-la ci-dessous, elle servira la prochaine fois.</p>}
            {result.matches.map((m) => (
              <div key={m.id} className="rounded-md border p-2 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{m.status}</Badge><span>Réponse du {new Date(m.answeredAt).toLocaleDateString('fr-FR')}</span><span>Proximité {Math.round(m.score * 100)} %</span>
                </div>
                <p className="mt-1 font-medium">{m.question}</p>
                <p>{m.isNotApplicable ? `Non applicable — ${m.notApplicableReason ?? ''}` : m.answer}</p>
              </div>
            ))}
            {useAi && !result.aiAvailable && <p className="text-xs text-muted-foreground">L&apos;IA n&apos;est pas configurée sur ce serveur : seules les réponses existantes sont proposées.</p>}
            {result.draft && (
              <div className="rounded-md border border-dashed p-2 text-sm">
                <p className="mb-1 text-xs text-muted-foreground">Brouillon rédigé par l&apos;IA à partir des réponses ci-dessus : à relire avant tout envoi.</p>
                <p className="whitespace-pre-wrap">{result.draft}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
