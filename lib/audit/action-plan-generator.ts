import { computeAuditResult, generateActionPlan } from './scoring';

type AuditForGeneration = {
  id: string;
  organizationId: string | null;
  createdAt: Date;
  responses: { question: string; answer: string; score: number | null }[];
};

export type GeneratedActionPlanItem = {
  organizationId: string;
  auditId: string;
  title: string;
  category: string;
  priority: 'Critique' | 'Haute' | 'Moyenne' | 'Faible';
  responsible: string;
  dueDate: Date;
  status: 'Non commencé';
};

const DEADLINE_IN_DAYS: Record<string, number> = {
  '1 mois': 30,
  '3 mois': 90,
};

const PRIORITY_MAP: Record<string, GeneratedActionPlanItem['priority']> = {
  Haute: 'Haute',
  Moyenne: 'Moyenne',
  Basse: 'Faible',
};

/**
 * Construit les actions exécutables (module D) à partir des réponses d'un audit.
 * Réutilise la logique existante de recommandations (lib/audit/scoring.ts) plutôt que
 * de la dupliquer : chaque question faible/négative génère déjà un texte d'action,
 * une catégorie et un propriétaire suggéré (rôle générique : DSI, RSSI, DPO...).
 *
 * Ne génère RIEN pour un audit sans organisation : le plan d'action exécutable est un
 * objet du cockpit client, pas de l'espace admin "sans client".
 */
export function buildActionPlanFromAudit(audit: AuditForGeneration): GeneratedActionPlanItem[] {
  if (!audit.organizationId) return [];

  const answers = audit.responses.map(r => ({
    questionId: r.question,
    answer: r.answer,
    score: r.score ?? 0,
  }));
  const result = computeAuditResult(answers);
  const rawPlan = generateActionPlan(result, answers);

  const seen = new Set<string>();
  const items: GeneratedActionPlanItem[] = [];

  for (const raw of rawPlan) {
    const dedupeKey = `${raw.category}::${raw.action}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const days = DEADLINE_IN_DAYS[raw.deadline] ?? 90;
    const dueDate = new Date(audit.createdAt.getTime() + days * 24 * 60 * 60 * 1000);

    items.push({
      organizationId: audit.organizationId,
      auditId: audit.id,
      title: raw.action,
      category: raw.category,
      priority: PRIORITY_MAP[raw.priority] ?? 'Moyenne',
      responsible: raw.owner,
      dueDate,
      // Toujours "Non commencé" à la génération : l'action vient d'être créée, même si
      // generateActionPlan() (ancien système d'aperçu) la marque "En cours" par défaut.
      status: 'Non commencé',
    });
  }

  return items;
}
