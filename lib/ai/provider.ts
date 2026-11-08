/**
 * Fournisseur d'IA générique, désactivé par défaut.
 *
 * Activation par variables d'environnement uniquement (jamais dans le code ni dans la base) :
 *  - ANTHROPIC_API_KEY : clé API ;
 *  - AI_MODEL : identifiant du modèle à utiliser (aucun nom de modèle n'est supposé ici).
 * Si l'une des deux manque, `generateText` renvoie null et l'appelant utilise son repli sans IA.
 *
 * Règle de confidentialité : l'appelant n'envoie que des faits agrégés (scores, comptes, intitulés de
 * domaines), jamais de noms de clients, d'e-mails ni de réponses libres.
 */
export function isAiConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.ANTHROPIC_API_KEY && env.AI_MODEL);
}

export async function generateText(
  prompt: { system: string; user: string; maxTokens?: number },
  options: { env?: NodeJS.ProcessEnv; fetchImpl?: typeof fetch; timeoutMs?: number } = {}
): Promise<string | null> {
  const env = options.env ?? process.env;
  if (!isAiConfigured(env)) return null;
  const doFetch = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 20_000);
  try {
    const res = await doFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.AI_MODEL,
        max_tokens: prompt.maxTokens ?? 600,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }],
      }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const text = Array.isArray(body?.content)
      ? body.content.filter((b: { type?: string }) => b?.type === 'text').map((b: { text?: string }) => b.text ?? '').join('\n').trim()
      : '';
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
