// Importations dynamiques simplifiées pour éviter les problèmes SSR
let jsPDF: any = null;

// Fonction pour charger jsPDF dynamiquement (sans canvg)
async function loadJsPDF() {
  if (typeof window !== 'undefined' && !jsPDF) {
    try {
      // Importer seulement jsPDF de base sans les extensions problématiques
      const jsPDFModule = await import('jspdf');
      jsPDF = jsPDFModule.default;
      
      // Essayer d'importer autotable de manière sécurisée
      try {
        await import('jspdf-autotable');
      } catch (autoTableError) {
        console.warn('jspdf-autotable non disponible:', autoTableError);
      }
      
      return jsPDF;
    } catch (error) {
      console.error('Erreur lors du chargement de jsPDF:', error);
      throw new Error('Impossible de charger jsPDF');
    }
  }
  return jsPDF;
}

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

const COLORS = {
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#059669',
  warning: '#d97706',
  danger: '#dc2626',
  light: '#f8fafc',
  dark: '#1e293b'
};

export class AuditPDFGenerator {
  private pdf: any;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private pageNumber: number;
  private isInitialized: boolean = false;

  constructor() {
    // L'initialisation se fera de manière asynchrone
    this.margin = 20;
    this.pageNumber = 1;
  }

  private async initialize() {
    if (this.isInitialized) return;
    
    const jsPDFClass = await loadJsPDF();
    if (!jsPDFClass) {
      throw new Error('Impossible de charger jsPDF. Assurez-vous d\'être côté client.');
    }
    
    this.pdf = new jsPDFClass('portrait', 'mm', 'a4');
    this.pageHeight = this.pdf.internal.pageSize.height;
    this.pageWidth = this.pdf.internal.pageSize.width;
    this.currentY = this.margin;
    this.isInitialized = true;
  }

  private addHeader(isCoverPage: boolean = false) {
    if (isCoverPage) {
      // Page de couverture - header plus grand et centré
      this.pdf.setFillColor(37, 99, 235); // Bleu primaire
      this.pdf.rect(0, 0, this.pageWidth, 40, 'F');
      
      // Titre principal centré
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(24);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('StratCyber', this.pageWidth / 2, 20, { align: 'center' });
      
      // Sous-titre centré
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text('Rapport d\'Audit de Cybersécurité', this.pageWidth / 2, 32, { align: 'center' });
      
      this.currentY = 50;
    } else {
      // Pages normales - header simple
      this.pdf.setFillColor(37, 99, 235); // Bleu primaire
      this.pdf.rect(0, 0, this.pageWidth, 20, 'F');
      
      // Titre simple
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('StratCyber - Rapport d\'Audit', this.margin, 12);
      
      // Date à droite
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('fr-FR');
      this.pdf.text(date, this.pageWidth - this.margin - 30, 12);
      
      this.currentY = 30;
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    // Ligne de séparation
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Texte du pied de page
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    const date = new Date().toLocaleDateString('fr-FR');
    this.pdf.text(`Généré le ${date} par StratCyber`, this.margin, footerY);
    this.pdf.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin - 15, footerY);
  }

  private checkPageBreak(height: number = 20) {
    if (this.currentY + height > this.pageHeight - 30) {
      this.addFooter();
      this.pdf.addPage();
      this.pageNumber++;
      this.addHeader();
    }
  }

  private addTitle(text: string, level: number = 1) {
    this.checkPageBreak(15);
    
    const sizes = [18, 14, 12];
    const colors = [COLORS.primary, COLORS.secondary, COLORS.dark];
    
    this.pdf.setFontSize(sizes[level - 1] || 12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(colors[level - 1] || COLORS.dark);
    
    this.pdf.text(text, this.margin, this.currentY);
    this.currentY += level === 1 ? 12 : 8;
    
    // Ligne sous le titre principal
    if (level === 1) {
      this.pdf.setDrawColor(37, 99, 235);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 5;
    }
  }

  private addText(text: string, options: { 
    bold?: boolean; 
    color?: string; 
    fontSize?: number;
    indent?: number;
  } = {}) {
    this.checkPageBreak(6);
    
    this.pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
    this.pdf.setFontSize(options.fontSize || 10);
    this.pdf.setTextColor(options.color || COLORS.dark);
    
    const x = this.margin + (options.indent || 0);
    const maxWidth = this.pageWidth - this.margin - x;
    
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    
    for (const line of lines) {
      this.checkPageBreak(5);
      this.pdf.text(line, x, this.currentY);
      this.currentY += 5;
    }
    
    this.currentY += 2;
  }

  private addScoreCard(title: string, score: number, status: string) {
    this.checkPageBreak(25);
    
    const cardWidth = 80;
    const cardHeight = 20;
    const x = this.margin;
    
    // Couleur de fond selon le score
    let bgColor = COLORS.success;
    if (score < 40) bgColor = COLORS.danger;
    else if (score < 70) bgColor = COLORS.warning;
    
    // Fond de la carte
    this.pdf.setFillColor(bgColor);
    this.pdf.roundedRect(x, this.currentY, cardWidth, cardHeight, 2, 2, 'F');
    
    // Titre
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.text(title, x + 5, this.currentY + 8);
    
    // Score
    this.pdf.setFontSize(16);
    this.pdf.text(`${score}%`, x + 5, this.currentY + 15);
    
    // Status
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(status, x + 40, this.currentY + 15);
    
    this.currentY += cardHeight + 10;
  }

  private addComplianceTable(complianceScores: ComplianceScore[]) {
    this.checkPageBreak(40);
    
    const tableData = complianceScores.map(cs => [
      cs.regulation,
      `${cs.score}%`,
      cs.status
    ]);

    this.pdf.autoTable({
      startY: this.currentY,
      head: [['Réglementation', 'Score', 'Statut']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 50, halign: 'center' }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const score = parseInt(tableData[data.row.index][1]);
          let color = [5, 150, 105]; // Vert
          if (score < 40) color = [220, 38, 38]; // Rouge
          else if (score < 70) color = [217, 119, 6]; // Orange
          
          this.pdf.setFillColor(...color);
          this.pdf.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          
          this.pdf.setTextColor(255, 255, 255);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(data.cell.text[0], data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
            align: 'center'
          });
        }
      }
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addActionPlanTable(actionPlan: ActionPlanItem[]) {
    this.checkPageBreak(40);
    
    const tableData = actionPlan.slice(0, 20).map(action => [
      action.action.substring(0, 60) + (action.action.length > 60 ? '...' : ''),
      action.category,
      action.priority,
      action.deadline,
      action.owner || 'Non assigné'
    ]);

    this.pdf.autoTable({
      startY: this.currentY,
      head: [['Action', 'Catégorie', 'Priorité', 'Échéance', 'Responsable']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      },
      didDrawCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 2) {
          const priority = tableData[data.row.index][2];
          let color = [5, 150, 105]; // Vert pour basse
          if (priority === 'Haute') color = [220, 38, 38]; // Rouge
          else if (priority === 'Moyenne') color = [217, 119, 6]; // Orange
          
          this.pdf.setFillColor(...color);
          this.pdf.rect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 'F');
          
          this.pdf.setTextColor(255, 255, 255);
          this.pdf.setFont('helvetica', 'bold');
          this.pdf.text(data.cell.text[0], data.cell.x + data.cell.width/2, data.cell.y + data.cell.height/2, {
            align: 'center'
          });
        }
      }
    });

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 10;
  }

  private addCategoryBreakdown(categoryScores: Record<string, number>) {
    this.addTitle('Analyse par Domaine', 2);
    
    Object.entries(categoryScores).forEach(([category, score]) => {
      this.checkPageBreak(15);
      
      // Nom de la catégorie
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(11);
      this.pdf.setTextColor(COLORS.dark);
      this.pdf.text(category, this.margin, this.currentY);
      
      // Barre de progression
      const barWidth = 100;
      const barHeight = 6;
      const barX = this.margin + 50;
      
      // Fond de la barre
      this.pdf.setFillColor(230, 230, 230);
      this.pdf.rect(barX, this.currentY - 3, barWidth, barHeight, 'F');
      
      // Barre de progression
      let barColor = COLORS.success;
      if (score < 40) barColor = COLORS.danger;
      else if (score < 70) barColor = COLORS.warning;
      
      this.pdf.setFillColor(barColor);
      this.pdf.rect(barX, this.currentY - 3, (barWidth * score) / 100, barHeight, 'F');
      
      // Score en texte
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(COLORS.dark);
      this.pdf.text(`${score}%`, barX + barWidth + 5, this.currentY);
      
      this.currentY += 12;
    });
    
    this.currentY += 5;
  }

  private addExecutiveSummary(audit: AuditData) {
    this.addTitle('Résumé Exécutif', 2);
    
    const score = audit.score || 0;
    const maturity = audit.maturity || 'Non évalué';
    const legalRisk = audit.legalRiskScore || 0;
    
    this.addText(
      `Cet audit de cybersécurité a été réalisé le ${new Date(audit.createdAt).toLocaleDateString('fr-FR')} et révèle un score global de ${score}% avec un niveau de maturité "${maturity}".`,
      { fontSize: 11 }
    );
    
    if (score < 50) {
      this.addText(
        '⚠️ ATTENTION : Votre organisation présente des vulnérabilités critiques nécessitant une action immédiate.',
        { bold: true, color: COLORS.danger, fontSize: 11 }
      );
    } else if (score < 80) {
      this.addText(
        '⚡ Votre organisation a des bases solides mais des améliorations importantes sont recommandées.',
        { bold: true, color: COLORS.warning, fontSize: 11 }
      );
    } else {
      this.addText(
        '✅ Excellente posture de cybersécurité ! Continuez à maintenir ce niveau élevé.',
        { bold: true, color: COLORS.success, fontSize: 11 }
      );
    }
    
    this.addText(
      `Le risque légal est évalué à ${legalRisk}% et nécessite ${legalRisk > 70 ? 'une attention immédiate' : legalRisk > 40 ? 'un suivi régulier' : 'un maintien des bonnes pratiques'}.`,
      { fontSize: 11 }
    );
    
    this.currentY += 5;
  }

  private addRecommendations(recommendations: string[]) {
    if (recommendations.length === 0) return;
    
    this.addTitle('Recommandations Prioritaires', 2);
    
    recommendations.slice(0, 10).forEach((rec, index) => {
      this.checkPageBreak(10);
      
      // Numéro de recommandation
      this.pdf.setFillColor(37, 99, 235);
      this.pdf.circle(this.margin + 3, this.currentY - 1, 3, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(10);
      this.pdf.text((index + 1).toString(), this.margin + 3, this.currentY + 1, { align: 'center' });
      
      // Texte de la recommandation
      this.pdf.setTextColor(COLORS.dark);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      const lines = this.pdf.splitTextToSize(rec, this.pageWidth - this.margin - 20);
      for (const line of lines) {
        this.checkPageBreak(5);
        this.pdf.text(line, this.margin + 10, this.currentY);
        this.currentY += 5;
      }
      
      this.currentY += 3;
    });
  }

  private addChartPlaceholder(title: string, description: string) {
    this.checkPageBreak(40);
    
    // Cadre pour le graphique
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35);
    
    // Titre du graphique
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(COLORS.primary);
    this.pdf.text(title, this.margin + 5, this.currentY + 10);
    
    // Description
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(COLORS.secondary);
    this.pdf.text(description, this.margin + 5, this.currentY + 20);
    
    // Note explicative
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(COLORS.secondary);
    this.pdf.text('(Graphique disponible dans la version web)', this.margin + 5, this.currentY + 30);
    
    this.currentY += 45;
  }

  private addCoverPage(audit: AuditData) {
    // Fond dégradé bleu (simulation avec des rectangles)
    this.pdf.setFillColor(37, 99, 235); // Bleu foncé
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight / 2, 'F');
    
    this.pdf.setFillColor(59, 130, 246); // Bleu moyen
    this.pdf.rect(0, this.pageHeight / 2, this.pageWidth, this.pageHeight / 4, 'F');
    
    this.pdf.setFillColor(147, 197, 253); // Bleu clair
    this.pdf.rect(0, (this.pageHeight * 3) / 4, this.pageWidth, this.pageHeight / 4, 'F');
    
    // Logo/titre principal
    this.currentY = 80;
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(32);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Rapport d\'Audit Cybersécurité', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Sous-titre
    this.currentY += 20;
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Analyse Complète & Plan d\'Action Stratégique', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Boîte d'information entreprise
    this.currentY += 40;
    const boxWidth = 120;
    const boxHeight = 60;
    const boxX = (this.pageWidth - boxWidth) / 2;
    
    // Fond de la boîte avec transparence simulée
    this.pdf.setFillColor(255, 255, 255, 0.9);
    this.pdf.roundedRect(boxX, this.currentY, boxWidth, boxHeight, 5, 5, 'F');
    
    // Contour de la boîte
    this.pdf.setDrawColor(37, 99, 235);
    this.pdf.setLineWidth(1);
    this.pdf.roundedRect(boxX, this.currentY, boxWidth, boxHeight, 5, 5, 'S');
    
    // Texte dans la boîte
    this.pdf.setTextColor(37, 99, 235);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Mon Entreprise', this.pageWidth / 2, this.currentY + 15, { align: 'center' });
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Secteur: Tertiaire', this.pageWidth / 2, this.currentY + 25, { align: 'center' });
    this.pdf.text('Taille: PME', this.pageWidth / 2, this.currentY + 35, { align: 'center' });
    this.pdf.text(`Audit réalisé le ${new Date(audit.createdAt).toLocaleDateString('fr-FR')}`, this.pageWidth / 2, this.currentY + 45, { align: 'center' });
    
    // Métriques principales en bas
    this.currentY += 100;
    const score = audit.score || 0;
    const maturity = audit.maturity || 'Non évalué';
    
    // Score global
    this.pdf.setFontSize(48);
    this.pdf.setFont('helvetica', 'bold');
    
    // Couleur selon le score
    if (score < 40) this.pdf.setTextColor(220, 38, 38); // Rouge
    else if (score < 70) this.pdf.setTextColor(217, 119, 6); // Orange
    else this.pdf.setTextColor(5, 150, 105); // Vert
    
    this.pdf.text(`${score}%`, 50, this.currentY, { align: 'center' });
    
    // Label score
    this.pdf.setFontSize(12);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Score Global', 50, this.currentY + 15, { align: 'center' });
    
    // Niveau de maturité
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(maturity, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Niveau de Maturité', this.pageWidth / 2, this.currentY + 15, { align: 'center' });
    
    // Nombre d'actions
    const actionCount = 31; // Valeur par défaut, peut être calculée
    this.pdf.setFontSize(48);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text(actionCount.toString(), this.pageWidth - 50, this.currentY, { align: 'center' });
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Actions Recommandées', this.pageWidth - 50, this.currentY + 15, { align: 'center' });
    
    // Footer de la page de couverture
    this.currentY = this.pageHeight - 40;
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.text('Rapport généré par StratCyber', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.pdf.text('Conforme ISO 27001, ANSSI, NIST', this.pageWidth / 2, this.currentY + 10, { align: 'center' });
  }

  async generatePDF(
    audit: AuditData, 
    complianceScores: ComplianceScore[], 
    actionPlan: ActionPlanItem[],
    categoryScores: Record<string, number>
  ): Promise<Blob> {
    
    // Initialiser les dépendances
    await this.initialize();
    
    // Page de couverture avec design spécial
    this.addCoverPage(audit);
    
    // Nouvelle page pour le contenu
    this.pdf.addPage();
    this.pageNumber++;
    this.addHeader();
    
    // Résumé exécutif
    this.addExecutiveSummary(audit);
    
    // Scores par catégorie
    this.addTitle('Analyse Détaillée par Domaine');
    this.addCategoryBreakdown(categoryScores);
    
    // Graphiques (placeholders pour l'instant)
    this.addChartPlaceholder(
      'Répartition des Scores par Domaine',
      'Visualisation radar des performances par domaine de cybersécurité'
    );
    
    // Conformité réglementaire
    if (complianceScores.length > 0) {
      this.addTitle('Conformité Réglementaire');
      this.addText(
        'Analyse de la conformité de votre organisation aux principales réglementations :',
        { fontSize: 11 }
      );
      this.addComplianceTable(complianceScores);
    }
    
    // Plan d'action
    if (actionPlan.length > 0) {
      this.addTitle('Plan d\'Action Recommandé');
      this.addText(
        `Voici les ${Math.min(actionPlan.length, 20)} actions prioritaires pour améliorer votre posture de cybersécurité :`,
        { fontSize: 11 }
      );
      this.addActionPlanTable(actionPlan);
      
      if (actionPlan.length > 20) {
        this.addText(
          `Note : ${actionPlan.length - 20} actions supplémentaires sont disponibles dans la version web complète.`,
          { fontSize: 9, color: COLORS.secondary }
        );
      }
    }
    
    // Recommandations
    const recommendations = audit.recommendations?.split('\n').filter(r => r.trim()) || [];
    if (recommendations.length > 0) {
      this.addTitle('Recommandations Détaillées');
      this.addRecommendations(recommendations);
    }
    
    // Page de conclusion
    this.pdf.addPage();
    this.pageNumber++;
    this.addHeader();
    
    this.addTitle('Conclusion et Prochaines Étapes');
    
    const score = audit.score || 0;
    if (score < 50) {
      this.addText(
        'Votre organisation nécessite des améliorations urgentes en matière de cybersécurité. Nous recommandons fortement de prioriser les actions marquées comme "Haute priorité" et de mettre en place un plan de remédiation dans les 30 jours.',
        { fontSize: 11, bold: true }
      );
    } else if (score < 80) {
      this.addText(
        'Votre organisation présente un niveau de cybersécurité satisfaisant mais peut bénéficier d\'améliorations ciblées. Concentrez-vous sur les domaines les moins performants.',
        { fontSize: 11 }
      );
    } else {
      this.addText(
        'Félicitations ! Votre organisation maintient un excellent niveau de cybersécurité. Continuez à surveiller et à maintenir ces standards élevés.',
        { fontSize: 11, bold: true, color: COLORS.success }
      );
    }
    
    this.currentY += 10;
    this.addText('Pour plus d\'informations et un suivi détaillé, consultez votre tableau de bord StratCyber.', { fontSize: 10, color: COLORS.secondary });
    
    // Ajout du footer sur la dernière page
    this.addFooter();
    
    return this.pdf.output('blob');
  }
}

// Fonction helper pour générer le PDF côté client
export async function generateAuditPDF(
  audit: AuditData,
  complianceScores: ComplianceScore[] = [],
  actionPlan: ActionPlanItem[] = [],
  categoryScores: Record<string, number> = {}
): Promise<void> {
  try {
    const generator = new AuditPDFGenerator();
    const pdfBlob = await generator.generatePDF(audit, complianceScores, actionPlan, categoryScores);
    
    // Télécharger le PDF
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-audit-${audit.id}-${new Date(audit.createdAt).toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Impossible de générer le PDF. Veuillez réessayer.');
  }
}

// Fonction alternative avec Puppeteer (côté serveur)
export async function generateServerPDF(htmlContent: string): Promise<Buffer> {
  // Cette fonction sera implémentée côté serveur avec Puppeteer
  // Elle prend du contenu HTML et le convertit en PDF
  throw new Error('generateServerPDF doit être appelée côté serveur');
}
