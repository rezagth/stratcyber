import { computeAuditResult, generateActionPlan } from './scoring';
import { prioritizeActions } from './prioritization';

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

  const unique = rawPlan.filter((raw) => {
    const dedupeKey = `${raw.category}::${raw.action}`;
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });

  // Priorité et échéance viennent des règles de prioritisation (voir prioritization.ts), pas de la
  // valeur unique de l'ancien générateur d'aperçu.
  const prioritized = prioritizeActions(
    unique.map((raw) => ({ title: raw.action, category: raw.category, responsible: raw.owner })),
    audit.createdAt
  );

  for (const item of prioritized) {
    items.push({
      organizationId: audit.organizationId,
      auditId: audit.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      responsible: item.responsible,
      dueDate: item.dueDate,
      // Toujours "Non commencé" à la génération : l'action vient d'être créée.
      status: 'Non commencé',
    });
  }

  return items;
}
