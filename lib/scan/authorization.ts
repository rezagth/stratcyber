/**
 * Règle centrale d'une campagne : AUCUN contrôle ne part sans autorisation écrite du client, valable
 * à l'instant du contrôle. Scanner le système d'autrui sans accord écrit est pénalement répréhensible
 * (articles 323-1 et suivants du Code pénal) : cette règle est donc vérifiée côté serveur à chaque lancement,
 * jamais seulement dans l'interface.
 */

export const CAMPAIGN_STATUSES = ['Brouillon', 'Autorisée', 'Terminée', 'Annulée'] as const;
export const CLOSED_STATUSES: readonly string[] = ['Terminée', 'Annulée'];
export const MAX_WINDOW_DAYS = 90;
export const MAX_TARGETS = 10;

const DAY = 86_400_000;

export type CampaignAuthorization = {
  status: string;
  authorizedByName: string | null;
  authorizedByRole: string | null;
  authorizationRef: string | null;
  authorizedAt: Date | null;
  windowStart: Date | null;
  windowEnd: Date | null;
};

/** La date de fin est saisie sans heure : la journée entière est autorisée. */
export const windowEndInclusive = (end: Date) => new Date(end.getTime() + DAY - 1);

/** Cohérence des champs d'autorisation déjà renseignés (null = pas de problème ; message en français sinon). */
export function authorizationDataProblem(c: Omit<CampaignAuthorization, 'status'>, now: Date = new Date()): string | null {
  if (c.authorizedAt && c.authorizedAt.getTime() > now.getTime() + DAY) return 'La date de signature ne peut pas être dans le futur.';
  if (c.windowStart && c.windowEnd) {
    if (c.windowEnd.getTime() < c.windowStart.getTime()) return 'La fin de la période autorisée précède son début.';
    if ((c.windowEnd.getTime() - c.windowStart.getTime()) / DAY > MAX_WINDOW_DAYS) {
      return `La période autorisée ne doit pas dépasser ${MAX_WINDOW_DAYS} jours : une autorisation courte limite les risques.`;
    }
  }
  return null;
}

/** Les informations de l'autorisation sont-elles toutes présentes ? (null = complet) */
export function authorizationMissing(c: Omit<CampaignAuthorization, 'status'>): string | null {
  const missing: string[] = [];
  if (!c.authorizedByName?.trim()) missing.push('nom du signataire');
  if (!c.authorizedByRole?.trim()) missing.push('fonction du signataire');
  if (!c.authorizationRef?.trim()) missing.push('référence du document signé');
  if (!c.authorizedAt) missing.push('date de signature');
  if (!c.windowStart) missing.push('début de la période autorisée');
  if (!c.windowEnd) missing.push('fin de la période autorisée');
  return missing.length > 0 ? `Autorisation incomplète : ${missing.join(', ')}.` : null;
}

/** Peut-on lancer un contrôle maintenant ? null = oui ; sinon la raison du refus. */
export function launchProblem(c: CampaignAuthorization, now: Date = new Date()): string | null {
  if (CLOSED_STATUSES.includes(c.status)) return `Campagne ${c.status === 'Annulée' ? 'annulée' : 'terminée'} : aucun contrôle possible.`;
  if (c.status !== 'Autorisée') return "L'autorisation écrite du client n'est pas confirmée pour cette campagne.";
  const missing = authorizationMissing(c);
  if (missing) return missing;
  const data = authorizationDataProblem(c, now);
  if (data) return data;
  if (now.getTime() < c.windowStart!.getTime()) return "La période autorisée n'a pas encore commencé.";
  if (now.getTime() > windowEndInclusive(c.windowEnd!).getTime()) return 'La période autorisée est terminée : demande une nouvelle autorisation au client.';
  return null;
}
