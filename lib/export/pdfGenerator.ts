import { AuditResult } from '../../types/audit';
import { ActionPlanItem, ActionPlanSummary, Milestone } from '../../types/actionPlan';

export interface PDFExportOptions {
  includeExecutiveSummary: boolean;
  includeDetailedActions: boolean;
  includeRoadmap: boolean;
  includeTeamAssignments: boolean;
  includeBudgetBreakdown: boolean;
  includeRiskAnalysis: boolean;
  companyInfo: {
    name: string;
    logo?: string;
    address: string;
    contact: string;
  };
  reportDate: Date;
  confidentialityLevel: 'Public' | 'Interne' | 'Confidentiel' | 'Secret';
}

export interface PDFReportData {
  auditResult: AuditResult;
  actionPlan: ActionPlanItem[];
  summary: ActionPlanSummary;
  milestones: Milestone[];
  options: PDFExportOptions;
}

export class ProfessionalPDFGenerator {
  private static readonly COLORS = {
    primary: '#2563eb',
    secondary: '#64748b',
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    muted: '#6b7280'
  };

  static async generateAuditReport(data: PDFReportData): Promise<Blob> {
    // En production, utiliser jsPDF ou Puppeteer pour générer le PDF
    // Ici, on simule la génération avec une structure HTML complète
    
    const htmlContent = this.generateHTMLReport(data);
    
    // Simuler la conversion HTML vers PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return blob;
  }

  private static generateHTMLReport(data: PDFReportData): string {
    const { auditResult, actionPlan, summary, milestones, options } = data;
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Audit Cybersécurité - ${options.companyInfo.name}</title>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    ${this.generateCoverPage(data)}
    ${options.includeExecutiveSummary ? this.generateExecutiveSummary(data) : ''}
    ${this.generateAuditResults(data)}
    ${options.includeDetailedActions ? this.generateDetailedActionPlan(data) : ''}
    ${options.includeRoadmap ? this.generateRoadmapSection(data) : ''}
    ${options.includeTeamAssignments ? this.generateTeamSection(data) : ''}
    ${options.includeBudgetBreakdown ? this.generateBudgetSection(data) : ''}
    ${options.includeRiskAnalysis ? this.generateRiskAnalysis(data) : ''}
    ${this.generateAppendices(data)}
</body>
</html>`;
  }

  private static getReportStyles(): string {
    return `
        @page {
            margin: 2cm;
            size: A4;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .cover-page {
            text-align: center;
            padding: 4cm 2cm;
            background: linear-gradient(135deg, ${this.COLORS.primary} 0%, ${this.COLORS.secondary} 100%);
            color: white;
            min-height: 80vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        
        .cover-title {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 1em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .cover-subtitle {
            font-size: 1.5em;
            margin-bottom: 2em;
            opacity: 0.9;
        }
        
        .company-info {
            font-size: 1.2em;
            margin-top: auto;
        }
        
        .confidentiality {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 5px;
            font-weight: bold;
        }
        
        .section {
            margin: 2em 0;
            padding: 1em;
        }
        
        .section-title {
            font-size: 2em;
            color: ${this.COLORS.primary};
            border-bottom: 3px solid ${this.COLORS.primary};
            padding-bottom: 0.5em;
            margin-bottom: 1em;
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1em;
            margin: 1em 0;
        }
        
        .metric-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1em;
            text-align: center;
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            color: ${this.COLORS.primary};
        }
        
        .metric-label {
            color: ${this.COLORS.muted};
            font-size: 0.9em;
        }
        
        .progress-bar {
            width: 100%;
            height: 20px;
            background: #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            margin: 0.5em 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, ${this.COLORS.success} 0%, ${this.COLORS.primary} 100%);
            transition: width 0.3s ease;
        }
        
        .action-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 1em;
            margin: 1em 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .action-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 0.5em;
        }
        
        .action-title {
            font-weight: bold;
            font-size: 1.1em;
            color: ${this.COLORS.primary};
        }
        
        .priority-badge {
            padding: 0.25em 0.75em;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .priority-critique {
            background: ${this.COLORS.danger};
            color: white;
        }
        
        .priority-haute {
            background: ${this.COLORS.warning};
            color: white;
        }
        
        .priority-moyenne {
            background: ${this.COLORS.secondary};
            color: white;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
        }
        
        .table th,
        .table td {
            border: 1px solid #e2e8f0;
            padding: 0.75em;
            text-align: left;
        }
        
        .table th {
            background: ${this.COLORS.primary};
            color: white;
            font-weight: bold;
        }
        
        .table tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .chart-placeholder {
            width: 100%;
            height: 300px;
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${this.COLORS.muted};
            font-style: italic;
            margin: 1em 0;
        }
        
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: ${this.COLORS.primary};
            color: white;
            text-align: center;
            padding: 1em;
            font-size: 0.9em;
        }
    `;
  }

  private static generateCoverPage(data: PDFReportData): string {
    const { options } = data;
    return `
        <div class="cover-page">
            <div class="confidentiality">${options.confidentialityLevel}</div>
            <h1 class="cover-title">Rapport d'Audit Cybersécurité</h1>
            <h2 class="cover-subtitle">Plan d'Action Stratégique</h2>
            <div class="company-info">
                <h3>${options.companyInfo.name}</h3>
                <p>${options.reportDate.toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
            </div>
        </div>
    `;
  }

  private static generateExecutiveSummary(data: PDFReportData): string {
    const { auditResult, summary } = data;
    return `
        <div class="page-break section">
            <h2 class="section-title">Résumé Exécutif</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${auditResult.globalScore}%</div>
                    <div class="metric-label">Score Global de Maturité</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.totalActions}</div>
                    <div class="metric-label">Actions Identifiées</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.criticalActions}</div>
                    <div class="metric-label">Actions Critiques</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${(summary.budgetTotal / 1000).toFixed(0)}K€</div>
                    <div class="metric-label">Budget Total</div>
                </div>
            </div>
            
            <h3>Analyse de la Maturité Cybersécurité</h3>
            <p>L'audit révèle un niveau de maturité cybersécurité de <strong>${auditResult.globalScore}%</strong>, 
            classé comme <strong>${auditResult.maturity}</strong>. Cette évaluation se base sur l'analyse de 
            ${Object.keys(auditResult.scoresByCategory).length} domaines critiques de la cybersécurité.</p>
            
            <h3>Recommandations Prioritaires</h3>
            <ul>
                ${auditResult.recommendations.slice(0, 5).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            
            <h3>Plan d'Action</h3>
            <p>Un plan d'action détaillé de <strong>${summary.totalActions} actions</strong> a été élaboré, 
            réparti sur <strong>24 mois</strong> avec un budget total de <strong>${summary.budgetTotal.toLocaleString()}€</strong>. 
            Les actions sont priorisées selon leur criticité et leur impact sur la réduction des risques.</p>
        </div>
    `;
  }

  private static generateAuditResults(data: PDFReportData): string {
    const { auditResult } = data;
    return `
        <div class="page-break section">
            <h2 class="section-title">Résultats de l'Audit</h2>
            
            <h3>Scores par Domaine</h3>
            ${Object.entries(auditResult.scoresByCategory).map(([category, score]) => `
                <div class="action-item">
                    <div class="action-header">
                        <span class="action-title">${category}</span>
                        <span class="priority-badge ${score < 40 ? 'priority-critique' : score < 70 ? 'priority-haute' : 'priority-moyenne'}">
                            ${score}%
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${score}%"></div>
                    </div>
                    <p><strong>Niveau:</strong> ${score < 40 ? 'Critique' : score < 70 ? 'À améliorer' : 'Conforme'}</p>
                </div>
            `).join('')}
            
            <div class="chart-placeholder">
                Graphique radar des scores par domaine
            </div>
        </div>
    `;
  }

  private static generateDetailedActionPlan(data: PDFReportData): string {
    const { actionPlan } = data;
    return `
        <div class="page-break section">
            <h2 class="section-title">Plan d'Action Détaillé</h2>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Action</th>
                        <th>Domaine</th>
                        <th>Priorité</th>
                        <th>Échéance</th>
                        <th>Budget</th>
                        <th>Responsable</th>
                    </tr>
                </thead>
                <tbody>
                    ${actionPlan.map((action, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${action.title}</td>
                            <td>${action.category}</td>
                            <td><span class="priority-badge priority-${action.priority.toLowerCase()}">${action.priority}</span></td>
                            <td>${action.dueDate.toLocaleDateString('fr-FR')}</td>
                            <td>${action.budget ? action.budget.toLocaleString() + '€' : 'N/A'}</td>
                            <td>${action.owner}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
  }

  private static generateRoadmapSection(data: PDFReportData): string {
    return `
        <div class="page-break section">
            <h2 class="section-title">Feuille de Route</h2>
            <div class="chart-placeholder">
                Timeline interactive de la feuille de route sur 24 mois
            </div>
        </div>
    `;
  }

  private static generateTeamSection(data: PDFReportData): string {
    return `
        <div class="page-break section">
            <h2 class="section-title">Assignations d'Équipe</h2>
            <div class="chart-placeholder">
                Répartition des responsabilités par membre d'équipe
            </div>
        </div>
    `;
  }

  private static generateBudgetSection(data: PDFReportData): string {
    const { summary } = data;
    return `
        <div class="page-break section">
            <h2 class="section-title">Analyse Budgétaire</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-value">${summary.budgetTotal.toLocaleString()}€</div>
                    <div class="metric-label">Budget Total</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${summary.budgetSpent.toLocaleString()}€</div>
                    <div class="metric-label">Budget Engagé</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${Math.round((summary.budgetSpent / summary.budgetTotal) * 100)}%</div>
                    <div class="metric-label">Taux d'Engagement</div>
                </div>
            </div>
            
            <div class="chart-placeholder">
                Répartition budgétaire par domaine et par trimestre
            </div>
        </div>
    `;
  }

  private static generateRiskAnalysis(data: PDFReportData): string {
    const { summary } = data;
    return `
        <div class="page-break section">
            <h2 class="section-title">Analyse des Risques</h2>
            
            <h3>Distribution des Risques</h3>
            <div class="metric-grid">
                ${Object.entries(summary.riskDistribution).map(([risk, count]) => `
                    <div class="metric-card">
                        <div class="metric-value">${count}</div>
                        <div class="metric-label">Risque ${risk}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="chart-placeholder">
                Matrice des risques et impact business
            </div>
        </div>
    `;
  }

  private static generateAppendices(data: PDFReportData): string {
    return `
        <div class="page-break section">
            <h2 class="section-title">Annexes</h2>
            
            <h3>Méthodologie d'Audit</h3>
            <p>L'audit a été réalisé selon les standards ISO 27001 et les recommandations de l'ANSSI.</p>
            
            <h3>Références</h3>
            <ul>
                <li>ISO/IEC 27001:2022 - Systèmes de management de la sécurité de l'information</li>
                <li>ANSSI - Guide d'hygiène informatique</li>
                <li>NIST Cybersecurity Framework</li>
                <li>RGPD - Règlement Général sur la Protection des Données</li>
            </ul>
            
            <h3>Glossaire</h3>
            <p><strong>EDR:</strong> Endpoint Detection and Response</p>
            <p><strong>RSSI:</strong> Responsable de la Sécurité des Systèmes d'Information</p>
            <p><strong>DPO:</strong> Délégué à la Protection des Données</p>
            <p><strong>SOC:</strong> Security Operations Center</p>
        </div>
        
        <div class="footer">
            Rapport généré par StratCyber - ${data.options.reportDate.toLocaleDateString('fr-FR')} - ${data.options.confidentialityLevel}
        </div>
    `;
  }
}
