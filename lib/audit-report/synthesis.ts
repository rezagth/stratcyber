import { generateText } from '@/lib/ai/provider';

export type SynthesisInput = {
  score: number | null;
  maturity: string | null;
  categoryScores: Array<{ category: string; percent: number }>;
  actions: Array<{ title: string; priority: string | null; dueDate: Date | null }>;
};

const PRIORITY_ORDER = ['Critique', 'Haute', 'Moyenne', 'Faible'];
const fmt = (d: Date) => d.toLocaleDateString('fr-FR');

/**
 * Synthèse exécutive sans IA : phrases construites à partir des chiffres de l'audit. Toujours
 * disponible, déterministe, et sert de repli quand l'IA n'est pas configurée ou échoue.
 */
export function buildDeterministicSummary(input: SynthesisInput): string[] {
  const lines: string[] = [];
  if (input.score === null) {
    lines.push("Le score global n'est pas disponible pour cet audit.");
  } else {
    lines.push(`Le score global de maturité ressort à ${Math.round(input.score)} %${input.maturity ? ` (niveau « ${input.maturity} »)` : ''}.`);
  }

  const sorted = [...input.categoryScores].sort((a, b) => a.percent - b.percent);
  if (sorted.length >= 2) {
    const weak = sorted.slice(0, 3).map((c) => `${c.category} (${c.percent} %)`).join(', ');
    const strong = sorted.slice(-2).reverse().map((c) => `${c.category} (${c.percent} %)`).join(', ');
    lines.push(`Les domaines les plus fragiles sont : ${weak}. Les plus solides sont : ${strong}.`);
  }

  if (input.actions.length > 0) {
    const counts = PRIORITY_ORDER
      .map((p) => [p, input.actions.filter((a) => a.priority === p).length] as const)
      .filter(([, n]) => n > 0)
      .map(([p, n]) => `${n} ${p.toLowerCase()}${n > 1 ? 's' : ''}`);
    lines.push(`Le plan d'action compte ${input.actions.length} actions : ${counts.join(', ')}.`);

    const urgent = input.actions
      .filter((a) => a.priority === 'Critique')
      .sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity))
      .slice(0, 3);
    if (urgent.length > 0) {
      lines.push(`À traiter en premier : ${urgent.map((a) => `${a.title}${a.dueDate ? ` (avant le ${fmt(a.dueDate)})` : ''}`).join(' ; ')}.`);
    }
  }

  lines.push("Ces résultats reposent sur les réponses déclarées lors de l'audit et ne remplacent pas une vérification technique sur site.");
  return lines;
}

const SYSTEM = "Tu rédiges la synthèse exécutive d'un rapport d'audit de cybersécurité destinée à un dirigeant de PME. "
  + 'Écris en français, en 2 courts paragraphes, ton factuel et sans jargon. '
  + "N'invente aucun chiffre : utilise uniquement les faits fournis. Ne promets aucune conformité.";

/**
 * Synthèse finale : version IA si elle est configurée et répond, sinon repli déterministe.
 * Seuls des faits agrégés sont transmis à l'IA (pas de nom de client, pas de réponses libres).
 */
export async function buildSummary(
  input: SynthesisInput,
  ai: typeof generateText = generateText
): Promise<{ paragraphs: string[]; source: 'ai' | 'deterministic' }> {
  const fallback = buildDeterministicSummary(input);
  const facts = fallback.join('\n');
  const text = await ai({ system: SYSTEM, user: `Faits de l'audit :\n${facts}\n\nRédige la synthèse.`, maxTokens: 500 });
  if (text) {
    const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).slice(0, 4);
    if (paragraphs.length > 0) return { paragraphs, source: 'ai' };
  }
  return { paragraphs: fallback, source: 'deterministic' };
}
