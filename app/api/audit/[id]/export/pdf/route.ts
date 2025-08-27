import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const auditId = params.id;
    
    // Récupérer les données de l'audit
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: session.user.id,
      },
      include: {
        responses: true,
        complianceScores: true,
        strategicActions: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ error: 'Audit non trouvé' }, { status: 404 });
    }

    // Lancer Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    
    // Configuration de la page
    await page.setViewport({ width: 1200, height: 800 });
    
    // Créer le contenu HTML pour le PDF
    const htmlContent = generateAuditHTML(audit);
    
    // Charger le contenu HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>StratCyber - Rapport d'Audit de Cybersécurité</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; width: 100%; text-align: center; color: #666;">
          <span>Généré le ${new Date().toLocaleDateString('fr-FR')} - Page <span class="pageNumber"></span> sur <span class="totalPages"></span></span>
        </div>
      `,
    });

    await browser.close();

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-audit-${auditId}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    );
  }
}

function generateAuditHTML(audit: any): string {
  const auditDate = new Date(audit.createdAt).toLocaleDateString('fr-FR');
  const score = audit.score || 0;
  const maturity = audit.maturity || 'Non évalué';
  
  // Calculer les scores par catégorie
  const categoryScores: Record<string, number> = {};
  audit.responses.forEach((response: any) => {
    if (!categoryScores[response.category]) {
      categoryScores[response.category] = [];
    }
    categoryScores[response.category].push(response.score || 0);
  });
  
  // Moyenne par catégorie
  Object.keys(categoryScores).forEach(cat => {
    const scores = categoryScores[cat];
    categoryScores[cat] = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  });

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport d'Audit - ${auditId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          padding: 40px 20px;
          border-radius: 10px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 1.2em;
          opacity: 0.9;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 8px;
          background: #f8fafc;
          border-left: 4px solid #2563eb;
        }
        
        .section h2 {
          color: #2563eb;
          margin-bottom: 15px;
          font-size: 1.5em;
        }
        
        .section h3 {
          color: #475569;
          margin-bottom: 10px;
          font-size: 1.2em;
        }
        
        .score-card {
          display: inline-block;
          padding: 15px 25px;
          border-radius: 8px;
          margin: 10px;
          text-align: center;
          min-width: 150px;
          color: white;
          font-weight: bold;
        }
        
        .score-excellent { background: #059669; }
        .score-good { background: #d97706; }
        .score-poor { background: #dc2626; }
        
        .score-card .score {
          font-size: 2em;
          display: block;
        }
        
        .score-card .label {
          font-size: 0.9em;
          opacity: 0.9;
        }
        
        .table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .table th, .table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .table th {
          background: #2563eb;
          color: white;
          font-weight: bold;
        }
        
        .table tr:hover {
          background: #f1f5f9;
        }
        
        .progress-bar {
          width: 100%;
          height: 20px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin: 5px 0;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        .progress-excellent { background: #059669; }
        .progress-good { background: #d97706; }
        .progress-poor { background: #dc2626; }
        
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
        }
        
        .badge-high { background: #dc2626; color: white; }
        .badge-medium { background: #d97706; color: white; }
        .badge-low { background: #059669; color: white; }
        
        .recommendations {
          list-style: none;
          counter-reset: recommendation-counter;
        }
        
        .recommendations li {
          counter-increment: recommendation-counter;
          margin-bottom: 15px;
          padding-left: 40px;
          position: relative;
        }
        
        .recommendations li::before {
          content: counter(recommendation-counter);
          position: absolute;
          left: 0;
          top: 0;
          background: #2563eb;
          color: white;
          width: 25px;
          height: 25px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9em;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Page de garde -->
        <div class="header">
          <h1>RAPPORT D'AUDIT CYBERSÉCURITÉ</h1>
          <p>Analyse complète de la posture de sécurité</p>
          <p>Généré le ${auditDate}</p>
        </div>

        <!-- Résumé exécutif -->
        <div class="section">
          <h2>📋 Résumé Exécutif</h2>
          <div style="text-align: center; margin: 20px 0;">
            <div class="score-card ${score >= 80 ? 'score-excellent' : score >= 50 ? 'score-good' : 'score-poor'}">
              <span class="score">${score}%</span>
              <span class="label">Score Global</span>
            </div>
            <div class="score-card ${score >= 80 ? 'score-excellent' : score >= 50 ? 'score-good' : 'score-poor'}">
              <span class="score">${maturity}</span>
              <span class="label">Maturité</span>
            </div>
          </div>
          
          <p><strong>Analyse :</strong> Cet audit de cybersécurité révèle un score global de ${score}% avec un niveau de maturité "${maturity}". ${
    score >= 80 
      ? '✅ Excellente posture de cybersécurité ! Continuez à maintenir ce niveau élevé.'
      : score >= 50 
      ? '⚡ Votre organisation a des bases solides mais des améliorations importantes sont recommandées.'
      : '⚠️ ATTENTION : Votre organisation présente des vulnérabilités critiques nécessitant une action immédiate.'
  }</p>
        </div>

        <!-- Scores par catégorie -->
        <div class="section">
          <h2>📊 Analyse par Domaine</h2>
          ${Object.entries(categoryScores).map(([category, catScore]) => `
            <div style="margin-bottom: 20px;">
              <h3>${category}</h3>
              <div class="progress-bar">
                <div class="progress-fill ${catScore >= 70 ? 'progress-excellent' : catScore >= 40 ? 'progress-good' : 'progress-poor'}" 
                     style="width: ${catScore}%;"></div>
              </div>
              <p style="text-align: right; margin-top: 5px;"><strong>${Math.round(catScore)}%</strong></p>
            </div>
          `).join('')}
        </div>

        <!-- Actions recommandées -->
        <div class="section">
          <h2>🎯 Plan d'Action Recommandé</h2>
          ${audit.strategicActions && audit.strategicActions.length > 0 ? `
            <table class="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Catégorie</th>
                  <th>Priorité</th>
                  <th>Échéance</th>
                </tr>
              </thead>
              <tbody>
                ${audit.strategicActions.slice(0, 15).map((action: any) => `
                  <tr>
                    <td>${action.title}</td>
                    <td>${action.category}</td>
                    <td><span class="badge ${action.priority === 'Haute' ? 'badge-high' : action.priority === 'Moyenne' ? 'badge-medium' : 'badge-low'}">${action.priority}</span></td>
                    <td>${new Date(action.dueDate).toLocaleDateString('fr-FR')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>Aucune action spécifique recommandée pour le moment.</p>'}
        </div>

        <!-- Recommandations -->
        ${audit.recommendations ? `
        <div class="section">
          <h2>💡 Recommandations Détaillées</h2>
          <ol class="recommendations">
            ${audit.recommendations.split('\n').filter((rec: string) => rec.trim()).slice(0, 10).map((rec: string) => `
              <li>${rec.trim()}</li>
            `).join('')}
          </ol>
        </div>
        ` : ''}

        <div class="page-break"></div>

        <!-- Conformité réglementaire -->
        ${audit.complianceScores && audit.complianceScores.length > 0 ? `
        <div class="section">
          <h2>⚖️ Conformité Réglementaire</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Réglementation</th>
                <th>Score</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              ${audit.complianceScores.map((cs: any) => `
                <tr>
                  <td><strong>${cs.regulation}</strong></td>
                  <td>${cs.score}%</td>
                  <td><span class="badge ${cs.score >= 70 ? 'badge-low' : cs.score >= 40 ? 'badge-medium' : 'badge-high'}">${cs.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <!-- Détails des réponses -->
        <div class="section">
          <h2>📝 Détail des Réponses</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Réponse</th>
                <th>Catégorie</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${audit.responses.slice(0, 20).map((response: any) => `
                <tr>
                  <td style="max-width: 300px;">${response.question}</td>
                  <td><strong>${response.answer}</strong></td>
                  <td>${response.category}</td>
                  <td><span class="badge ${(response.score || 0) >= 4 ? 'badge-low' : (response.score || 0) >= 2 ? 'badge-medium' : 'badge-high'}">${response.score || 0}/5</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${audit.responses.length > 20 ? `<p style="margin-top: 15px; color: #64748b; font-size: 0.9em;">Et ${audit.responses.length - 20} autres réponses...</p>` : ''}
        </div>

        <!-- Conclusion -->
        <div class="section">
          <h2>🎯 Conclusion et Prochaines Étapes</h2>
          <p>${
            score >= 80 
              ? 'Félicitations ! Votre organisation maintient un excellent niveau de cybersécurité. Continuez à surveiller et à maintenir ces standards élevés.'
              : score >= 50 
              ? 'Votre organisation présente un niveau de cybersécurité satisfaisant mais peut bénéficier d\'améliorations ciblées. Concentrez-vous sur les domaines les moins performants.'
              : 'Votre organisation nécessite des améliorations urgentes en matière de cybersécurité. Nous recommandons fortement de prioriser les actions marquées comme "Haute priorité" et de mettre en place un plan de remédiation dans les 30 jours.'
          }</p>
          
          <p style="margin-top: 15px; color: #64748b;">Pour plus d'informations et un suivi détaillé, consultez votre tableau de bord StratCyber.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
