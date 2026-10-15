'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

export default function ClientSecurityAnswersPage() {
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = () => {
    fetch('/api/client/security-answers').then((r) => r.json()).then(setAnswers);
  };
  useEffect(load, []);

  async function validate(id: string) {
    const res = await fetch(`/api/client/security-answers/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la validation.'); return; }
    setFeedback('Réponse validée.');
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <div className="mt-2 mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes réponses aux questionnaires de sécurité</h1>
        <a href="/api/client/security-answers/export" className="text-sm underline">Exporter en CSV</a>
      </div>

      {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}
      {answers === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {answers?.length === 0 && <p className="text-sm text-muted-foreground">Aucune réponse pour le moment.</p>}

      <ul className="space-y-3">
        {answers?.map((a) => (
          <li key={a.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  {a.category && <Badge variant="outline">{a.category}</Badge>}
                  <CardTitle className="text-base">{a.question}</CardTitle>
                  <Badge variant={STATUS_VARIANT[a.status] ?? 'outline'}>{a.status}</Badge>
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
                  <p className="text-sm">{a.answer}</p>
                )}
                {a.status === 'À valider' && <Button size="sm" onClick={() => validate(a.id)}>Valider cette réponse</Button>}
                {a.status === 'Brouillon' && <p className="text-xs text-muted-foreground">Réponse encore en préparation par votre consultant.</p>}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
