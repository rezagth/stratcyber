/**
 * Priorisation du plan d'action : règles simples et lisibles, appliquées à la génération.
 *
 * Avant, toutes les actions issues d'un audit sortaient en « Haute » avec la même échéance,
 * ce qui rendait le plan inutilisable pour décider par quoi commencer. Ici :
 *  - Critique : mesures techniques de base et gestion des incidents (sauvegardes, authentification,
 *    correctifs, notification des violations...). C'est ce qui limite les dégâts d'une attaque.
 *  - Haute : obligations réglementaires (RGPD, NIS2, DORA, CRA, LPM) et chaîne d'approvisionnement.
 *  - Moyenne : gouvernance, organisation, sensibilisation, cloud, technique courante.
 *  - Faible : démarches de maturité (ISO 27001, EBIOS, spécifiques au secteur).
 * Les échéances sont étalées en vagues pour ne pas tout demander au client le même jour.
 * Ce sont des règles d'aide à la décision : l'administrateur peut toujours modifier une action.
 */

export type Priority = 'Critique' | 'Haute' | 'Moyenne' | 'Faible';

export type PrioritizableAction = { title: string; category: string };

const CRITICAL_PATTERN =
  /sauvegard|mfa|multi-?facteur|double authentification|authentification|mot(s)? de passe|correctif|patch|mise(s)? à jour|antivirus|antimalware|chiffrement|rançon|violation|notification|72\s?h|incident|accès privilégi|segmentation|pare-?feu/i;

const REGULATORY = new Set(['RGPD', 'NIS2', 'DORA', 'CRA', 'LPM', 'SupplyChain']);
const LOW = new Set(['ISO27001', 'EBIOS', 'Secteur']);

/** Délai de base (en jours) avant la première échéance, selon la priorité. */
export const BASE_DELAY_DAYS: Record<Priority, number> = { Critique: 30, Haute: 60, Moyenne: 90, Faible: 180 };
/** Nombre d'actions demandées par vague, et décalage entre deux vagues. */
export const WAVE_SIZE = 6;
export const WAVE_GAP_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

export function priorityFor(action: PrioritizableAction): Priority {
  if (CRITICAL_PATTERN.test(action.title)) return 'Critique';
  if (LOW.has(action.category)) return 'Faible';
  if (REGULATORY.has(action.category)) return 'Haute';
  return 'Moyenne';
}

const ORDER: Priority[] = ['Critique', 'Haute', 'Moyenne', 'Faible'];

/**
 * Renvoie les actions triées par priorité, chacune avec sa priorité et son échéance.
 * L'ordre relatif des actions de même priorité est conservé (tri stable).
 */
export function prioritizeActions<T extends PrioritizableAction>(
  actions: T[],
  from: Date
): Array<T & { priority: Priority; dueDate: Date }> {
  const withPriority = actions.map((action) => ({ action, priority: priorityFor(action) }));
  const result: Array<T & { priority: Priority; dueDate: Date }> = [];
  for (const level of ORDER) {
    const group = withPriority.filter((a) => a.priority === level);
    group.forEach(({ action }, index) => {
      const delay = BASE_DELAY_DAYS[level] + Math.floor(index / WAVE_SIZE) * WAVE_GAP_DAYS;
      result.push({ ...action, priority: level, dueDate: new Date(from.getTime() + delay * DAY_MS) });
    });
  }
  return result;
}
