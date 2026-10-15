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
  const answerByQuestionId = new Map(answers.map(a => [a.questionId, a]));

  const unansweredByCategory: Record<AuditCategory, number> = {
    Gouvernance: 0, Technique: 0, Organisationnel: 0, GRC: 0, Sensibilisation: 0,
    RGPD: 0, NIS2: 0, DORA: 0, CRA: 0, LPM: 0, Incidents: 0, SupplyChain: 0, Cloud: 0, Secteur: 0,
    ISO27001: 0, EBIOS: 0,
  };

  // Catégories réellement concernées par cet audit (déduites des réponses fournies, jamais
  // du catalogue global : une entreprise hors périmètre DORA ne doit pas être pénalisée pour
  // ne pas avoir répondu à des questions DORA qui ne lui ont jamais été posées).
  const presentCategories = new Set<AuditCategory>();
  answers.forEach(ans => {
    const q = questionMap.get(ans.questionId);
    if (q) presentCategories.add(q.category);
  });
  // Les questions sectorielles couvrent TOUS les secteurs dans le catalogue global : impossible
  // de distinguer ici le secteur de l'entreprise, donc on ne complète pas cette catégorie au-delà
  // des réponses fournies (pas de risque de compter les questions d'un autre secteur).
  const SECTOR_SENSITIVE_CATEGORIES: AuditCategory[] = ['Secteur'];

  // Parcourir toutes les questions des catégories concernées par cet audit : une question
  // applicable mais non répondue compte comme un score de 0 (elle ne doit jamais être
  // silencieusement exclue du dénominateur, sous peine de gonfler artificiellement le score).
  allAuditQuestions.forEach(q => {
    if (!presentCategories.has(q.category)) return;

    const ans = answerByQuestionId.get(q.id);
    const isSectorSensitive = SECTOR_SENSITIVE_CATEGORIES.includes(q.category);
    if (!ans && isSectorSensitive) return;

    const hasAnswer = !!ans && typeof ans.answer === 'string' && ans.answer.trim() !== '';
    const weight = q.weight || 1;
    // Une note hors de l'échelle 0–5 (ou non numérique, ou absente) ne doit jamais gonfler ni fausser le score.
    const rawScore = hasAnswer && typeof ans!.score === 'number' && Number.isFinite(ans!.score) ? ans!.score : 0;
    const score = Math.min(5, Math.max(0, rawScore));

    if (!hasAnswer) {
      unansweredByCategory[q.category] += 1;
    }

    scoresByCategory[q.category] += score * weight;
    maxByCategory[q.category] += 5 * weight;

    total += score * weight;
    max += 5 * weight;
  });

  // Aucune réponse exploitable : score 0 (et non NaN, qui serait stocké en base et affiché dans le rapport).
  const globalScore = max > 0 ? Math.round((total / max) * 100) : 0;
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

  // Plafonds légaux indicatifs par réglementation. Montants maximaux publiés au niveau
  // du texte (hors calcul % du CA, non disponible ici). Toujours à faire valider par un
  // juriste avant diffusion à un client — voir `fineNote`.
  // `null` = pas de plafond chiffré harmonisé : afficher une note plutôt qu'un montant.
  const REGULATION_FINE_CEILINGS: Partial<Record<AuditCategory, { amount: number; note: string } | null>> = {
    RGPD: {
      amount: 20_000_000,
      note: "Plafond maximal (RGPD, art. 83) : 20 M€ ou 4 % du chiffre d'affaires annuel mondial, le montant le plus élevé étant retenu. Montant indicatif, à confirmer avec un juriste.",
    },
    NIS2: {
      amount: 10_000_000,
      note: "Plafond indicatif pour les entités essentielles (NIS2, art. 34) : 10 M€ ou 2 % du CA mondial. Transposition française non finalisée à ce jour — montant à titre indicatif.",
    },
    CRA: {
      amount: 15_000_000,
      note: "Plafond maximal (Cyber Resilience Act, art. 64) pour un manquement aux exigences essentielles : 15 M€ ou 2,5 % du CA mondial. Montant indicatif.",
    },
    DORA: null,
    LPM: null,
  };
  const NO_HARMONIZED_CEILING_NOTE: Record<string, string> = {
    DORA: "DORA ne fixe pas de plafond d'amende harmonisé pour les entités financières : les sanctions sont déterminées par l'autorité nationale compétente. Les fournisseurs TIC critiques s'exposent à des astreintes de l'ordre de 1 % du chiffre d'affaires journalier moyen. À faire valider avec un juriste.",
    LPM: "Le régime de sanctions LPM (opérateurs d'importance vitale, code de la défense) n'est pas un pourcentage du CA et dépend du manquement constaté. Pas de montant générique fiable à afficher ici — à faire valider avec un juriste.",
  };

  // Calcul des scores de conformité par réglementation
  const complianceScores: ComplianceScore[] = (['RGPD', 'NIS2', 'DORA', 'CRA', 'LPM'] as const).map(regulation => ({
    regulation,
    score: normalizedScoresByCategory[regulation] || 0,
    mandatoryGaps: [],
    riskLevel: 'LOW' as const,
    estimatedFine: 0,
  }));

  // Mise à jour des niveaux de risque et de l'amende indicative en fonction du score.
  // Le plafond légal (ou son absence) dépend de la réglementation, pas d'un barème unique.
  complianceScores.forEach(compliance => {
    if (compliance.score < 40) {
      compliance.riskLevel = 'CRITICAL';
    } else if (compliance.score < 60) {
      compliance.riskLevel = 'HIGH';
    } else if (compliance.score < 80) {
      compliance.riskLevel = 'MEDIUM';
    } else {
      compliance.riskLevel = 'LOW';
    }

    const ceiling = REGULATION_FINE_CEILINGS[compliance.regulation as AuditCategory];
    if (ceiling === null || ceiling === undefined) {
      compliance.estimatedFine = 0;
      if (compliance.riskLevel !== 'LOW') {
        compliance.fineNote = NO_HARMONIZED_CEILING_NOTE[compliance.regulation];
      }
    } else if (compliance.riskLevel === 'LOW') {
      compliance.estimatedFine = 0;
    } else {
      compliance.estimatedFine = ceiling.amount;
      compliance.fineNote = ceiling.note;
    }
  });

  // Calcul du score de risque légal (inverse du score global)
  const legalRiskScore = Math.round(100 - globalScore);

  return {
    globalScore,
    scoresByCategory: normalizedScoresByCategory,
    unansweredByCategory,
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