/**
 * Mapping des catégories d'actions vers la documentation de compliance
 * Ce fichier permet de lier les actions de la roadmap à la documentation appropriée
 */

interface ComplianceDoc {
  link: string;
  title: string;
  description: string;
}

const complianceDocs: Record<string, ComplianceDoc> = {
  'RGPD': {
    link: '/compliance/rgpd',
    title: 'Documentation RGPD',
    description: 'Règlement Général sur la Protection des Données - Guide complet et ressources pratiques'
  },
  'NIS2': {
    link: '/compliance/nis2',
    title: 'Documentation NIS2',
    description: 'Directive Network and Information Systems 2 - Obligations et mise en conformité'
  },
  'DORA': {
    link: '/compliance/dora',
    title: 'Documentation DORA',
    description: 'Digital Operational Resilience Act - Résilience opérationnelle pour le secteur financier'
  },
  'ISO27001': {
    link: '/compliance/iso27001',
    title: 'Documentation ISO 27001',
    description: 'Norme ISO 27001 - Management de la Sécurité de l\'Information'
  },
  'ANSSI': {
    link: '/compliance/anssi',
    title: 'Documentation ANSSI',
    description: 'Agence Nationale de la Sécurité des SI - Guides et bonnes pratiques'
  },
  'EBIOS': {
    link: '/compliance/ebios',
    title: 'Documentation EBIOS RM',
    description: 'Méthode d\'analyse et d\'évaluation des risques numériques'
  },
  'LPM': {
    link: '/compliance/anssi', // Redirection vers ANSSI car LPM relève de l'ANSSI
    title: 'Documentation LPM',
    description: 'Loi de Programmation Militaire - Obligations de cybersécurité'
  },
  'CRA': {
    link: '/compliance/cra',
    title: 'Documentation CRA',
    description: 'Cyber Resilience Act - Règlement européen sur la résilience cybernétique'
  },
  'SupplyChain': {
    link: '/compliance/supply-chain',
    title: 'Sécurisation de la Supply Chain',
    description: 'Guide complet StratCyber pour sécuriser votre chaîne d\'approvisionnement numérique'
  },
  'Gouvernance': {
    link: '/compliance/iso27001',
    title: 'Gouvernance Cybersécurité',
    description: 'Gouvernance et management de la sécurité de l\'information'
  },
  'Technique': {
    link: '/compliance/anssi',
    title: 'Mesures Techniques',
    description: 'Guides techniques ANSSI et bonnes pratiques de sécurité'
  },
  'Organisationnel': {
    link: '/compliance/iso27001',
    title: 'Mesures Organisationnelles',
    description: 'Organisation et processus de sécurité'
  },
  'Sensibilisation': {
    link: '/compliance/security-awareness',
    title: 'Sensibilisation Sécurité',
    description: 'Programme StratCyber de sensibilisation et formation cybersécurité'
  },
  'Incidents': {
    link: '/compliance/incident-response',
    title: 'Gestion d\'Incidents',
    description: 'Guide StratCyber pour la gestion et réponse aux incidents cybersécurité'
  },
  'Cloud': {
    link: '/compliance/cloud-security',
    title: 'Sécurité Cloud',
    description: 'Guide StratCyber pour la sécurisation des environnements cloud et multi-cloud'
  },
  'GRC': {
    link: '/compliance/iso27001',
    title: 'Governance, Risk & Compliance',
    description: 'Gouvernance, gestion des risques et conformité'
  },
  'Secteur': {
    link: '/compliance', // Page principale
    title: 'Conformité Sectorielle',
    description: 'Réglementations spécifiques par secteur d\'activité'
  }
};

export default complianceDocs;
