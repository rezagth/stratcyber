import { AuditAnswer, AuditCategory, AuditResult, AuditQuestion, ComplianceScore } from '../../types/audit';
import { auditQuestions } from './questions';
import { rgpdQuestions, nis2Questions, doraQuestions, lmpQuestions, incidentQuestions, supplyChainQuestions, cloudQuestions, craQuestions, sectorSpecificQuestions } from './questions-extended';

const maturityLevels = [
  { min: 0, label: 'Faible' },
  { min: 40, label: 'Moyenne' },
  { min: 70, label: 'Élevée' },
];

const recommendationsByCategory: Record<AuditCategory, string[]> = {
  Gouvernance: [
    "Formaliser une politique de sécurité.",
    "Désigner un responsable cybersécurité.",
    "Mettre en place un processus de gestion des incidents."
  ],
  Technique: [
    "Déployer un antivirus à jour.",
    "Mettre en place des sauvegardes régulières.",
    "Sécuriser les accès distants."
  ],
  Organisationnel: [
    "Organiser des sessions de sensibilisation.",
    "Élaborer un plan de continuité/reprise.",
    "Revoir les droits d’accès périodiquement."
  ],
  GRC: [
    "Initier une démarche de certification ISO 27001.",
    "Réaliser une cartographie des risques."
  ],
  Sensibilisation: [
    "Lancer des campagnes de phishing.",
    "Former les nouveaux arrivants."
  ],
  RGPD: [
    "Nommer un DPO.",
    "Documenter les traitements de données."
  ],
  NIS2: [
    "Élaborer une stratégie de gestion des risques cybersécurité.",
    "Mettre en place un processus de notification des incidents.",
    "Tester le plan de continuité d'activité."
  ],
  DORA: [
    "Mettre en place une gestion des risques opérationnels.",
    "Élaborer un plan de gestion des incidents informatiques.",
    "Tester la résilience des systèmes critiques."
  ],
  CRA: [
    "Évaluer la résilience des produits numériques.",
    "Mettre en place un processus de divulgation des vulnérabilités.",
    "Évaluer la sécurité de la chaîne d'approvisionnement."
  ],
  LPM: [
    "Identifier les actifs d'information sensibles.",
    "Mettre en place une gestion des risques cyber pour les PME.",
    "Former les dirigeants aux enjeux cyber."
  ],
  Incidents: [
    "Élaborer un plan de gestion des incidents de sécurité.",
    "Former le personnel à la détection des incidents.",
    "Mettre en place un système de veille sur les menaces."
  ],
  SupplyChain: [
    "Évaluer les risques liés aux fournisseurs.",
    "Mettre en place des exigences de sécurité pour les fournisseurs.",
    "Auditer régulièrement les fournisseurs critiques."
  ],
  Cloud: [
    "Mettre en place une gouvernance des services cloud.",
    "Évaluer la sécurité des fournisseurs de services cloud.",
    "Chiffrer les données sensibles dans le cloud."
  ],
  Secteur: [
    "Adapter la gouvernance cyber aux spécificités du secteur.",
    "Identifier les obligations réglementaires sectorielles.",
    "Mettre en place des mesures de sécurité spécifiques au secteur."
  ]
};

// Combine all questions from all sets
// Note: sectorSpecificQuestions is a Record type, so we flatten all sector questions
const allAuditQuestions: AuditQuestion[] = [
  ...auditQuestions,
  ...rgpdQuestions,
  ...nis2Questions,
  ...doraQuestions,
  ...lmpQuestions,
  ...incidentQuestions,
  ...supplyChainQuestions,
  ...cloudQuestions,
  ...craQuestions,
  // Flatten sector specific questions from all sectors
  ...Object.values(sectorSpecificQuestions).flat()
];

export function computeAuditResult(answers: AuditAnswer[]): AuditResult {
  let total = 0;
  let max = 0;
  const scoresByCategory: Record<AuditCategory, number> = {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
    NIS2: 0,
    DORA: 0,
    CRA: 0,
    LPM: 0,
    Incidents: 0,
    SupplyChain: 0,
    Cloud: 0,
    Secteur: 0
  };
  const maxByCategory: Record<AuditCategory, number> = {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
    NIS2: 0,
    DORA: 0,
    CRA: 0,
    LPM: 0,
    Incidents: 0,
    SupplyChain: 0,
    Cloud: 0,
    Secteur: 0
  };

  // Construire une map pour retrouver rapidement les questions par id
  const questionMap = new Map(allAuditQuestions.map(q => [q.id, q]));

  // Parcourir uniquement les réponses fournies
  answers.forEach(ans => {
    const q = questionMap.get(ans.questionId);
    if (!q) return; // Question inconnue (au cas où)

    const weight = q.weight || 1;
    const score = ans.score !== undefined ? ans.score : 0;

    scoresByCategory[q.category] += score * weight;
    maxByCategory[q.category] += 5 * weight;

    total += score * weight;
    max += 5 * weight;
  });

  const globalScore = Math.round((total / max) * 100);
  const maturity = maturityLevels.slice().reverse().find(m => globalScore >= m.min)?.label || 'Faible';

  // Normaliser les scores par catégorie en pourcentage
  const normalizedScoresByCategory: Record<AuditCategory, number> = {} as Record<AuditCategory, number>;
  (Object.keys(scoresByCategory) as AuditCategory[]).forEach(cat => {
    const maxCat = maxByCategory[cat];
    if (maxCat > 0) {
      normalizedScoresByCategory[cat] = Math.round((scoresByCategory[cat] / maxCat) * 100);
    }
  });

  // Recommandations et roadmap (par catégorie < 70%)
  const recommendations: string[] = [];
  const roadmap: string[] = [];
  (Object.keys(normalizedScoresByCategory) as AuditCategory[]).forEach(cat => {
    const percent = normalizedScoresByCategory[cat];
    if (percent < 70) {
      recommendations.push(...recommendationsByCategory[cat]);
      roadmap.push(`Renforcer la maturité sur le domaine ${cat}`);
    }
  });

  // Calcul des scores de conformité par réglementation
  const complianceScores: ComplianceScore[] = [
    {
      regulation: 'RGPD',
      score: normalizedScoresByCategory.RGPD || 0,
      mandatoryGaps: [],
      riskLevel: 'LOW',
      estimatedFine: 0,
    },
    {
      regulation: 'NIS2',
      score: normalizedScoresByCategory.NIS2 || 0,
      mandatoryGaps: [],
      riskLevel: 'LOW',
      estimatedFine: 0,
    },
    {
      regulation: 'DORA',
      score: normalizedScoresByCategory.DORA || 0,
      mandatoryGaps: [],
      riskLevel: 'LOW',
      estimatedFine: 0,
    },
    {
      regulation: 'CRA',
      score: normalizedScoresByCategory.CRA || 0,
      mandatoryGaps: [],
      riskLevel: 'LOW',
      estimatedFine: 0,
    },
    {
      regulation: 'LPM',
      score: normalizedScoresByCategory.LPM || 0,
      mandatoryGaps: [],
      riskLevel: 'LOW',
      estimatedFine: 0,
    }
  ];

  // Mise à jour des niveaux de risque en fonction des scores
  complianceScores.forEach(score => {
    if (score.score < 40) {
      score.riskLevel = 'CRITICAL';
      score.estimatedFine = 10000000; // 10M€ pour RGPD
    } else if (score.score < 60) {
      score.riskLevel = 'HIGH';
      score.estimatedFine = 2000000; // 2M€
    } else if (score.score < 80) {
      score.riskLevel = 'MEDIUM';
      score.estimatedFine = 200000; // 200K€
    } else {
      score.riskLevel = 'LOW';
      score.estimatedFine = 0;
    }
  });

  // Calcul du score de risque légal (inverse du score global)
  const legalRiskScore = Math.round(100 - globalScore);

  return {
    globalScore,
    scoresByCategory: normalizedScoresByCategory,
    maturity,
    recommendations,
    roadmap,
    complianceScores,
    legalRiskScore,
    mandatoryActions: [],
    optionalActions: [],
  };
}

// Compliance helper for dashboard
export function inferComplianceFromCategory(category: AuditCategory): string[] {
  switch (category) {
    case 'Gouvernance':
      return ['NIS2', 'LPM'];
    case 'Technique':
      return ['NIS2', 'DORA', 'CRA'];
    case 'Organisationnel':
      return ['NIS2', 'LPM'];
    case 'GRC':
      return ['NIS2', 'DORA'];
    case 'Sensibilisation':
      return ['NIS2'];
    case 'RGPD':
      return ['RGPD'];
    default:
      return [];
  }
}

// Génération d'un plan d'action détaillé
import type { ActionStatus } from '../../types/actionPlan';

export type ActionPlanItem = {
  action: string;
  category: AuditCategory;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  deadline: string;
  owner: string;
  compliance?: string[]; // RGPD, NIS2, DORA, etc.
  status?: ActionStatus; // 'En cours', 'Terminé', ...
};



export function generateActionPlan(result: AuditResult, answers: AuditAnswer[]): ActionPlanItem[] {
  const actionPlan: ActionPlanItem[] = [];
  
  // Create a combined array of all possible questions
  const allQuestions: AuditQuestion[] = [
    ...auditQuestions,
    ...rgpdQuestions,
    ...nis2Questions,
    ...doraQuestions,
    ...lmpQuestions,
    ...incidentQuestions,
    ...supplyChainQuestions,
    ...cloudQuestions,
    ...craQuestions,
    // Add sector specific questions
    ...Object.values(sectorSpecificQuestions).flat()
  ];
  
  // Définir les propriétaires par catégorie
  const ownersByCategory: Record<AuditCategory, string> = {
    Gouvernance: 'Direction',
    Technique: 'DSI',
    Organisationnel: 'DRH',
    GRC: 'RSSI',
    Sensibilisation: 'DRH',
    RGPD: 'DPO',
    NIS2: 'RSSI',
    DORA: 'RSSI',
    CRA: 'RSSI',
    LPM: 'RSSI',
    Incidents: 'DSI',
    SupplyChain: 'RSSI',
    Cloud: 'DSI',
    Secteur: 'Direction'
  };
  
  // Generate actions based on individual question responses
  answers.forEach((answer) => {
    const question = allQuestions.find(q => q.id === answer.questionId);
    if (question && question.actionRecommendations) {
      // For boolean questions with negative answers
      if (question.type === 'boolean' && 
          (answer.answer.toLowerCase() === 'non' || answer.answer.toLowerCase() === 'no' || answer.answer.toLowerCase() === 'false') &&
          question.actionRecommendations.negativeAnswer) {
        question.actionRecommendations.negativeAnswer.forEach((action) => {
          let owner = ownersByCategory[question.category] || 'Direction';
          
          // Ajuster le propriétaire pour certaines actions spécifiques
          if (action.includes('antivirus') || action.includes('sauvegardes')) {
            owner = 'DSI';
          } else if (action.includes('sensibilisation') || action.includes('former')) {
            owner = 'DRH';
          } else if (action.includes('DPO') || action.includes('RGPD')) {
            owner = 'DPO';
          } else if (action.includes('certification') || action.includes('risques')) {
            owner = 'RSSI';
          }
          
          actionPlan.push({
            action,
            category: question.category,
            priority: 'Haute',
            deadline: '1 mois',
            owner,
            compliance: inferComplianceFromCategory(question.category),
            status: 'En cours',
          });
        });
      }
      
      // For scale questions with low scores (0-2)
      if (question.type === 'scale' && 
          answer.score !== undefined && 
          answer.score <= 2 &&
          question.actionRecommendations.lowScore) {
        question.actionRecommendations.lowScore.forEach((action) => {
          let owner = ownersByCategory[question.category] || 'Direction';
          
          // Ajuster le propriétaire pour certaines actions spécifiques
          if (action.includes('antivirus') || action.includes('sauvegardes')) {
            owner = 'DSI';
          } else if (action.includes('sensibilisation') || action.includes('former')) {
            owner = 'DRH';
          } else if (action.includes('DPO') || action.includes('RGPD')) {
            owner = 'DPO';
          } else if (action.includes('certification') || action.includes('risques')) {
            owner = 'RSSI';
          }
          
          actionPlan.push({
            action,
            category: question.category,
            priority: answer.score <= 1 ? 'Haute' : 'Moyenne',
            deadline: answer.score <= 1 ? '1 mois' : '3 mois',
            owner,
            compliance: inferComplianceFromCategory(question.category),
            status: 'En cours',
          });
        });
      }
      
      // For choice questions with low scores (0-2)
      if (question.type === 'choice' && 
          answer.score !== undefined && 
          answer.score <= 2 &&
          question.actionRecommendations.lowScore) {
        question.actionRecommendations.lowScore.forEach((action) => {
          let owner = ownersByCategory[question.category] || 'Direction';
          
          // Ajuster le propriétaire pour certaines actions spécifiques
          if (action.includes('antivirus') || action.includes('sauvegardes')) {
            owner = 'DSI';
          } else if (action.includes('sensibilisation') || action.includes('former')) {
            owner = 'DRH';
          } else if (action.includes('DPO') || action.includes('RGPD')) {
            owner = 'DPO';
          } else if (action.includes('certification') || action.includes('risques')) {
            owner = 'RSSI';
          }
          
          actionPlan.push({
            action,
            category: question.category,
            priority: answer.score <= 1 ? 'Haute' : 'Moyenne',
            deadline: answer.score <= 1 ? '1 mois' : '3 mois',
            owner,
            compliance: inferComplianceFromCategory(question.category),
            status: 'En cours',
          });
        });
      }
    }
  });

  return actionPlan;
}

// Ajout d'une fonction pour calculer les tendances
export function calculateTrends(audits: AuditResult[]): Record<AuditCategory, number> {
  if (audits.length < 2) return {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
  };
  
  const trends: Record<AuditCategory, number> = {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
  };
  const categories = Object.keys(audits[0].scoresByCategory) as AuditCategory[];
  
  categories.forEach(category => {
    const current = audits[0].scoresByCategory[category];
    const previous = audits[1].scoresByCategory[category];
    trends[category] = ((current - previous) / previous) * 100;
  });
  
  return trends;
}

// Calcul du "Crazy Score" - un indicateur ludique de la maturité cyber
export function calculateCrazyScore(result: AuditResult): {
  score: number;
  label: string;
  emoji: string;
} {
  const { globalScore } = result;
  
  // Calculer le nombre de catégories critiques (score < 40)
  const criticalCategories = Object.values(result.scoresByCategory).filter(score => score < 40).length;
  
  // Calculer le nombre de catégories conformes (score >= 70)
  const compliantCategories = Object.values(result.scoresByCategory).filter(score => score >= 70).length;
  
  // Base: score global
  let crazyScore = globalScore;
  
  // Bonus/Malus en fonction des catégories
  crazyScore -= criticalCategories * 10; // Malus pour chaque catégorie critique
  crazyScore += compliantCategories * 5; // Bonus pour chaque catégorie conforme
  
  // Limiter le score entre 0 et 100
  crazyScore = Math.max(0, Math.min(100, crazyScore));
  
  // Déterminer le label et l'emoji en fonction du score
  let label = '';
  let emoji = '';
  
  if (crazyScore < 20) {
    label = 'Catastrophique';
    emoji = '☠️';
  } else if (crazyScore < 40) {
    label = 'Dangereux';
    emoji = '🔥';
  } else if (crazyScore < 60) {
    label = 'Fragile';
    emoji = '⚠️';
  } else if (crazyScore < 80) {
    label = 'Solide';
    emoji = '💪';
  } else {
    label = 'Excellent';
    emoji = '🚀';
  }
  
  return { score: Math.round(crazyScore), label, emoji };
}