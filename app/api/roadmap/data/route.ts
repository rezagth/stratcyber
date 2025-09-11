import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getActionStatuses } from '../actions/route';

interface ActionPlan {
  id: string;
  title: string;
  action: string;  // Ajout du champ action pour le contenu détaillé
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
      
      // Action de suivi pour les catégories critiques
      actions.push({
        id: `followup-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Suivi et contrôle - ${category}`,
        action: `Établir un suivi et contrôle régulier pour ${category}`,
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

    // Actions spécifiques détaillées pour chaque catégorie
    const categoryActions = {
      'RGPD': [
        {
          action: "Mettre en place une procédure de notification des violations de données dans les 72h à la CNIL",
          description: "Établir un processus formalisé pour détecter, évaluer et notifier les violations de données personnelles conformément à l'article 33 du RGPD",
          priority: "Critique" as const,
          estimatedHours: 24,
          owner: "DPO",
          budget: 3000
        },
        {
          action: "Former le personnel à identifier et signaler les violations de données",
          description: "Programme de formation pour sensibiliser l'ensemble du personnel aux obligations RGPD et aux procédures de signalement",
          priority: "Haute" as const,
          estimatedHours: 16,
          owner: "DPO",
          budget: 2000
        },
        {
          action: "Élaborer un plan de réponse aux violations de données conformément à l'article 33 du RGPD",
          description: "Créer un plan d'action détaillé pour gérer les incidents de sécurité affectant les données personnelles",
          priority: "Critique" as const,
          estimatedHours: 20,
          owner: "DPO",
          budget: 2500
        },
        {
          action: "Mettre en place des procédures claires pour permettre aux personnes d'exercer leurs droits RGPD",
          description: "Formaliser les processus pour traiter les demandes d'accès, de rectification, d'effacement et de portabilité des données",
          priority: "Haute" as const,
          estimatedHours: 18,
          owner: "DPO",
          budget: 1800
        },
        {
          action: "Créer et maintenir le registre des traitements de données personnelles",
          description: "Documenter tous les traitements de données personnelles conformément à l'article 30 du RGPD",
          priority: "Critique" as const,
          estimatedHours: 32,
          owner: "DPO",
          budget: 4000
        }
      ],
      'NIS2': [
        {
          action: "Mettre en place un système de gestion des incidents de sécurité conforme à la directive NIS2",
          description: "Établir un processus de détection, signalement et réponse aux incidents de cybersécurité selon les exigences NIS2",
          priority: "Critique" as const,
          estimatedHours: 40,
          owner: "RSSI",
          budget: 8000
        },
        {
          action: "Renforcer la sécurité de la chaîne d'approvisionnement numérique",
          description: "Évaluer et sécuriser les fournisseurs critiques selon les exigences NIS2",
          priority: "Haute" as const,
          estimatedHours: 32,
          owner: "RSSI",
          budget: 6000
        },
        {
          action: "Établir des mesures de cybersécurité proportionnées aux risques",
          description: "Déployer les mesures techniques et organisationnelles requises par NIS2",
          priority: "Critique" as const,
          estimatedHours: 48,
          owner: "RSSI",
          budget: 12000
        }
      ],
      'Incidents': [
        {
          action: "Développer et tester le plan de réponse aux incidents cybersécurité",
          description: "Créer un plan complet de gestion des incidents incluant les procédures d'escalade et de communication",
          priority: "Critique" as const,
          estimatedHours: 30,
          owner: "RSSI",
          budget: 5000
        },
        {
          action: "Former l'équipe de réponse aux incidents (CSIRT)",
          description: "Formation spécialisée pour l'équipe de réponse aux incidents sur les techniques d'investigation et de remédiation",
          priority: "Haute" as const,
          estimatedHours: 24,
          owner: "RSSI",
          budget: 4000
        },
        {
          action: "Mettre en place la surveillance continue des systèmes critiques",
          description: "Déployer des outils de détection et monitoring 24h/24 pour identifier rapidement les incidents",
          priority: "Critique" as const,
          estimatedHours: 40,
          owner: "RSSI",
          budget: 15000
        }
      ],
      'Cloud': [
        {
          action: "Sécuriser l'architecture cloud selon les bonnes pratiques de sécurité",
          description: "Audit et renforcement de la sécurité des environnements cloud (AWS, Azure, GCP) avec mise en place de contrôles appropriés",
          priority: "Haute" as const,
          estimatedHours: 35,
          owner: "Architecte Cloud",
          budget: 8000
        },
        {
          action: "Implémenter la gestion des identités et accès dans le cloud (IAM)",
          description: "Mise en place d'une gestion centralisée des identités avec authentification multi-facteurs et contrôle d'accès granulaire",
          priority: "Critique" as const,
          estimatedHours: 28,
          owner: "Administrateur Système",
          budget: 6000
        },
        {
          action: "Établir la stratégie de chiffrement des données dans le cloud",
          description: "Chiffrement des données au repos et en transit avec gestion sécurisée des clés de chiffrement",
          priority: "Critique" as const,
          estimatedHours: 32,
          owner: "Architecte Sécurité",
          budget: 7000
        }
      ],
      'Technique': [
        {
          action: "Déployer une solution de protection avancée contre les menaces (EDR/XDR)",
          description: "Installation et configuration d'outils de détection et réponse étendues pour une protection proactive",
          priority: "Critique" as const,
          estimatedHours: 40,
          owner: "RSSI",
          budget: 25000
        },
        {
          action: "Renforcer la sécurité du réseau avec segmentation et micro-segmentation",
          description: "Isolation des segments réseau critiques et mise en place de contrôles d'accès granulaires",
          priority: "Haute" as const,
          estimatedHours: 35,
          owner: "Administrateur Réseau",
          budget: 12000
        },
        {
          action: "Mettre à jour et durcir la sécurité des systèmes d'exploitation",
          description: "Application des correctifs de sécurité et configuration sécurisée des serveurs et postes de travail",
          priority: "Haute" as const,
          estimatedHours: 30,
          owner: "Administrateur Système",
          budget: 8000
        }
      ],
      'Gouvernance': [
        {
          action: "Élaborer et approuver la politique de sécurité de l'information",
          description: "Rédaction d'une politique globale de sécurité alignée sur les standards internationaux (ISO 27001)",
          priority: "Critique" as const,
          estimatedHours: 40,
          owner: "RSSI",
          budget: 6000
        },
        {
          action: "Mettre en place le comité de pilotage cybersécurité",
          description: "Création d'un comité de direction pour superviser la stratégie cybersécurité et les investissements",
          priority: "Haute" as const,
          estimatedHours: 20,
          owner: "Direction",
          budget: 3000
        },
        {
          action: "Établir le processus de gestion des risques cybersécurité",
          description: "Mise en place d'une méthodologie d'évaluation et traitement des risques cyber",
          priority: "Critique" as const,
          estimatedHours: 35,
          owner: "RSSI",
          budget: 8000
        }
      ],
      'Sensibilisation': [
        {
          action: "Développer un programme complet de sensibilisation à la cybersécurité",
          description: "Création de supports et organisation de formations pour sensibiliser tous les collaborateurs",
          priority: "Haute" as const,
          estimatedHours: 32,
          owner: "RH + RSSI",
          budget: 5000
        },
        {
          action: "Lancer des campagnes de simulation de phishing ciblées",
          description: "Tests réguliers de phishing simulé pour mesurer et améliorer la vigilance des utilisateurs",
          priority: "Moyenne" as const,
          estimatedHours: 16,
          owner: "RSSI",
          budget: 3000
        },
        {
          action: "Former les équipes métier aux bonnes pratiques de sécurité",
          description: "Sessions de formation spécialisées par métier (RH, Finance, Commercial) sur les risques spécifiques",
          priority: "Haute" as const,
          estimatedHours: 24,
          owner: "RSSI",
          budget: 4000
        }
      ],
      'SupplyChain': [
        {
          action: "Évaluer et certifier la sécurité des fournisseurs critiques",
          description: "Audit de sécurité des principaux fournisseurs avec mise en place de critères de sécurité",
          priority: "Critique" as const,
          estimatedHours: 40,
          owner: "Achats + RSSI",
          budget: 10000
        },
        {
          action: "Intégrer des clauses de cybersécurité dans les contrats fournisseurs",
          description: "Révision des contrats avec intégration d'exigences de sécurité et de notification d'incidents",
          priority: "Haute" as const,
          estimatedHours: 24,
          owner: "Juridique + RSSI",
          budget: 5000
        },
        {
          action: "Surveiller en continu les risques de la chaîne d'approvisionnement",
          description: "Mise en place d'outils de surveillance des fournisseurs et veille sur les menaces supply chain",
          priority: "Haute" as const,
          estimatedHours: 30,
          owner: "RSSI",
          budget: 8000
        }
      ]
    };
    
    // Ajouter les actions spécifiques pour la catégorie
    const specificActions = categoryActions[category as keyof typeof categoryActions] || [];
    specificActions.forEach((actionData, index) => {
      actions.push({
        id: `${category.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`,
        title: actionData.action.substring(0, 60) + "...",
        action: actionData.action,
        description: actionData.description,
        category: category,
        priority: actionData.priority,
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString(),
        owner: actionData.owner,
        estimatedHours: actionData.estimatedHours,
        businessImpact: `Amélioration de la sécurité ${category}`,
        budget: actionData.budget
      });
    });
    
    // Actions supplémentaires basées sur les réponses faibles (si pas assez d'actions spécifiques)
    if (specificActions.length < 2 && lowScoreResponses.length > 0) {
      lowScoreResponses.slice(0, 2).forEach((response: any, index: number) => {
        const scorePercent = Math.round(((response.score || 0) / 5) * 100);
        const priority = (response.score || 0) < 1.5 ? 'Critique' : 
                        (response.score || 0) < 2.5 ? 'Haute' : 'Moyenne';
        
        actions.push({
          id: `${category.toLowerCase()}-response-${index + 1}`,
          title: `Amélioration ${category} - Action complémentaire`,
          action: `Améliorer les pratiques ${category} suite aux résultats d'audit`,
          description: `Action d'amélioration basée sur l'évaluation: Score actuel ${scorePercent}%`,
          category: category,
          priority: priority,
          status: 'Non démarré',
          progress: 0,
          dueDate: new Date(Date.now() + (60 + index * 15) * 24 * 60 * 60 * 1000).toISOString(),
          owner: 'Responsable métier',
          estimatedHours: 20,
          businessImpact: `Correction des lacunes identifiées en ${category}`,
          budget: 3000
        });
      });
    }
    
    // Actions supplémentaires pour les catégories avec beaucoup de réponses faibles
    if (lowScoreResponses.length >= 3) {
      actions.push({
        id: `comprehensive-${category.toLowerCase().replace(/\s+/g, '-')}`,
        title: `Plan complet d'amélioration - ${category}`,
        action: `Élaborer et exécuter un plan complet d'amélioration pour ${category}`,
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
        action: 'Maintenir le niveau d\'excellence sécuritaire atteint',
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
        action: 'Mettre en place une veille et des innovations en cybersécurité',
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

export async function GET(request: Request) {
  try {
    // Correction pour Next.js 15 : pas besoin de passer request à getServerSession
    // car getServerSession gère maintenant les APIs asynchrones en interne
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le paramètre auditId depuis l'URL
    const { searchParams } = new URL(request.url);
    const auditId = searchParams.get('auditId');

    let audit;
    
    if (auditId) {
      // Récupérer l'audit spécifique avec validation de sécurité
      audit = await prisma.audit.findFirst({
        where: {
          id: auditId,
          userId: session.user.id, // S'assurer que l'utilisateur a accès à cet audit
        },
        include: {
          responses: true,
        },
      });
      
      // Si l'audit spécifié n'existe pas ou n'appartient pas à l'utilisateur
      if (!audit) {
        return NextResponse.json(
          { error: 'Audit non trouvé ou accès non autorisé' },
          { status: 404 }
        );
      }
    } else {
      // Récupérer le dernier audit (comportement par défaut)
      audit = await prisma.audit.findFirst({
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
    }

    if (!audit || audit.responses.length === 0) {
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
    const generatedActions = generateActionsFromResponses(audit.responses);
    
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
    const totalResponses = audit.responses.length;
    const totalScore = audit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
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
      lastAuditDate: audit.createdAt.toISOString(),
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
