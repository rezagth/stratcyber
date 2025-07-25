import { AuditQuestion } from '../../types/audit';

export const auditQuestions: AuditQuestion[] = [
  // Gouvernance
  {
    id: 'g1',
    category: 'Gouvernance',
    question: "Existe-t-il une politique de sécurité de l'information formalisée et diffusée à tous les collaborateurs ?",
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
  // RGPD
  {
    id: 'rgpd1',
    category: 'RGPD',
    question: "Un DPO est-il désigné et les obligations RGPD sont-elles respectées ?",
    description: "DPO interne ou externe, registre des traitements, droits des personnes.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'rgpd2',
    category: 'RGPD',
    question: "Les traitements de données personnelles sont-ils documentés et cartographiés ?",
    description: "Registre des traitements à jour.",
    type: 'scale',
    weight: 1,
  },
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

// Questions sur la Conformité
{
  id: 'rgpd3',
  category: 'RGPD',
  question: "Les analyses d'impact (AIPD) sont-elles réalisées pour les traitements sensibles ?",
  description: "Conformément aux exigences du RGPD pour les traitements à risque.",
  type: 'boolean',
  weight: 2,
}
];