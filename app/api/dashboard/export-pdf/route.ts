import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDashboardData } from '@/lib/dashboard/data';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { sections, dateRange } = await request.json();

    // Récupérer les données du dashboard
    const dashboardData = await getDashboardData(session.user.id);

    // Générer le HTML pour le PDF
    const htmlContent = generateDashboardHTML(dashboardData, sections, dateRange);

    // En production, vous pourriez utiliser puppeteer ou une autre bibliothèque
    // pour générer un vrai PDF. Pour l'instant, on retourne le HTML.
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="dashboard-${new Date().toISOString().split('T')[0]}.html"`
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export PDF' },
      { status: 500 }
    );
  }
}

function generateDashboardHTML(data: any, sections: string[], dateRange: any): string {
  const today = new Date().toLocaleDateString('fr-FR');
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Dashboard Cybersécurité - ${today}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 28px;
        }
        .header p {
            color: #666;
            margin: 5px 0 0 0;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .kpi-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            background: #f9fafb;
        }
        .kpi-value {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
        }
        .kpi-title {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .kpi-subtitle {
            font-size: 12px;
            color: #999;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #1f2937;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .table th,
        .table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
        }
        .table th {
            background-color: #f3f4f6;
            font-weight: bold;
        }
        .table tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
        .badge-success { background-color: #d1fae5; color: #065f46; }
        .badge-warning { background-color: #fef3c7; color: #92400e; }
        .badge-danger { background-color: #fee2e2; color: #991b1b; }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        @media print {
            body { print-color-adjust: exact; }
            .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Dashboard Cybersécurité</h1>
        <p>Rapport généré le ${today}</p>
        <p>Période: ${dateRange?.start ? new Date(dateRange.start).toLocaleDateString('fr-FR') : 'N/A'} - ${dateRange?.end ? new Date(dateRange.end).toLocaleDateString('fr-FR') : 'N/A'}</p>
    </div>

    ${sections.includes('kpis') ? `
    <div class="section">
        <h2>Indicateurs Clés de Performance</h2>
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-value">${data.kpis.globalMaturityScore}%</div>
                <div class="kpi-title">Score de Maturité Global</div>
                <div class="kpi-subtitle">Niveau de maturité cybersécurité</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${data.kpis.actionProgressPercentage}%</div>
                <div class="kpi-title">Progression des Actions</div>
                <div class="kpi-subtitle">${data.kpis.completedActions} terminées, ${data.kpis.inProgressActions} en cours</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${data.kpis.legalRiskScore}/100</div>
                <div class="kpi-title">Risque Légal</div>
                <div class="kpi-subtitle">Score de risque de non-conformité</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-value">${data.kpis.openIncidents}</div>
                <div class="kpi-title">Incidents Ouverts</div>
                <div class="kpi-subtitle">${data.kpis.criticalVulnerabilities} vulnérabilités critiques</div>
            </div>
        </div>
    </div>
    ` : ''}

    ${sections.includes('actions') ? `
    <div class="section">
        <h2>Plan d'Action</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Action</th>
                    <th>Catégorie</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Progression</th>
                    <th>Échéance</th>
                    <th>Responsable</th>
                </tr>
            </thead>
            <tbody>
                ${data.actions.map((action: any) => `
                <tr>
                    <td>${action.title}</td>
                    <td>${action.category}</td>
                    <td><span class="badge ${getPriorityBadgeClass(action.priority)}">${action.priority}</span></td>
                    <td><span class="badge ${getStatusBadgeClass(action.status)}">${action.status}</span></td>
                    <td>${action.progress}%</td>
                    <td>${new Date(action.dueDate).toLocaleDateString('fr-FR')}</td>
                    <td>${action.owner || 'Non assigné'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${sections.includes('risks') ? `
    <div class="section">
        <h2>Registre des Risques</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Risque</th>
                    <th>Catégorie</th>
                    <th>Impact</th>
                    <th>Probabilité</th>
                    <th>Niveau</th>
                    <th>Statut</th>
                    <th>Responsable</th>
                </tr>
            </thead>
            <tbody>
                ${data.risks.map((risk: any) => `
                <tr>
                    <td>${risk.title}</td>
                    <td>${risk.category}</td>
                    <td>${risk.impact}/5</td>
                    <td>${risk.probability}/5</td>
                    <td><span class="badge ${getRiskLevelBadgeClass(risk.riskLevel)}">${risk.riskLevel}</span></td>
                    <td>${risk.status}</td>
                    <td>${risk.owner || 'Non assigné'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${sections.includes('compliance') ? `
    <div class="section">
        <h2>Conformité Réglementaire</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Réglementation</th>
                    <th>Score</th>
                    <th>Statut</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(data.kpis.complianceScores).map(([regulation, score]: [string, any]) => `
                <tr>
                    <td>${regulation}</td>
                    <td>${score}%</td>
                    <td><span class="badge ${getComplianceBadgeClass(score)}">${getComplianceStatus(score)}</span></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="footer">
        <p>Ce rapport a été généré automatiquement par StratCyber Dashboard.</p>
        <p>Données extraites le ${today} à ${new Date().toLocaleTimeString('fr-FR')}</p>
    </div>
</body>
</html>
  `;
}

function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case 'Critique':
    case 'Haute':
      return 'badge-danger';
    case 'Moyenne':
      return 'badge-warning';
    default:
      return 'badge-success';
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Terminé':
      return 'badge-success';
    case 'En cours':
      return 'badge-warning';
    case 'En retard':
      return 'badge-danger';
    default:
      return 'badge-warning';
  }
}

function getRiskLevelBadgeClass(level: string): string {
  switch (level) {
    case 'Critique':
    case 'Élevé':
      return 'badge-danger';
    case 'Moyen':
      return 'badge-warning';
    default:
      return 'badge-success';
  }
}

function getComplianceBadgeClass(score: number): string {
  if (score >= 80) return 'badge-success';
  if (score >= 60) return 'badge-warning';
  return 'badge-danger';
}

function getComplianceStatus(score: number): string {
  if (score >= 80) return 'Conforme';
  if (score >= 60) return 'À améliorer';
  return 'Critique';
}
