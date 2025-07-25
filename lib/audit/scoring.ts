import { AuditAnswer, AuditCategory, AuditResult } from '../../types/audit';
import { auditQuestions } from './questions';

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
  ]
};

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
  };
  const maxByCategory: Record<AuditCategory, number> = {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
  };

  for (const q of auditQuestions) {
    const ans = answers.find(a => a.questionId === q.id);
    const score = ans && ans.score !== undefined ? ans.score : 0;
    scoresByCategory[q.category] += score * (q.weight || 1);
    maxByCategory[q.category] += 5 * (q.weight || 1);
    total += score * (q.weight || 1);
    max += 5 * (q.weight || 1);
  }

  const globalScore = Math.round((total / max) * 100);
  const maturity = maturityLevels.slice().reverse().find(m => globalScore >= m.min)?.label || 'Faible';

  // Normaliser les scores par catégorie en pourcentage
  const normalizedScoresByCategory: Record<AuditCategory, number> = {} as Record<AuditCategory, number>;
  (Object.keys(scoresByCategory) as AuditCategory[]).forEach(cat => {
    normalizedScoresByCategory[cat] = Math.round((scoresByCategory[cat] / maxByCategory[cat]) * 100);
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

  return {
    globalScore,
    scoresByCategory: normalizedScoresByCategory,
    maturity,
    recommendations,
    roadmap,
  };
}

// Génération d'un plan d'action détaillé
export type ActionPlanItem = {
  action: string;
  category: AuditCategory;
  priority: 'Haute' | 'Moyenne' | 'Basse';
  deadline: string;
  owner: string;
};



export function generateActionPlan(result: AuditResult): ActionPlanItem[] {
  const actionPlan: ActionPlanItem[] = [];
  const categories = Object.entries(result.scoresByCategory) as [AuditCategory, number][];
  
  // Trier les catégories par score croissant
  categories.sort(([,a], [,b]) => a - b);
  
  // Définir les propriétaires par catégorie
  const ownersByCategory: Record<AuditCategory, string> = {
    Gouvernance: 'Direction',
    Technique: 'DSI',
    Organisationnel: 'DRH',
    GRC: 'RSSI',
    Sensibilisation: 'DRH',
    RGPD: 'DPO'
  };
  
  categories.forEach(([category, score]) => {
    const recommendations = recommendationsByCategory[category];
    if (score < 70) {
      recommendations.forEach((action) => {
        // Déterminer le propriétaire en fonction de l'action
        let owner = ownersByCategory[category];
        
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
          category,
          priority: score < 40 ? 'Haute' : score < 60 ? 'Moyenne' : 'Basse',
          deadline: score < 40 ? '1 mois' : score < 60 ? '3 mois' : '6 mois',
          owner,
        });
      });
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