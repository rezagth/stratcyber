/**
 * Dédoublonnage sémantique des actions du plan.
 * Plusieurs questions (RGPD, NIS2, ISO, incidents…) recommandent la même action avec des
 * formulations différentes (ex. « tenir un registre des traitements » ×3). On garde la
 * première occurrence (la plus prioritaire, le plan arrivant déjà trié) et on écarte les
 * actions dont le sens est quasi identique, dans la même famille de sujet.
 */

const STOPWORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'et', 'ou', 'en', 'au', 'aux', 'a', 'pour',
  'par', 'sur', 'dans', 'avec', 'sans', 'chaque', 'tous', 'toutes', 'tout', 'son', 'sa', 'ses', 'leur',
  'leurs', 'ce', 'cette', 'ces', 'qui', 'que', 'est', 'sont', 'etre', 'se', 'si', 'plus', 'au', 'moins',
  'une', 'fois', 'an', 'annee', 'mettre', 'place', 'definir', 'formaliser', 'etablir', 'realiser',
  'planifier', 'organiser',
]);

export function normalizeTokens(text: string): string[] {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
  return base
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .map((t) => (t.length > 5 ? t.slice(0, 6) : t)); // racine grossière (singulier/pluriel, conjugaison)
}

function similarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  const jaccard = inter / (a.size + b.size - inter);
  const containment = inter / Math.min(a.size, b.size);
  return Math.max(jaccard, containment * 0.85);
}

export function dedupeActions<T extends { category: string; action: string }>(
  items: T[],
  threshold = 0.4
): T[] {
  const kept: { item: T; tokens: Set<string> }[] = [];
  for (const item of items) {
    const tokens = new Set(normalizeTokens(item.action));
    const duplicate = kept.some(
      (k) => k.item.action === item.action || similarity(tokens, k.tokens) >= threshold
    );
    if (!duplicate) kept.push({ item, tokens });
  }
  return kept.map((k) => k.item);
}
