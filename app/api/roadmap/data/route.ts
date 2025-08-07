import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getActionStatuses } from '../actions/route';

interface ActionPlan {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Critique' | 'Haute' | 'Moyenne' | 'Faible';
  status: 'Non démarré' | 'En cours' | 'Terminé' | 'En retard';
  progress: number;
  dueDate: string;
  owner: string;
  estimatedHours: number;
  businessImpact: string;
  budget?: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  progress: number;
  status: 'En cours' | 'Terminé' | 'En retard';
  actions: string[];
}

// Conversion vers ActionPlanItem pour compatibilité avec les composants existants
function convertToActionPlanItems(actions: ActionPlan[]): any[] {
  return actions.map(action => ({
    ...action,
    startDate: new Date(action.dueDate),
    dueDate: new Date(action.dueDate),
    status: action.status,
    estimatedDuration: action.estimatedHours / 8, // Conversion heures vers jours
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

// Générateur d'actions basé sur les réponses d'audit
function generateActionsFromResponses(responses: any[]): ActionPlan[] {
  const actions: ActionPlan[] = [];
  
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
    const lowScoreResponses = data.responses.filter((r: any) => (r.score || 0) < 3); // Score < 3 sur 5
    const veryLowScoreResponses = data.responses.filter((r: any) => (r.score || 0) < 2); // Score < 2 sur 5
    
    // Actions pour les catégories avec des scores faibles
    if (avgScore < 2.5) { // Score < 2.5 sur 5 = critique
      actions.push({
        id: `critical-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Amélioration critique - ${category}`,
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
      
      // Action de suivi pour les catégories critiques
      actions.push({
        id: `followup-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Suivi et contrôle - ${category}`,
        description: `Mise en place d'un suivi régulier et de contrôles pour ${category}`,
        category: category,
        priority: 'Haute',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'RSSI',
        estimatedHours: 20,
        businessImpact: `Maintien des améliorations dans ${category}`,
        budget: 3000
      });
    } else if (avgScore < 3.5) { // Score < 3.5 sur 5 = haute priorité
      actions.push({
        id: `high-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Renforcement - ${category}`,
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

    // Actions spécifiques basées sur les réponses individuelles (plus d'actions par réponse)
    lowScoreResponses.forEach((response: any, index: number) => {
      const scorePercent = Math.round(((response.score || 0) / 5) * 100);
      const priority = (response.score || 0) < 1.5 ? 'Critique' : 
                      (response.score || 0) < 2.5 ? 'Haute' : 'Moyenne';
      
      // Action principale pour chaque réponse faible
      actions.push({
        id: `specific-${response.id}`,
        title: `Action ciblée: ${response.question.substring(0, 50)}...`,
        description: `Correction spécifique basée sur la réponse: "${response.answer}". Score: ${scorePercent}%`,
        category: category,
        priority: priority,
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'Responsable métier',
        estimatedHours: 16,
        businessImpact: `Correction directe d'une vulnérabilité identifiée`,
        budget: 2000
      });
      
      // Action de formation/sensibilisation associée
      if ((response.score || 0) < 2.5) {
        actions.push({
          id: `training-${response.id}`,
          title: `Formation spécifique - ${response.question.substring(0, 40)}...`,
          description: `Formation du personnel sur les points faibles identifiés`,
          category: category,
          priority: 'Moyenne',
          status: 'Non démarré',
          progress: 0,
          dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          owner: 'RH + RSSI',
          estimatedHours: 8,
          businessImpact: `Amélioration des compétences sur un point critique`,
          budget: 1500
        });
      }
      
      // Action de contrôle/audit pour les scores très faibles
      if ((response.score || 0) < 2) {
        actions.push({
          id: `audit-${response.id}`,
          title: `Contrôle renforcé - ${response.question.substring(0, 40)}...`,
          description: `Mise en place de contrôles réguliers pour surveiller l'amélioration`,
          category: category,
          priority: 'Haute',
          status: 'Non démarré',
          progress: 0,
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          owner: 'RSSI',
          estimatedHours: 12,
          businessImpact: `Surveillance continue d'un point critique`,
          budget: 1000
        });
      }
    });
    
    // Actions supplémentaires pour les catégories avec beaucoup de réponses faibles
    if (lowScoreResponses.length >= 3) {
      actions.push({
        id: `comprehensive-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Plan complet d'amélioration - ${category}`,
        description: `Plan d'amélioration global pour ${category} suite aux multiples lacunes identifiées`,
        category: category,
        priority: 'Critique',
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

  // Si peu d'actions générées (score global élevé), ajouter quelques actions d'amélioration continue
  if (actions.length < 5) {
    const globalScoreFromResponses = responses.length > 0 ? 
      (responses.reduce((sum, r) => sum + (r.score || 0), 0) / (responses.length * 5)) * 100 : 0;
    
    if (globalScoreFromResponses >= 85) {
      actions.push({
        id: 'excellence-maintenance',
        title: 'Maintien de l\'excellence sécuritaire',
        description: 'Processus de maintien du haut niveau de sécurité atteint',
        category: 'Gouvernance',
        priority: 'Moyenne',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'RSSI',
        estimatedHours: 20,
        businessImpact: 'Maintien du niveau d\'excellence atteint',
        budget: 3000
      });
      
      actions.push({
        id: 'excellence-innovation',
        title: 'Innovation en cybersécurité',
        description: 'Veille et mise en place de nouvelles technologies de sécurité',
        category: 'Technique',
        priority: 'Faible',
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
        owner: 'RSSI',
        estimatedHours: 30,
        businessImpact: 'Anticipation des futures menaces',
        budget: 8000
      });
    }
  }

  return actions.slice(0, 50); // Augmenté à 50 actions maximum pour plus de détails
}

// Génération des trimestres basés sur les actions
function generateQuarters(actions: any[], milestones: Milestone[]): any[] {
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
    }).map(milestone => ({
      ...milestone,
      dueDate: new Date(milestone.dueDate),
      status: milestone.status === 'En cours' ? 'En cours' : 
             milestone.status === 'Terminé' ? 'Terminé' : 'À venir'
    }));
    
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

// Génération des jalons basés sur les actions
function generateMilestones(actions: ActionPlan[]): Milestone[] {
  const milestones: Milestone[] = [];
  
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
      status: 'En cours' as const,
      actions: actionIds
    });
  });

  return milestones.slice(0, 4); // Maximum 4 jalons
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

    // Récupérer le dernier audit avec les réponses
    const latestAudit = await prisma.audit.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        responses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestAudit || latestAudit.responses.length === 0) {
      return NextResponse.json({
        actions: [],
        milestones: [],
        score: 0,
        lastAuditDate: new Date().toISOString(),
        statistics: {
          totalActions: 0,
          completedActions: 0,
          criticalActions: 0,
          overdueActions: 0,
          avgProgress: 0,
        }
      });
    }

    // Récupérer les statuts des actions sauvegardés
    const actionStatuses = getActionStatuses(session.user.id);
    
    // Générer les actions basées sur les réponses réelles
    const generatedActions = generateActionsFromResponses(latestAudit.responses);
    
    // Appliquer les statuts sauvegardés aux actions
    const actionsWithStatus = generatedActions.map(action => {
      const savedStatus = actionStatuses[action.id];
      return {
        ...action,
        status: savedStatus?.status || action.status,
        progress: savedStatus?.progress || action.progress
      };
    });
    
    // Convertir vers le format ActionPlanItem
    const actions = convertToActionPlanItems(actionsWithStatus);
    
    // Générer les jalons basés sur les actions
    const milestones = generateMilestones(actionsWithStatus);
    
    // Générer les trimestres avec les jalons
    const quarters = generateQuarters(actions, milestones);

    // Calculer le score global - Les scores sont sur une échelle de 0-5, donc on divise par 5 pour obtenir un pourcentage
    const totalResponses = latestAudit.responses.length;
    const totalScore = latestAudit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
    const maxPossibleScore = totalResponses * 5; // Score maximum possible (tous les scores à 5)
    const globalScore = totalResponses > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // Calculer les statistiques
    const statistics = {
      totalActions: actions.length,
      completedActions: actions.filter(a => a.status === 'Terminé').length,
      criticalActions: actions.filter(a => a.priority === 'Critique').length,
      overdueActions: actions.filter(a => {
        const dueDate = new Date(a.dueDate);
        return dueDate < new Date() && a.status !== 'Terminé';
      }).length,
      avgProgress: actions.length > 0 ? Math.round(actions.reduce((sum, a) => sum + a.progress, 0) / actions.length) : 0,
    };

    return NextResponse.json({
      actions,
      milestones,
      quarters,
      score: globalScore,
      lastAuditDate: latestAudit.createdAt.toISOString(),
      statistics,
      analyticsData: {
        summary: {
          totalActions: statistics.totalActions,
          completedActions: statistics.completedActions,
          overallProgress: statistics.avgProgress,
          criticalActions: statistics.criticalActions,
          overdueActions: statistics.overdueActions,
          upcomingDeadlines: [],
          budgetTotal: actions.reduce((sum: number, a: any) => sum + (a.budget || 0), 0),
          budgetSpent: Math.round(actions.reduce((sum: number, a: any) => sum + (a.budget || 0), 0) * 0.12),
          averageCompletionTime: 45,
          riskDistribution: {
            'Très élevé': statistics.criticalActions,
            'Élevé': actions.filter((a: any) => a.priority === 'Haute').length,
            'Moyen': actions.filter((a: any) => a.priority === 'Moyenne').length,
            'Faible': actions.filter((a: any) => a.priority === 'Faible').length
          },
          categoryProgress: actions.reduce((acc: any, action: any) => {
            acc[action.category] = acc[action.category] || 0;
            acc[action.category] += action.progress;
            return acc;
          }, {})
        },
        trends: {
          scoreEvolution: [],
          budgetUtilization: [],
          actionCompletion: []
        },
        benchmarks: {
          industryAverage: 65,
          bestPractice: 85,
          companySize: 'PME',
          sector: 'Services'
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données de roadmap:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
