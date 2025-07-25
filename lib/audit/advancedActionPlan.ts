import { AuditResult, AuditCategory } from '../../types/audit';
import { 
  ActionPlanItem, 
  SubTask, 
  Milestone, 
  RoadmapQuarter, 
  ActionPlanSummary,
  TeamMember,
  RoadmapConfig,
  Priority,
  RiskLevel,
  ActionStatus
} from '../../types/actionPlan';

// Base de données des actions détaillées par catégorie
const detailedActionsByCategory: Record<AuditCategory, Array<{
  title: string;
  description: string;
  subTasks: Array<{
    title: string;
    description: string;
    estimatedHours: number;
    dependencies?: string[];
  }>;
  businessImpact: string;
  technicalComplexity: 'Faible' | 'Moyenne' | 'Élevée';
  estimatedDuration: number;
  budget?: number;
  kpis: string[];
  successCriteria: string[];
  resources: string[];
}>> = {
  Gouvernance: [
    {
      title: "Formaliser la politique de sécurité de l'information",
      description: "Élaborer, valider et diffuser une politique de sécurité complète alignée sur les standards ISO 27001",
      subTasks: [
        {
          title: "Audit de l'existant et analyse des besoins",
          description: "Analyser les politiques existantes et identifier les lacunes",
          estimatedHours: 16
        },
        {
          title: "Rédaction de la politique de sécurité",
          description: "Rédiger la politique en conformité avec les standards",
          estimatedHours: 24,
          dependencies: ["audit-existant"]
        },
        {
          title: "Validation par la direction",
          description: "Présenter et faire valider la politique par le COMEX",
          estimatedHours: 8,
          dependencies: ["redaction-politique"]
        },
        {
          title: "Communication et formation",
          description: "Diffuser la politique et former les collaborateurs",
          estimatedHours: 12,
          dependencies: ["validation-direction"]
        }
      ],
      businessImpact: "Réduction des risques cyber de 40%, amélioration de la conformité réglementaire",
      technicalComplexity: 'Moyenne',
      estimatedDuration: 45,
      budget: 15000,
      kpis: ["Taux de conformité", "Nombre d'incidents évités", "Score d'audit"],
      successCriteria: ["Politique validée par la direction", "100% des employés formés", "Conformité ISO 27001"],
      resources: ["Template ISO 27001", "Guide ANSSI", "Formation CNIL"]
    },
    {
      title: "Désigner et former un RSSI",
      description: "Recruter ou nommer un Responsable de la Sécurité des Systèmes d'Information avec lettre de mission",
      subTasks: [
        {
          title: "Définition du profil et des missions",
          description: "Élaborer la fiche de poste et la lettre de mission",
          estimatedHours: 8
        },
        {
          title: "Recrutement ou nomination interne",
          description: "Processus de recrutement ou promotion interne",
          estimatedHours: 40,
          dependencies: ["definition-profil"]
        },
        {
          title: "Formation et certification",
          description: "Formation aux standards et certification professionnelle",
          estimatedHours: 80,
          dependencies: ["recrutement"]
        },
        {
          title: "Mise en place des outils et processus",
          description: "Déploiement des outils de pilotage sécurité",
          estimatedHours: 32,
          dependencies: ["formation"]
        }
      ],
      businessImpact: "Leadership sécurité, réduction des incidents de 60%",
      technicalComplexity: 'Élevée',
      estimatedDuration: 90,
      budget: 80000,
      kpis: ["Temps de réponse aux incidents", "Nombre de vulnérabilités détectées", "Score de maturité"],
      successCriteria: ["RSSI nommé officiellement", "Certification obtenue", "Processus opérationnels"],
      resources: ["ANSSI - Guide RSSI", "Formations CISSP", "Outils SIEM"]
    }
  ],
  Technique: [
    {
      title: "Déployer une solution EDR/XDR complète",
      description: "Mise en place d'une solution de détection et réponse avancée sur tous les endpoints",
      subTasks: [
        {
          title: "Audit du parc informatique",
          description: "Inventaire complet des équipements et systèmes",
          estimatedHours: 24
        },
        {
          title: "Sélection de la solution EDR",
          description: "Benchmark et choix de la solution (CrowdStrike, SentinelOne, etc.)",
          estimatedHours: 32,
          dependencies: ["audit-parc"]
        },
        {
          title: "Déploiement pilote",
          description: "Test sur un échantillon d'équipements",
          estimatedHours: 40,
          dependencies: ["selection-solution"]
        },
        {
          title: "Déploiement généralisé",
          description: "Rollout sur l'ensemble du parc",
          estimatedHours: 60,
          dependencies: ["pilote"]
        },
        {
          title: "Formation et procédures",
          description: "Formation des équipes IT et création des procédures",
          estimatedHours: 24,
          dependencies: ["deploiement"]
        }
      ],
      businessImpact: "Détection précoce des menaces, réduction du temps de réponse de 80%",
      technicalComplexity: 'Élevée',
      estimatedDuration: 60,
      budget: 50000,
      kpis: ["Temps de détection", "Taux de faux positifs", "Couverture du parc"],
      successCriteria: ["100% du parc couvert", "SOC opérationnel", "MTTR < 1h"],
      resources: ["Solutions EDR", "Formation SOC", "Playbooks incidents"]
    }
  ],
  Organisationnel: [
    {
      title: "Mettre en place un programme de sensibilisation cyber",
      description: "Déployer un programme complet de sensibilisation incluant phishing simulé et formations",
      subTasks: [
        {
          title: "Audit des connaissances actuelles",
          description: "Évaluer le niveau de sensibilisation des collaborateurs",
          estimatedHours: 16
        },
        {
          title: "Conception du programme de formation",
          description: "Créer les modules de formation adaptés aux métiers",
          estimatedHours: 40,
          dependencies: ["audit-connaissances"]
        },
        {
          title: "Mise en place du phishing simulé",
          description: "Déployer une plateforme de simulation de phishing",
          estimatedHours: 24,
          dependencies: ["conception-programme"]
        },
        {
          title: "Déploiement des formations",
          description: "Lancer les sessions de formation par vagues",
          estimatedHours: 60,
          dependencies: ["phishing-simule"]
        },
        {
          title: "Suivi et amélioration continue",
          description: "Mesurer l'efficacité et ajuster le programme",
          estimatedHours: 20,
          dependencies: ["deploiement-formations"]
        }
      ],
      businessImpact: "Réduction des erreurs humaines de 70%, amélioration de la culture sécurité",
      technicalComplexity: 'Moyenne',
      estimatedDuration: 120,
      budget: 25000,
      kpis: ["Taux de clic phishing", "Score de sensibilisation", "Nombre d'incidents humains"],
      successCriteria: ["Taux de clic < 5%", "100% des employés formés", "Culture sécurité mesurable"],
      resources: ["Plateforme e-learning", "Outils phishing", "Contenus de formation"]
    }
  ],
  GRC: [
    {
      title: "Initier la démarche de certification ISO 27001",
      description: "Lancer le projet de certification ISO 27001 avec accompagnement externe",
      subTasks: [
        {
          title: "Gap analysis ISO 27001",
          description: "Analyser l'écart avec les exigences ISO 27001",
          estimatedHours: 32
        },
        {
          title: "Plan de mise en conformité",
          description: "Élaborer le plan d'action détaillé pour la conformité",
          estimatedHours: 24,
          dependencies: ["gap-analysis"]
        },
        {
          title: "Mise en œuvre des contrôles",
          description: "Déployer les 114 contrôles de sécurité ISO 27001",
          estimatedHours: 200,
          dependencies: ["plan-conformite"]
        },
        {
          title: "Audit blanc",
          description: "Réaliser un audit blanc avant la certification",
          estimatedHours: 16,
          dependencies: ["mise-en-oeuvre"]
        },
        {
          title: "Certification officielle",
          description: "Audit de certification par organisme accrédité",
          estimatedHours: 24,
          dependencies: ["audit-blanc"]
        }
      ],
      businessImpact: "Reconnaissance internationale, avantage concurrentiel, réduction des primes d'assurance",
      technicalComplexity: 'Élevée',
      estimatedDuration: 365,
      budget: 120000,
      kpis: ["Nombre de contrôles conformes", "Score d'audit", "Délai de certification"],
      successCriteria: ["Certification ISO 27001 obtenue", "Tous les contrôles implémentés", "Audit réussi"],
      resources: ["Standard ISO 27001", "Consultant expert", "Outils de conformité"]
    }
  ],
  Sensibilisation: [
    {
      title: "Créer un centre de ressources cybersécurité",
      description: "Développer un portail interne avec ressources, formations et actualités cyber",
      subTasks: [
        {
          title: "Conception de l'architecture du portail",
          description: "Définir la structure et les fonctionnalités du portail",
          estimatedHours: 20
        },
        {
          title: "Développement du portail",
          description: "Créer le site web avec CMS et fonctionnalités",
          estimatedHours: 80,
          dependencies: ["conception-architecture"]
        },
        {
          title: "Création des contenus",
          description: "Rédiger articles, guides et ressources",
          estimatedHours: 60,
          dependencies: ["developpement"]
        },
        {
          title: "Intégration et tests",
          description: "Intégrer les contenus et tester le portail",
          estimatedHours: 24,
          dependencies: ["creation-contenus"]
        },
        {
          title: "Lancement et communication",
          description: "Lancer le portail et communiquer auprès des équipes",
          estimatedHours: 16,
          dependencies: ["integration-tests"]
        }
      ],
      businessImpact: "Amélioration de l'autonomie des équipes, réduction des demandes de support",
      technicalComplexity: 'Moyenne',
      estimatedDuration: 90,
      budget: 30000,
      kpis: ["Nombre de visiteurs", "Temps passé sur le portail", "Satisfaction utilisateurs"],
      successCriteria: ["Portail opérationnel", "50+ ressources disponibles", "80% d'adoption"],
      resources: ["CMS Drupal/WordPress", "Contenus ANSSI", "Designer UX"]
    }
  ],
  RGPD: [
    {
      title: "Mettre en place la gouvernance RGPD complète",
      description: "Déployer l'ensemble des processus RGPD avec DPO et outils de conformité",
      subTasks: [
        {
          title: "Nomination du DPO",
          description: "Désigner et former le Délégué à la Protection des Données",
          estimatedHours: 40
        },
        {
          title: "Cartographie des traitements",
          description: "Inventorier et documenter tous les traitements de données",
          estimatedHours: 80,
          dependencies: ["nomination-dpo"]
        },
        {
          title: "Analyses d'impact (AIPD)",
          description: "Réaliser les AIPD pour les traitements à risque",
          estimatedHours: 60,
          dependencies: ["cartographie"]
        },
        {
          title: "Mise en place des processus",
          description: "Déployer les processus de gestion des droits et incidents",
          estimatedHours: 40,
          dependencies: ["aipd"]
        },
        {
          title: "Formation et sensibilisation",
          description: "Former les équipes aux obligations RGPD",
          estimatedHours: 30,
          dependencies: ["processus"]
        }
      ],
      businessImpact: "Conformité réglementaire, évitement des sanctions, confiance clients",
      technicalComplexity: 'Moyenne',
      estimatedDuration: 180,
      budget: 45000,
      kpis: ["Nombre de traitements documentés", "Délai de réponse aux demandes", "Score de conformité"],
      successCriteria: ["DPO opérationnel", "Registre complet", "Processus conformes"],
      resources: ["Formation DPO", "Outils RGPD", "Templates CNIL"]
    }
  ]
};

// Équipes types par taille d'entreprise
const teamTemplates: Record<string, TeamMember[]> = {
  PME: [
    { id: 'dsi', name: 'Directeur SI', role: 'DSI', email: 'dsi@company.com', department: 'IT', skills: ['Management', 'Architecture'], workload: 60, assignedActions: [] },
    { id: 'admin', name: 'Administrateur Système', role: 'Admin Sys', email: 'admin@company.com', department: 'IT', skills: ['Windows', 'Linux', 'Réseau'], workload: 70, assignedActions: [] },
    { id: 'drh', name: 'Directeur RH', role: 'DRH', email: 'drh@company.com', department: 'RH', skills: ['Formation', 'Communication'], workload: 40, assignedActions: [] },
    { id: 'direction', name: 'Direction Générale', role: 'CEO', email: 'ceo@company.com', department: 'Direction', skills: ['Stratégie', 'Décision'], workload: 20, assignedActions: [] }
  ],
  ETI: [
    { id: 'dsi', name: 'Directeur SI', role: 'DSI', email: 'dsi@company.com', department: 'IT', skills: ['Management', 'Architecture'], workload: 50, assignedActions: [] },
    { id: 'rssi', name: 'RSSI', role: 'RSSI', email: 'rssi@company.com', department: 'IT', skills: ['Sécurité', 'Audit', 'ISO27001'], workload: 80, assignedActions: [] },
    { id: 'admin1', name: 'Admin Système Senior', role: 'Admin Sys', email: 'admin1@company.com', department: 'IT', skills: ['Windows', 'Linux', 'VMware'], workload: 60, assignedActions: [] },
    { id: 'admin2', name: 'Admin Réseau', role: 'Admin Réseau', email: 'admin2@company.com', department: 'IT', skills: ['Cisco', 'Firewall', 'Monitoring'], workload: 65, assignedActions: [] },
    { id: 'dpo', name: 'DPO', role: 'DPO', email: 'dpo@company.com', department: 'Juridique', skills: ['RGPD', 'Droit', 'Audit'], workload: 70, assignedActions: [] },
    { id: 'drh', name: 'Directeur RH', role: 'DRH', email: 'drh@company.com', department: 'RH', skills: ['Formation', 'Communication'], workload: 30, assignedActions: [] }
  ]
};

export function generateAdvancedActionPlan(
  auditResult: AuditResult,
  config: Partial<RoadmapConfig> = {}
): {
  actions: ActionPlanItem[];
  milestones: Milestone[];
  quarters: RoadmapQuarter[];
  summary: ActionPlanSummary;
  teamMembers: TeamMember[];
} {
  const startDate = config.startDate || new Date();
  const companySize = config.companySize || 'PME';
  const teamMembers = config.teamMembers || teamTemplates[companySize] || teamTemplates.PME;
  
  const actions: ActionPlanItem[] = [];
  const milestones: Milestone[] = [];
  
  // Générer les actions basées sur les scores
  Object.entries(auditResult.scoresByCategory).forEach(([category, score]) => {
    const cat = category as AuditCategory;
    
    if (score < 70) { // Seuil pour déclencher des actions
      const categoryActions = detailedActionsByCategory[cat] || [];
      
      categoryActions.forEach((actionTemplate, index) => {
        const actionId = `${cat.toLowerCase()}-${index + 1}`;
        const priority = getPriority(score);
        const riskLevel = getRiskLevel(score);
        
        // Calculer les dates
        const actionStartDate = new Date(startDate);
        actionStartDate.setDate(actionStartDate.getDate() + (index * 30)); // Étalement des actions
        
        const actionDueDate = new Date(actionStartDate);
        actionDueDate.setDate(actionDueDate.getDate() + actionTemplate.estimatedDuration);
        
        // Générer les sous-tâches
        const subTasks: SubTask[] = actionTemplate.subTasks.map((subTaskTemplate, subIndex) => ({
          id: `${actionId}-subtask-${subIndex + 1}`,
          title: subTaskTemplate.title,
          description: subTaskTemplate.description,
          estimatedHours: subTaskTemplate.estimatedHours,
          status: 'Non commencé' as ActionStatus,
          dueDate: new Date(actionStartDate.getTime() + (subIndex + 1) * (actionTemplate.estimatedDuration / actionTemplate.subTasks.length) * 24 * 60 * 60 * 1000),
          dependencies: subTaskTemplate.dependencies || []
        }));
        
        // Assigner automatiquement selon la catégorie
        const owner = getOwnerByCategory(cat, teamMembers);
        const assignees = getAssigneesByCategory(cat, teamMembers);
        
        const action: ActionPlanItem = {
          id: actionId,
          title: actionTemplate.title,
          description: actionTemplate.description,
          category: cat,
          priority,
          riskLevel,
          startDate: actionStartDate,
          dueDate: actionDueDate,
          estimatedDuration: actionTemplate.estimatedDuration,
          owner: owner.id,
          assignees: assignees.map(a => a.id),
          status: 'Non commencé',
          progress: 0,
          subTasks,
          businessImpact: actionTemplate.businessImpact,
          technicalComplexity: actionTemplate.technicalComplexity,
          budget: actionTemplate.budget,
          dependencies: [],
          blockers: [],
          resources: actionTemplate.resources,
          notes: '',
          kpis: actionTemplate.kpis,
          successCriteria: actionTemplate.successCriteria,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        actions.push(action);
      });
    }
  });
  
  // Générer les jalons
  const categoriesWithActions = [...new Set(actions.map(a => a.category))];
  categoriesWithActions.forEach(category => {
    const categoryActions = actions.filter(a => a.category === category);
    const lastActionDate = new Date(Math.max(...categoryActions.map(a => a.dueDate.getTime())));
    
    milestones.push({
      id: `milestone-${category.toLowerCase()}`,
      title: `Finalisation du domaine ${category}`,
      description: `Toutes les actions du domaine ${category} sont terminées`,
      dueDate: lastActionDate,
      category,
      actions: categoryActions.map(a => a.id),
      status: 'À venir',
      progress: 0
    });
  });
  
  // Générer les trimestres
  const quarters = generateQuarters(startDate, actions, milestones);
  
  // Calculer le résumé
  const summary = calculateSummary(actions);
  
  return {
    actions,
    milestones,
    quarters,
    summary,
    teamMembers
  };
}

function getPriority(score: number): Priority {
  if (score < 30) return 'Critique';
  if (score < 50) return 'Haute';
  if (score < 70) return 'Moyenne';
  return 'Basse';
}

function getRiskLevel(score: number): RiskLevel {
  if (score < 30) return 'Très élevé';
  if (score < 50) return 'Élevé';
  if (score < 70) return 'Moyen';
  return 'Faible';
}

function getOwnerByCategory(category: AuditCategory, teamMembers: TeamMember[]): TeamMember {
  const ownerMap: Record<AuditCategory, string> = {
    Gouvernance: 'direction',
    Technique: 'dsi',
    Organisationnel: 'drh',
    GRC: 'rssi',
    Sensibilisation: 'drh',
    RGPD: 'dpo'
  };
  
  const ownerId = ownerMap[category];
  return teamMembers.find(m => m.id === ownerId) || teamMembers[0];
}

function getAssigneesByCategory(category: AuditCategory, teamMembers: TeamMember[]): TeamMember[] {
  const assigneeMap: Record<AuditCategory, string[]> = {
    Gouvernance: ['direction', 'dsi', 'rssi'],
    Technique: ['dsi', 'admin', 'admin1', 'admin2'],
    Organisationnel: ['drh', 'dsi'],
    GRC: ['rssi', 'dsi'],
    Sensibilisation: ['drh', 'dsi'],
    RGPD: ['dpo', 'drh', 'dsi']
  };
  
  const assigneeIds = assigneeMap[category] || [];
  return teamMembers.filter(m => assigneeIds.includes(m.id));
}

function generateQuarters(startDate: Date, actions: ActionPlanItem[], milestones: Milestone[]): RoadmapQuarter[] {
  const quarters: RoadmapQuarter[] = [];
  const currentYear = startDate.getFullYear();
  
  for (let i = 0; i < 8; i++) { // 2 ans de roadmap
    const quarterNum = (Math.floor((startDate.getMonth() + i * 3) / 3) % 4) + 1;
    const year = currentYear + Math.floor((startDate.getMonth() + i * 3) / 12);
    
    const quarterStart = new Date(year, (quarterNum - 1) * 3, 1);
    const quarterEnd = new Date(year, quarterNum * 3, 0);
    
    const quarterMilestones = milestones.filter(m => 
      m.dueDate >= quarterStart && m.dueDate <= quarterEnd
    );
    
    const quarterBudget = actions
      .filter(a => a.startDate >= quarterStart && a.startDate <= quarterEnd)
      .reduce((sum, a) => sum + (a.budget || 0), 0);
    
    const focusAreas = [...new Set(quarterMilestones.map(m => m.category))];
    
    quarters.push({
      quarter: `Q${quarterNum} ${year}`,
      year,
      startDate: quarterStart,
      endDate: quarterEnd,
      milestones: quarterMilestones,
      budget: quarterBudget,
      focusAreas
    });
  }
  
  return quarters;
}

function calculateSummary(actions: ActionPlanItem[]): ActionPlanSummary {
  const totalActions = actions.length;
  const completedActions = actions.filter(a => a.status === 'Terminé').length;
  const overallProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const criticalActions = actions.filter(a => a.priority === 'Critique').length;
  const overdueActions = actions.filter(a => a.dueDate < new Date() && a.status !== 'Terminé').length;
  
  const upcomingDeadlines = actions
    .filter(a => {
      const daysUntilDue = Math.ceil((a.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 30 && daysUntilDue >= 0 && a.status !== 'Terminé';
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 5);
  
  const budgetTotal = actions.reduce((sum, a) => sum + (a.budget || 0), 0);
  const budgetSpent = actions
    .filter(a => a.status === 'Terminé')
    .reduce((sum, a) => sum + (a.budget || 0), 0);
  
  const completedActionsWithDuration = actions.filter(a => a.status === 'Terminé');
  const averageCompletionTime = completedActionsWithDuration.length > 0
    ? Math.round(completedActionsWithDuration.reduce((sum, a) => sum + a.estimatedDuration, 0) / completedActionsWithDuration.length)
    : 0;
  
  const riskDistribution: Record<RiskLevel, number> = {
    'Très élevé': actions.filter(a => a.riskLevel === 'Très élevé').length,
    'Élevé': actions.filter(a => a.riskLevel === 'Élevé').length,
    'Moyen': actions.filter(a => a.riskLevel === 'Moyen').length,
    'Faible': actions.filter(a => a.riskLevel === 'Faible').length
  };
  
  const categoryProgress: Record<AuditCategory, number> = {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0
  };
  
  Object.keys(categoryProgress).forEach(cat => {
    const category = cat as AuditCategory;
    const categoryActions = actions.filter(a => a.category === category);
    if (categoryActions.length > 0) {
      const completedInCategory = categoryActions.filter(a => a.status === 'Terminé').length;
      categoryProgress[category] = Math.round((completedInCategory / categoryActions.length) * 100);
    }
  });
  
  return {
    totalActions,
    completedActions,
    overallProgress,
    criticalActions,
    overdueActions,
    upcomingDeadlines,
    budgetTotal,
    budgetSpent,
    averageCompletionTime,
    riskDistribution,
    categoryProgress
  };
}
