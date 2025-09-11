import { PrismaClient } from '@prisma/client';
import { 
  DashboardKPIs, 
  DashboardAction,
  DashboardRisk,
  DashboardMilestone,
  DashboardAlert,
  DashboardIncident,
  ChartData,
  TimeSeriesData,
  HeatmapData,
  AuditWithRelations 
} from '@/types/dashboard';
import { computeAuditResult } from '@/lib/audit/scoring';
import type { AuditAnswer } from '@/types/audit';

const prisma = new PrismaClient();

/**
 * Récupère les KPIs globaux du dashboard
 */
export async function getDashboardKPIs(userId: string): Promise<DashboardKPIs> {
  try {
    // Récupérer le dernier audit avec toutes ses données
    const lastAudit = await prisma.audit.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        responses: true,
        strategicActions: true,
        complianceScores: true,
        legalRiskAssessment: true
      }
    });

    if (!lastAudit) {
      // Retourner des valeurs par défaut si aucun audit n'existe
      return {
        globalMaturityScore: 0,
        actionProgressPercentage: 0,
        completedActions: 0,
        inProgressActions: 0,
        overdueActions: 0,
        complianceScores: {},
        legalRiskScore: 0,
        criticalVulnerabilities: 0,
        openIncidents: 0,
        securityAlerts: 0
      };
    }

    // Calculer le score de maturité en utilisant la vraie logique de scoring
    let globalMaturityScore = 0;
    let complianceScores: Record<string, number> = {};
    let legalRiskScore = 0;
    
    if (lastAudit.responses && lastAudit.responses.length > 0) {
      // Convertir les réponses au format attendu par computeAuditResult
      const auditAnswers: AuditAnswer[] = lastAudit.responses.map(response => ({
        questionId: response.question, // Utiliser la question comme ID
        answer: response.answer,
        score: response.score || 0
      }));
      
      // Utiliser la vraie fonction de calcul des scores
      const auditResult = computeAuditResult(auditAnswers);
      globalMaturityScore = auditResult.globalScore;
      legalRiskScore = auditResult.legalRiskScore;
      
      // Extraire les scores de conformité
      auditResult.complianceScores.forEach(cs => {
        complianceScores[cs.regulation] = cs.score;
      });
    } else {
      globalMaturityScore = lastAudit.score || 0;
    }

    // Calculer les KPIs des actions stratégiques
    const allActions = lastAudit.strategicActions || [];
    const completedActions = allActions.filter(a => a.status === 'Terminé').length;
    const inProgressActions = allActions.filter(a => a.status === 'En cours').length;
    const securityActions = allActions.filter(a => {
      const cat = (a.category || '').toLowerCase();
      return cat.includes('sécurité') || cat.includes('security');
    }).length;
    
    // Actions en retard (date dépassée et pas terminées)
    const now = new Date();
    const overdueActions = allActions.filter(a => 
      a.dueDate < now && a.status !== 'Terminé'
    ).length;

    // Calculer le pourcentage de progression global des actions
    const totalProgress = allActions.reduce((sum, action) => sum + action.progress, 0);
    const actionProgressPercentage = allActions.length > 0 
      ? Math.round(totalProgress / allActions.length) 
      : 0;

    // Utiliser les scores de conformité calculés ou ceux de la base de données
    if (lastAudit.complianceScores && lastAudit.complianceScores.length > 0 && Object.keys(complianceScores).length === 0) {
      // Utiliser les scores de conformité sauvegardés en base
      lastAudit.complianceScores.forEach(cs => {
        complianceScores[cs.regulation] = Math.round(cs.score);
      });
    }
    
    // Utiliser le score de risque légal calculé ou celui de la base de données
    if (lastAudit.legalRiskAssessment && legalRiskScore === 0) {
      legalRiskScore = lastAudit.legalRiskAssessment.overallScore;
    }

    // Vulnérabilités critiques
    const criticalVulnerabilities = await prisma.vulnerability.count({
      where: { 
        severity: 'critical',
        status: { not: 'closed' }
      }
    });

    // Incidents ouverts
    const openIncidents = await prisma.incidentReport.count({
      where: { 
        status: { in: ['open', 'investigating'] }
      }
    });

    // Alertes sécurité non résolues
    const securityAlerts = await prisma.securityAlert.count({
      where: { isResolved: false }
    });

    // Calculer le pourcentage d'incidents résolus réel
    const totalIncidents = await prisma.incidentReport.count({});
    const resolvedIncidents = await prisma.incidentReport.count({
      where: {
        status: { in: ['resolved', 'closed'] }
      }
    });
    const incidentResolutionRate = totalIncidents > 0 
      ? Math.round((resolvedIncidents / totalIncidents) * 100) 
      : 0;

    return {
      globalMaturityScore,
      actionProgressPercentage,
      completedActions,
      inProgressActions,
      overdueActions,
      complianceScores,
      legalRiskScore,
      criticalVulnerabilities,
      openIncidents,
      securityAlerts,
      securityActions,
      totalIncidents,
      resolvedIncidents,
      incidentResolutionRate
    };
  } catch (error) {
    console.error('Erreur lors du calcul des KPIs:', error);
    throw error;
  }
}

/**
 * Récupère les actions pour le dashboard
 */
export async function getDashboardActions(userId: string): Promise<DashboardAction[]> {
  try {
    const actions = await prisma.strategicAction.findMany({
      where: { audit: { userId } },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' }
      ]
    });

    return actions.map(action => ({
      id: action.id,
      title: action.title,
      description: action.description,
      category: action.category,
      priority: action.priority as 'Critique' | 'Haute' | 'Moyenne' | 'Basse',
      status: action.status as 'Non commencé' | 'En cours' | 'Terminé' | 'En retard',
      progress: action.progress,
      dueDate: action.dueDate,
      owner: action.owner,
      assignees: action.assignees ? JSON.parse(action.assignees) : [],
      dependencies: action.dependencies ? JSON.parse(action.dependencies) : [],
      kpis: action.kpis ? JSON.parse(action.kpis) : []
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    throw error;
  }
}

/**
 * Récupère les risques pour le dashboard
 */
export async function getDashboardRisks(): Promise<DashboardRisk[]> {
  try {
    const riskAssessments = await prisma.riskAssessment.findMany({
      include: {
        threats: true,
        vulnerabilities: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limiter aux 20 plus récents
    });

    const risks: DashboardRisk[] = [];

    // Convertir les menaces en risques
    riskAssessments.forEach(assessment => {
      assessment.threats.forEach(threat => {
        risks.push({
          id: threat.id,
          title: threat.name,
          description: threat.description,
          category: threat.category,
          impact: threat.impact,
          probability: threat.likelihood,
          riskLevel: getRiskLevel(threat.impact, threat.likelihood),
          mitigationPlan: assessment.mitigationPlan,
          status: 'Ouvert', // Par défaut
          owner: undefined
        });
      });
    });

    return risks;
  } catch (error) {
    console.error('Erreur lors de la récupération des risques:', error);
    throw error;
  }
}

/**
 * Récupère les jalons pour le dashboard
 */
export async function getDashboardMilestones(userId: string): Promise<DashboardMilestone[]> {
  try {
    const milestones = await prisma.strategicMilestone.findMany({
      where: { audit: { userId } },
      orderBy: { dueDate: 'asc' }
    });

    return milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      category: milestone.category,
      dueDate: milestone.dueDate,
      status: milestone.status as 'Non commencé' | 'En cours' | 'Terminé',
      progress: milestone.progress,
      actions: [] // TODO: Implémenter la relation avec les actions
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des jalons:', error);
    throw error;
  }
}

/**
 * Récupère les alertes sécurité pour le dashboard
 */
export async function getDashboardAlerts(): Promise<DashboardAlert[]> {
  try {
    const alerts = await prisma.securityAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 // Limiter aux 10 plus récentes
    });

    return alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical',
      category: alert.category as 'vulnerability' | 'threat' | 'incident',
      isResolved: alert.isResolved,
      createdAt: alert.createdAt,
      affectedSystems: alert.affectedSystems ? JSON.parse(alert.affectedSystems) : []
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des alertes:', error);
    throw error;
  }
}

/**
 * Récupère les incidents pour le dashboard
 */
export async function getDashboardIncidents(): Promise<DashboardIncident[]> {
  try {
    const incidents = await prisma.incidentReport.findMany({
      orderBy: { detectedAt: 'desc' },
      take: 10 // Limiter aux 10 plus récents
    });

    return incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      severity: incident.severity as 'low' | 'medium' | 'high' | 'critical',
      status: incident.status as 'open' | 'investigating' | 'resolved' | 'closed',
      detectedAt: incident.detectedAt,
      resolvedAt: incident.resolvedAt,
      affectedSystems: incident.affectedSystems ? JSON.parse(incident.affectedSystems) : [],
      dataImpacted: incident.dataImpacted
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    throw error;
  }
}

/**
 * Génère les données pour le graphique de répartition des actions par statut
 */
export async function getActionStatusChartData(userId: string): Promise<ChartData[]> {
  try {
    const actions = await prisma.strategicAction.findMany({
      where: { audit: { userId } }
    });

    const statusCounts = actions.reduce((acc, action) => {
      acc[action.status] = (acc[action.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      'Non commencé': '#94a3b8',
      'En cours': '#3b82f6',
      'Terminé': '#10b981',
      'En retard': '#ef4444'
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status as keyof typeof colors]
    }));
  } catch (error) {
    console.error('Erreur lors de la génération du graphique statut actions:', error);
    throw error;
  }
}

/**
 * Génère les données pour le graphique de progression par domaine
 */
export async function getDomainProgressChartData(userId: string): Promise<ChartData[]> {
  try {
    const actions = await prisma.strategicAction.findMany({
      where: { audit: { userId } }
    });

    const domainProgress = actions.reduce((acc, action) => {
      if (!acc[action.category]) {
        acc[action.category] = { total: 0, sum: 0 };
      }
      acc[action.category].total += 1;
      acc[action.category].sum += action.progress;
      return acc;
    }, {} as Record<string, { total: number; sum: number }>);

    return Object.entries(domainProgress).map(([category, data]) => ({
      name: category,
      value: Math.round(data.sum / data.total)
    }));
  } catch (error) {
    console.error('Erreur lors de la génération du graphique progression domaines:', error);
    throw error;
  }
}

/**
 * Génère les données pour l'évolution du score de maturité
 */
export async function getMaturityTimeSeriesData(userId: string): Promise<TimeSeriesData[]> {
  try {
    const audits = await prisma.audit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        responses: true
      }
    });

    return audits.map(audit => {
      let calculatedScore = 0;
      
      // Utiliser la vraie logique de calcul des scores
      if (audit.responses && audit.responses.length > 0) {
        try {
          // Convertir les réponses au format attendu par computeAuditResult
          const auditAnswers: AuditAnswer[] = audit.responses.map(response => ({
            questionId: response.question,
            answer: response.answer,
            score: response.score || 0
          }));
          
          // Utiliser la vraie fonction de calcul
          const auditResult = computeAuditResult(auditAnswers);
          calculatedScore = auditResult.globalScore;
        } catch (error) {
          console.warn('Erreur lors du calcul du score pour l\'audit', audit.id, error);
          // Fallback sur l'ancien calcul
          const totalScore = audit.responses.reduce((sum, response) => {
            return sum + (response.score || 0);
          }, 0);
          calculatedScore = Math.round(totalScore / audit.responses.length);
        }
      } else if (audit.score !== null) {
        calculatedScore = audit.score;
      }
      
      return {
        date: audit.createdAt.toISOString().split('T')[0],
        score: calculatedScore,
        category: 'Maturité Globale'
      };
    }).filter(data => data.score > 0); // Filtrer les scores vides
  } catch (error) {
    console.error('Erreur lors de la génération des données temporelles:', error);
    throw error;
  }
}

/**
 * Génère les données pour la heatmap des risques
 */
export async function getRiskHeatmapData(): Promise<HeatmapData[]> {
  try {
    const threats = await prisma.threatScenario.findMany({
      select: {
        name: true,
        impact: true,
        likelihood: true
      }
    });

    return threats.map(threat => ({
      impact: threat.impact,
      probability: threat.likelihood,
      risk: threat.name,
      level: getRiskLevel(threat.impact, threat.likelihood)
    }));
  } catch (error) {
    console.error('Erreur lors de la génération de la heatmap:', error);
    throw error;
  }
}

/**
 * Détermine le niveau de risque basé sur l'impact et la probabilité
 */
function getRiskLevel(impact: number, probability: number): 'Faible' | 'Moyen' | 'Élevé' | 'Critique' {
  const riskScore = impact * probability;
  if (riskScore >= 20) return 'Critique';
  if (riskScore >= 12) return 'Élevé';
  if (riskScore >= 6) return 'Moyen';
  return 'Faible';
}

/**
 * Calcule les métriques d'analytics avancés
 */
export async function getAdvancedAnalytics(userId: string) {
  try {
    // Calculer le temps moyen de résolution des incidents
    const resolvedIncidents = await prisma.incidentReport.findMany({
      where: {
        status: { in: ['resolved', 'closed'] },
        resolvedAt: { not: null }
      }
    });
    
    let avgResolutionTime = 0;
    if (resolvedIncidents.length > 0) {
      const totalTime = resolvedIncidents.reduce((sum, incident) => {
        if (incident.resolvedAt) {
          const diff = incident.resolvedAt.getTime() - incident.reportedAt.getTime();
          return sum + (diff / (1000 * 60 * 60 * 24)); // Convertir en jours
        }
        return sum;
      }, 0);
      avgResolutionTime = Math.round((totalTime / resolvedIncidents.length) * 10) / 10;
    }
    
    // Calculer la couverture d'audit
    const auditResponses = await prisma.auditResponse.findMany({
      where: { audit: { userId } }
    });
    
    const categories = [...new Set(auditResponses.map(r => r.category))];
    const auditCoverage = categories.length > 0 ? Math.round((categories.length / 10) * 100) : 0; // Assumons 10 catégories max
    
    // Calculer les tendances par catégorie
    const audits = await prisma.audit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 2,
      include: { responses: true }
    });
    
    let trendDirection = 'Stable';
    if (audits.length >= 2) {
      const latestScore = audits[0].responses?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
      const previousScore = audits[1].responses?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
      
      if (latestScore > previousScore + 5) trendDirection = 'Amélioration';
      else if (latestScore < previousScore - 5) trendDirection = 'Dégradation';
    }
    
    return {
      avgResolutionTime,
      auditCoverage,
      trendDirection,
      totalIncidents: resolvedIncidents.length,
      categoriesCovered: categories.length
    };
  } catch (error) {
    console.error('Erreur lors du calcul des analytics avancés:', error);
    return {
      avgResolutionTime: 0,
      auditCoverage: 0,
      trendDirection: 'Stable',
      totalIncidents: 0,
      categoriesCovered: 0
    };
  }
}

/**
 * Génère des données pour le graphique de répartition des scores par catégorie
 */
export async function getScoresByCategoryData(userId: string): Promise<ChartData[]> {
  try {
    const lastAudit = await prisma.audit.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { responses: true }
    });
    
    if (!lastAudit?.responses || lastAudit.responses.length === 0) {
      return [];
    }
    
    const scoresByCategory: Record<string, { total: number, count: number }> = {};
    
    lastAudit.responses.forEach(response => {
      const category = response.category || 'Général';
      if (!scoresByCategory[category]) {
        scoresByCategory[category] = { total: 0, count: 0 };
      }
      scoresByCategory[category].total += (response.score || 0);
      scoresByCategory[category].count += 1;
    });
    
    return Object.entries(scoresByCategory).map(([category, data]) => ({
      name: category,
      value: Math.round(data.total / data.count),
      color: getColorForCategory(category)
    }));
  } catch (error) {
    console.error('Erreur lors de la génération des scores par catégorie:', error);
    return [];
  }
}

/**
 * Attribue une couleur à une catégorie
 */
function getColorForCategory(category: string): string {
  const colors: Record<string, string> = {
    'Gouvernance': '#8b5cf6',
    'Technique': '#06b6d4',
    'Organisationnel': '#10b981',
    'Juridique': '#f59e0b',
    'Stratégique': '#ef4444',
    'Formation': '#84cc16',
    'Audit': '#6366f1',
    'Conformité': '#ec4899'
  };
  
  return colors[category] || '#64748b';
}

/**
 * Calcule le score de performance mensuelle basé sur les données réelles
 */
export async function getMonthlyPerformanceScore(userId: string): Promise<{
  currentMonthScore: number;
  previousMonthScore: number;
  trend: 'up' | 'down' | 'stable';
  monthlyActions: {
    completed: number;
    started: number;
    overdue: number;
  };
  complianceProgress: number;
}> {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Récupérer les audits du mois en cours et du mois précédent
    const [currentMonthAudits, previousMonthAudits] = await Promise.all([
      prisma.audit.findMany({
        where: {
          userId,
          createdAt: { gte: currentMonthStart }
        },
        include: { responses: true, complianceScores: true }
      }),
      prisma.audit.findMany({
        where: {
          userId,
          createdAt: {
            gte: previousMonthStart,
            lte: previousMonthEnd
          }
        },
        include: { responses: true, complianceScores: true }
      })
    ]);

    // Calculer le score du mois en cours
    let currentMonthScore = 0;
    if (currentMonthAudits.length > 0) {
      const latestAudit = currentMonthAudits[currentMonthAudits.length - 1];
      if (latestAudit.responses && latestAudit.responses.length > 0) {
        const totalScore = latestAudit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
        currentMonthScore = Math.round(totalScore / latestAudit.responses.length);
      } else if (latestAudit.score) {
        currentMonthScore = latestAudit.score;
      }
    }

    // Calculer le score du mois précédent
    let previousMonthScore = 0;
    if (previousMonthAudits.length > 0) {
      const latestPreviousAudit = previousMonthAudits[previousMonthAudits.length - 1];
      if (latestPreviousAudit.responses && latestPreviousAudit.responses.length > 0) {
        const totalScore = latestPreviousAudit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
        previousMonthScore = Math.round(totalScore / latestPreviousAudit.responses.length);
      } else if (latestPreviousAudit.score) {
        previousMonthScore = latestPreviousAudit.score;
      }
    }

    // Déterminer la tendance
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (currentMonthScore > previousMonthScore + 3) trend = 'up';
    else if (currentMonthScore < previousMonthScore - 3) trend = 'down';

    // Analyser les actions du mois en cours
    const monthlyActions = await prisma.strategicAction.findMany({
      where: {
        audit: { userId },
        OR: [
          { createdAt: { gte: currentMonthStart } },
          { updatedAt: { gte: currentMonthStart } },
          { dueDate: { gte: currentMonthStart, lte: now } }
        ]
      }
    });

    const completed = monthlyActions.filter(a => 
      a.status === 'Terminé' && a.updatedAt >= currentMonthStart
    ).length;
    
    const started = monthlyActions.filter(a => 
      a.status === 'En cours' && a.createdAt >= currentMonthStart
    ).length;
    
    const overdue = monthlyActions.filter(a => 
      a.dueDate < now && a.status !== 'Terminé'
    ).length;

    // Calculer le progrès de conformité du mois
    let complianceProgress = 0;
    if (currentMonthAudits.length > 0) {
      const latestAudit = currentMonthAudits[currentMonthAudits.length - 1];
      if (latestAudit.complianceScores && latestAudit.complianceScores.length > 0) {
        const totalCompliance = latestAudit.complianceScores.reduce((sum, cs) => sum + cs.score, 0);
        complianceProgress = Math.round(totalCompliance / latestAudit.complianceScores.length);
      }
    }

    // Si pas de données pour le mois en cours, utiliser les données les plus récentes
    if (currentMonthScore === 0) {
      const lastAudit = await prisma.audit.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { responses: true }
      });
      
      if (lastAudit?.responses && lastAudit.responses.length > 0) {
        const totalScore = lastAudit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
        currentMonthScore = Math.round(totalScore / lastAudit.responses.length);
      } else if (lastAudit?.score) {
        currentMonthScore = lastAudit.score;
      }
    }

    return {
      currentMonthScore,
      previousMonthScore,
      trend,
      monthlyActions: {
        completed,
        started,
        overdue
      },
      complianceProgress
    };
  } catch (error) {
    console.error('Erreur lors du calcul du score mensuel:', error);
    return {
      currentMonthScore: 0,
      previousMonthScore: 0,
      trend: 'stable',
      monthlyActions: {
        completed: 0,
        started: 0,
        overdue: 0
      },
      complianceProgress: 0
    };
  }
}

/**
 * Récupère toutes les données nécessaires pour le dashboard
 */
export async function getDashboardData(userId: string) {
  try {
    const [
      kpis,
      actions,
      risks,
      milestones,
      alerts,
      incidents,
      actionStatusChart,
      domainProgressChart,
      maturityTimeSeries,
      riskHeatmap,
      analytics,
      scoresByCategory
    ] = await Promise.all([
      getDashboardKPIs(userId),
      getDashboardActions(userId),
      getDashboardRisks(),
      getDashboardMilestones(userId),
      getDashboardAlerts(),
      getDashboardIncidents(),
      getActionStatusChartData(userId),
      getDomainProgressChartData(userId),
      getMaturityTimeSeriesData(userId),
      getRiskHeatmapData(),
      getAdvancedAnalytics(userId),
      getScoresByCategoryData(userId)
    ]);

    // Construire le donut des risques sécurité à partir des niveaux de risques agrégés
    const riskLevelCounts: Record<string, number> = { 'Critique': 0, 'Élevé': 0, 'Moyen': 0, 'Faible': 0 };
    risks.forEach(r => { riskLevelCounts[r.riskLevel] = (riskLevelCounts[r.riskLevel] || 0) + 1; });
    const securityRisksDonut: ChartData[] = [
      { name: 'Critique', value: riskLevelCounts['Critique'] || 0, color: '#dc2626' },
      { name: 'Élevé', value: riskLevelCounts['Élevé'] || 0, color: '#ea580c' },
      { name: 'Moyen', value: riskLevelCounts['Moyen'] || 0, color: '#f59e0b' },
      { name: 'Faible', value: riskLevelCounts['Faible'] || 0, color: '#10b981' },
    ];

    return {
      kpis,
      actions,
      risks,
      milestones,
      alerts,
      incidents,
      analytics,
      charts: {
        actionStatus: actionStatusChart,
        domainProgress: domainProgressChart,
        maturityTimeSeries: maturityTimeSeries,
        riskHeatmap: riskHeatmap,
        scoresByCategory: scoresByCategory,
        securityRisksDonut
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données dashboard:', error);
    throw error;
  }
}
