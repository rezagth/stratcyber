/**
 * Aide à la réponse aux questionnaires : retrouve, dans la banque de réponses du client, celles qui
 * ressemblent à la question posée (recoupement de mots significatifs). Déterministe, sans IA, et ne
 * produit jamais de réponse nouvelle : il ne fait que proposer les réponses déjà données.
 */
export type StoredAnswer = {
  id: string; question: string; answer: string | null; isNotApplicable: boolean;
  notApplicableReason: string | null; status: string; answeredAt: Date;
};

const STOP = new Set(['les', 'des', 'une', 'est', 'sont', 'que', 'qui', 'pour', 'dans', 'avec', 'sur', 'par', 'vous', 'votre', 'vos', 'nous', 'notre',
  'the', 'and', 'for', 'est-ce', 'ils', 'elle', 'elles', 'aux', 'ces', 'cette', 'comme', 'plus', 'pas', 'son', 'ses', 'leur', 'leurs', 'avez', 'avons', 'disposez']);

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function tokens(text: string): Set<string> {
  return new Set(normalize(text).split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w)));
}

export function suggestAnswers(question: string, answers: StoredAnswer[], limit = 3) {
  const wanted = tokens(question);
  if (wanted.size === 0) return [];
  return answers
    .map((a) => {
      const have = tokens(a.question);
      let common = 0;
      for (const w of wanted) if (have.has(w)) common += 1;
      const score = common / Math.sqrt(wanted.size * Math.max(have.size, 1));
      // À pertinence égale, une réponse validée passe avant un brouillon.
      return { answer: a, score: score + (a.status === 'Validé' ? 0.02 : 0) };
    })
    .filter((m) => m.score >= 0.25)
    .sort((a, b) => b.score - a.score || b.answer.answeredAt.getTime() - a.answer.answeredAt.getTime())
    .slice(0, limit);
}
