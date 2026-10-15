/**
 * Export CSV de la bibliothèque de réponses (module F). Implémentation maison plutôt
 * qu'une dépendance : le format est simple (une ligne par réponse, échappement
 * standard des guillemets/virgules/retours à la ligne), pas besoin d'une librairie.
 */

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export type SecurityAnswerRow = {
  question: string;
  answer: string | null;
  isNotApplicable: boolean;
  notApplicableReason: string | null;
  category: string | null;
  answeredAt: Date;
  status: string;
  validatedByName: string | null;
  validatedAt: Date | null;
};

const HEADERS = ['Question', 'Réponse', 'Non applicable', 'Motif (N/A)', 'Catégorie', 'Date de la réponse', 'Statut', 'Validé par', 'Date de validation'];

export function toCsv(rows: SecurityAnswerRow[]): string {
  const lines = [HEADERS.join(',')];
  for (const row of rows) {
    const cells = [
      row.question,
      row.isNotApplicable ? '' : (row.answer ?? ''),
      row.isNotApplicable ? 'Oui' : 'Non',
      row.notApplicableReason ?? '',
      row.category ?? '',
      row.answeredAt.toLocaleDateString('fr-FR'),
      row.status,
      row.validatedByName ?? '',
      row.validatedAt ? row.validatedAt.toLocaleDateString('fr-FR') : '',
    ];
    lines.push(cells.map((c) => escapeCell(String(c))).join(','));
  }
  // BOM UTF-8 : Excel ouvre correctement les accents sans ça.
  return '﻿' + lines.join('\r\n');
}
