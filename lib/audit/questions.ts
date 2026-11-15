import { AuditQuestion, CompanyProfile } from '../../types/audit';
import { getQuestionsForProfile } from './questions-extended';

// Questions de base - toujours posées
export const baseQuestions: AuditQuestion[] = [
  // Gouvernance
  {
    id: 'g1',
    category: 'Gouvernance',
    question: "Existe-t-il une politique de sécurité de l'information (PSI) formalisée et diffusée à tous les collaborateurs ?",
    description: "La politique doit être validée par la direction et communiquée à tous.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'g2',
    category: 'Gouvernance',
    question: "Un responsable de la sécurité (RSSI) est-il officiellement nommé ?",
    description: "Le RSSI doit avoir une lettre de mission et des moyens dédiés.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'g3',
    category: 'Gouvernance',
    question: "Les risques cybersécurité sont-ils régulièrement évalués et documentés ?",
    description: "Une analyse de risques doit être réalisée au moins une fois par an.",
    type: 'scale',
    weight: 2,
  },
  // Technique
  {
    id: 't1',
    category: 'Technique',
    question: "Les postes de travail et serveurs sont-ils maintenus à jour (patchs de sécurité) ?",
    description: "Inclut le système d'exploitation et les logiciels critiques.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 't2',
    category: 'Technique',
    question: "Un antivirus/EDR est-il déployé et supervisé sur tous les équipements ?",
    description: "La supervision doit permettre de détecter rapidement les incidents.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 't3',
    category: 'Technique',
    question: "Les sauvegardes sont-elles régulières, testées et stockées hors site ?",
    description: "Test de restauration au moins trimestriel, stockage hors site recommandé.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 't4',
    category: 'Technique',
    question: "L'accès distant (VPN, RDP, etc.) est-il protégé par une authentification forte (MFA) ?",
    description: "Le MFA est obligatoire pour tout accès externe.",
    type: 'boolean',
    weight: 2,
  },
  // Organisationnel
  {
    id: 'o1',
    category: 'Organisationnel',
    question: "Des campagnes de sensibilisation à la cybersécurité sont-elles organisées chaque année ?",
    description: "Tous les collaborateurs doivent être formés régulièrement.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'o2',
    category: 'Organisationnel',
    question: "Un plan de continuité/reprise d'activité (PCA/PRA) est-il formalisé et testé ?",
    description: "Le plan doit être documenté et testé au moins une fois par an.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'o3',
    category: 'Organisationnel',
    question: "Les droits d'accès sont-ils revus régulièrement (au moins 1 fois/an) ?",
    description: "Inclut la gestion des départs et des changements de poste.",
    type: 'scale',
    weight: 1,
  },
  // GRC
  {
    id: 'grc1',
    category: 'GRC',
    question: "L'organisation est-elle engagée dans une démarche de conformité (ISO 27001, HDS, etc.) ?",
    description: "Certification ou projet en cours.",
    type: 'choice',
    options: ['Non', 'Projet en cours', 'Certification obtenue'],
    weight: 2,
  },
  {
    id: 'grc2',
    category: 'GRC',
    question: "Une cartographie des risques métiers et SI est-elle réalisée et maintenue à jour ?",
    description: "La cartographie doit être revue au moins annuellement.",
    type: 'scale',
    weight: 2,
  },
  // RGPD : voir lib/audit/questions-extended.ts (rgpdQuestions), qui porte les questions
  // RGPD complètes avec leurs recommandations — ne pas en redéfinir ici (un doublon d'id
  // masquait silencieusement ces recommandations, voir rgpd1/rgpd2/rgpd3 avant ce commit).
  // Sensibilisation
  {
    id: 's1',
    category: 'Sensibilisation',
    question: "Des campagnes de phishing simulées sont-elles menées ?",
    description: "Au moins une fois par an.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 's2',
    category: 'Sensibilisation',
    question: "Les nouveaux arrivants reçoivent-ils une formation cybersécurité ?",
    description: "Formation obligatoire à l'arrivée.",
    type: 'boolean',
    weight: 1,
  },


// Questions sur la Supply Chain
{
  id: 'sc1',
  category: 'GRC',
  question: "Une évaluation des risques cyber des fournisseurs critiques est-elle réalisée ?",
  description: "Inclut l'analyse des contrats et des mesures de sécurité des prestataires.",
  type: 'scale',
  weight: 2,
},

// Questions sur la Gestion de Crise
{
  id: 'gc1',
  category: 'Organisationnel',
  question: "Une cellule de crise cyber est-elle définie avec des procédures d'escalade ?",
  description: "Inclut les contacts d'urgence et la communication de crise.",
  type: 'scale',
  weight: 2,
},

  // Hygiène cyber de base (PME) — mots de passe, MFA, messagerie, appareils, départs, fraude

  {
    id: 'h1',
    category: 'Technique',
    question: "Les mots de passe sont-ils robustes, uniques et gérés par un gestionnaire de mots de passe ?",
    description: "Pas de réutilisation, pas de mots de passe partagés ou notés sur papier.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h2',
    category: 'Technique',
    question: "L'authentification multifacteur (MFA) est-elle activée sur la messagerie, le cloud et les comptes administrateurs ?",
    description: "Priorité : messagerie, outils collaboratifs, banque en ligne, comptes à privilèges.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'h3',
    category: 'Technique',
    question: "Les comptes administrateurs sont-ils limités, nominatifs et distincts des comptes du quotidien ?",
    description: "Aucun usage quotidien (mail, web) avec un compte à privilèges.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h4',
    category: 'Technique',
    question: "La messagerie est-elle protégée (SPF, DKIM, DMARC, filtrage anti-spam et anti-phishing) ?",
    description: "Réduit l'usurpation de votre domaine et les courriels frauduleux.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h5',
    category: 'Technique',
    question: "Les ordinateurs portables et téléphones professionnels sont-ils chiffrés et verrouillés automatiquement ?",
    description: "Chiffrement du disque (BitLocker, FileVault) et verrouillage automatique.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h6',
    category: 'Technique',
    question: "Le réseau Wi-Fi et le pare-feu sont-ils sécurisés (Wi-Fi invité séparé, mot de passe changé, accès d'administration non exposés) ?",
    description: "Box ou routeur : mot de passe par défaut changé, administration non accessible depuis Internet.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h7',
    category: 'Technique',
    question: "La restauration d'une sauvegarde a-t-elle déjà été testée avec succès au cours des 12 derniers mois ?",
    description: "Une sauvegarde jamais restaurée n'est pas une garantie.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'h8',
    category: 'Organisationnel',
    question: "Les départs et arrivées sont-ils gérés (retrait des accès et récupération du matériel le jour du départ) ?",
    description: "Procédure arrivée / départ avec liste de comptes à fermer.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h9',
    category: 'Organisationnel',
    question: "Existe-t-il une charte informatique signée par les collaborateurs (usages, télétravail, appareils personnels) ?",
    description: "Cadre l'usage des outils et les règles de sécurité de base.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'h10',
    category: 'Organisationnel',
    question: "Existe-t-il un inventaire à jour des équipements, logiciels et services cloud utilisés ?",
    description: "Y compris les outils souscrits sans passer par l'informatique.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h11',
    category: 'Organisationnel',
    question: "Les contrats avec les prestataires informatiques et cloud comportent-ils des clauses de sécurité, de confidentialité et de réversibilité ?",
    description: "Inclut l'hébergeur, l'infogéreur, l'éditeur de logiciels métiers.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h12',
    category: 'Incidents',
    question: "Les collaborateurs savent-ils comment signaler un incident ou un courriel suspect, et à qui ?",
    description: "Un canal unique et connu de tous (adresse, numéro, procédure).",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h13',
    category: 'Incidents',
    question: "L'organisation a-t-elle déjà subi un incident de sécurité (hameçonnage abouti, ransomware, fuite) dont des leçons ont été tirées ?",
    description: "Répondre « Non » si aucun incident n'a eu lieu ou si rien n'a été formalisé.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'h14',
    category: 'Sensibilisation',
    question: "Les collaborateurs ont-ils été sensibilisés spécifiquement à la fraude au président et au faux virement ?",
    description: "Procédure de double validation pour tout changement de coordonnées bancaires.",
    type: 'boolean',
    weight: 2,
  },
];

/**
 * Génère les questions d'audit adaptées au profil de l'entreprise
 */
export function generateAdaptiveQuestions(profile: CompanyProfile): AuditQuestion[] {
  // Questions de base toujours incluses
  let questions = [...baseQuestions];
  
  // Ajouter les questions spécifiques aux réglementations applicables
  const extendedQuestions = getQuestionsForProfile(profile.applicableRegulations, profile.sector);
  questions = questions.concat(extendedQuestions);
  
  // Filtrer les doublons par ID
  const uniqueQuestions = questions.filter((question, index, self) => 
    index === self.findIndex(q => q.id === question.id)
  );
  
  return uniqueQuestions;
}

/**
 * Obtient toutes les questions pour un profil donné (fonction principale)
 */
export function getAuditQuestions(profile?: CompanyProfile): AuditQuestion[] {
  if (!profile) {
    return baseQuestions;
  }
  
  return generateAdaptiveQuestions(profile);
}

/**
 * Questions par catégorie pour l'affichage organisé
 */
export function getQuestionsByCategory(profile?: CompanyProfile): Record<string, AuditQuestion[]> {
  const questions = getAuditQuestions(profile);
  
  return questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {} as Record<string, AuditQuestion[]>);
}

/**
 * Calcule le nombre total de questions selon le profil
 */
export function getTotalQuestionCount(profile?: CompanyProfile): number {
  return getAuditQuestions(profile).length;
}

/**
 * Obtient les catégories applicables selon le profil
 */
export function getApplicableCategories(profile?: CompanyProfile): string[] {
  const questionsByCategory = getQuestionsByCategory(profile);
  return Object.keys(questionsByCategory);
}

// Export de compatibilité - utilise les questions de base par défaut
export const auditQuestions = baseQuestions;