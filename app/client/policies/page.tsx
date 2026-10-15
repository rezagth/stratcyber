'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PolicyDocument = {
  id: string; type: string; title: string; content: string; version: number; status: string;
  validatedByName: string | null; validatedAt: string | null;
};

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary' | 'outline'> = {
  'Validé': 'default',
  'À valider': 'secondary',
  'Brouillon': 'outline',
};

export default function ClientPoliciesPage() {
  const [documents, setDocuments] = useState<PolicyDocument[] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = () => {
    fetch('/api/client/policies').then((r) => r.json()).then(setDocuments);
  };
  useEffect(load, []);

  async function validate(id: string) {
    const res = await fetch(`/api/client/policies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res.ok) { setFeedback((await res.json()).error ?? 'Échec de la validation.'); return; }
    setFeedback('Document validé.');
    load();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-2 text-2xl font-semibold">Mes politiques et livrables</h1>
      <p className="mb-6 text-xs text-muted-foreground">
        Modèles à adapter, à faire relire par un juriste — ceci n&apos;est pas du conseil juridique.
      </p>

      {feedback && <p role="status" className="mb-4 text-sm">{feedback}</p>}
      {documents === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {documents?.length === 0 && <p className="text-sm text-muted-foreground">Aucun document pour le moment.</p>}

      <ul className="space-y-3">
        {documents?.map((doc) => (
          <li key={doc.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{doc.type}</Badge>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <span className="text-xs text-muted-foreground">v{doc.version}</span>
                  <Badge variant={STATUS_VARIANT[doc.status] ?? 'outline'}>{doc.status}</Badge>
                </div>
                {doc.status === 'Validé' && doc.validatedByName && (
                  <p className="text-xs text-muted-foreground">
                    Validé par {doc.validatedByName} le {new Date(doc.validatedAt!).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">{doc.content}</pre>
                {doc.status === 'À valider' && (
                  <Button size="sm" onClick={() => validate(doc.id)}>Valider ce document</Button>
                )}
                {doc.status === 'Brouillon' && (
                  <p className="text-xs text-muted-foreground">Document encore en préparation par votre consultant.</p>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
