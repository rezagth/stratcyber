/** Lit `?month=&year=` d'une requête de rapport mensuel (module K) ; mois courant par défaut. */
export function parsePeriodParams(url: URL): { month: number; year: number } | { error: string } {
  const now = new Date();
  const month = parseInt(url.searchParams.get('month') ?? String(now.getMonth() + 1), 10);
  const year = parseInt(url.searchParams.get('year') ?? String(now.getFullYear()), 10);
  if (!Number.isInteger(month) || month < 1 || month > 12) return { error: 'Mois invalide (1 à 12)' };
  if (!Number.isInteger(year) || year < 2000 || year > 2100) return { error: 'Année invalide' };
  return { month, year };
}
