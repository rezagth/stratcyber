/**
 * Ne retient, dans `body`, que les clés explicitement listées dans `allowed`. Brique du
 * "moteur commun" : chaque route décide sa propre liste blanche par rôle (ex. un client
 * ne peut mettre à jour que `status`/`proofOfCompletion`, jamais `estimatedCost`), mais
 * passe toujours par cette même fonction plutôt que de recopier `body` tel quel dans un
 * `prisma.update` (ce qui permettrait une affectation de masse).
 */
export function pickDefined<T extends Record<string, unknown>>(
  body: unknown,
  allowed: readonly (keyof T)[]
): Partial<T> {
  const out: Partial<T> = {};
  if (!body || typeof body !== 'object') return out;
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = (body as Record<string, unknown>)[key as string] as T[keyof T];
    }
  }
  return out;
}
