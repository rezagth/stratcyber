'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Ebook = {
  id: string; title: string; author: string; description: string | null;
  content: { markdown?: string } | string | null;
  category: string; difficulty: string;
  readingSessions: { progress: number; completed: boolean; timeSpent: number }[];
  quizzes: { id: string }[];
};

export default function ClientEbookReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const [ebookId, setEbookId] = useState<string | null>(null);
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressDisplay, setProgressDisplay] = useState(0);
  const [completed, setCompleted] = useState(false);

  const progressRef = useRef(0);
  const secondsRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    params.then((p) => setEbookId(p.id));
  }, [params]);

  useEffect(() => {
    if (!ebookId) return;
    fetch(`/api/client/training/ebooks/${ebookId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Formation non trouvée.');
        const data: Ebook = await res.json();
        setEbook(data);
        const session = data.readingSessions[0];
        progressRef.current = session?.progress ?? 0;
        secondsRef.current = 0;
        setProgressDisplay(progressRef.current);
        setCompleted(session?.completed ?? false);
      })
      .catch((e: Error) => setError(e.message));
  }, [ebookId]);

  function saveProgress(extra: { progress?: number; completed?: boolean } = {}) {
    if (!ebookId) return;
    if (extra.progress !== undefined) progressRef.current = extra.progress;
    fetch(`/api/client/training/ebooks/${ebookId}/progress`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ progress: progressRef.current, timeSpent: secondsRef.current }),
    }).catch(() => {});
    setProgressDisplay(progressRef.current);
    if (extra.completed !== undefined) setCompleted(extra.completed);
  }

  useEffect(() => {
    if (!ebookId) return;
    const secondsInterval = setInterval(() => { secondsRef.current += 1; }, 1000);
    const saveInterval = setInterval(() => saveProgress(), 20000);
    return () => {
      clearInterval(secondsInterval);
      clearInterval(saveInterval);
      saveProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ebookId]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const pct = max <= 0 ? 100 : Math.min(100, Math.round((el.scrollTop / max) * 100));
    if (pct > progressRef.current) {
      progressRef.current = pct;
      setProgressDisplay(pct);
    }
  }

  function markCompleted() {
    saveProgress({ progress: 100, completed: true });
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="text-sm text-red-600">{error}</p>
        <Link href="/client/training" className="text-sm text-muted-foreground hover:underline">← Retour à la formation</Link>
      </div>
    );
  }
  if (!ebook) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">Chargement…</div>;

  const markdown = typeof ebook.content === 'string' ? ebook.content : ebook.content?.markdown ?? '';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/client/training" className="text-sm text-muted-foreground hover:underline">← Retour à la formation</Link>

      <div className="mt-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{ebook.title}</h1>
          <Badge variant="outline">{ebook.category}</Badge>
          <Badge variant="outline">{ebook.difficulty}</Badge>
          {completed && <Badge>Terminé</Badge>}
        </div>
        <p className="text-sm text-muted-foreground">{ebook.author}</p>
      </div>

      <Progress value={progressDisplay} className="mb-4" />

      <Card>
        <CardContent ref={containerRef} onScroll={handleScroll} className="prose prose-sm max-w-none py-6 max-h-[60vh] overflow-y-auto">
          {markdown ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown> : <p className="text-muted-foreground">Contenu non disponible.</p>}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!completed && <Button onClick={markCompleted}>Marquer comme terminé</Button>}
        {ebook.quizzes.length > 0 && (
          <Link href={`/client/training/quiz/${ebook.id}`}>
            <Button variant="outline">Passer le quiz</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
