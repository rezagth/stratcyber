'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

type Ebook = {
  id: string; title: string; author: string; description: string | null;
  category: string; difficulty: string; duration: string | null;
  readingSessions: { progress: number; completed: boolean }[];
  quizzes: { id: string }[];
};

export default function ClientTrainingPage() {
  const [ebooks, setEbooks] = useState<Ebook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/client/training/ebooks')
      .then(async (res) => {
        if (!res.ok) throw new Error(res.status === 403 ? 'Compte non rattaché à un client.' : 'Chargement impossible.');
        setEbooks(await res.json());
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client" className="text-sm text-muted-foreground hover:underline">← Retour à l&apos;espace client</Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Formation</h1>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!error && ebooks === null && <p className="text-sm text-muted-foreground">Chargement…</p>}
      {ebooks?.length === 0 && <p className="text-sm text-muted-foreground">Aucune formation disponible pour le moment.</p>}

      <ul className="space-y-3">
        {ebooks?.map((ebook) => {
          const session = ebook.readingSessions[0];
          const progress = session?.progress ?? 0;
          return (
            <li key={ebook.id}>
              <Link href={`/client/training/ebook/${ebook.id}`} className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="transition hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{ebook.title}</CardTitle>
                      <Badge variant="outline">{ebook.category}</Badge>
                      <Badge variant="outline">{ebook.difficulty}</Badge>
                      {session?.completed && <Badge>Terminé</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{ebook.author}{ebook.duration && ` · ${ebook.duration}`}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ebook.description && <p className="text-sm text-muted-foreground">{ebook.description}</p>}
                    <Progress value={progress} />
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
