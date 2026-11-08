import { DOCUMENTS, type LibraryDocument } from '@/lib/policy/library-documents';
import { VARIABLES, MAX_LONG, MAX_SHORT, type VariableDef } from '@/lib/policy/library-variables';
import { extractVariables } from '@/lib/policy/template-engine';

export type { LibraryDocument, VariableDef };
export const POLICY_LIBRARY: LibraryDocument[] = DOCUMENTS;

export function getLibraryDocument(id: string): LibraryDocument | undefined {
  return POLICY_LIBRARY.find((doc) => doc.id === id);
}

/** Variables d'un document, dans l'ordre d'apparition. */
export function documentVariables(doc: LibraryDocument): string[] {
  return extractVariables(doc.content);
}

/** Questions à poser pour un ensemble de documents : union dédoublonnée, dans l'ordre des documents. */
export function questionsFor(documentIds: string[]): Array<{ key: string } & VariableDef> {
  const seen = new Set<string>();
  const questions: Array<{ key: string } & VariableDef> = [];
  for (const id of documentIds) {
    const doc = getLibraryDocument(id);
    if (!doc) continue;
    for (const key of documentVariables(doc)) {
      const def = VARIABLES[key];
      if (!def || seen.has(key)) continue;
      seen.add(key);
      questions.push({ key, ...def });
    }
  }
  return questions;
}

/**
 * Nettoie les valeurs reçues : uniquement des variables connues, uniquement du texte, bornées en
 * longueur. Tout le reste est ignoré (jamais d'erreur silencieuse sur le contenu, jamais de clé arbitraire).
 */
export function sanitizeValues(raw: unknown): Record<string, string> {
  const values: Record<string, string> = {};
  if (!raw || typeof raw !== 'object') return values;
  for (const [key, def] of Object.entries(VARIABLES)) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value !== 'string') continue;
    const trimmed = value.trim().slice(0, def.long ? MAX_LONG : MAX_SHORT);
    if (trimmed) values[key] = trimmed;
  }
  return values;
}
