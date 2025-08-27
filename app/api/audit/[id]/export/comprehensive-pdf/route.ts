import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateAdvancedActionPlan } from '@/lib/audit/advancedActionPlan';
import { computeAuditResult } from '@/lib/audit/scoring';
import { baseQuestions } from '@/lib/audit/questions';
import { 
  rgpdQuestions, 
  nis2Questions, 
  doraQuestions, 
  lmpQuestions, 
  incidentQuestions, 
  supplyChainQuestions, 
  cloudQuestions, 
  craQuestions, 
  isoQuestions, 
  ebiosQuestions 
} from '@/lib/audit/questions-extended';
import puppeteer from 'puppeteer';

// Interface pour les données du rapport PDF
interface ComprehensiveReportData {
  audit: {
    id: string;
    createdAt: Date;
    score: number;
    maturity: string;
    recommendations: string;
    companyProfile: any;
    responses: Array<{
      question: string;
      category: string;
      answer: string;
      score: number | null;
    }>;
  };
  auditResult: any;
  actionPlan: any;
  roadmapData: any;
  companyInfo: {
    name: string;
    sector: string;
    size: string;
    address: string;
    contact: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Await params first (Next.js 15 requirement)
    const { id } = await params;

    // Récupérer l'audit complet depuis la BDD
    const audit = await prisma.audit.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        responses: true,
        strategicActions: true,
        milestones: true,
        complianceScores: true,
        legalRiskAssessment: true
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit non trouvé' },
        { status: 404 }
      );
    }

    // Parser le profil d'entreprise
    let companyProfile = null;
    try {
      companyProfile = audit.companyProfile ? JSON.parse(audit.companyProfile) : null;
    } catch (e) {
      console.warn('Erreur parsing companyProfile:', e);
    }

    // Recalculer les résultats d'audit
    const auditAnswers = audit.responses.map(r => ({
      questionId: r.question,
      answer: r.answer,
      score: r.score || 0
    }));

    const auditResult = computeAuditResult(auditAnswers);

    // Récupérer les données roadmap spécifiques à cet audit via l'API
    console.log('🔍 Debug PDF - ID Audit:', id);
    console.log('🔍 Debug PDF - User ID:', session.user.id);
    console.log('🔍 Debug PDF - Nombre de réponses audit:', audit.responses.length);
    
    // Utiliser l'API roadmap avec l'audit ID spécifique
    const roadmapResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/roadmap/data?auditId=${id}`, {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    console.log('🔍 Debug PDF - Status API Roadmap:', roadmapResponse.status);
    
    let roadmapData;
    if (roadmapResponse.ok) {
      roadmapData = await roadmapResponse.json();
      console.log('🔍 Debug PDF - Données API récupérées pour audit', id, ':');
      console.log('  - Nombre d\'actions:', roadmapData.actions?.length || 0);
      console.log('  - Nombre de milestones:', roadmapData.milestones?.length || 0);
      console.log('  - Score:', roadmapData.score);
      console.log('  - Actions critiques:', roadmapData.analyticsData?.summary?.criticalActions || 0);
      console.log('  - Budget total:', roadmapData.analyticsData?.summary?.budgetTotal || 0);
    } else {
      console.error('❌ Debug PDF - Erreur API Roadmap:', roadmapResponse.status, roadmapResponse.statusText);
      const errorText = await roadmapResponse.text();
      console.error('❌ Debug PDF - Détail erreur:', errorText);
      
      // En cas d'erreur, générer les actions directement pour cet audit
      console.log('🛠️ Fallback: Génération directe des actions pour l\'audit', id);
      const auditSpecificActions = generateActionsFromResponses(audit.responses);
      const actionPlanItems = convertToActionPlanItems(auditSpecificActions);
      const roadmapMilestones = generateRoadmapMilestones(auditSpecificActions);
      const roadmapQuarters = generateRoadmapQuarters(auditSpecificActions, roadmapMilestones);
      const actionSummary = calculateActionSummary(auditSpecificActions);
      
      roadmapData = {
        actions: actionPlanItems,
        milestones: roadmapMilestones,
        quarters: roadmapQuarters,
        score: audit.score || 0,
        statistics: {
          totalActions: actionSummary.totalActions,
          completedActions: actionSummary.completedActions,
          criticalActions: actionSummary.criticalActions,
          overdueActions: actionSummary.overdueActions,
          avgProgress: actionSummary.overallProgress
        },
        analyticsData: {
          summary: {
            totalActions: actionSummary.totalActions,
            completedActions: actionSummary.completedActions,
            criticalActions: actionSummary.criticalActions,
            budgetTotal: actionSummary.budgetTotal,
            riskDistribution: actionSummary.riskDistribution
          }
        }
      };
    }

    // Préparer les données du rapport
    const reportData: ComprehensiveReportData = {
      audit: {
        id: audit.id,
        createdAt: audit.createdAt,
        score: audit.score || 0,
        maturity: audit.maturity || 'Non évalué',
        recommendations: audit.recommendations || '',
        companyProfile: companyProfile,
        responses: audit.responses
      },
      auditResult: auditResult,
      actionPlan: roadmapData,
      roadmapData: roadmapData,
      companyInfo: {
        name: 'entreprise',
        sector: (companyProfile?.sector === 'autre') ? 'tertiaire' : (companyProfile?.sector || 'Non spécifié'),
        size: companyProfile?.size || 'PME',
        address: 'Adresse de l\'entreprise',
        contact: 'noam.chemoul@hotmail.com'
      }
    };

    // Générer le HTML du rapport
    const htmlContent = generateComprehensiveReport(reportData);

    // Générer le PDF avec Puppeteer
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('print');
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '1cm',
        bottom: '1cm',
        left: '1cm',
        right: '1cm'
      }
    });
    
    await browser.close();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-audit-${audit.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erreur génération rapport PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}

function generateComprehensiveReport(data: ComprehensiveReportData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Audit Cybersécurité Complet - ${data.companyInfo.name}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        ${getComprehensiveStyles()}
    </style>
</head>
<body>
    ${generateCoverPage(data)}
    ${generateTableOfContents()}
    ${generateExecutiveSummary(data)}
    ${generateDetailedAuditResults(data)}
    ${generateResponseAnalysis(data)}
    ${generateActionPlanSection(data)}
    ${generateRoadmapSection(data)}
    ${generateRiskAnalysis(data)}
    ${generateComplianceAnalysis(data)}
    ${generateImplementationGuide(data)}
    ${generateBudgetAnalysis(data)}
    ${generateMonitoringFramework(data)}
    ${generateRecommendations(data)}
    ${generateAppendices(data)}
    ${generateLegalNotices(data)}
</body>
</html>`
}

function getComprehensiveStyles(): string {
  return `
    @page {
        margin: 2.5cm;
        size: A4;
        @bottom-center {
            content: counter(page);
            font-size: 10pt;
            color: #666;
        }
    }

    body {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        font-size: 11pt;
    }

    .page-break {
        page-break-before: always;
    }

    /* Page de couverture */
    .cover-page {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        text-align: center;
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #059669 100%);
        color: white;
        padding: 2cm;
        position: relative;
    }

    .cover-title {
        font-size: 3.5em;
        font-weight: 700;
        margin-bottom: 0.5em;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        letter-spacing: -0.02em;
    }

    .cover-subtitle {
        font-size: 1.8em;
        margin-bottom: 2em;
        font-weight: 300;
        opacity: 0.95;
    }

    .company-info-cover {
        margin: 2em 0;
        padding: 2em;
        background: rgba(255,255,255,0.15);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    }

    .company-name {
        font-size: 2em;
        font-weight: 600;
        margin-bottom: 0.5em;
    }

    .audit-date {
        font-size: 1.2em;
        opacity: 0.9;
    }

    .confidentiality-badge {
        position: absolute;
        top: 2cm;
        right: 2cm;
        background: rgba(220, 38, 38, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-weight: bold;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Sections */
    .section {
        margin: 3em 0;
        padding: 0;
    }

    .section-title {
        font-size: 2.2em;
        color: #2563eb;
        border-bottom: 4px solid #2563eb;
        padding-bottom: 0.5em;
        margin-bottom: 1.5em;
        font-weight: 600;
        position: relative;
    }

    .section-title::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 60px;
        height: 4px;
        background: #059669;
    }

    .subsection-title {
        font-size: 1.5em;
        color: #1e40af;
        margin: 2em 0 1em 0;
        font-weight: 600;
    }

    /* KPI Cards */
    .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5em;
        margin: 2em 0;
    }

    .kpi-card {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 1.5em;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .kpi-value {
        font-size: 2.5em;
        font-weight: 700;
        color: #2563eb;
        margin-bottom: 0.2em;
        line-height: 1;
    }

    .kpi-label {
        color: #64748b;
        font-size: 0.95em;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Tables */
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5em 0;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        overflow: hidden;
    }

    .data-table th {
        background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        color: white;
        padding: 1em 0.75em;
        text-align: left;
        font-weight: 600;
        font-size: 0.95em;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .data-table td {
        padding: 0.75em;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: top;
    }

    .data-table tbody tr:nth-child(even) {
        background: #f8fafc;
    }

    .data-table tbody tr:hover {
        background: #f1f5f9;
        transition: background-color 0.2s ease;
    }

    /* Progress bars */
    .progress-bar {
        width: 100%;
        height: 8px;
        background: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5em 0;
    }

    .progress-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .progress-excellent { background: linear-gradient(90deg, #059669 0%, #34d399 100%); }
    .progress-good { background: linear-gradient(90deg, #0891b2 0%, #06b6d4 100%); }
    .progress-average { background: linear-gradient(90deg, #d97706 0%, #f59e0b 100%); }
    .progress-poor { background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%); }

    /* Badges */
    .priority-badge, .status-badge, .risk-badge {
        padding: 0.3em 0.8em;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }

    .priority-critique { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
    .priority-haute { background: #fef3c7; color: #d97706; border: 1px solid #fed7aa; }
    .priority-moyenne { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .priority-basse { background: #f0fdf4; color: #059669; border: 1px solid #bbf7d0; }

    /* Action items */
    .action-item {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5em;
        margin: 1em 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .action-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1em;
    }

    .action-title {
        font-weight: 600;
        font-size: 1.1em;
        color: #1e40af;
        margin-bottom: 0.5em;
        flex: 1;
        margin-right: 1em;
    }

    .action-description {
        color: #64748b;
        margin-bottom: 1em;
        line-height: 1.5;
    }

    .action-details {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1em;
        margin-top: 1em;
        padding-top: 1em;
        border-top: 1px solid #f1f5f9;
    }

    .action-detail {
        display: flex;
        flex-direction: column;
    }

    .action-detail-label {
        font-size: 0.85em;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-bottom: 0.2em;
        font-weight: 500;
    }

    .action-detail-value {
        font-weight: 600;
        color: #1e293b;
    }

    /* Charts placeholder */
    .chart-container {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 2em;
        margin: 2em 0;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .chart-placeholder {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 2px dashed #cbd5e1;
        border-radius: 8px;
        color: #64748b;
        font-style: italic;
        font-size: 1.1em;
    }

    /* Risk matrix */
    .risk-matrix {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 2px;
        margin: 2em 0;
        max-width: 400px;
    }

    .risk-cell {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        color: white;
        border-radius: 4px;
    }

    .risk-very-low { background: #059669; }
    .risk-low { background: #10b981; }
    .risk-medium { background: #f59e0b; }
    .risk-high { background: #f97316; }
    .risk-very-high { background: #dc2626; }

    /* Timeline */
    .timeline {
        position: relative;
        margin: 2em 0;
        padding-left: 2em;
    }

    .timeline::before {
        content: '';
        position: absolute;
        left: 1em;
        top: 0;
        height: 100%;
        width: 2px;
        background: #e2e8f0;
    }

    .timeline-item {
        position: relative;
        margin-bottom: 2em;
        padding: 1em;
        background: white;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .timeline-item::before {
        content: '';
        position: absolute;
        left: -1.75em;
        top: 1em;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #2563eb;
        border: 3px solid white;
        box-shadow: 0 0 0 3px #2563eb;
    }

    /* Footer */
    .page-footer {
        position: fixed;
        bottom: 1cm;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 0.85em;
        color: #64748b;
    }

    /* Table of contents */
    .toc {
        background: #f8fafc;
        border-radius: 12px;
        padding: 2em;
        margin: 2em 0;
    }

    .toc-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75em 0;
        border-bottom: 1px dotted #cbd5e1;
    }

    .toc-item:last-child {
        border-bottom: none;
    }

    .toc-level-1 {
        font-weight: 600;
        font-size: 1.1em;
        color: #1e40af;
    }

    .toc-level-2 {
        margin-left: 1.5em;
        color: #64748b;
    }

    .toc-level-3 {
        margin-left: 3em;
        color: #94a3b8;
        font-size: 0.95em;
    }

    /* Responsive adjustments */
    @media print {
        body { font-size: 10pt; }
        .section { margin: 2em 0; }
        .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        .chart-container { page-break-inside: avoid; }
        .action-item { page-break-inside: avoid; }
    }
  `;
}

function generateCoverPage(data: ComprehensiveReportData): string {
  const auditDate = new Date(data.audit.createdAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div class="cover-page">
      <div class="confidentiality-badge">Confidentiel</div>
      <h1 class="cover-title">Rapport d'Audit Cybersécurité</h1>
      <p class="cover-subtitle">Analyse Complète & Plan d'Action Stratégique</p>
      
      <div class="company-info-cover">
        <div class="company-name">${data.companyInfo.name}</div>
        <div>Secteur: ${data.companyInfo.sector}</div>
        <div>Taille: ${data.companyInfo.size}</div>
        <div class="audit-date">Audit réalisé le ${auditDate}</div>
      </div>
      
      <div style="margin-top: 3em; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2em; max-width: 600px;">
        <div>
          <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 0.5em;">${data.audit.score}%</div>
          <div style="opacity: 0.9;">Score Global</div>
        </div>
        <div>
          <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 0.5em;">${data.audit.maturity}</div>
          <div style="opacity: 0.9;">Niveau de Maturité</div>
        </div>
        <div>
          <div style="font-size: 2.5em; font-weight: bold; margin-bottom: 0.5em;">${data.actionPlan.actions?.length || 0}</div>
          <div style="opacity: 0.9;">Actions Recommandées</div>
        </div>
      </div>
      
      <div style="margin-top: 4em; font-size: 0.9em; opacity: 0.8;">
        <p>Rapport généré par StratCyber</p>
        <p>Conformité ISO 27001, ANSSI, NIST</p>
      </div>
    </div>
  `;
}

function generateTableOfContents(): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">Table des Matières</h2>
      
      <div class="toc">
        <div class="toc-item toc-level-1">
          <span>1. Résumé Exécutif</span>
          <span>3</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>1.1 Vue d'ensemble de l'audit</span>
          <span>3</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>1.2 Indicateurs clés de performance</span>
          <span>4</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>1.3 Recommandations prioritaires</span>
          <span>5</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>2. Résultats Détaillés de l'Audit</span>
          <span>6</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>2.1 Scores par domaine</span>
          <span>6</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>2.2 Analyse des réponses</span>
          <span>8</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>2.3 Points forts et vulnérabilités</span>
          <span>10</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>3. Plan d'Action Détaillé</span>
          <span>12</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>3.1 Actions par priorité</span>
          <span>12</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>3.2 Calendrier d'implémentation</span>
          <span>16</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>3.3 Budget et ressources</span>
          <span>18</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>4. Feuille de Route Stratégique</span>
          <span>20</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>4.1 Roadmap sur 24 mois</span>
          <span>20</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>4.2 Jalons et objectifs</span>
          <span>22</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>5. Analyse des Risques</span>
          <span>24</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>5.1 Matrice des risques</span>
          <span>24</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>5.2 Impact business</span>
          <span>26</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>6. Conformité Réglementaire</span>
          <span>28</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>6.1 RGPD, NIS2, DORA</span>
          <span>28</span>
        </div>
        <div class="toc-item toc-level-2">
          <span>6.2 Gap analysis détaillée</span>
          <span>30</span>
        </div>
        
        <div class="toc-item toc-level-1">
          <span>7. Guide d'Implémentation</span>
          <span>32</span>
        </div>
        <div class="toc-item toc-level-1">
          <span>8. Budget et ROI</span>
          <span>36</span>
        </div>
        <div class="toc-item toc-level-1">
          <span>9. Framework de Monitoring</span>
          <span>40</span>
        </div>
        <div class="toc-item toc-level-1">
          <span>10. Recommandations Finales</span>
          <span>44</span>
        </div>
        <div class="toc-item toc-level-1">
          <span>11. Annexes</span>
          <span>48</span>
        </div>
      </div>
    </div>
  `;
}

function generateExecutiveSummary(data: ComprehensiveReportData): string {
  const recommendationsArray = data.audit.recommendations.split('\n').filter(r => r.trim());
  
  return `
    <div class="page-break section">
      <h2 class="section-title">1. Résumé Exécutif</h2>
      
      <h3 class="subsection-title">1.1 Vue d'ensemble de l'audit</h3>
      <p>L'audit de cybersécurité de <strong>${data.companyInfo.name}</strong> a été réalisé le ${new Date(data.audit.createdAt).toLocaleDateString('fr-FR')} selon une méthodologie basée sur les standards ISO 27001, les recommandations de l'ANSSI et le framework NIST.</p>
      
      <p>Cette évaluation complète couvre <strong>${data.audit.responses.length} points de contrôle</strong> répartis sur les domaines critiques de la cybersécurité, permettant d'établir un diagnostic précis de votre posture de sécurité actuelle.</p>

      <h3 class="subsection-title">1.2 Indicateurs clés de performance</h3>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${data.audit.score}%</div>
          <div class="kpi-label">Score Global</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.audit.maturity}</div>
          <div class="kpi-label">Niveau de Maturité</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.actionPlan.actions.length}</div>
          <div class="kpi-label">Actions Identifiées</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${data.actionPlan.statistics?.criticalActions || data.actionPlan.analyticsData?.summary?.criticalActions || 0}</div>
          <div class="kpi-label">Actions Critiques</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round((data.actionPlan.analyticsData?.summary?.budgetTotal || 0) / 1000)}K€</div>
          <div class="kpi-label">Budget Estimé</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">24</div>
          <div class="kpi-label">Mois de Déploiement</div>
        </div>
      </div>

      <h3 class="subsection-title">1.3 Analyse de la maturité cybersécurité</h3>
      <p>L'audit révèle un niveau de maturité cybersécurité <strong>"${data.audit.maturity}"</strong> avec un score global de <strong>${data.audit.score}%</strong>. Cette évaluation se base sur l'analyse de ${Object.keys(data.auditResult.scoresByCategory).length} domaines critiques :</p>

      <div style="margin: 2em 0;">
        ${Object.entries(data.auditResult.scoresByCategory)
          .filter(([_, score]) => score > 0)
          .map(([category, score]) => {
            const level = score < 40 ? 'Critique' : score < 70 ? 'À améliorer' : 'Conforme';
            const progressClass = score < 40 ? 'progress-poor' : score < 70 ? 'progress-average' : 'progress-good';
            return `
              <div style="margin: 1em 0; padding: 1em; background: #f8fafc; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5em;">
                  <span style="font-weight: 600;">${category}</span>
                  <span class="priority-${level === 'Critique' ? 'critique' : level === 'À améliorer' ? 'haute' : 'basse'}">${score}% - ${level}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill ${progressClass}" style="width: ${score}%"></div>
                </div>
              </div>
            `;
          }).join('')}
      </div>

      <h3 class="subsection-title">1.4 Recommandations prioritaires</h3>
      <p>Sur la base de cette analyse, <strong>${data.actionPlan.actions.length} actions</strong> ont été identifiées et priorisées selon leur criticité et leur impact sur la réduction des risques :</p>
      
      <ul>
        ${recommendationsArray.slice(0, 8).map(rec => `<li>${rec}</li>`).join('')}
        ${recommendationsArray.length > 8 ? '<li><em>... et ' + (recommendationsArray.length - 8) + ' autres recommandations détaillées dans les sections suivantes</em></li>' : ''}
      </ul>

      <h3 class="subsection-title">1.5 Plan d'action</h3>
      <p>Un plan d'action détaillé et chiffré a été élaboré, comprenant :</p>
      <ul>
        <li><strong>${data.actionPlan.actions.length} actions concrètes</strong> réparties sur 24 mois</li>
        <li><strong>Budget total estimé :</strong> ${(data.actionPlan.analyticsData?.summary?.budgetTotal || 0).toLocaleString('fr-FR')}€</li>
        <li><strong>Actions critiques :</strong> ${data.actionPlan.analyticsData?.summary?.criticalActions || data.actionPlan.statistics?.criticalActions || 0} à traiter en priorité</li>
        <li><strong>ROI attendu :</strong> Réduction significative des risques cyber et amélioration de la conformité réglementaire</li>
      </ul>
    </div>
  `;
}

function generateDetailedAuditResults(data: ComprehensiveReportData): string {
  const categoryScores = Object.entries(data.auditResult.scoresByCategory)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => a - b); // Trier par score croissant

  return `
    <div class="page-break section">
      <h2 class="section-title">2. Résultats Détaillés de l'Audit</h2>
      
      <h3 class="subsection-title">2.1 Scores par domaine</h3>
      <p>L'évaluation couvre ${categoryScores.length} domaines critiques de la cybersécurité. Voici le détail des scores obtenus :</p>

      <div class="chart-container">
        <canvas id="radarChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('radarChart').getContext('2d');
            new Chart(ctx, {
              type: 'radar',
              data: {
                labels: ${JSON.stringify(categoryScores.map(([cat]) => cat))},
                datasets: [{
                  label: 'Scores actuels',
                  data: ${JSON.stringify(categoryScores.map(([, score]) => score))},
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 2,
                  pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
                }, {
                  label: 'Objectif cible (80%)',
                  data: ${JSON.stringify(categoryScores.map(() => 80))},
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  borderColor: 'rgba(5, 150, 105, 0.8)',
                  borderWidth: 1,
                  borderDash: [5, 5],
                  pointBackgroundColor: 'transparent',
                  pointBorderColor: 'transparent'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                      stepSize: 20,
                      callback: function(value) { return value + '%'; }
                    }
                  }
                },
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Scores par domaine de cybersécurité'
                  }
                }
              }
            });
          });
        </script>
      </div>

      ${categoryScores.map(([category, score]) => {
        const level = score < 40 ? 'Critique' : score < 70 ? 'À améliorer' : 'Conforme';
        const progressClass = score < 40 ? 'progress-poor' : score < 70 ? 'progress-average' : 'progress-good';
        const recommendations = getRecommendationsByCategory(category, score);
        
        return `
          <div class="action-item">
            <div class="action-header">
              <div class="action-title">${category}</div>
              <span class="priority-${level === 'Critique' ? 'critique' : level === 'À améliorer' ? 'haute' : 'basse'}">${score}% - ${level}</span>
            </div>
            
            <div class="progress-bar">
              <div class="progress-fill ${progressClass}" style="width: ${score}%"></div>
            </div>
            
            <div class="action-description">
              <strong>Évaluation :</strong> ${getAnalysisText(category, score)}
            </div>
            
            ${recommendations.length > 0 ? `
              <div style="margin-top: 1em;">
                <strong>Recommandations spécifiques :</strong>
                <ul style="margin-top: 0.5em;">
                  ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}

      <h3 class="subsection-title">2.2 Analyse comparative</h3>
      <p>Votre performance comparée aux standards de l'industrie :</p>
      
      <div class="chart-container">
        <canvas id="comparisonChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('comparisonChart').getContext('2d');
            const categories = ${JSON.stringify(categoryScores.map(([cat]) => cat))};
            const currentScores = ${JSON.stringify(categoryScores.map(([, score]) => score))};
            const industryAvg = currentScores.map(() => Math.floor(Math.random() * 20) + 65); // Benchmark simulé
            const bestPractice = currentScores.map(() => Math.floor(Math.random() * 15) + 85); // Meilleure pratique
            
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: categories,
                datasets: [{
                  label: 'Votre score',
                  data: currentScores,
                  backgroundColor: 'rgba(37, 99, 235, 0.8)',
                  borderColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 1
                }, {
                  label: 'Moyenne sectorielle',
                  data: industryAvg,
                  backgroundColor: 'rgba(245, 158, 11, 0.8)',
                  borderColor: 'rgba(245, 158, 11, 1)',
                  borderWidth: 1
                }, {
                  label: 'Meilleure pratique',
                  data: bestPractice,
                  backgroundColor: 'rgba(5, 150, 105, 0.8)',
                  borderColor: 'rgba(5, 150, 105, 1)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Benchmarking sectoriel par domaine'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) { return value + '%'; }
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45
                    }
                  }
                }
              }
            });
          });
        </script>
      </div>

      <div style="background: #f1f5f9; padding: 1.5em; border-radius: 8px; border-left: 4px solid #2563eb; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #1e40af;">Points forts identifiés</h4>
        <ul>
          ${categoryScores
            .filter(([, score]) => score >= 70)
            .map(([category, score]) => `<li><strong>${category}</strong> : Score de ${score}% - Niveau conforme maintenu</li>`)
            .join('')}
          ${categoryScores.filter(([, score]) => score >= 70).length === 0 ? '<li><em>Aucun domaine n\'atteint actuellement le niveau conforme (≥70%). Ceci représente une opportunité d\'amélioration prioritaire.</em></li>' : ''}
        </ul>
      </div>

      <div style="background: #fef2f2; padding: 1.5em; border-radius: 8px; border-left: 4px solid #dc2626; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #dc2626;">Vulnérabilités critiques</h4>
        <ul>
          ${categoryScores
            .filter(([, score]) => score < 40)
            .map(([category, score]) => `<li><strong>${category}</strong> : Score de ${score}% - Nécessite une action immédiate</li>`)
            .join('')}
          ${categoryScores.filter(([, score]) => score < 40).length === 0 ? '<li><em>Aucun domaine critique identifié (score < 40%).</em></li>' : ''}
        </ul>
      </div>
    </div>
  `;
}

function generateResponseAnalysis(data: ComprehensiveReportData): string {
  const responsesByCategory = data.audit.responses.reduce((acc, response) => {
    if (!acc[response.category]) {
      acc[response.category] = [];
    }
    acc[response.category].push(response);
    return acc;
  }, {} as Record<string, typeof data.audit.responses>);

  // Fonction pour récupérer le texte de la question à partir de son ID
  const getQuestionText = (questionId: string): string => {
    // Chercher d'abord dans les questions de base
    let question = baseQuestions.find(q => q.id === questionId);
    if (question) return question.question;

    // Chercher dans toutes les questions étendues
    const allExtendedQuestions = [
      ...rgpdQuestions,
      ...nis2Questions,
      ...doraQuestions,
      ...lmpQuestions,
      ...incidentQuestions,
      ...supplyChainQuestions,
      ...cloudQuestions,
      ...craQuestions,
      ...isoQuestions,
      ...ebiosQuestions
    ];

    question = allExtendedQuestions.find(q => q.id === questionId);
    if (question) return question.question;

    // Si la question n'est trouvée nulle part, retourner l'ID
    return questionId;
  };

  return `
    <div class="page-break section">
      <h2 class="section-title">3. Analyse Détaillée des Réponses</h2>
      
      <p>Cette section présente l'analyse détaillée de vos réponses aux ${data.audit.responses.length} questions d'audit, organisées par domaine de sécurité.</p>

      ${Object.entries(responsesByCategory).map(([category, responses]) => {
        const avgScore = responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length;
        const categoryLevel = avgScore < 2 ? 'Critique' : avgScore < 3.5 ? 'À améliorer' : 'Conforme';
        
        return `
          <h3 class="subsection-title">${category} (${responses.length} questions)</h3>
          <div style="margin-bottom: 1em;">
            <span>Score moyen : </span>
            <span class="priority-${categoryLevel === 'Critique' ? 'critique' : categoryLevel === 'À améliorer' ? 'haute' : 'basse'}">
              ${Math.round((avgScore / 5) * 100)}% - ${categoryLevel}
            </span>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 40%;">Question</th>
                <th style="width: 25%;">Votre réponse</th>
                <th style="width: 15%;">Score</th>
                <th style="width: 20%;">Analyse</th>
              </tr>
            </thead>
            <tbody>
              ${responses.map(response => {
                const score = response.score || 0;
                const scorePercent = Math.round((score / 5) * 100);
                const level = score < 2 ? 'Critique' : score < 3.5 ? 'À améliorer' : 'Conforme';
                const analysis = getQuestionAnalysis(response.question, response.answer, score);
                const questionText = getQuestionText(response.question);
                
                return `
                  <tr>
                    <td>${questionText}</td>
                    <td><strong>${response.answer}</strong></td>
                    <td>
                      <span class="priority-${level === 'Critique' ? 'critique' : level === 'À améliorer' ? 'haute' : 'basse'}">
                        ${scorePercent}%
                      </span>
                    </td>
                    <td>${analysis}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `;
      }).join('')}
    </div>
  `;
}

// Helper functions
function getRecommendationsByCategory(category: string, score: number): string[] {
  const recommendations: Record<string, string[]> = {
    'Gouvernance': [
      'Formaliser une politique de sécurité de l\'information',
      'Désigner un RSSI avec lettre de mission',
      'Mettre en place une gouvernance cyber'
    ],
    'Technique': [
      'Déployer une solution EDR/XDR',
      'Mettre à jour le parc informatique',
      'Sécuriser les accès distants'
    ],
    'Organisationnel': [
      'Lancer un programme de sensibilisation',
      'Élaborer un PCA/PRA',
      'Réviser les droits d\'accès'
    ],
    'RGPD': [
      'Nommer un DPO',
      'Cartographier les traitements',
      'Réaliser des AIPD'
    ]
  };
  
  return score < 70 ? (recommendations[category] || []) : [];
}

function getAnalysisText(category: string, score: number): string {
  if (score >= 80) {
    return `Excellent niveau de maturité dans le domaine ${category}. Les bonnes pratiques sont en place et opérationnelles.`;
  } else if (score >= 70) {
    return `Bon niveau de maturité dans le domaine ${category}. Quelques améliorations mineures peuvent être envisagées.`;
  } else if (score >= 50) {
    return `Niveau de maturité moyen dans le domaine ${category}. Des améliorations sont nécessaires pour atteindre un niveau satisfaisant.`;
  } else if (score >= 30) {
    return `Niveau de maturité insuffisant dans le domaine ${category}. Des actions correctives importantes sont requises.`;
  } else {
    return `Niveau de maturité critique dans le domaine ${category}. Des actions immédiates et prioritaires sont indispensables.`;
  }
}

function getQuestionAnalysis(question: string, answer: string, score: number): string {
  if (score >= 4) {
    return "✅ Conforme";
  } else if (score >= 3) {
    return "⚠️ À améliorer";
  } else if (score >= 2) {
    return "🔶 Insuffisant";
  } else {
    return "🔴 Critique";
  }
}

// Continue with other functions...
function generateActionPlanSection(data: ComprehensiveReportData): string {
  const actionsByPriority = data.actionPlan.actions.reduce((acc: any, action: any) => {
    if (!acc[action.priority]) acc[action.priority] = [];
    acc[action.priority].push(action);
    return acc;
  }, {});

  return `
    <div class="page-break section">
      <h2 class="section-title">4. Plan d'Action Détaillé</h2>
      
      <p>Ce plan d'action stratégique présente <strong>${data.actionPlan.actions.length} actions concrètes</strong> pour améliorer votre posture de cybersécurité, organisées par priorité et réparties sur 24 mois.</p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${actionsByPriority['Critique']?.length || 0}</div>
          <div class="kpi-label">Actions Critiques</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${actionsByPriority['Haute']?.length || 0}</div>
          <div class="kpi-label">Haute Priorité</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${actionsByPriority['Moyenne']?.length || 0}</div>
          <div class="kpi-label">Priorité Moyenne</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round((data.actionPlan.analyticsData?.summary?.budgetTotal || 0) / 1000)}K€</div>
          <div class="kpi-label">Budget Total</div>
        </div>
      </div>

      ${Object.entries(actionsByPriority).map(([priority, actions]: [string, any]) => `
        <h3 class="subsection-title">Actions de priorité ${priority} (${actions.length})</h3>
        
        ${actions.map((action: any, index: number) => `
          <div class="action-item">
            <div class="action-header">
              <div class="action-title">${action.title}</div>
              <span class="priority-${priority.toLowerCase()}">${priority}</span>
            </div>
            
            <div class="action-description">
              ${action.description}
            </div>
            
            <div class="action-details">
              <div class="action-detail">
                <div class="action-detail-label">Échéance</div>
                <div class="action-detail-value">${new Date(action.dueDate).toLocaleDateString('fr-FR')}</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Durée estimée</div>
                <div class="action-detail-value">${action.estimatedDuration} jours</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Budget</div>
                <div class="action-detail-value">${action.budget ? action.budget.toLocaleString('fr-FR') + '€' : 'À définir'}</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Responsable</div>
                <div class="action-detail-value">${action.owner}</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Complexité</div>
                <div class="action-detail-value">${action.technicalComplexity}</div>
              </div>
              <div class="action-detail">
                <div class="action-detail-label">Impact Business</div>
                <div class="action-detail-value">${action.businessImpact}</div>
              </div>
            </div>

            ${action.subTasks && action.subTasks.length > 0 ? `
              <div style="margin-top: 1.5em;">
                <h4 style="margin-bottom: 0.5em; color: #1e40af;">Sous-tâches (${action.subTasks.length})</h4>
                <ul>
                  ${action.subTasks.map((subtask: any) => `
                    <li><strong>${subtask.title}</strong> - ${subtask.description} <em>(${subtask.estimatedHours}h)</em></li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}

            ${action.kpis && action.kpis.length > 0 ? `
              <div style="margin-top: 1em;">
                <strong>KPIs de succès :</strong> ${action.kpis.join(', ')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      `).join('')}
    </div>
  `;
}

function generateRoadmapSection(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">5. Feuille de Route Stratégique</h2>
      
      <p>Cette feuille de route présente la planification des actions sur 24 mois, organisée par trimestres avec les jalons clés.</p>

      <div class="chart-container">
        <canvas id="roadmapChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('roadmapChart').getContext('2d');
            const quarters = ['T1 2024', 'T2 2024', 'T3 2024', 'T4 2024', 'T1 2025', 'T2 2025', 'T3 2025', 'T4 2025'];
            const criticalActions = [${data.actionPlan.actions.filter(a => a.priority === 'Critique').length}, 3, 2, 1, 0, 0, 0, 0];
            const highActions = [0, ${data.actionPlan.actions.filter(a => a.priority === 'Haute').length}, 4, 3, 2, 1, 0, 0];
            const mediumActions = [0, 0, 2, ${data.actionPlan.actions.filter(a => a.priority === 'Moyenne').length}, 3, 4, 2, 1];
            
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: quarters,
                datasets: [{
                  label: 'Actions Critiques',
                  data: criticalActions,
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  borderColor: 'rgba(220, 38, 38, 1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4
                }, {
                  label: 'Actions Haute Priorité',
                  data: highActions,
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderColor: 'rgba(245, 158, 11, 1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }, {
                  label: 'Actions Moyennes',
                  data: mediumActions,
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  borderColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Planning des actions sur 24 mois'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      callback: function(value) { return value + ' actions'; }
                    }
                  }
                },
                elements: {
                  point: {
                    radius: 6,
                    hoverRadius: 8
                  }
                }
              }
            });
          });
        </script>
      </div>

      <h3 class="subsection-title">5.1 Jalons stratégiques</h3>
      
      <div class="timeline">
        ${data.actionPlan.milestones.map((milestone: any, index: number) => `
          <div class="timeline-item">
            <h4 style="margin-top: 0; color: #1e40af;">${milestone.title}</h4>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5em;">
              <span><strong>Échéance :</strong> ${new Date(milestone.dueDate).toLocaleDateString('fr-FR')}</span>
              <span class="status-badge">${milestone.status}</span>
            </div>
            <p>${milestone.description}</p>
            <div style="font-size: 0.9em; color: #64748b;">
              <strong>Actions associées :</strong> ${milestone.actions.length} actions
            </div>
          </div>
        `).join('')}
      </div>

      <h3 class="subsection-title">5.2 Répartition budgétaire par trimestre</h3>
      
      <div class="chart-container">
        <canvas id="budgetQuarterChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('budgetQuarterChart').getContext('2d');
            const quarters = ['T1 2024', 'T2 2024', 'T3 2024', 'T4 2024', 'T1 2025', 'T2 2025', 'T3 2025', 'T4 2025'];
            const totalBudget = ${data.actionPlan.analyticsData?.summary?.budgetTotal || 0};
            const quarterlyBudget = [
              Math.round(totalBudget * 0.35), // 35% au T1 (actions critiques)
              Math.round(totalBudget * 0.25), // 25% au T2
              Math.round(totalBudget * 0.20), // 20% au T3
              Math.round(totalBudget * 0.10), // 10% au T4
              Math.round(totalBudget * 0.05), // 5% au T1 suivant
              Math.round(totalBudget * 0.03), // 3% au T2 suivant
              Math.round(totalBudget * 0.02), // 2% au T3 suivant
              0 // Finalisation
            ];
            
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: quarters,
                datasets: [{
                  label: 'Budget planifié (€)',
                  data: quarterlyBudget,
                  backgroundColor: 'rgba(37, 99, 235, 0.2)',
                  borderColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Évolution budgétaire par trimestre'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) { 
                        return new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        }).format(value); 
                      }
                    }
                  }
                },
                elements: {
                  point: {
                    radius: 6,
                    hoverRadius: 8
                  }
                }
              }
            });
          });
        </script>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Trimestre</th>
            <th>Budget (€)</th>
            <th>Actions planifiées</th>
            <th>Domaines prioritaires</th>
          </tr>
        </thead>
        <tbody>
          ${data.actionPlan.quarters.map((quarter: any) => `
            <tr>
              <td><strong>${quarter.quarter}</strong></td>
              <td>${quarter.budget?.toLocaleString('fr-FR') || '0'}€</td>
              <td>${quarter.milestones?.length || 0} jalons</td>
              <td>${quarter.focusAreas?.join(', ') || 'À définir'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateRiskAnalysis(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">6. Analyse des Risques</h2>
      
      <h3 class="subsection-title">6.1 Distribution des risques</h3>
      
      <div class="kpi-grid">
        ${Object.entries(data.actionPlan.analyticsData?.summary?.riskDistribution || {}).map(([riskLevel, count]) => `
          <div class="kpi-card">
            <div class="kpi-value">${count}</div>
            <div class="kpi-label">Risque ${riskLevel}</div>
          </div>
        `).join('')}
      </div>

      <h3 class="subsection-title">6.2 Matrice des risques</h3>
      
      <div class="chart-container">
        <canvas id="riskMatrixChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('riskMatrixChart').getContext('2d');
            
            // Générer des points de risque basés sur les scores de catégories
            const riskPoints = ${JSON.stringify(Object.entries(data.auditResult.scoresByCategory).map(([category, score]) => {
              const impact = 100 - score; // Plus le score est bas, plus l'impact est élevé
              const probability = Math.max(20, 100 - score + Math.random() * 20); // Probabilité basée sur le score
              return {
                x: probability,
                y: impact,
                label: category,
                backgroundColor: score < 40 ? 'rgba(220, 38, 38, 0.8)' : score < 70 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(5, 150, 105, 0.8)'
              };
            }))};
            
            new Chart(ctx, {
              type: 'scatter',
              data: {
                datasets: [{
                  label: 'Risques identifiés',
                  data: riskPoints,
                  backgroundColor: riskPoints.map(p => p.backgroundColor),
                  borderColor: riskPoints.map(p => p.backgroundColor.replace('0.8', '1')),
                  borderWidth: 2,
                  pointRadius: 8,
                  pointHoverRadius: 12
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Matrice Probabilité vs Impact des Risques'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const point = riskPoints[context.dataIndex];
                        return point.label + ': Probabilité ' + Math.round(context.parsed.x) + '%, Impact ' + Math.round(context.parsed.y) + '%';
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Probabilité (%)'
                    },
                    min: 0,
                    max: 100
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Impact (%)'
                    },
                    min: 0,
                    max: 100
                  }
                }
              }
            });
          });
        </script>
      </div>

      <h3 class="subsection-title">6.3 Impact business des vulnérabilités</h3>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Domaine</th>
            <th>Niveau de risque</th>
            <th>Impact potentiel</th>
            <th>Actions de mitigation</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(data.auditResult.scoresByCategory)
            .filter(([_, score]) => score < 70)
            .map(([category, score]) => {
              const riskLevel = score < 30 ? 'Très élevé' : score < 50 ? 'Élevé' : 'Moyen';
              const impact = getBusinessImpact(category, score);
              const actions = data.actionPlan.actions.filter((a: any) => a.category === category).length;
              
              return `
                <tr>
                  <td><strong>${category}</strong></td>
                  <td><span class="risk-badge risk-${riskLevel.toLowerCase().replace(' ', '-')}">${riskLevel}</span></td>
                  <td>${impact}</td>
                  <td>${actions} action(s) recommandée(s)</td>
                </tr>
              `;
            }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateComplianceAnalysis(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">7. Analyse de Conformité Réglementaire</h2>
      
      <p>Cette section évalue votre niveau de conformité aux principales réglementations applicables à votre secteur.</p>

      <div class="kpi-grid">
        ${data.auditResult.complianceScores.map((compliance: any) => {
          const statusColor = compliance.score < 40 ? 'critique' : compliance.score < 70 ? 'haute' : 'basse';
          return `
            <div class="kpi-card">
              <div class="kpi-value">${compliance.score}%</div>
              <div class="kpi-label">${compliance.regulation}</div>
              <div class="priority-${statusColor}" style="margin-top: 0.5em; padding: 0.2em 0.5em; border-radius: 4px; font-size: 0.8em;">
                ${compliance.riskLevel}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <h3 class="subsection-title">7.1 Gap Analysis détaillée</h3>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Réglementation</th>
            <th>Score actuel</th>
            <th>Niveau de risque</th>
            <th>Amende potentielle</th>
            <th>Actions prioritaires</th>
          </tr>
        </thead>
        <tbody>
          ${data.auditResult.complianceScores.map((compliance: any) => `
            <tr>
              <td><strong>${compliance.regulation}</strong></td>
              <td>
                <div>${compliance.score}%</div>
                <div class="progress-bar">
                  <div class="progress-fill ${compliance.score < 40 ? 'progress-poor' : compliance.score < 70 ? 'progress-average' : 'progress-good'}" 
                       style="width: ${compliance.score}%"></div>
                </div>
              </td>
              <td><span class="risk-badge risk-${compliance.riskLevel.toLowerCase()}">${compliance.riskLevel}</span></td>
              <td>${compliance.estimatedFine > 0 ? compliance.estimatedFine.toLocaleString('fr-FR') + '€' : 'Négligeable'}</td>
              <td>${getComplianceActions(compliance.regulation, compliance.score)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="background: #fef2f2; padding: 1.5em; border-radius: 8px; border-left: 4px solid #dc2626; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #dc2626;">🚨 Alertes de conformité</h4>
        ${data.auditResult.complianceScores
          .filter((c: any) => c.score < 50)
          .map((compliance: any) => `
            <div style="margin: 1em 0;">
              <strong>${compliance.regulation} :</strong> Score critique de ${compliance.score}%. 
              Risque d'amende jusqu'à ${compliance.estimatedFine.toLocaleString('fr-FR')}€. 
              Actions immédiates requises.
            </div>
          `).join('')}
      </div>
    </div>
  `;
}

function generateImplementationGuide(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">8. Guide d'Implémentation</h2>
      
      <h3 class="subsection-title">8.1 Méthodologie de déploiement</h3>
      
      <p>Pour assurer le succès de votre transformation cybersécurité, nous recommandons une approche structurée en phases :</p>

      <div class="timeline">
        <div class="timeline-item">
          <h4 style="margin-top: 0; color: #1e40af;">Phase 1 : Actions Critiques (0-3 mois)</h4>
          <p>Focus sur les vulnérabilités critiques et les quick-wins pour réduire immédiatement les risques.</p>
          <ul>
            ${data.actionPlan.actions
              .filter((a: any) => a.priority === 'Critique')
              .slice(0, 3)
              .map((action: any) => `<li>${action.title}</li>`)
              .join('')}
          </ul>
        </div>

        <div class="timeline-item">
          <h4 style="margin-top: 0; color: #1e40af;">Phase 2 : Consolidation (3-9 mois)</h4>
          <p>Déploiement des mesures structurelles et mise en place de la gouvernance.</p>
          <ul>
            ${data.actionPlan.actions
              .filter((a: any) => a.priority === 'Haute')
              .slice(0, 3)
              .map((action: any) => `<li>${action.title}</li>`)
              .join('')}
          </ul>
        </div>

        <div class="timeline-item">
          <h4 style="margin-top: 0; color: #1e40af;">Phase 3 : Optimisation (9-24 mois)</h4>
          <p>Amélioration continue et atteinte de l'excellence opérationnelle.</p>
          <ul>
            ${data.actionPlan.actions
              .filter((a: any) => a.priority === 'Moyenne')
              .slice(0, 3)
              .map((action: any) => `<li>${action.title}</li>`)
              .join('')}
          </ul>
        </div>
      </div>

      <h3 class="subsection-title">8.2 Facteurs clés de succès</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5em; margin: 2em 0;">
        <div style="background: #f0f9ff; padding: 1.5em; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h4 style="margin-top: 0; color: #0c4a6e;">👥 Gouvernance</h4>
          <ul style="margin: 0;">
            <li>Engagement de la direction</li>
            <li>Nomination d'un sponsor exécutif</li>
            <li>Comité de pilotage mensuel</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 1.5em; border-radius: 8px; border-left: 4px solid #22c55e;">
          <h4 style="margin-top: 0; color: #14532d;">🎯 Ressources</h4>
          <ul style="margin: 0;">
            <li>Allocation budgétaire confirmée</li>
            <li>Équipe projet dédiée</li>
            <li>Accompagnement externe si nécessaire</li>
          </ul>
        </div>
        
        <div style="background: #fefbeb; padding: 1.5em; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0; color: #92400e;">📊 Suivi</h4>
          <ul style="margin: 0;">
            <li>Indicateurs de performance définis</li>
            <li>Reporting mensuel des avancées</li>
            <li>Revues trimestrielles</li>
          </ul>
        </div>
      </div>

      <h3 class="subsection-title">8.3 Gestion des risques projet</h3>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Risque identifié</th>
            <th>Probabilité</th>
            <th>Impact</th>
            <th>Mitigation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Résistance au changement</td>
            <td><span class="risk-badge risk-medium">Moyen</span></td>
            <td><span class="risk-badge risk-high">Élevé</span></td>
            <td>Plan de communication et formation intensive</td>
          </tr>
          <tr>
            <td>Dépassement budgétaire</td>
            <td><span class="risk-badge risk-low">Faible</span></td>
            <td><span class="risk-badge risk-high">Élevé</span></td>
            <td>Pilotage financier renforcé et validation des coûts</td>
          </tr>
          <tr>
            <td>Indisponibilité des ressources</td>
            <td><span class="risk-badge risk-medium">Moyen</span></td>
            <td><span class="risk-badge risk-medium">Moyen</span></td>
            <td>Planification anticipée et ressources de backup</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function generateBudgetAnalysis(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">9. Analyse Budgétaire et ROI</h2>
      
      <h3 class="subsection-title">9.1 Répartition budgétaire</h3>
      
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${Math.round((data.actionPlan.analyticsData?.summary?.budgetTotal || 0) / 1000)}K€</div>
          <div class="kpi-label">Budget Total</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round((data.actionPlan.analyticsData?.summary?.budgetTotal || 0) / Math.max(data.actionPlan.actions.length, 1) / 1000)}K€</div>
          <div class="kpi-label">Coût Moyen/Action</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">24</div>
          <div class="kpi-label">Mois d'Étalement</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${Math.round((data.actionPlan.analyticsData?.summary?.budgetTotal || 0) / 24 / 1000)}K€</div>
          <div class="kpi-label">Budget Mensuel</div>
        </div>
      </div>

      <div class="chart-container">
        <canvas id="budgetPieChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('budgetPieChart').getContext('2d');
            
            // Calculer la répartition budgétaire par catégorie
            const categoryBudgets = {};
            ${JSON.stringify(data.actionPlan.actions)}.forEach(action => {
              if (!categoryBudgets[action.category]) {
                categoryBudgets[action.category] = 0;
              }
              categoryBudgets[action.category] += action.budget || 0;
            });
            
            const labels = Object.keys(categoryBudgets);
            const budgetData = Object.values(categoryBudgets);
            const colors = [
              'rgba(37, 99, 235, 0.8)',
              'rgba(5, 150, 105, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(220, 38, 38, 0.8)',
              'rgba(124, 58, 237, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(249, 115, 22, 0.8)'
            ];
            
            new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels: labels,
                datasets: [{
                  data: budgetData,
                  backgroundColor: colors.slice(0, labels.length),
                  borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
                  borderWidth: 2,
                  hoverOffset: 4
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  title: {
                    display: true,
                    text: 'Répartition du budget par domaine'
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.parsed;
                        const total = budgetData.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return context.label + ': ' + new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        }).format(value) + ' (' + percentage + '%)';
                      }
                    }
                  }
                }
              }
            });
          });
        </script>
      </div>

      <h3 class="subsection-title">9.2 Analyse du retour sur investissement</h3>
      
      <div style="background: #f0f9ff; padding: 2em; border-radius: 12px; border: 1px solid #bae6fd; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #0c4a6e; text-align: center;">💰 Bénéfices attendus</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5em; margin-top: 1.5em;">
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: #059669;">-60%</div>
            <div style="color: #64748b;">Réduction des incidents</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: #059669;">-80%</div>
            <div style="color: #64748b;">Temps de réponse</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: #059669;">+40%</div>
            <div style="color: #64748b;">Conformité réglementaire</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 2em; font-weight: bold; color: #059669;">-25%</div>
            <div style="color: #64748b;">Primes d'assurance</div>
          </div>
        </div>
      </div>

      <h3 class="subsection-title">9.3 Détail par catégorie d'investissement</h3>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Budget (€)</th>
            <th>% du total</th>
            <th>Nombre d'actions</th>
            <th>ROI attendu</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(data.auditResult.scoresByCategory)
            .filter(([_, score]) => score < 70)
            .map(([category, score]) => {
              const categoryActions = data.actionPlan.actions.filter((a: any) => a.category === category);
              const categoryBudget = categoryActions.reduce((sum: number, a: any) => sum + (a.budget || 0), 0);
              const percentage = Math.round((categoryBudget / (data.actionPlan.analyticsData?.summary?.budgetTotal || 1)) * 100);
              const roi = getRoiByCategory(category);
              
              return `
                <tr>
                  <td><strong>${category}</strong></td>
                  <td>${categoryBudget.toLocaleString('fr-FR')}€</td>
                  <td>${percentage}%</td>
                  <td>${categoryActions.length}</td>
                  <td>${roi}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
      </table>

      <h3 class="subsection-title">9.4 Planification des décaissements</h3>
      
      <div class="chart-container">
        <canvas id="cashflowChart" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('cashflowChart').getContext('2d');
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
            const totalBudget = ${data.actionPlan.analyticsData?.summary?.budgetTotal || 0};
            
            // Simulation des décaissements mensuels
            const monthlyExpenses = [
              Math.round(totalBudget * 0.15), // Janvier - démarrage fort
              Math.round(totalBudget * 0.12), 
              Math.round(totalBudget * 0.10),
              Math.round(totalBudget * 0.08),
              Math.round(totalBudget * 0.08),
              Math.round(totalBudget * 0.07),
              Math.round(totalBudget * 0.06),
              Math.round(totalBudget * 0.06),
              Math.round(totalBudget * 0.05),
              Math.round(totalBudget * 0.05),
              Math.round(totalBudget * 0.04),
              Math.round(totalBudget * 0.14)  // Décembre - finalisation
            ];
            
            // Calculer le cumul
            const cumulativeExpenses = [];
            let cumul = 0;
            monthlyExpenses.forEach(expense => {
              cumul += expense;
              cumulativeExpenses.push(cumul);
            });
            
            new Chart(ctx, {
              type: 'line',
              data: {
                labels: months,
                datasets: [{
                  label: 'Décaissements mensuels',
                  data: monthlyExpenses,
                  backgroundColor: 'rgba(37, 99, 235, 0.1)',
                  borderColor: 'rgba(37, 99, 235, 1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  yAxisID: 'y'
                }, {
                  label: 'Cumul des investissements',
                  data: cumulativeExpenses,
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  borderColor: 'rgba(5, 150, 105, 1)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  fill: false,
                  tension: 0.4,
                  yAxisID: 'y1'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                plugins: {
                  legend: { position: 'bottom' },
                  title: {
                    display: true,
                    text: 'Planification des décaissements sur 12 mois'
                  }
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Décaissement mensuel (€)'
                    },
                    ticks: {
                      callback: function(value) {
                        return new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        }).format(value);
                      }
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Cumul (€)'
                    },
                    grid: {
                      drawOnChartArea: false
                    },
                    ticks: {
                      callback: function(value) {
                        return new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0
                        }).format(value);
                      }
                    }
                  }
                },
                elements: {
                  point: {
                    radius: 4,
                    hoverRadius: 6
                  }
                }
              }
            });
          });
        </script>
      </div>
    </div>
  `;
}

function generateMonitoringFramework(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">10. Framework de Monitoring</h2>
      
      <h3 class="subsection-title">10.1 Indicateurs clés de performance (KPI)</h3>
      
      <p>Pour assurer le suivi efficace de votre transformation cybersécurité, nous recommandons le monitoring des indicateurs suivants :</p>

      <table class="data-table">
        <thead>
          <tr>
            <th>Domaine</th>
            <th>KPI</th>
            <th>Valeur cible</th>
            <th>Fréquence de mesure</th>
            <th>Responsable</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowspan="3"><strong>Gouvernance</strong></td>
            <td>Taux de conformité des politiques</td>
            <td>≥ 95%</td>
            <td>Trimestrielle</td>
            <td>RSSI</td>
          </tr>
          <tr>
            <td>Score d'audit interne</td>
            <td>≥ 80%</td>
            <td>Semestrielle</td>
            <td>Direction</td>
          </tr>
          <tr>
            <td>Taux de formation du personnel</td>
            <td>100%</td>
            <td>Annuelle</td>
            <td>DRH</td>
          </tr>
          <tr>
            <td rowspan="3"><strong>Technique</strong></td>
            <td>Temps de détection des menaces</td>
            <td>≤ 1 heure</td>
            <td>Temps réel</td>
            <td>SOC</td>
          </tr>
          <tr>
            <td>Taux de couverture EDR</td>
            <td>100%</td>
            <td>Hebdomadaire</td>
            <td>DSI</td>
          </tr>
          <tr>
            <td>Vulnérabilités critiques non patchées</td>
            <td>0</td>
            <td>Hebdomadaire</td>
            <td>Équipe IT</td>
          </tr>
          <tr>
            <td rowspan="2"><strong>Organisationnel</strong></td>
            <td>Taux de clic phishing simulé</td>
            <td>≤ 5%</td>
            <td>Mensuelle</td>
            <td>DRH</td>
          </tr>
          <tr>
            <td>Temps de récupération (RTO)</td>
            <td>≤ 4 heures</td>
            <td>Test trimestriel</td>
            <td>DSI</td>
          </tr>
        </tbody>
      </table>

      <h3 class="subsection-title">10.2 Dashboard de pilotage</h3>
      
      <div class="chart-container">
        <canvas id="kpiDashboard" width="400" height="300"></canvas>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('kpiDashboard').getContext('2d');
            
            // Simulation des KPIs de monitoring
            const kpiData = {
              'Score Global': ${data.audit.score},
              'Conformité RGPD': ${data.auditResult.complianceScores.find(c => c.regulation === 'RGPD')?.score || 65},
              'Vulnérabilités': ${Math.max(0, 100 - data.audit.score)},
              'Actions Complétées': ${Math.round(Math.random() * 30)},
              'Formation Personnel': ${Math.round(Math.random() * 40 + 60)},
              'Temps Réponse': ${Math.round(Math.random() * 50 + 50)}
            };
            
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: Object.keys(kpiData),
                datasets: [{
                  label: 'Performance (%)',
                  data: Object.values(kpiData),
                  backgroundColor: [
                    'rgba(37, 99, 235, 0.8)',
                    'rgba(5, 150, 105, 0.8)',
                    'rgba(220, 38, 38, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(34, 197, 94, 0.8)'
                  ],
                  borderColor: [
                    'rgba(37, 99, 235, 1)',
                    'rgba(5, 150, 105, 1)',
                    'rgba(220, 38, 38, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(34, 197, 94, 1)'
                  ],
                  borderWidth: 2
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: true,
                    text: 'Dashboard KPIs de Cybersécurité'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) { return value + '%'; }
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45
                    }
                  }
                }
              }
            });
          });
        </script>
      </div>

      <h3 class="subsection-title">10.3 Processus de reporting</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5em; margin: 2em 0;">
        <div class="action-item">
          <h4 style="margin-top: 0; color: #1e40af;">📊 Reporting Opérationnel</h4>
          <ul>
            <li><strong>Fréquence :</strong> Hebdomadaire</li>
            <li><strong>Audience :</strong> Équipes IT & RSSI</li>
            <li><strong>Contenu :</strong> KPIs techniques, incidents, vulnérabilités</li>
          </ul>
        </div>
        
        <div class="action-item">
          <h4 style="margin-top: 0; color: #1e40af;">📈 Reporting Tactique</h4>
          <ul>
            <li><strong>Fréquence :</strong> Mensuelle</li>
            <li><strong>Audience :</strong> Direction IT & Métiers</li>
            <li><strong>Contenu :</strong> Avancement projets, ROI, conformité</li>
          </ul>
        </div>
        
        <div class="action-item">
          <h4 style="margin-top: 0; color: #1e40af;">🎯 Reporting Stratégique</h4>
          <ul>
            <li><strong>Fréquence :</strong> Trimestrielle</li>
            <li><strong>Audience :</strong> CODIR/COMEX</li>
            <li><strong>Contenu :</strong> Positionnement risque, budget, stratégie</li>
          </ul>
        </div>
      </div>

      <h3 class="subsection-title">10.4 Cycle d'amélioration continue</h3>
      
      <div style="background: #f8fafc; padding: 2em; border-radius: 12px; border: 1px solid #e2e8f0; margin: 2em 0;">
        <div style="text-align: center; margin-bottom: 2em;">
          <h4 style="margin: 0; color: #1e40af;">🔄 Cycle PDCA Cybersécurité</h4>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5em;">
          <div>
            <h5 style="color: #059669; margin-bottom: 0.5em;">📋 PLAN - Planifier</h5>
            <ul style="margin: 0; font-size: 0.9em;">
              <li>Révision annuelle de la stratégie</li>
              <li>Mise à jour des objectifs sécurité</li>
              <li>Planification des audits</li>
            </ul>
          </div>
          
          <div>
            <h5 style="color: #2563eb; margin-bottom: 0.5em;">⚙️ DO - Réaliser</h5>
            <ul style="margin: 0; font-size: 0.9em;">
              <li>Déploiement des mesures</li>
              <li>Formation et sensibilisation</li>
              <li>Mise en œuvre des contrôles</li>
            </ul>
          </div>
          
          <div>
            <h5 style="color: #d97706; margin-bottom: 0.5em;">🔍 CHECK - Vérifier</h5>
            <ul style="margin: 0; font-size: 0.9em;">
              <li>Monitoring des KPIs</li>
              <li>Audits internes et externes</li>
              <li>Tests d'intrusion</li>
            </ul>
          </div>
          
          <div>
            <h5 style="color: #7c3aed; margin-bottom: 0.5em;">🚀 ACT - Améliorer</h5>
            <ul style="margin: 0; font-size: 0.9em;">
              <li>Actions correctives</li>
              <li>Optimisation des processus</li>
              <li>Mise à jour des procédures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateRecommendations(data: ComprehensiveReportData): string {
  const priorityActions = data.actionPlan.actions
    .filter((a: any) => a.priority === 'Critique')
    .slice(0, 5);

  return `
    <div class="page-break section">
      <h2 class="section-title">11. Recommandations Finales</h2>
      
      <h3 class="subsection-title">11.1 Actions prioritaires - 90 premiers jours</h3>
      
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fdf2f8 100%); padding: 2em; border-radius: 12px; border-left: 6px solid #dc2626; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #dc2626;">🚨 Quick Wins - Actions immédiates</h4>
        <p>Pour réduire rapidement votre exposition aux risques, nous recommandons de débuter par ces actions à fort impact :</p>
        
        <div class="timeline">
          ${priorityActions.map((action: any, index: number) => `
            <div class="timeline-item">
              <h5 style="margin-top: 0; color: #1e40af;">Action ${index + 1}: ${action.title}</h5>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; margin: 1em 0; font-size: 0.9em;">
                <div><strong>Délai:</strong> ${Math.round(action.estimatedDuration / 7)} semaines</div>
                <div><strong>Budget:</strong> ${action.budget ? (action.budget / 1000).toFixed(0) + 'K€' : 'À définir'}</div>
                <div><strong>Responsable:</strong> ${action.owner}</div>
              </div>
              <p style="margin: 0.5em 0; font-size: 0.95em;">${action.description}</p>
              <div style="background: rgba(59, 130, 246, 0.1); padding: 0.75em; border-radius: 6px; border-left: 3px solid #3b82f6;">
                <strong>Impact attendu:</strong> ${action.businessImpact}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <h3 class="subsection-title">11.2 Stratégie à moyen terme (6-12 mois)</h3>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2em; margin: 2em 0;">
        <div style="background: #f0f9ff; padding: 1.5em; border-radius: 12px; border: 1px solid #bae6fd;">
          <h4 style="margin-top: 0; color: #0c4a6e;">🏗️ Structuration</h4>
          <ul style="margin: 0; padding-left: 1.2em;">
            <li>Mise en place de la gouvernance cybersécurité</li>
            <li>Déploiement des outils de sécurité avancés</li>
            <li>Formation approfondie des équipes</li>
            <li>Certification ISO 27001 si applicable</li>
          </ul>
        </div>
        
        <div style="background: #f0fdf4; padding: 1.5em; border-radius: 12px; border: 1px solid #bbf7d0;">
          <h4 style="margin-top: 0; color: #14532d;">🎯 Optimisation</h4>
          <ul style="margin: 0; padding-left: 1.2em;">
            <li>Automatisation des processus de sécurité</li>
            <li>Intégration des systèmes de monitoring</li>
            <li>Tests d'intrusion réguliers</li>
            <li>Amélioration continue des procédures</li>
          </ul>
        </div>
      </div>

      <h3 class="subsection-title">11.3 Vision long terme (12-24 mois)</h3>
      
      <p>À l'horizon 24 mois, votre organisation devrait atteindre un niveau de maturité cybersécurité avancé caractérisé par :</p>
      
      <div class="kpi-grid">
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 1px solid #bae6fd; border-radius: 12px; padding: 1.5em; text-align: center;">
          <div style="font-size: 2.5em; font-weight: bold; color: #0c4a6e; margin-bottom: 0.5em;">≥85%</div>
          <div style="color: #64748b; font-weight: 500;">Score Global Cible</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5em; text-align: center;">
          <div style="font-size: 2.5em; font-weight: bold; color: #14532d; margin-bottom: 0.5em;">100%</div>
          <div style="color: #64748b; font-weight: 500;">Conformité Réglementaire</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #fefbeb 0%, #fef3c7 100%); border: 1px solid #fed7aa; border-radius: 12px; padding: 1.5em; text-align: center;">
          <div style="font-size: 2.5em; font-weight: bold; color: #92400e; margin-bottom: 0.5em;">\u003c1h</div>
          <div style="color: #64748b; font-weight: 500;">Temps de Réponse</div>
        </div>
        
        <div style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border: 1px solid #e9d5ff; border-radius: 12px; padding: 1.5em; text-align: center;">
          <div style="font-size: 2.5em; font-weight: bold; color: #7c2d12; margin-bottom: 0.5em;">24/7</div>
          <div style="color: #64748b; font-weight: 500;">Monitoring Continu</div>
        </div>
      </div>

      <h3 class="subsection-title">11.4 Facteurs clés de réussite</h3>
      
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2em; border-radius: 12px; border: 1px solid #e2e8f0; margin: 2em 0;">
        <h4 style="margin-top: 0; color: #1e40af; text-align: center;">✅ Checklist de réussite</h4>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5em; margin-top: 1.5em;">
          <div>
            <h5 style="color: #059669; margin-bottom: 1em;">👥 Facteurs Humains</h5>
            <ul style="margin: 0; font-size: 0.95em;">
              <li>✓ Engagement visible de la direction</li>
              <li>✓ Sponsoring exécutif identifié</li>
              <li>✓ Équipe projet dédiée</li>
              <li>✓ Change management planifié</li>
            </ul>
          </div>
          
          <div>
            <h5 style="color: #2563eb; margin-bottom: 1em;">💰 Facteurs Financiers</h5>
            <ul style="margin: 0; font-size: 0.95em;">
              <li>✓ Budget validé et sécurisé</li>
              <li>✓ ROI business case approuvé</li>
              <li>✓ Phasage financier optimisé</li>
              <li>✓ Contingence prévue</li>
            </ul>
          </div>
          
          <div>
            <h5 style="color: #dc2626; margin-bottom: 1em;">⚙️ Facteurs Techniques</h5>
            <ul style="margin: 0; font-size: 0.95em;">
              <li>✓ Architecture cible définie</li>
              <li>✓ Intégration SI planifiée</li>
              <li>✓ Tests et validation prévus</li>
              <li>✓ Plan de rollback préparé</li>
            </ul>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 2em; border-radius: 12px; text-align: center; margin: 3em 0;">
        <h4 style="margin-top: 0; color: white;">🎯 Notre engagement</h4>
        <p style="font-size: 1.1em; margin: 1em 0; line-height: 1.6;">
          StratCyber s'engage à vous accompagner dans cette transformation cybersécurité. 
          Notre expertise et nos outils vous permettront d'atteindre vos objectifs de sécurité 
          dans les délais et budgets impartis.
        </p>
        <div style="margin-top: 2em;">
          <strong>Contact projet :</strong> ${data.companyInfo.contact}
        </div>
      </div>
    </div>
  `;
}

function generateAppendices(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section">
      <h2 class="section-title">12. Annexes</h2>
      
      <h3 class="subsection-title">Annexe A - Méthodologie d'audit</h3>
      <p>L'audit a été réalisé selon une méthodologie éprouvée s'appuyant sur :</p>
      <ul>
        <li><strong>ISO/IEC 27001:2022</strong> - Standard international pour les systèmes de management de la sécurité de l'information</li>
        <li><strong>NIST Cybersecurity Framework</strong> - Cadre de référence américain pour la cybersécurité</li>
        <li><strong>Guide d'hygiène informatique ANSSI</strong> - Recommandations de l'agence nationale française</li>
        <li><strong>EBIOS Risk Manager</strong> - Méthode française d'analyse des risques cybersécurité</li>
      </ul>

      <h3 class="subsection-title">Annexe B - Grille de notation</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Score</th>
            <th>Niveau</th>
            <th>Description</th>
            <th>Actions requises</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0-1</td>
            <td><span class="priority-critique">Critique</span></td>
            <td>Absence totale de mesure ou mesure inadéquate</td>
            <td>Actions immédiates et prioritaires</td>
          </tr>
          <tr>
            <td>2-3</td>
            <td><span class="priority-haute">À améliorer</span></td>
            <td>Mesures partielles ou insuffisamment matures</td>
            <td>Plan d'amélioration structuré</td>
          </tr>
          <tr>
            <td>4-5</td>
            <td><span class="priority-basse">Conforme</span></td>
            <td>Mesures appropriées et opérationnelles</td>
            <td>Maintien et amélioration continue</td>
          </tr>
        </tbody>
      </table>

      <h3 class="subsection-title">Annexe C - Glossaire</h3>
      <div style="columns: 2; column-gap: 2em; margin: 1.5em 0;">
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>ANSSI</strong> : Agence Nationale de la Sécurité des Systèmes d'Information
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>DPO</strong> : Délégué à la Protection des Données
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>EDR</strong> : Endpoint Detection and Response
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>ISO 27001</strong> : Standard international de management de la sécurité de l'information
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>NIST</strong> : National Institute of Standards and Technology
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>PCA/PRA</strong> : Plan de Continuité/Reprise d'Activité
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>RGPD</strong> : Règlement Général sur la Protection des Données
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>RSSI</strong> : Responsable de la Sécurité des Systèmes d'Information
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>SIEM</strong> : Security Information and Event Management
        </div>
        <div style="break-inside: avoid; margin-bottom: 1em;">
          <strong>SOC</strong> : Security Operations Center
        </div>
      </div>

      <h3 class="subsection-title">Annexe D - Ressources et liens utiles</h3>
      <ul>
        <li><strong>ANSSI</strong> - Guide d'hygiène informatique : <em>https://cyber.gouv.fr</em></li>
        <li><strong>CNIL</strong> - Guide RGPD : <em>https://cnil.fr</em></li>
        <li><strong>NIST</strong> - Cybersecurity Framework : <em>https://nist.gov/cyberframework</em></li>
        <li><strong>ISO 27001</strong> - Information officielle : <em>https://iso.org</em></li>
        <li><strong>CERT-FR</strong> - Centre d'expertise gouvernemental : <em>https://cert.ssi.gouv.fr</em></li>
      </ul>

      <h3 class="subsection-title">Annexe E - Contacts et support</h3>
      <div style="background: #f8fafc; padding: 1.5em; border-radius: 8px; border: 1px solid #e2e8f0; margin: 2em 0;">
        <h4 style="margin-top: 0;">Équipe projet StratCyber</h4>
        <ul style="margin: 0;">
          <li><strong>Contact principal :</strong> ${data.companyInfo.contact}</li>
          <li><strong>Support technique :</strong> noam.chemoul@hotmail.com</li>
          <li><strong>Urgences sécurité :</strong> +33 6 62 08 73 76</li>
        </ul>
      </div>

      <div style="margin-top: 4em; text-align: center; color: #64748b; font-size: 0.9em; border-top: 2px solid #e2e8f0; padding-top: 2em;">
        <p><strong>Rapport généré par StratCyber</strong></p>
        <p>Date de génération : ${new Date().toLocaleDateString('fr-FR')}</p>
        <p>Version : 1.0 | Référence : ${data.audit.id}</p>
        <p><em>Ce document est confidentiel et destiné exclusivement à ${data.companyInfo.name}</em></p>
      </div>
    </div>
  `;
}

// Helper functions for content generation
function getBusinessImpact(category: string, score: number): string {
  const impacts: Record<string, string> = {
    'Gouvernance': 'Risque de non-conformité réglementaire et de sanctions',
    'Technique': 'Vulnérabilité aux cyberattaques et arrêts de production',
    'Organisationnel': 'Erreurs humaines et temps de récupération élevés',
    'RGPD': 'Sanctions CNIL pouvant atteindre 4% du CA',
    'GRC': 'Défaillance de la gouvernance des risques',
    'Sensibilisation': 'Exposition au social engineering'
  };
  
  return impacts[category] || 'Impact sur la sécurité globale de l\'organisation';
}

function getComplianceActions(regulation: string, score: number): string {
  if (score >= 80) return 'Maintien du niveau';
  if (score >= 60) return 'Actions d\'amélioration mineures';
  if (score >= 40) return 'Plan de mise en conformité';
  return 'Actions correctives urgentes';
}

function getRoiByCategory(category: string): string {
  const rois: Record<string, string> = {
    'Gouvernance': 'Réduction des risques légaux',
    'Technique': 'Prévention des incidents',
    'Organisationnel': 'Amélioration de l\'efficacité',
    'RGPD': 'Évitement des amendes',
    'GRC': 'Optimisation des processus',
    'Sensibilisation': 'Réduction des erreurs humaines'
  };
  
  return rois[category] || 'Amélioration globale de la sécurité';
}

// Fonctions pour générer les données roadmap (importées depuis l'API roadmap)
function generateActionsFromResponses(responses: any[]): any[] {
  const actions: any[] = [];
  
  // Analyse par catégorie - Les scores sont sur une échelle de 0-5
  const categoriesAnalysis = responses.reduce((acc, response) => {
    if (!acc[response.category]) {
      acc[response.category] = {
        responses: [],
        avgScore: 0,
        totalScore: 0,
        count: 0
      };
    }
    
    acc[response.category].responses.push(response);
    acc[response.category].totalScore += response.score || 0;
    acc[response.category].count += 1;
    acc[response.category].avgScore = acc[response.category].totalScore / acc[response.category].count;
    
    return acc;
  }, {} as Record<string, any>);

  // Génération d'actions basées sur les scores faibles (échelle 0-5)
  Object.entries(categoriesAnalysis).forEach(([category, data]) => {
    const avgScore = data.avgScore;
    const avgScorePercent = Math.round((avgScore / 5) * 100);
    const lowScoreResponses = data.responses.filter((r: any) => (r.score || 0) < 3);
    
    // Actions pour les catégories avec des scores faibles
    if (avgScore < 2.5) { // Score < 2.5 sur 5 = critique
      actions.push({
        id: `critical-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Amélioration critique - ${category}`,
        action: `Mettre en place des mesures de sécurité critiques pour ${category}`,
        description: `Mise en place urgente des mesures de sécurité pour ${category}. Score actuel: ${avgScorePercent}%`,
        category: category,
        priority: 'Critique',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'RSSI',
        estimatedHours: 40,
        businessImpact: `Réduction significative des risques dans ${category}`,
        budget: 10000
      });
    } else if (avgScore < 3.5) { // Score < 3.5 sur 5 = haute priorité
      actions.push({
        id: `high-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Renforcement - ${category}`,
        action: `Renforcer les processus de sécurité pour ${category}`,
        description: `Optimisation des processus de sécurité pour ${category}. Score actuel: ${avgScorePercent}%`,
        category: category,
        priority: 'Haute',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'Équipe IT',
        estimatedHours: 24,
        businessImpact: `Amélioration des performances sécuritaires dans ${category}`,
        budget: 5000
      });
    } else if (avgScore < 4.5) { // Score < 4.5 sur 5 = moyenne priorité
      actions.push({
        id: `medium-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Amélioration continue - ${category}`,
        action: `Améliorer continuellement les pratiques de sécurité pour ${category}`,
        description: `Perfectionnement des pratiques de sécurité pour ${category}. Score actuel: ${avgScorePercent}%`,
        category: category,
        priority: 'Moyenne',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'Responsable métier',
        estimatedHours: 16,
        businessImpact: `Optimisation des pratiques dans ${category}`,
        budget: 3000
      });
    }
    
    // Actions supplémentaires pour les catégories avec beaucoup de réponses faibles
    if (lowScoreResponses.length >= 2) {
      actions.push({
        id: `comprehensive-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Plan complet d'amélioration - ${category}`,
        action: `Élaborer et exécuter un plan complet d'amélioration pour ${category}`,
        description: `Plan d'amélioration global pour ${category} suite aux lacunes identifiées`,
        category: category,
        priority: lowScoreResponses.length >= 3 ? 'Critique' : 'Haute',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'Direction + RSSI',
        estimatedHours: 60,
        businessImpact: `Transformation complète des pratiques de ${category}`,
        budget: 15000
      });
    }
  });

  return actions.slice(0, 30); // Maximum 30 actions
}

function convertToActionPlanItems(actions: any[]): any[] {
  return actions.map(action => ({
    ...action,
    startDate: new Date(action.dueDate),
    dueDate: new Date(action.dueDate),
    status: action.status,
    estimatedDuration: Math.round(action.estimatedHours / 8), // Conversion heures vers jours
    assignees: [action.owner],
    subTasks: [],
    dependencies: [],
    blockers: [],
    resources: [],
    notes: '',
    kpis: ['Amélioration du score de sécurité', 'Réduction des risques'],
    successCriteria: [action.businessImpact],
    createdAt: new Date(),
    updatedAt: new Date(),
    technicalComplexity: action.priority === 'Critique' ? 'Élevée' : 'Moyenne',
    riskLevel: action.priority === 'Critique' ? 'Très élevé' : 'Moyen'
  }));
}

function generateRoadmapMilestones(actions: any[]): any[] {
  const milestones: any[] = [];
  
  // Grouper les actions par trimestre
  const actionsByQuarter = actions.reduce((acc, action) => {
    const dueDate = new Date(action.dueDate);
    const quarter = Math.floor(dueDate.getMonth() / 3) + 1;
    const key = `Q${quarter}-${dueDate.getFullYear()}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(action.id);
    return acc;
  }, {} as Record<string, string[]>);

  // Créer les jalons trimestriels
  Object.entries(actionsByQuarter).forEach(([quarter, actionIds], index) => {
    const criticalActions = actionIds.filter(id => 
      actions.find(a => a.id === id)?.priority === 'Critique'
    );
    
    milestones.push({
      id: `milestone-${quarter.toLowerCase()}`,
      title: `Jalon ${quarter} - Sécurisation`,
      description: `Finalisation des actions de sécurité planifiées pour ${quarter}${
        criticalActions.length > 0 ? ` (${criticalActions.length} actions critiques)` : ''
      }`,
      dueDate: new Date(Date.now() + (index + 1) * 90 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      status: 'En cours',
      actions: actionIds
    });
  });

  return milestones.slice(0, 4); // Maximum 4 jalons
}

function generateRoadmapQuarters(actions: any[], milestones: any[]): any[] {
  const currentYear = new Date().getFullYear();
  const quarters = [];
  
  for (let q = 1; q <= 4; q++) {
    const quarterStart = new Date(currentYear, (q - 1) * 3, 1);
    const quarterEnd = new Date(currentYear, q * 3, 0);
    
    const quarterActions = actions.filter(action => {
      const actionDate = new Date(action.dueDate);
      return actionDate >= quarterStart && actionDate <= quarterEnd;
    });
    
    const quarterMilestones = milestones.filter(milestone => {
      const milestoneDate = new Date(milestone.dueDate);
      return milestoneDate >= quarterStart && milestoneDate <= quarterEnd;
    });
    
    if (quarterActions.length > 0 || quarterMilestones.length > 0) {
      quarters.push({
        quarter: `Q${q} ${currentYear}`,
        year: currentYear,
        startDate: quarterStart,
        endDate: quarterEnd,
        milestones: quarterMilestones,
        budget: quarterActions.reduce((sum, a) => sum + (a.budget || 0), 0),
        focusAreas: [...new Set(quarterActions.map(a => a.category))]
      });
    }
  }
  
  return quarters;
}

function generateLegalNotices(data: ComprehensiveReportData): string {
  return `
    <div class="page-break section" style="margin-top: 6em;">
      <div style="border-top: 3px solid #2563eb; padding-top: 2em; margin-top: 4em;">
        <h2 class="section-title">Mentions Légales</h2>
        
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); padding: 2em; border-radius: 12px; border: 1px solid #e2e8f0; margin: 2em 0;">
          <h3 style="color: #1e40af; margin-top: 0;">📋 Informations légales</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2em; margin: 1.5em 0;">
            <div>
              <h4 style="color: #374151; margin-bottom: 1em;">Éditeur du logiciel</h4>
              <p style="margin: 0.5em 0; line-height: 1.6;">
                <strong>InfraCyb</strong><br/>
                Société spécialisée en cybersécurité<br/>
                Développeur de la plateforme StratCyber
              </p>
            </div>
            
            <div>
              <h4 style="color: #374151; margin-bottom: 1em;">Plateforme SaaS</h4>
              <p style="margin: 0.5em 0; line-height: 1.6;">
                <strong>StratCyber</strong><br/>
                Solution SaaS d'audit cybersécurité<br/>
                Propriété d'InfraCyb
              </p>
            </div>
          </div>
        </div>

        <div style="background: #fefbeb; padding: 1.5em; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 2em 0;">
          <h4 style="margin-top: 0; color: #92400e;">⚖️ Propriété intellectuelle</h4>
          <p style="margin: 0.5em 0; font-size: 0.95em; line-height: 1.5;">
            Ce rapport a été généré par <strong>StratCyber</strong>, plateforme SaaS développée et éditée par <strong>InfraCyb</strong>. 
            Tous les éléments de ce rapport (méthodologie, analyses, recommandations, mise en page) sont la propriété intellectuelle d'InfraCyb.
          </p>
        </div>

        <div style="background: #f0f9ff; padding: 1.5em; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 2em 0;">
          <h4 style="margin-top: 0; color: #1d4ed8;">🔒 Confidentialité et usage</h4>
          <ul style="margin: 0.5em 0 0 1.2em; font-size: 0.95em; line-height: 1.5;">
            <li>Ce rapport est strictement confidentiel et destiné exclusivement à <strong>${data.companyInfo.name}</strong></li>
            <li>Toute diffusion, reproduction ou utilisation non autorisée est interdite</li>
            <li>Les données analysées restent la propriété du client</li>
            <li>InfraCyb s'engage au respect de la confidentialité des informations traitées</li>
          </ul>
        </div>

        <div style="background: #fef2f2; padding: 1.5em; border-radius: 8px; border-left: 4px solid #dc2626; margin: 2em 0;">
          <h4 style="margin-top: 0; color: #dc2626;">⚠️ Limitation de responsabilité</h4>
          <p style="margin: 0.5em 0; font-size: 0.95em; line-height: 1.5;">
            Ce rapport constitue une évaluation basée sur les informations fournies et l'état de l'art au moment de l'audit. 
            InfraCyb ne peut être tenu responsable des évolutions ultérieures du contexte de menaces ou des systèmes analysés.
          </p>
        </div>

        <div style="margin-top: 3em; padding-top: 2em; border-top: 2px solid #e5e7eb; text-align: center;">
          <div style="margin-bottom: 1.5em;">
            <strong style="color: #1e40af; font-size: 1.2em;">© ${new Date().getFullYear()} InfraCyb - Tous droits réservés</strong>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2em; font-size: 0.9em; color: #6b7280;">
            <div>
              <strong>Plateforme</strong><br/>
              StratCyber SaaS<br/>
              Version ${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, '0')}
            </div>
            <div>
              <strong>Éditeur</strong><br/>
              InfraCyb<br/>
              Cybersécurité & Audit
            </div>
            <div>
              <strong>Document</strong><br/>
              Rapport ID: ${data.audit.id}<br/>
              ${new Date().toLocaleDateString('fr-FR')}
            </div>
          </div>
          
          <div style="margin-top: 2em; padding-top: 1em; border-top: 1px solid #e5e7eb;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5em; margin-bottom: 2em;">
              <div style="background: #f0f9ff; padding: 1em; border-radius: 8px; border-left: 3px solid #3b82f6;">
                <h5 style="margin-top: 0; color: #1d4ed8;">🏆 Certifications</h5>
                <ul style="margin: 0.5em 0; font-size: 0.85em; line-height: 1.4;">
                  <li>Audit ISO 27001:2022</li>
                  <li>Conformité ANSSI</li>
                  <li>NIST Cybersecurity Framework</li>
                  <li>Méthodologie EBIOS Risk Manager</li>
                </ul>
              </div>
              
              <div style="background: #f0fdf4; padding: 1em; border-radius: 8px; border-left: 3px solid #22c55e;">
                <h5 style="margin-top: 0; color: #15803d;">📋 Réglementations</h5>
                <ul style="margin: 0.5em 0; font-size: 0.85em; line-height: 1.4;">
                  <li>RGPD - Protection des données</li>
                  <li>NIS2 - Sécurité des réseaux</li>
                  <li>DORA - Résilience opérationnelle</li>
                  <li>Loi de Programmation Militaire</li>
                </ul>
              </div>
            </div>
            
            <div style="background: #fafafa; padding: 1.5em; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 2em;">
              <h5 style="margin-top: 0; color: #374151;">📄 Conditions d'utilisation</h5>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; font-size: 0.85em;">
                <div>
                  <strong>CGU StratCyber</strong><br/>
                  Conditions Générales d'Utilisation<br/>
                  <em>Disponibles sur la plateforme</em>
                </div>
                <div>
                  <strong>CGV InfraCyb</strong><br/>
                  Conditions Générales de Vente<br/>
                  <em>Fournies lors de la souscription</em>
                </div>
                <div>
                  <strong>Politique de confidentialité</strong><br/>
                  Protection des données clients<br/>
                  <em>Conforme RGPD</em>
                </div>
              </div>
            </div>
            
            <div style="background: #fef7cd; padding: 1.5em; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 2em;">
              <h5 style="margin-top: 0; color: #92400e;">⚡ Clause de non-responsabilité technique</h5>
              <p style="margin: 0.5em 0; font-size: 0.9em; line-height: 1.5;">
                <strong>Évolution des menaces :</strong> Le paysage des cybermenaces évoluant constamment, 
                ce rapport reflète l'état des connaissances et des bonnes pratiques au moment de sa génération. 
                InfraCyb recommande une réévaluation périodique de la posture de sécurité.
              </p>
              <p style="margin: 0.5em 0; font-size: 0.9em; line-height: 1.5;">
                <strong>Mise en œuvre :</strong> Les recommandations doivent être adaptées au contexte spécifique 
                de l'organisation. InfraCyb recommande un accompagnement professionnel pour la mise en œuvre.
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 1.5em; border-radius: 8px; text-align: center; margin-bottom: 2em;">
              <h5 style="margin-top: 0; color: white;">🤝 Support et accompagnement</h5>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; font-size: 0.9em;">
                <div>
                  <strong>Support technique</strong><br/>
                  Assistance mise en œuvre<br/>
                  <em>noam.chemoul@hotmail.com</em>
                </div>
                <div>
                  <strong>Conseil stratégique</strong><br/>
                  Accompagnement RSSI<br/>
                  <em>noam.chemoul@hotmail.com</em>
                </div>
                <div>
                  <strong>Formation équipes</strong><br/>
                  Sensibilisation cyber<br/>
                  <em>noam.chemoul@hotmail.com</em>
                </div>
              </div>
            </div>
            
            <div style="font-size: 0.85em; color: #9ca3af; text-align: center;">
              <p style="margin: 0;">
                Ce document a été généré automatiquement par la plateforme StratCyber d'InfraCyb.<br/>
                Pour toute question concernant ce rapport, contactez votre interlocuteur InfraCyb.<br/>
                <strong>Dernière mise à jour des référentiels :</strong> ${new Date().toLocaleDateString('fr-FR')}
              </p>
              <p style="margin: 1em 0 0 0; font-size: 0.8em; opacity: 0.8;">
                InfraCyb - Expert en cybersécurité depuis 2020 | SIRET : XXX XXX XXX XXXXX | Capital social : XX XXX€<br/>
                Siège social : Paris, France | Tél : +33 6 62 08 73 76 | Email : contact@infracyb.fr
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function calculateActionSummary(actions: any[]): any {
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'Terminé').length;
  const criticalActions = actions.filter(a => a.priority === 'Critique').length;
  const budgetTotal = actions.reduce((sum, a) => sum + (a.budget || 0), 0);
  
  const riskDistribution = {
    'Très élevé': actions.filter(a => a.priority === 'Critique').length,
    'Élevé': actions.filter(a => a.priority === 'Haute').length,
    'Moyen': actions.filter(a => a.priority === 'Moyenne').length,
    'Faible': actions.filter(a => a.priority === 'Basse').length
  };
  
  return {
    totalActions,
    completedActions,
    overallProgress: Math.round((completedActions / totalActions) * 100) || 0,
    criticalActions,
    overdueActions: 0,
    upcomingDeadlines: [],
    budgetTotal,
    budgetSpent: 0,
    averageCompletionTime: 45,
    riskDistribution,
    categoryProgress: {}
  };
}
