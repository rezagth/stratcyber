import { pickDefined } from '@/lib/api/whitelist';

type QuizAttemptFields = {
  answers: unknown; // objet { [questionId]: réponse }, requis
  score: unknown; // 0 à 100, calculé côté client — comme le fait déjà /training existant
};
const WHITELIST: (keyof QuizAttemptFields)[] = ['answers', 'score'];

/**
 * Valide une tentative de quiz (module J). Le score est calculé côté client (même
 * logique que la page /training existante, qui ne l'a jamais recalculé côté serveur) ;
 * seul `passed` est toujours redérivé du score et du seuil du quiz, jamais accepté du corps.
 */
export function parseQuizAttemptFields(body: unknown): { data: { answers: string; score: number } } | { error: string } {
  const picked = pickDefined<QuizAttemptFields>(body, WHITELIST);

  if (typeof picked.answers !== 'object' || picked.answers === null || Array.isArray(picked.answers)) {
    return { error: 'Réponses invalides' };
  }
  const score = picked.score;
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100) {
    return { error: 'Score invalide (0 à 100)' };
  }

  return { data: { answers: JSON.stringify(picked.answers), score } };
}
