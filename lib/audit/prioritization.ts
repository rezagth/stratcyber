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

/* ------------------------------------------------------------------ */
/* Plan réaliste : un horizon de 90 jours limité + une phase 2         */
/* ------------------------------------------------------------------ */

export type Effort = 'rapide' | 'moyen' | 'lourd';

/** Nombre maximum d'actions demandées au client sur les 90 premiers jours. */
export const PHASE1_MAX = 15;
export const PHASE1_DAYS = 90;
/** Phase 2 : démarre après la phase 1, une vague de WAVE_SIZE actions par mois. */
export const PHASE2_WAVE_GAP_DAYS = 30;

const QUICK_PATTERN =
  /mfa|multi-?facteur|double authentification|mises? à jour|correctif|patch|désigner|nommer|point de contact|activer|antivirus|antimalware|mots? de passe/i;
const HEAVY_PATTERN =
  /certification|iso\s?27001|ebios|cartograph|analyse de risques|audit|continuité|\bpca\b|\bpra\b|documenter|registre|politique|procédure|formaliser|résilience|programme|schéma directeur/i;

export function estimateEffort(title: string): Effort {
  if (QUICK_PATTERN.test(title) && !HEAVY_PATTERN.test(title)) return 'rapide';
  if (HEAVY_PATTERN.test(title)) return 'lourd';
  return 'moyen';
}

const EFFORT_RANK: Record<Effort, number> = { rapide: 0, moyen: 1, lourd: 2 };
const EFFORT_LABEL: Record<Effort, string> = {
  rapide: 'Effort estimé : rapide (environ 1 jour ou moins).',
  moyen: 'Effort estimé : moyen (quelques jours).',
  lourd: 'Effort estimé : lourd (plusieurs semaines).',
};
const PROOF_LABEL: Record<Effort, string> = {
  rapide: 'Preuve attendue : capture d’écran de la configuration ou confirmation écrite.',
  moyen: 'Preuve attendue : document ou procédure datée et validée.',
  lourd: 'Preuve attendue : livrable validé par la direction (document, rapport ou attestation).',
};

export type PlannedAction<T> = T & {
  priority: Priority;
  dueDate: Date;
  effort: Effort;
  phase: 1 | 2;
  description: string;
};

/**
 * Construit un plan réaliste à partir des actions candidates :
 *  - tri par priorité, puis gains rapides d'abord (effort croissant), puis ordre d'origine ;
 *  - phase 1 : les PHASE1_MAX premières, toutes dues dans les 90 jours (un gain rapide : 14 jours) ;
 *  - phase 2 : le reste, après 90 jours, en vagues mensuelles. Une priorité « Haute » y devient
 *    « Moyenne » : tout ne peut pas être urgent en même temps. « Critique » est conservée.
 * Chaque action reçoit dans `description` l'effort estimé, la phase et la preuve attendue.
 */
export function planActions<T extends PrioritizableAction>(actions: T[], from: Date): PlannedAction<T>[] {
  const ranked = actions
    .map((action, index) => {
      const priority = priorityFor(action);
      return { action, index, priority, effort: estimateEffort(action.title) };
    })
    .sort(
      (a, b) =>
        ORDER.indexOf(a.priority) - ORDER.indexOf(b.priority) ||
        EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort] ||
        a.index - b.index
    );

  return ranked.map((r, i) => {
    const phase: 1 | 2 = i < PHASE1_MAX ? 1 : 2;
    let priority = r.priority;
    let delay: number;
    if (phase === 1) {
      const wave = Math.floor(i / WAVE_SIZE);
      delay =
        r.effort === 'rapide'
          ? 14 + wave * 7
          : Math.min(PHASE1_DAYS, BASE_DELAY_DAYS[priority] + wave * WAVE_GAP_DAYS);
    } else {
      if (priority === 'Haute') priority = 'Moyenne';
      delay = PHASE1_DAYS + (1 + Math.floor((i - PHASE1_MAX) / WAVE_SIZE)) * PHASE2_WAVE_GAP_DAYS;
    }
    const intro = phase === 1 ? 'Phase 1 : à traiter dans les 90 jours.' : 'Phase 2 : à planifier après les 90 premiers jours.';
    return {
      ...r.action,
      priority,
      dueDate: new Date(from.getTime() + delay * DAY_MS),
      effort: r.effort,
      phase,
      description: `${intro} ${EFFORT_LABEL[r.effort]} ${PROOF_LABEL[r.effort]}`,
    };
  });
}
