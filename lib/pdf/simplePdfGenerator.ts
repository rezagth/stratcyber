// Générateur PDF simple sans dépendances externes problématiques
// Utilise seulement l'API native du navigateur pour créer du HTML et le convertir en PDF

export interface AuditData {
  id: string;
  score: number | null;
  maturity: string | null;
  createdAt: string;
  responses: {
    question: string;
    answer: string;
    score: number | null;
    category: string;
  }[];
  companyProfile?: string;
  actionPlan?: string;
  recommendations?: string;
  legalRiskScore?: number;
}

export interface ComplianceScore {
  regulation: string;
  score: number;
  status: string;
}

export interface ActionPlanItem {
  action: string;
  category: string;
  priority: string;
  deadline: string;
  owner: string;
  description?: string;
  budget?: number;
}

export class SimplePDFGenerator {
  
  private generateHTML(
    audit: AuditData,
    complianceScores: ComplianceScore[] = [],
    actionPlan: ActionPlanItem[] = [],
    categoryScores: Record<string, number> = {}
  ): string {
    const score = audit.score || 0;
    const maturity = audit.maturity || 'Non évalué';
    const date = new Date(audit.createdAt).toLocaleDateString('fr-FR');
    const legalRisk = audit.legalRiskScore || 0;

    // Déterminer la couleur du score
    const getScoreColor = (score: number) => {
      if (score < 40) return '#dc2626';
      if (score < 70) return '#d97706';
      return '#059669';
    };

    const getScoreStatus = (score: number) => {
      if (score < 40) return 'Critique';
      if (score < 70) return 'À améliorer';
      return 'Satisfaisant';
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rapport d'Audit Cybersécurité - ${audit.id}</title>
    <style>
        @page {
            margin: 2cm;
            @top-center {
                content: "Rapport d'Audit Cybersécurité - StratCyber";
            }
            @bottom-center {
                content: "Page " counter(page) " sur " counter(pages);
            }
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 8px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        
        .header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .score-card {
            background: ${getScoreColor(score)};
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .score-card h2 {
            margin: 0 0 10px 0;
            font-size: 2em;
        }
        
        .score-card .score {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .score-card .status {
            font-size: 1.3em;
            opacity: 0.9;
        }
        
        .section {
            margin: 40px 0;
            page-break-inside: avoid;
        }
        
        .section h2 {
            color: #2563eb;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        
        .section h3 {
            color: #64748b;
            font-size: 1.4em;
            margin: 25px 0 15px 0;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .info-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        
        .info-card strong {
            color: #2563eb;
            display: block;
            margin-bottom: 5px;
        }
        
        .category-bar {
            margin: 15px 0;
            padding: 10px 0;
        }
        
        .category-name {
            font-weight: bold;
            margin-bottom: 8px;
            color: #1e293b;
        }
        
        .progress-bar {
            background: #e2e8f0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        
        .progress-fill {
            height: 100%;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        
        th {
            background: #2563eb;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: bold;
        }
        
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .priority-high {
            background: #fee2e2;
            color: #dc2626;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .priority-medium {
            background: #fef3c7;
            color: #d97706;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .priority-low {
            background: #dcfce7;
            color: #059669;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .recommendation {
            background: #f0f9ff;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .recommendation::before {
            content: "💡 ";
            font-size: 1.2em;
        }
        
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-weight: bold;
        }
        
        .alert-danger {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
        }
        
        .alert-warning {
            background: #fffbeb;
            border: 1px solid #fed7aa;
            color: #d97706;
        }
        
        .alert-success {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #059669;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .footer {
            margin-top: 50px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 8px;
            text-align: center;
            color: #64748b;
            font-size: 0.9em;
        }
        
        @media print {
            body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .page-break {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RAPPORT D'AUDIT CYBERSÉCURITÉ</h1>
        <p>StratCyber - Votre partenaire sécurité</p>
        <p>Généré le ${date}</p>
    </div>
    
    <div class="score-card">
        <h2>Score Global de Cybersécurité</h2>
        <div class="score">${score}%</div>
        <div class="status">${getScoreStatus(score)} - ${maturity}</div>
    </div>
    
    <div class="section">
        <h2>Informations Générales</h2>
        <div class="info-grid">
            <div class="info-card">
                <strong>Date de l'audit</strong>
                ${date}
            </div>
            <div class="info-card">
                <strong>Score global</strong>
                ${score}% (${getScoreStatus(score)})
            </div>
            <div class="info-card">
                <strong>Niveau de maturité</strong>
                ${maturity}
            </div>
            <div class="info-card">
                <strong>Risque légal</strong>
                ${legalRisk}%
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Résumé Exécutif</h2>
        <p>Cet audit de cybersécurité a été réalisé le ${date} et révèle un score global de <strong>${score}%</strong> avec un niveau de maturité "<strong>${maturity}</strong>".</p>
        
        ${score < 50 ? `
            <div class="alert alert-danger">
                ⚠️ ATTENTION : Votre organisation présente des vulnérabilités critiques nécessitant une action immédiate.
            </div>
        ` : score < 80 ? `
            <div class="alert alert-warning">
                ⚡ Votre organisation a des bases solides mais des améliorations importantes sont recommandées.
            </div>
        ` : `
            <div class="alert alert-success">
                ✅ Excellente posture de cybersécurité ! Continuez à maintenir ce niveau élevé.
            </div>
        `}
        
        <p>Le risque légal est évalué à <strong>${legalRisk}%</strong> et nécessite ${legalRisk > 70 ? 'une attention immédiate' : legalRisk > 40 ? 'un suivi régulier' : 'un maintien des bonnes pratiques'}.</p>
    </div>
    
    ${Object.keys(categoryScores).length > 0 ? `
    <div class="section page-break">
        <h2>Analyse par Domaine</h2>
        ${Object.entries(categoryScores).map(([category, score]) => `
            <div class="category-bar">
                <div class="category-name">${category}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${score}%; background-color: ${getScoreColor(score)}">
                        ${score}%
                    </div>
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${complianceScores.length > 0 ? `
    <div class="section">
        <h2>Conformité Réglementaire</h2>
        <p>Analyse de la conformité de votre organisation aux principales réglementations :</p>
        <table>
            <thead>
                <tr>
                    <th>Réglementation</th>
                    <th>Score</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${complianceScores.map(cs => `
                    <tr>
                        <td>${cs.regulation}</td>
                        <td><strong>${cs.score}%</strong></td>
                        <td><span style="color: ${getScoreColor(cs.score)}; font-weight: bold;">${cs.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}
    
    ${actionPlan.length > 0 ? `
    <div class="section page-break">
        <h2>Plan d'Action Recommandé</h2>
        <p>Voici les <strong>${Math.min(actionPlan.length, 20)}</strong> actions prioritaires pour améliorer votre posture de cybersécurité :</p>
        <table>
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Catégorie</th>
                    <th>Priorité</th>
                    <th>Échéance</th>
                    <th>Responsable</th>
                </tr>
            </thead>
            <tbody>
                ${actionPlan.slice(0, 20).map(action => `
                    <tr>
                        <td>${action.action.length > 100 ? action.action.substring(0, 100) + '...' : action.action}</td>
                        <td>${action.category}</td>
                        <td><span class="priority-${action.priority.toLowerCase()}">${action.priority}</span></td>
                        <td>${action.deadline}</td>
                        <td>${action.owner || 'Non assigné'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${actionPlan.length > 20 ? `<p><em>Note : ${actionPlan.length - 20} actions supplémentaires sont disponibles dans la version web complète.</em></p>` : ''}
    </div>
    ` : ''}
    
    ${audit.recommendations ? `
    <div class="section">
        <h2>Recommandations Détaillées</h2>
        ${audit.recommendations.split('\n').filter(r => r.trim()).slice(0, 10).map((rec, index) => `
            <div class="recommendation">
                <strong>Recommandation ${index + 1} :</strong> ${rec}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    <div class="section page-break">
        <h2>Conclusion et Prochaines Étapes</h2>
        
        ${score < 50 ? `
            <p><strong>Votre organisation nécessite des améliorations urgentes en matière de cybersécurité.</strong> Nous recommandons fortement de prioriser les actions marquées comme "Haute priorité" et de mettre en place un plan de remédiation dans les 30 jours.</p>
        ` : score < 80 ? `
            <p>Votre organisation présente un niveau de cybersécurité satisfaisant mais peut bénéficier d'améliorations ciblées. Concentrez-vous sur les domaines les moins performants.</p>
        ` : `
            <p><strong style="color: #059669;">Félicitations ! Votre organisation maintient un excellent niveau de cybersécurité.</strong> Continuez à surveiller et à maintenir ces standards élevés.</p>
        `}
        
        <p>Pour plus d'informations et un suivi détaillé, consultez votre tableau de bord StratCyber.</p>
    </div>
    
    <div class="footer">
        <p><strong>StratCyber</strong> - Rapport généré automatiquement le ${date}</p>
        <p>Ce document est confidentiel et destiné uniquement à l'usage interne de votre organisation.</p>
    </div>
</body>
</html>`;
  }
  
  async generatePDF(
    audit: AuditData,
    complianceScores: ComplianceScore[] = [],
    actionPlan: ActionPlanItem[] = [],
    categoryScores: Record<string, number> = {}
  ): Promise<void> {
    try {
      // Générer le HTML
      const htmlContent = this.generateHTML(audit, complianceScores, actionPlan, categoryScores);
      
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez que les pop-ups sont autorisés.');
      }
      
      // Écrire le contenu HTML
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis déclencher l'impression
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF. Veuillez réessayer.');
    }
  }
  
  // Méthode pour télécharger directement en HTML
  downloadHTML(
    audit: AuditData,
    complianceScores: ComplianceScore[] = [],
    actionPlan: ActionPlanItem[] = [],
    categoryScores: Record<string, number> = {}
  ): void {
    try {
      const htmlContent = this.generateHTML(audit, complianceScores, actionPlan, categoryScores);
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-audit-${audit.id}-${new Date(audit.createdAt).toLocaleDateString('fr-FR').replace(/\//g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement HTML:', error);
      throw new Error('Impossible de télécharger le rapport HTML. Veuillez réessayer.');
    }
  }
}

// Fonction helper simple
export async function generateSimplePDF(
  audit: AuditData,
  complianceScores: ComplianceScore[] = [],
  actionPlan: ActionPlanItem[] = [],
  categoryScores: Record<string, number> = {}
): Promise<void> {
  const generator = new SimplePDFGenerator();
  await generator.generatePDF(audit, complianceScores, actionPlan, categoryScores);
}

// Fonction helper pour télécharger en HTML
export function downloadAuditHTML(
  audit: AuditData,
  complianceScores: ComplianceScore[] = [],
  actionPlan: ActionPlanItem[] = [],
  categoryScores: Record<string, number> = {}
): void {
  const generator = new SimplePDFGenerator();
  generator.downloadHTML(audit, complianceScores, actionPlan, categoryScores);
}
