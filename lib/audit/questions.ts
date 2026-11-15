import { AuditQuestion, CompanyProfile } from '../../types/audit';
import { getQuestionsForProfile } from './questions-extended';

// Questions de base - toujours posées
export const baseQuestions: AuditQuestion[] = [
  // Gouvernance
  {
    id: 'g1',
    category: 'Gouvernance',
    question: "Des objectifs généraux de sécurité et de protection des données, validés par la direction, sont-ils formalisés ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 1 « Piloter la sécurité des données » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
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
    question: "Les activités à protéger en priorité et les systèmes d'information associés sont-ils identifiés ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Gouvernance »), lu le 15/11/2026.",
    type: 'scale',
    weight: 2,
  },
  // Technique
  {
    id: 't1',
    category: 'Technique',
    question: "Les mises à jour de sécurité sont-elles appliquées sur tous les équipements (ordinateurs, tablettes, téléphones) dès qu'elles sont proposées ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 3).",
    type: 'scale',
    weight: 2,
  },
  {
    id: 't2',
    category: 'Technique',
    question: "Un antivirus et/ou EDR est-il déployé sur l'ensemble des équipements et services ?",
    description: "Sources : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 4) ; ANSSI, MonAideCyber (thème « Sécurité des postes »), lus le 15/11/2026.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 't3',
    category: 'Technique',
    question: "Les données sont-elles sauvegardées régulièrement, avec une copie conservée hors de l'équipement (support externe débranché après la sauvegarde) ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 2).",
    type: 'scale',
    weight: 2,
  },
  {
    id: 't4',
    category: 'Technique',
    question: "Le télétravail et les accès distants (cloud inclus) sont-ils protégés par une authentification multifacteur ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des accès »), lu le 15/11/2026.",
    type: 'boolean',
    weight: 2,
  },
  // Organisationnel
  {
    id: 'o1',
    category: 'Organisationnel',
    question: "Des actions de sensibilisation à la menace et aux bonnes pratiques cyber sont-elles réalisées auprès du personnel ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sensibilisation »), lu le 15/11/2026.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'o2',
    category: 'Organisationnel',
    question: "Un plan de continuité et de reprise d'activité informatique, même sommaire, est-il rédigé (avec la liste des intervenants) et testé régulièrement ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 18 « Prévoir la continuité et la reprise d'activité » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'o3',
    category: 'Organisationnel',
    question: "Les habilitations sont-elles revues au moins une fois par an (comptes inutilisés supprimés, droits réalignés sur les fonctions) ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 5 « Gérer les habilitations » (lu le 15/11/2026).",
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
    question: "Avant de confier des données à un prestataire, ses garanties de sécurité (politique de sécurité, certifications) sont-elles vérifiées ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 14 « Gérer la sous-traitance » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },

// Questions sur la Gestion de Crise
{
  id: 'gc1',
  category: 'Organisationnel',
  question: "Une liste imprimée des personnes à contacter en cas de crise (internes et externes) est-elle disponible ?",
  description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Réaction »), lu le 15/11/2026.",
  type: 'scale',
  weight: 2,
},

  // Hygiène cyber de base (PME) — mots de passe, MFA, messagerie, appareils, départs, fraude

  {
    id: 'h1',
    category: 'Technique',
    question: "Les mots de passe sont-ils suffisamment longs et complexes, différents d'un service à l'autre, et gérés avec un gestionnaire de mots de passe ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 1).",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h2',
    category: 'Technique',
    question: "La double authentification (MFA) est-elle activée partout où les services le permettent (messagerie, cloud, comptes administrateurs…) ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 1 : « activez la double authentification chaque fois que possible »).",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'h3',
    category: 'Technique',
    question: "Les administrateurs disposent-ils de comptes dédiés aux tâches d'administration, réservés à leur usage, et les comptes à privilèges inactifs ou inutiles sont-ils désactivés ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des accès »), lu le 15/11/2026.",
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
    question: "Les ordinateurs portables et supports de stockage mobiles sont-ils chiffrés, et les smartphones verrouillés automatiquement par un secret ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 7 « Sécuriser l'informatique mobile », et règles essentielles de la CNIL du 19/06/2026 (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h6',
    category: 'Technique',
    question: "Les flux entre vos systèmes et Internet sont-ils filtrés ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des postes »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h7',
    category: 'Technique',
    question: "La restauration d'une sauvegarde a-t-elle déjà été testée avec succès au cours des 12 derniers mois ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Réaction »), lu le 15/11/2026.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'h8',
    category: 'Organisationnel',
    question: "Les permissions d'accès sont-elles supprimées dès qu'une personne change de poste ou quitte l'organisation ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 5 « Gérer les habilitations » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h9',
    category: 'Organisationnel',
    question: "Le respect d'une charte d'utilisation du système d'information est-il exigé du personnel ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sensibilisation »), lu le 15/11/2026.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'h10',
    category: 'Organisationnel',
    question: "Le système d'information est-il documenté (inventaire formalisé des équipements, logiciels et services, plan du système d'information) ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Gouvernance »), lu le 15/11/2026.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'h11',
    category: 'Organisationnel',
    question: "Des exigences de cybersécurité sont-elles intégrées aux contrats des prestataires qui disposent d'accès informatiques ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Gouvernance »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h12',
    category: 'Incidents',
    question: "La conduite à tenir et la liste des personnes à contacter en cas d'incident de sécurité sont-elles diffusées à tous, avec consigne de signaler tout événement suspect ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 19 « Gérer les incidents et les violations » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'h13',
    category: 'Incidents',
    question: "L'organisation est-elle en mesure d'améliorer sa gestion de crise après un incident ou un exercice ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Réaction »), lu le 15/11/2026.",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'h14',
    category: 'Sensibilisation',
    question: "Toute demande de virement vers un RIB nouveau reçu par message est-elle confirmée auprès du créancier, en l'appelant sur son numéro habituel ?",
    description: "Source : Cybermalveillance.gouv.fr, « Que faire en cas de fraude au virement ou au faux RIB ? » (mise à jour 14/10/2026, lu le 15/11/2026).",
    type: 'boolean',
    weight: 1,
  },
  // Questions tirées des 10 mesures essentielles de Cybermalveillance.gouv.fr (page lue le 15/11/2026).
  {
    id: 'n1',
    category: 'Technique',
    question: "Les applications sont-elles installées uniquement depuis les sites ou magasins officiels des éditeurs ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 5).",
    type: 'boolean',
    weight: 1,
  },
  {
    id: 'n2',
    category: 'Sensibilisation',
    question: "Face à un message inattendu ou alarmiste (e-mail, SMS, messagerie), les collaborateurs demandent-ils confirmation à l'émetteur par un autre moyen ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 6).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n3',
    category: 'Organisationnel',
    question: "Les usages personnels et professionnels sont-ils séparés (matériel, messageries, espaces de stockage en ligne) ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 9).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n4',
    category: 'Technique',
    question: "En déplacement, les collaborateurs évitent-ils les réseaux Wi-Fi publics ou inconnus (connexion mobile privilégiée, VPN si aucun autre choix) ?",
    description: "Source : Cybermalveillance.gouv.fr, « Les 10 mesures essentielles pour votre cybersécurité » (mesure 10).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n5',
    category: 'Incidents',
    question: "Le personnel est-il entraîné aux bons réflexes à adopter en cas de cyberattaque ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Réaction »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n6',
    category: 'Technique',
    question: "Les mots de passe et autres secrets par défaut des équipements et logiciels sont-ils systématiquement modifiés ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des postes »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n7',
    category: 'Gouvernance',
    question: "Un suivi des alertes de cybersécurité et des vulnérabilités publiées pouvant vous affecter est-il réalisé ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Gouvernance »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n8',
    category: 'Technique',
    question: "Les systèmes sont-ils cloisonnés de l'extérieur ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des postes »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n9',
    category: 'Technique',
    question: "Les utilisateurs sont-ils privés des droits d'administrateur sur leur poste ?",
    description: "Source : ANSSI, MonAideCyber (référentiel du diagnostic cyber, thème « Sécurité des accès »), lu le 15/11/2026.",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n10',
    category: 'Gouvernance',
    question: "Une analyse de risques, même minimale, a-t-elle été menée sur les traitements de données personnelles ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 20 « Analyse de risques » (lu le 15/11/2026).",
    type: 'scale',
    weight: 1,
  },
  {
    id: 'n11',
    category: 'Gouvernance',
    question: "Avez-vous vérifié si votre entité est concernée par la directive NIS 2 (test en ligne de l'ANSSI sur MesServicesCyber) ?",
    description: "Source : ANSSI, MesServicesCyber, page NIS 2 (lue le 15/11/2026) : la transposition en France est en cours ; un test en ligne permet de savoir si l'entité est régulée et dans quelle catégorie. Ne crée aucune obligation à ce jour.",
    type: 'boolean',
    weight: 1,
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