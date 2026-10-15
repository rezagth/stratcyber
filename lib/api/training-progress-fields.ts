import { pickDefined } from '@/lib/api/whitelist';

type ProgressFields = {
  currentPage: unknown;
  progress: unknown;
  timeSpent: unknown;
};
const WHITELIST: (keyof ProgressFields)[] = ['currentPage', 'progress', 'timeSpent'];

type ParsedProgress = { currentPage?: number; progress?: number; timeSpent?: number; completed?: boolean };

/**
 * Valide la progression de lecture d'un ebook (module J). `completed` n'est jamais
 * accepté du corps de la requête : toujours redérivé de `progress` (>= 100), côté serveur.
 */
export function parseReadingProgressFields(body: unknown): { data: ParsedProgress } | { error: string } {
  const picked = pickDefined<ProgressFields>(body, WHITELIST);
  const data: ParsedProgress = {};

  if (picked.currentPage !== undefined) {
    const v = picked.currentPage;
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) return { error: 'Page actuelle invalide' };
    data.currentPage = v;
  }
  if (picked.progress !== undefined) {
    const v = picked.progress;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 100) return { error: 'Progression invalide (0 à 100)' };
    data.progress = v;
    data.completed = v >= 100;
  }
  if (picked.timeSpent !== undefined) {
    const v = picked.timeSpent;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return { error: 'Temps passé invalide' };
    data.timeSpent = v;
  }

  return { data };
}
