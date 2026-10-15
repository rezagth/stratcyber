import type { MonthlyReportData } from '@/lib/monthly-report/data';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('fr-FR');
const fmtEur = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

function section(title: string, body: string): string {
  return `<div class="section"><h2>${esc(title)}</h2>${body}</div>`;
}

function table(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return '<p class="muted">Aucune donnée pour cette période.</p>';
  return `
    <table>
      <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

function stat(label: string, value: string | number): string {
  return `<div class="stat"><span class="stat-value">${esc(value)}</span><span class="stat-label">${esc(label)}</span></div>`;
}

/** Construit le rapport mensuel (module K) en HTML, prêt à être rendu en PDF par Puppeteer. */
export function buildMonthlyReportHtml(data: MonthlyReportData): string {
  const { organization, period, governance, budget, training, vulnerabilities, policies, securityAnswers, suppliers, incidentsInPeriod, actionsCompletedInPeriod } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport mensuel — ${esc(organization.name)} — ${esc(period.label)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 12px; }
  .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; padding: 28px; border-radius: 8px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; margin-bottom: 6px; }
  .header p { opacity: 0.9; }
  .section { margin-bottom: 20px; padding: 16px 18px; border-radius: 8px; background: #f8fafc; border-left: 4px solid #2563eb; page-break-inside: avoid; }
  .section h2 { font-size: 15px; margin-bottom: 10px; color: #1e3a8a; }
  .stats { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 8px; }
  .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; min-width: 110px; }
  .stat-value { display: block; font-size: 18px; font-weight: 700; color: #1d4ed8; }
  .stat-label { display: block; font-size: 10px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
  th { color: #475569; font-weight: 600; background: #f1f5f9; }
  .muted { color: #64748b; font-style: italic; }
  .footer { text-align: center; color: #94a3b8; font-size: 10px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Rapport mensuel de cybersécurité</h1>
    <p>${esc(organization.name)} — ${esc(period.label)}</p>
  </div>

  ${section('Profil de l\'organisation', `
    <p>${esc(organization.sector ?? 'Secteur non renseigné')} · ${esc(organization.size ?? 'Taille non renseignée')}</p>
    ${organization.missionScope ? `<p class="muted">${esc(organization.missionScope)}</p>` : ''}
  `)}

  ${section('Synthèse gouvernance', `
    <div class="stats">
      ${stat('Risques ouverts', governance.risks.open)}
      ${stat('dont critiques', governance.risks.byLevel.Critique)}
      ${stat('Actions en retard', governance.actions.overdue)}
      ${stat('Incidents ouverts', governance.incidents.open)}
      ${stat('Contrôles conformes', governance.controls.byStatus['Conforme'] ?? 0)}
    </div>
    <p>Prochain comité : ${governance.nextCommittee ? `${esc(governance.nextCommittee.title)} (${fmtDate(governance.nextCommittee.meetingDate)})` : '<span class="muted">aucun planifié</span>'}</p>
    <p>Dernière revue annuelle : ${governance.lastAnnualReview ? `${esc(governance.lastAnnualReview.title)} (${fmtDate(governance.lastAnnualReview.meetingDate)}, ${esc(governance.lastAnnualReview.status)})` : '<span class="muted">aucune enregistrée</span>'}</p>
  `)}

  ${section(`Incidents détectés en ${period.label}`, table(
    ['Titre', 'Sévérité', 'Statut', 'Date'],
    incidentsInPeriod.map((i) => [esc(i.title), esc(i.severity), esc(i.status), fmtDate(i.detectedAt)])
  ))}

  ${section(`Actions du plan terminées en ${period.label}`, table(
    ['Titre', 'Catégorie', 'Date'],
    actionsCompletedInPeriod.map((a) => [esc(a.title), esc(a.category ?? '—'), a.proofDate ? fmtDate(a.proofDate) : '—'])
  ))}

  ${section('Vulnérabilités', `
    <div class="stats">
      ${stat('Total suivies', vulnerabilities.total)}
      ${stat('Ouvertes', vulnerabilities.open)}
      ${stat('Critiques non corrigées', vulnerabilities.critical)}
    </div>
  `)}

  ${section('Politiques et questionnaires', `
    <div class="stats">
      ${stat('Politiques', policies.total)}
      ${stat('dont validées', policies.validated)}
      ${stat('Réponses sécurité', securityAnswers.total)}
      ${stat('dont validées', securityAnswers.validated)}
    </div>
  `)}

  ${section('Fournisseurs', `
    <div class="stats">
      ${stat('Fournisseurs suivis', suppliers.total)}
      ${stat('Avec clause de sécurité', suppliers.withSecurityClause)}
      ${stat('Revue en retard', suppliers.reviewLate)}
    </div>
  `)}

  ${section(`Budget ${budget.fiscalYear}`, `
    <div class="stats">
      ${stat('Alloué', fmtEur(budget.allocated))}
      ${stat('Coût prévisionnel', fmtEur(budget.plannedCost))}
      ${stat('Dépensé', fmtEur(budget.actualSpent))}
      ${stat('Reste', fmtEur(budget.remaining))}
    </div>
  `)}

  ${section('Formation', `
    <p>Catalogue commun : ${training.catalogSize} ebook(s) publié(s).</p>
    ${table(
      ['Employé', 'Ebooks terminés', 'En cours', 'Quiz réussis'],
      training.employees.map((e) => [esc(e.name ?? e.email), String(e.ebooksCompleted), String(e.ebooksInProgress), String(e.quizzesPassed)])
    )}
  `)}

  <div class="footer">Rapport généré le ${fmtDate(new Date())} par StratCyber</div>
</body>
</html>`;
}
