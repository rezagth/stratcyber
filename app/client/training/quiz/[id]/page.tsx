'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Question = { id: string; question: string; options: string[]; correctAnswer: string; explanation: string };
type Quiz = { id: string; title: string; description: string | null; questions: Question[]; passingScore: number };
type EbookSummary = { id: string; title: string; quizzes: { id: string }[] };

export default function ClientQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const [ebookId, setEbookId] = useState<string | null>(null);
  const [ebook, setEbook] = useState<EbookSummary | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    params.then((p) => setEbookId(p.id));
  }, [params]);

  useEffect(() => {
    if (!ebookId) return;
    (async () => {
      try {
        const ebookRes = await fetch(`/api/client/training/ebooks/${ebookId}`);
        if (!ebookRes.ok) throw new Error('Formation non trouvée.');
        const ebookData: EbookSummary = await ebookRes.json();
        setEbook(ebookData);
        if (!ebookData.quizzes.length) throw new Error('Aucun quiz disponible pour cette formation.');
        const quizRes = await fetch(`/api/client/training/quizzes/${ebookData.quizzes[0].id}`);
        if (!quizRes.ok) throw new Error('Quiz non trouvé.');
        setQuiz(await quizRes.json());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur inconnue.');
      }
    })();
  }, [ebookId]);

  function select(questionId: string, answer: string) {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  }

  async function submit() {
    if (!quiz) return;
    const correct = quiz.questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    setSubmitting(true);
    const res = await fetch(`/api/client/training/quizzes/${quiz.id}/attempts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: selectedAnswers, score }),
    });
    setSubmitting(false);
    if (!res.ok) { setError((await res.json()).error ?? "Échec de l'enregistrement."); return; }
    const attempt = await res.json();
    setResult({ score: attempt.score, passed: attempt.passed });
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="text-sm text-red-600">{error}</p>
        <Link href="/client/training" className="text-sm text-muted-foreground hover:underline">← Retour à la formation</Link>
      </div>
    );
  }
  if (!quiz || !ebook) return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-muted-foreground">Chargement…</div>;

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href={`/client/training/ebook/${ebook.id}`} className="text-sm text-muted-foreground hover:underline">← Retour à la formation</Link>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-xl">{result.passed ? 'Quiz réussi !' : 'Résultat insuffisant'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Votre score : <strong>{result.score}%</strong> (seuil de réussite : {quiz.passingScore}%)</p>
            <Badge variant={result.passed ? 'default' : 'destructive'}>{result.passed ? 'Réussi' : 'Non réussi'}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = quiz.questions[currentQuestion];
  const allAnswered = quiz.questions.every((question) => selectedAnswers[question.id]);
  const isLast = currentQuestion === quiz.questions.length - 1;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href={`/client/training/ebook/${ebook.id}`} className="text-sm text-muted-foreground hover:underline">← Retour à la formation</Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} sur {quiz.questions.length}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-medium">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((option) => (
              <label
                key={option}
                className={`block cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                  selectedAnswers[q.id] === option ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'
                }`}
              >
                <input type="radio" name={`q-${q.id}`} value={option} checked={selectedAnswers[q.id] === option}
                  onChange={() => select(q.id, option)} className="sr-only" />
                {option}
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((i) => i - 1)}>Précédent</Button>
            {isLast ? (
              <Button disabled={!allAnswered || submitting} onClick={submit}>Terminer le quiz</Button>
            ) : (
              <Button disabled={!selectedAnswers[q.id]} onClick={() => setCurrentQuestion((i) => i + 1)}>Suivant</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
