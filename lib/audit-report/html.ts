import type { AuditReportData } from '@/lib/audit-report/data';
import { getProviderIdentity } from '@/lib/contract/provider';
import { referencesForResponses, NOT_COVERED_SCOPE } from '@/lib/audit/sources';

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


const DAY_MS = 24 * 60 * 60 * 1000;
const PLAN_BLOCKS = [
  { label: "Sous 30 jours", max: 30 },
  { label: 'De 31 à 60 jours', max: 60 },
  { label: 'De 61 à 90 jours', max: 90 },
  { label: 'Au-delà de 90 jours', max: Infinity },
] as const;

/**
 * Répartit les actions en blocs 30 / 60 / 90 jours, comptés depuis la création du plan
 * (date de création la plus ancienne des actions, à défaut celle de l'audit). Les blocs vides sont omis ;
 * une action sans échéance est placée au-delà de 90 jours.
 */
export function planBlocks<T extends { dueDate?: Date | string | null }>(
  items: T[],
  auditCreatedAt: Date | string,
): Array<{ label: string; items: T[] }> {
  const created = items
    .map((i) => (i as { createdAt?: Date | string | null }).createdAt)
    .filter((d): d is Date | string => !!d)
    .map((d) => new Date(d).getTime());
  const ref = created.length > 0 ? Math.min(...created) : new Date(auditCreatedAt).getTime();
  const blocks = PLAN_BLOCKS.map((b) => ({ label: b.label, max: b.max, items: [] as T[] }));
  for (const item of items) {
    const days = item.dueDate ? Math.ceil((new Date(item.dueDate).getTime() - ref) / DAY_MS) : Infinity;
    (blocks.find((b) => days <= b.max) ?? blocks[blocks.length - 1]).items.push(item);
  }
  return blocks.filter((b) => b.items.length > 0).map(({ label, items }) => ({ label, items }));
}

const MAX_RESPONSES = 50;

/** Libellés lisibles des domaines internes (le client ne doit pas lire « GRC » ou « SupplyChain »). */
const CATEGORY_LABELS: Record<string, string> = {
  GRC: 'Gouvernance, risques et conformité',
  SupplyChain: "Chaîne d'approvisionnement",
  ISO27001: 'ISO 27001',
  EBIOS: 'EBIOS',
  Secteur: 'Spécifique au secteur',
};
export const categoryLabel = (c: string) => CATEGORY_LABELS[c] ?? c;

/** Extrait la preuve attendue et la phase de la description générée avec chaque action du plan. */
export function parsePlanDescription(description: string | null | undefined): { phase: string | null; proof: string | null } {
  const text = description ?? '';
  const proof = /Preuve attendue\s*:\s*([^]*?)\.?\s*$/.exec(text)?.[1]?.trim() ?? null;
  const phase = /Phase\s*([12])\s*:/.exec(text)?.[1] ?? null;
  return { phase: phase ? `Phase ${phase}` : null, proof };
}

/** Construit le rapport d'audit en HTML, prêt à être rendu en PDF. Toutes les valeurs sont échappées. */
export function buildAuditReportHtml(data: AuditReportData, summary: string[] = []): string {
  const { audit, organizationName, recommendations, plan, actionItems, categoryScores, compliance, responses, detail } = data;
  const scan = data.scan ?? { findings: [], checks: 0, hosts: [], lastRunAt: null };
  const score = audit.score ?? 0;
  // Mentions légales du prestataire (variables INFRACYB_*) : affichées seulement si renseignées.
  const prov = getProviderIdentity();
  const legalLine = [prov.legalName, prov.siret ? `SIRET ${prov.siret}` : null, prov.address, prov.email].filter(Boolean).join(' — ');

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
    ${organizationName ? `<p><strong>Client : ${esc(organizationName)}</strong></p>` : ''}
    <p>Audit du ${esc(fmtDate(audit.createdAt))} — réalisé par InfraCyb</p>
    <p style="margin-top:6px;font-size:10px;opacity:.9">Document confidentiel — destiné exclusivement au client mentionné ci-dessus</p>
  </div>

  ${section('Périmètre et méthode', `
    <p>Audit <strong>organisationnel de maturité en cybersécurité</strong>, fondé sur un questionnaire et sur les informations
    <strong>déclarées par l'organisation auditée</strong>. Sauf mention contraire, les réponses n'ont pas été vérifiées techniquement.</p>
    <p style="margin-top:6px">Référentiels de lecture : bonnes pratiques de l'ANSSI (hygiène informatique) et réglementations applicables au profil déclaré.
    Les scores et niveaux de maturité sont <strong>indicatifs</strong> : ils servent à prioriser les actions, pas à certifier un niveau de sécurité.</p>
    <p style="margin-top:6px">Le score est la moyenne des notes des questions adossées à un texte officiel vérifié (voir « Références vérifiées »), toutes de poids égal. Quelques points sans source officielle sont posés à part (« à valider par le consultant ») et ne comptent pas dans le score.</p>
    <p style="margin-top:6px"><strong>Non couvert par ce questionnaire :</strong> ${esc(NOT_COVERED_SCOPE)}.</p>
    ${scan.checks > 0 ? `<p style="margin-top:6px">Les constats de la section « Constats vérifiés » proviennent d'un <strong>contrôle externe non intrusif</strong>
    (en-têtes HTTP, certificat, DNS et messagerie) réalisé avec l'autorisation écrite du client sur : ${esc(scan.hosts.join(', ') || 'domaines autorisés')}. Ils sont vérifiés techniquement ; les autres éléments restent déclaratifs.</p>` : ''}
    <p style="margin-top:6px">Ne sont <strong>pas</strong> couverts : tests d'intrusion, audit de configuration, audit de code source, analyse forensique.</p>
  `, true)}

  ${section('Synthèse', `
    <div class="stats">
      <div class="stat"><span class="stat-value">${esc(audit.score === null ? '—' : `${Math.round(score)} %`)}</span><span class="stat-label">Score global</span></div>
      <div class="stat"><span class="stat-value">${esc(audit.maturity ?? 'Non évalué')}</span><span class="stat-label">Maturité</span></div>
    </div>
    ${summary.map((p) => `<p style="margin-top:8px">${esc(p)}</p>`).join('')}
  `, true)}

  ${detail === 'full' && categoryScores.length > 0 ? section('Analyse par domaine', categoryScores.map((c) => `
    <div class="domain"><strong>${esc(categoryLabel(c.category))}</strong> — ${esc(c.percent)} %<div class="bar"><div style="width:${Math.max(0, Math.min(100, c.percent))}%"></div></div></div>
  `).join('')) : ''}

  ${scan.findings.length > 0 ? section('Constats vérifiés par contrôle externe non intrusif', `
    <p class="muted">Contrôle réalisé le ${esc(scan.lastRunAt ? fmtDate(scan.lastRunAt) : '—')}, uniquement sur les domaines autorisés par écrit par le client. Aucun test d'intrusion.</p>
    ${table(['Domaine', 'Gravité', 'Constat', 'Détail'],
      scan.findings.map((f) => [esc(f.host), esc(f.severity), esc(f.title), esc(f.detail)]))}
  `) : ''}

  ${recommendations.length > 0 ? section('Recommandations', `<ol>${recommendations.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>`) : ''}

  ${section("Plan d'action", actionItems.length > 0
    ? planBlocks(actionItems, audit.createdAt).map((blk) => `
        <p style="margin-top:10px"><strong>${esc(blk.label)}</strong> <span class="muted">(${esc(blk.items.length)} action${blk.items.length > 1 ? 's' : ''})</span></p>
        ${table(['Action', 'Priorité', 'Responsable', 'Échéance', 'Preuve attendue'],
          blk.items.map((a) => {
            const { phase, proof } = parsePlanDescription((a as { description?: string | null }).description);
            return [esc(a.title), esc(a.priority ?? '—'), esc(a.responsible ?? '—'),
              `${esc(a.dueDate ? fmtDate(a.dueDate) : '—')}${phase ? `<br><span class="muted">${esc(phase)}</span>` : ''}`,
              esc(proof ?? 'À définir avec le client')];
          }))}`).join('')
    : plan.length === 0
      ? '<p class="muted">Aucune action enregistrée.</p>'
      : table(['Action', 'Priorité', 'Responsable', 'Durée estimée'],
          plan.map((p) => [esc(p.title), esc(p.priority ?? '—'), esc(p.owner ?? '—'), esc(p.estimatedDuration ?? '—')])))}

  ${section('Dossier de preuves', `
    <p class="muted">Ce dossier liste ce que l'audit a produit et ce qui doit être réuni pour prouver chaque action du plan. Il ne contient que des éléments réels : les colonnes vides sont à compléter au fur et à mesure (les preuves elles-mêmes se déposent dans l'Espace client InfraCyb, rubrique Preuves).</p>
    <p style="margin-top:8px"><strong>Éléments produits par cet audit</strong></p>
    <ul style="padding-left:18px">
      <li>Questionnaire d'audit réalisé le ${esc(fmtDate(audit.createdAt))} : ${esc(responses.length)} réponse(s) enregistrée(s) (déclaratives, non vérifiées techniquement).</li>
      ${scan.checks > 0
        ? `<li>Contrôle externe non intrusif du ${esc(scan.lastRunAt ? fmtDate(scan.lastRunAt) : '—')} sur ${esc(scan.hosts.join(', ') || 'les domaines autorisés')} : ${esc(scan.checks)} vérification(s), ${esc(scan.findings.length)} constat(s) (section « Constats vérifiés »).</li>`
        : '<li>Aucun contrôle externe réalisé pour cet audit : aucune preuve technique produite.</li>'}
      <li>Références officielles des questions posées : section « Références vérifiées ».</li>
    </ul>
    ${actionItems.length > 0
      ? `<p style="margin-top:8px"><strong>Preuves à réunir par action</strong></p>${table(['Action', 'Preuve attendue', 'Remise le', 'Référence ou emplacement'],
          actionItems.map((a) => {
            const { proof } = parsePlanDescription((a as { description?: string | null }).description);
            return [esc(a.title), esc(proof ?? 'À définir avec le client'), '&nbsp;', '&nbsp;'];
          }))}`
      : '<p class="muted" style="margin-top:8px">Aucune action enregistrée : aucune preuve à réunir pour le moment.</p>'}
  `)}

  ${detail === 'full' && compliance.length > 0 ? section('Niveau de préparation réglementaire (indicatif, hors attestation de conformité)', table(
    ['Réglementation', 'Score', 'Statut'],
    compliance.map((c) => [esc(c.regulation), `${esc(Math.round(c.score))} %`, esc(c.status)])
  )) : ''}

  ${detail === 'full' && responses.length > 0 ? section('Détail des réponses', `
    ${table(['Question', 'Réponse', 'Domaine', 'Score'],
      responses.slice(0, MAX_RESPONSES).map((r) => [esc(r.question), esc(r.answer), esc(categoryLabel(r.category)), r.score === null ? '—' : `${esc(r.score)}/5`]))}
    ${responses.length > MAX_RESPONSES ? `<p class="muted">Et ${responses.length - MAX_RESPONSES} autres réponses.</p>` : ''}
  `) : ''}

  ${(() => {
    const { sources, unsourcedCount, consultantResponses } = referencesForResponses(responses);
    if (sources.length === 0 && unsourcedCount === 0 && consultantResponses.length === 0) return '';
    return section('Références vérifiées', `
      <p class="muted">Chaque question posée repose sur un texte officiel lu à la date indiquée.</p>
      ${sources.length > 0 ? `<ul style="padding-left:18px">${sources.map((src) =>
        `<li>${esc(src.label)} — ${esc(src.url)} (vérifié le ${esc(fmtDate(src.verifiedOn))})${src.note ? `<br><span class="muted">${esc(src.note)}</span>` : ''}</li>`).join('')}</ul>` : ''}
      ${consultantResponses.length > 0 ? `<p style="margin-top:10px"><strong>Points à valider par le consultant (sans source officielle vérifiée, hors score)</strong></p>
        <p class="muted">Ces points sont déclaratifs : ils ne comptent pas dans le score et sont à valider par le consultant InfraCyb avant toute conclusion.</p>
        ${table(['Question', 'Réponse'], consultantResponses.map((r) => [esc(r.question), esc(r.answer)]))}` : ''}
      ${unsourcedCount > 0 ? `<p style="margin-top:6px"><strong>${esc(unsourcedCount)} réponse(s) de cet audit portent sur des questions sans source vérifiée</strong> (ancien questionnaire) : à ne pas considérer comme fondées sur un texte officiel.</p>` : ''}
    `);
  })()}

  ${section('Limites et avertissements', `
    <ul style="padding-left:18px">
      <li>Cette prestation n'est <strong>pas une prestation qualifiée par l'ANSSI</strong> (PASSI, PACS). Elle ne remplace pas un audit qualifié lorsqu'une réglementation ou une autorité l'exige (par exemple pour les opérateurs d'importance vitale ou les entités soumises à des obligations spécifiques).</li>
      <li>Ce rapport <strong>n'est pas une attestation de conformité</strong> (RGPD, NIS2, DORA, ISO 27001 ou autre) ni un avis juridique. L'applicabilité de chaque texte au client doit être confirmée, notamment pour NIS2 dont la transposition en droit français dépend de la loi en cours d'adoption.</li>
      <li>Le rapport reflète la situation <strong>à la date de l'audit</strong>, d'après les éléments communiqués. Il ne garantit ni l'exhaustivité des constats, ni l'absence de vulnérabilité ou d'incident, ni le résultat des actions recommandées.</li>
      <li>Les données personnelles échangées pour l'audit sont traitées par InfraCyb uniquement pour la réalisation de la mission, dans le cadre du contrat conclu avec le client (article 28 du RGPD) et avec une confidentialité stricte.</li>
      <li>Ce document contient des informations sensibles sur la sécurité du client : ne pas le diffuser en dehors des personnes habilitées et le conserver de façon sécurisée.</li>
    </ul>
  `, true)}

  ${legalLine ? `<div class="footer">${esc(legalLine)}</div>` : ''}
  <div class="footer">Rapport généré le ${esc(fmtDate(new Date()))} par InfraCyb — confidentiel</div>
</body>
</html>`;
}
