/**
 * Moteur de variables pour les modèles de politiques (module E) : remplacement simple
 * de `{{nom_variable}}` par sa valeur. Pas de logique conditionnelle ni de boucle —
 * un modèle de document n'en a pas besoin, et plus de puissance = plus de risque de
 * laisser passer une variable mal substituée dans un document livré à un client.
 */

const VARIABLE_RE = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

/** Liste les noms de variables présentes dans un modèle, dans leur ordre d'apparition, sans doublon. */
export function extractVariables(content: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const match of content.matchAll(VARIABLE_RE)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

/**
 * Remplace chaque `{{variable}}` par sa valeur fournie. Une variable sans valeur
 * fournie est laissée TELLE QUELLE dans le texte (jamais silencieusement vidée) :
 * mieux vaut un `{{nom_variable}}` visible et suspect qu'un trou invisible dans un
 * document juridique.
 */
export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(VARIABLE_RE, (match, name) => {
    const value = values[name];
    return typeof value === 'string' && value.trim() ? value : match;
  });
}

/** Les variables encore présentes après substitution (utile pour avertir l'admin avant validation). */
export function unresolvedVariables(filledContent: string): string[] {
  return extractVariables(filledContent);
}
