import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'security' | 'compliance' | 'process' | 'training' | 'governance' | 'technical';
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  estimatedTimeframe: string;
  estimatedCost?: string;
  expectedROI: string;
  reasons: string[];
  suggestedActions: string[];
  kpis: string[];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const recommendations: Recommendation[] = [];

    // Récupérer les données nécessaires pour l'analyse
    const [lastAudit, actions, incidents, vulnerabilities, complianceScores] = await Promise.all([
      prisma.audit.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        include: { 
          responses: true, 
          strategicActions: true,
          complianceScores: true
        }
      }),
      prisma.strategicAction.findMany({
        where: { audit: { userId: session.user.id } }
      }),
      prisma.incidentReport.findMany({
        orderBy: { reportedAt: 'desc' },
        take: 50
      }),
      prisma.vulnerability.findMany({
        where: { status: { not: 'closed' } },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.complianceScore.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    if (!lastAudit) {
      return NextResponse.json({ recommendations: [] });
    }

    // Analyse des scores d'audit faibles
    const lowScoreCategories: { [key: string]: number } = {};
    lastAudit.responses.forEach(response => {
      if (response.score && response.score < 60) {
        const category = response.category || 'Général';
        lowScoreCategories[category] = (lowScoreCategories[category] || 0) + 1;
      }
    });

    // Recommandations basées sur les scores faibles
    Object.entries(lowScoreCategories).forEach(([category, count]) => {
      if (count >= 2) {
        recommendations.push(generateCategoryImprovement(category, count));
      }
    });

    // Analyse des actions en retard
    const overdueActions = actions.filter(a => 
      new Date(a.dueDate) < new Date() && a.status !== 'Terminé'
    );

    if (overdueActions.length > 0) {
      recommendations.push({
        id: 'overdue-actions',
        title: 'Rattrapage des Actions en Retard',
        description: `${overdueActions.length} actions sont en retard. Une révision des priorités et des ressources est recommandée.`,
        priority: overdueActions.length > 5 ? 'high' : 'medium',
        category: 'process',
        impact: 'high',
        effort: 'medium',
        estimatedTimeframe: '2-4 semaines',
        estimatedCost: '€5,000 - €15,000',
        expectedROI: '200-300%',
        reasons: [
          `${overdueActions.length} actions dépassent leur échéance`,
          'Risque d\'impact sur les objectifs de conformité',
          'Possible sous-estimation des ressources nécessaires'
        ],
        suggestedActions: [
          'Réviser et reprioriser les actions en cours',
          'Allouer des ressources supplémentaires',
          'Mettre en place un suivi hebdomadaire',
          'Identifier les blocages et les résoudre'
        ],
        kpis: ['Taux de completion des actions', 'Respect des échéances', 'Charge de travail équipe']
      });
    }

    // Analyse des incidents récurrents
    const incidentsByCategory: { [key: string]: number } = {};
    incidents.forEach(incident => {
      incidentsByCategory[incident.category] = (incidentsByCategory[incident.category] || 0) + 1;
    });

    const frequentIncidentCategories = Object.entries(incidentsByCategory)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);

    frequentIncidentCategories.forEach(([category, count]) => {
      recommendations.push(generateIncidentPrevention(category, count));
    });

    // Analyse des vulnérabilités critiques
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');

    if (criticalVulns.length > 0) {
      recommendations.push({
        id: 'critical-vulnerabilities',
        title: 'Traitement Urgence Vulnérabilités Critiques',
        description: `${criticalVulns.length} vulnérabilités critiques nécessitent une attention immédiate.`,
        priority: 'high',
        category: 'security',
        impact: 'high',
        effort: 'high',
        estimatedTimeframe: '1-2 semaines',
        estimatedCost: '€10,000 - €25,000',
        expectedROI: '500-800%',
        reasons: [
          `${criticalVulns.length} vulnérabilités critiques identifiées`,
          'Risque élevé de cyberattaque',
          'Impact potentiel majeur sur l\'activité'
        ],
        suggestedActions: [
          'Patch immédiat des vulnérabilités critiques',
          'Mise en place de contrôles compensatoires',
          'Audit de sécurité complémentaire',
          'Plan de réponse aux incidents renforcé'
        ],
        kpis: ['Temps de résolution vulnérabilités', 'Nombre vulnérabilités ouvertes', 'Score de sécurité global']
      });
    }

    if (highVulns.length > 5) {
      recommendations.push({
        id: 'high-vulnerabilities',
        title: 'Programme de Réduction Vulnérabilités',
        description: `${highVulns.length} vulnérabilités de niveau élevé nécessitent un plan de traitement structuré.`,
        priority: 'medium',
        category: 'security',
        impact: 'medium',
        effort: 'medium',
        estimatedTimeframe: '4-6 semaines',
        estimatedCost: '€8,000 - €20,000',
        expectedROI: '300-500%',
        reasons: [
          `${highVulns.length} vulnérabilités de niveau élevé`,
          'Accumulation de la dette sécuritaire',
          'Risque d\'escalade vers des incidents'
        ],
        suggestedActions: [
          'Priorisation basée sur le risque métier',
          'Planification des correctifs par vagues',
          'Renforcement des tests de sécurité',
          'Formation équipe technique'
        ],
        kpis: ['Réduction mensuelle vulnérabilités', 'Couverture tests sécurité', 'MTTR vulnérabilités']
      });
    }

    // Analyse de conformité
    const lowComplianceScores = complianceScores.filter(cs => cs.score < 70);
    if (lowComplianceScores.length > 0) {
      const regulations = [...new Set(lowComplianceScores.map(cs => cs.regulation))];
      
      recommendations.push({
        id: 'compliance-improvement',
        title: 'Renforcement Conformité Réglementaire',
        description: `Scores de conformité insuffisants détectés pour ${regulations.join(', ')}.`,
        priority: 'high',
        category: 'compliance',
        impact: 'high',
        effort: 'high',
        estimatedTimeframe: '8-12 semaines',
        estimatedCost: '€15,000 - €40,000',
        expectedROI: '400-600%',
        reasons: [
          `${lowComplianceScores.length} scores de conformité < 70%`,
          'Risque de sanctions réglementaires',
          'Image et réputation de l\'organisation'
        ],
        suggestedActions: [
          'Audit de conformité approfondi',
          'Mise à jour des procédures',
          'Formation du personnel',
          'Mise en place d\'outils de monitoring'
        ],
        kpis: ['Score de conformité global', 'Temps de mise en conformité', 'Nombre d\'écarts identifiés']
      });
    }

    // Analyse des actions par catégorie pour identifier les lacunes
    const actionsByCategory: { [key: string]: number } = {};
    actions.forEach(action => {
      actionsByCategory[action.category] = (actionsByCategory[action.category] || 0) + 1;
    });

    // Recommandations de formation si peu d'actions liées à la sensibilisation
    const trainingActions = actions.filter(a => 
      a.category.toLowerCase().includes('formation') || 
      a.category.toLowerCase().includes('sensibilisation')
    );

    if (trainingActions.length < 2) {
      recommendations.push({
        id: 'security-training',
        title: 'Programme de Sensibilisation Cybersécurité',
        description: 'Déficit identifié dans les actions de formation et sensibilisation du personnel.',
        priority: 'medium',
        category: 'training',
        impact: 'high',
        effort: 'low',
        estimatedTimeframe: '6-8 semaines',
        estimatedCost: '€3,000 - €8,000',
        expectedROI: '250-400%',
        reasons: [
          'Peu d\'actions de formation identifiées',
          'Facteur humain critique pour la sécurité',
          'ROI élevé des programmes de sensibilisation'
        ],
        suggestedActions: [
          'Évaluation du niveau de sensibilisation',
          'Campagne de phishing simulé',
          'Formations interactives régulières',
          'Communication continue sur les bonnes pratiques'
        ],
        kpis: ['Taux de participation formations', 'Résultats tests phishing', 'Incidents liés au facteur humain']
      });
    }

    // Recommandation d'automatisation si beaucoup d'actions manuelles
    const manualActions = actions.filter(a => 
      a.description?.toLowerCase().includes('manuel') ||
      a.description?.toLowerCase().includes('verification') ||
      a.category.toLowerCase().includes('audit')
    );

    if (manualActions.length > 5) {
      recommendations.push({
        id: 'process-automation',
        title: 'Automatisation des Contrôles',
        description: `${manualActions.length} actions manuelles identifiées avec potentiel d'automatisation.`,
        priority: 'medium',
        category: 'technical',
        impact: 'medium',
        effort: 'high',
        estimatedTimeframe: '12-16 semaines',
        estimatedCost: '€20,000 - €50,000',
        expectedROI: '300-500%',
        reasons: [
          `${manualActions.length} processus manuels identifiés`,
          'Risque d\'erreur humaine élevé',
          'Gain d\'efficacité et de cohérence'
        ],
        suggestedActions: [
          'Audit des processus manuels',
          'Sélection d\'outils d\'automatisation',
          'Développement de scripts et workflows',
          'Formation des équipes aux nouveaux outils'
        ],
        kpis: ['Pourcentage processus automatisés', 'Temps de traitement moyen', 'Taux d\'erreur']
      });
    }

    // Trier les recommandations par priorité et impact
    const sortedRecommendations = recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const impactOrder = { high: 3, medium: 2, low: 1 };
      
      const aPriorityScore = priorityOrder[a.priority] * impactOrder[a.impact];
      const bPriorityScore = priorityOrder[b.priority] * impactOrder[b.impact];
      
      return bPriorityScore - aPriorityScore;
    });

    // Limiter à 8 recommandations maximum
    const finalRecommendations = sortedRecommendations.slice(0, 8);

    return NextResponse.json({
      recommendations: finalRecommendations,
      summary: {
        total: finalRecommendations.length,
        byPriority: {
          high: finalRecommendations.filter(r => r.priority === 'high').length,
          medium: finalRecommendations.filter(r => r.priority === 'medium').length,
          low: finalRecommendations.filter(r => r.priority === 'low').length
        },
        byCategory: {
          security: finalRecommendations.filter(r => r.category === 'security').length,
          compliance: finalRecommendations.filter(r => r.category === 'compliance').length,
          process: finalRecommendations.filter(r => r.category === 'process').length,
          training: finalRecommendations.filter(r => r.category === 'training').length,
          governance: finalRecommendations.filter(r => r.category === 'governance').length,
          technical: finalRecommendations.filter(r => r.category === 'technical').length
        },
        estimatedTotalCost: calculateTotalCostRange(finalRecommendations),
        avgROI: calculateAverageROI(finalRecommendations)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération des recommandations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des recommandations' },
      { status: 500 }
    );
  }
}

function generateCategoryImprovement(category: string, issueCount: number): Recommendation {
  const categoryMappings: { [key: string]: any } = {
    'Gouvernance': {
      title: 'Renforcement de la Gouvernance',
      description: `${issueCount} lacunes identifiées dans la gouvernance de la sécurité.`,
      category: 'governance',
      actions: ['Révision des politiques', 'Clarification des rôles', 'Amélioration du reporting']
    },
    'Technique': {
      title: 'Amélioration Technique',
      description: `${issueCount} défaillances techniques détectées.`,
      category: 'technical',
      actions: ['Audit technique approfondi', 'Mise à jour des systèmes', 'Renforcement de l\'architecture']
    },
    'Formation': {
      title: 'Renforcement des Compétences',
      description: `${issueCount} lacunes en formation identifiées.`,
      category: 'training',
      actions: ['Programme de formation ciblé', 'Certification du personnel', 'Veille technologique']
    }
  };

  const mapping = categoryMappings[category] || {
    title: `Amélioration ${category}`,
    description: `${issueCount} points d'amélioration identifiés.`,
    category: 'process',
    actions: ['Analyse approfondie', 'Plan d\'amélioration', 'Suivi régulier']
  };

  return {
    id: `category-${category.toLowerCase()}`,
    title: mapping.title,
    description: mapping.description,
    priority: issueCount > 3 ? 'high' : 'medium',
    category: mapping.category,
    impact: 'medium',
    effort: 'medium',
    estimatedTimeframe: '6-10 semaines',
    estimatedCost: '€5,000 - €15,000',
    expectedROI: '200-350%',
    reasons: [
      `${issueCount} lacunes identifiées dans ${category}`,
      'Impact sur la posture de sécurité globale',
      'Opportunité d\'amélioration significative'
    ],
    suggestedActions: mapping.actions,
    kpis: [`Score ${category}`, 'Nombre d\'écarts', 'Temps de résolution']
  };
}

function generateIncidentPrevention(category: string, incidentCount: number): Recommendation {
  return {
    id: `incident-prevention-${category}`,
    title: `Prévention Incidents ${category}`,
    description: `${incidentCount} incidents récurrents dans la catégorie ${category} nécessitent une approche préventive.`,
    priority: incidentCount > 5 ? 'high' : 'medium',
    category: 'security',
    impact: 'high',
    effort: 'medium',
    estimatedTimeframe: '4-8 semaines',
    estimatedCost: '€8,000 - €20,000',
    expectedROI: '400-600%',
    reasons: [
      `${incidentCount} incidents dans ${category}`,
      'Pattern récurrent nécessitant action préventive',
      'Réduction des coûts de réponse aux incidents'
    ],
    suggestedActions: [
      'Analyse des causes racines',
      'Mise en place de contrôles préventifs',
      'Amélioration de la surveillance',
      'Formation spécifique des équipes'
    ],
    kpis: ['Réduction incidents récurrents', 'MTTR moyen', 'Coût des incidents']
  };
}

function calculateTotalCostRange(recommendations: Recommendation[]): string {
  let minTotal = 0;
  let maxTotal = 0;

  recommendations.forEach(rec => {
    if (rec.estimatedCost) {
      const matches = rec.estimatedCost.match(/€([\d,]+)\s*-\s*€([\d,]+)/);
      if (matches) {
        minTotal += parseInt(matches[1].replace(',', ''));
        maxTotal += parseInt(matches[2].replace(',', ''));
      }
    }
  });

  return `€${minTotal.toLocaleString()} - €${maxTotal.toLocaleString()}`;
}

function calculateAverageROI(recommendations: Recommendation[]): string {
  let totalMin = 0;
  let totalMax = 0;
  let count = 0;

  recommendations.forEach(rec => {
    const matches = rec.expectedROI.match(/([\d]+)-([\d]+)%/);
    if (matches) {
      totalMin += parseInt(matches[1]);
      totalMax += parseInt(matches[2]);
      count++;
    }
  });

  if (count === 0) return '0%';

  const avgMin = Math.round(totalMin / count);
  const avgMax = Math.round(totalMax / count);

  return `${avgMin}-${avgMax}%`;
}
