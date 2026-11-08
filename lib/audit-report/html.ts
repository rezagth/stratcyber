import type { AuditReportData } from '@/lib/audit-report/data';

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const fmtDate = (d: Date | string) => new Date(d).toLocaleDateString('fr-FR');

function section(title: string, body: string, keep = false): string {
  return `<div class="section${keep ? ' keep' : ''}"><h2>${esc(title)}</h2>${body}</div>`;
}

function table(headers: string[], rows: string[][]): string {
  return `
    <table>
      <thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}

const MAX_RESPONSES = 50;

/** Construit le rapport d'audit en HTML, prêt à être rendu en PDF. Toutes les valeurs sont échappées. */
export function buildAuditReportHtml(data: AuditReportData, summary: string[] = []): string {
  const { audit, recommendations, plan, actionItems, categoryScores, compliance, responses, detail } = data;
  const score = audit.score ?? 0;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport d'audit — ${esc(fmtDate(audit.createdAt))}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 12px; line-height: 1.5; }
  .header { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; padding: 28px; border-radius: 8px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; margin-bottom: 6px; }
  .section { margin-bottom: 20px; padding: 16px 18px; border-radius: 8px; background: #f8fafc; border-left: 4px solid #2563eb; }
  .section.keep { break-inside: avoid; }
  .section h2 { font-size: 15px; margin-bottom: 10px; color: #1e3a8a; break-after: avoid; }
  .domain { break-inside: avoid; }
  li { break-inside: avoid; }
  .stats { display: flex; gap: 12px; margin-bottom: 8px; }
  .stat { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; min-width: 110px; }
  .stat-value { display: block; font-size: 18px; font-weight: 700; color: #1d4ed8; }
  .stat-label { display: block; font-size: 10px; color: #64748b; }
  .bar { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; margin: 3px 0 8px; }
  .bar > div { height: 100%; background: #2563eb; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th, td { text-align: left; padding: 5px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
  th { color: #475569; font-weight: 600; background: #f1f5f9; }
  ol { padding-left: 18px; }
  .muted { color: #64748b; font-style: italic; }
  .footer { text-align: center; color: #94a3b8; font-size: 10px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="header">
    <h1>Rapport d'audit de cybersécurité</h1>
    <p>Audit du ${esc(fmtDate(audit.createdAt))}</p>
  </div>

  ${section('Synthèse', `
    <div class="stats">
      <div class="stat"><span class="stat-value">${esc(audit.score === null ? '—' : `${Math.round(score)} %`)}</span><span class="stat-label">Score global</span></div>
      <div class="stat"><span class="stat-value">${esc(audit.maturity ?? 'Non évalué')}</span><span class="stat-label">Maturité</span></div>
    </div>
    ${summary.map((p) => `<p style="margin-top:8px">${esc(p)}</p>`).join('')}
  `, true)}

  ${detail === 'full' && categoryScores.length > 0 ? section('Analyse par domaine', categoryScores.map((c) => `
    <div class="domain"><strong>${esc(c.category)}</strong> — ${esc(c.percent)} %<div class="bar"><div style="width:${Math.max(0, Math.min(100, c.percent))}%"></div></div></div>
  `).join('')) : ''}

  ${recommendations.length > 0 ? section('Recommandations', `<ol>${recommendations.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>`) : ''}

  ${section("Plan d'action", actionItems.length > 0
    ? table(['Action', 'Priorité', 'Responsable', 'Échéance'],
        actionItems.map((a) => [esc(a.title), esc(a.priority ?? '—'), esc(a.responsible ?? '—'), esc(a.dueDate ? fmtDate(a.dueDate) : '—')]))
    : plan.length === 0
      ? '<p class="muted">Aucune action enregistrée.</p>'
      : table(['Action', 'Priorité', 'Responsable', 'Durée estimée'],
          plan.map((p) => [esc(p.title), esc(p.priority ?? '—'), esc(p.owner ?? '—'), esc(p.estimatedDuration ?? '—')])))}

  ${detail === 'full' && compliance.length > 0 ? section('Conformité réglementaire', table(
    ['Réglementation', 'Score', 'Statut'],
    compliance.map((c) => [esc(c.regulation), `${esc(Math.round(c.score))} %`, esc(c.status)])
  )) : ''}

  ${detail === 'full' && responses.length > 0 ? section('Détail des réponses', `
    ${table(['Question', 'Réponse', 'Domaine', 'Score'],
      responses.slice(0, MAX_RESPONSES).map((r) => [esc(r.question), esc(r.answer), esc(r.category), r.score === null ? '—' : `${esc(r.score)}/5`]))}
    ${responses.length > MAX_RESPONSES ? `<p class="muted">Et ${responses.length - MAX_RESPONSES} autres réponses.</p>` : ''}
  `) : ''}

  <div class="footer">Rapport généré le ${esc(fmtDate(new Date()))} par StratCyber</div>
</body>
</html>`;
}
