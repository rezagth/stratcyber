import { AuditQuestion, RegulationScope, CompanySector } from '../../types/audit';

/**
 * Questions RGPD complètes (15 questions)
 */
export const rgpdQuestions: AuditQuestion[] = [
  {
    id: 'rgpd1',
    category: 'RGPD',
    question: "Une personne est-elle chargée de piloter la conformité RGPD (DPO ou référent) ?",
    description: "Le DPO est obligatoire pour un organisme public, ou pour une entreprise dont l'activité de base impose un suivi régulier et systématique des personnes à grande échelle ou le traitement à grande échelle de données sensibles ou pénales. Dans les autres cas, la CNIL recommande fortement de désigner un pilote. Source : CNIL, « Désigner un pilote » (vérifié le 15/11/2026).",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Désigner un pilote de la conformité RGPD : un DPO indépendant si la désignation est obligatoire (organisme public, suivi régulier et systématique à grande échelle, données sensibles à grande échelle), sinon un référent RGPD (fortement recommandé par la CNIL).",
        "Élaborer et diffuser une charte de protection des données personnelles."
      ]
    }
  },
  {
    id: 'rgpd2',
    category: 'RGPD',
    question: "Les traitements de données personnelles sont-ils documentés et cartographiés ?",
    description: "Registre des traitements à jour conforme à l'art. 30 RGPD.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Mettre à jour le registre des traitements de données personnelles conformément à l'article 30 du RGPD.",
        "Identifier et documenter tous les traitements de données effectués par l'organisation.",
        "Cartographier les flux de données pour assurer une traçabilité complète."
      ]
    }
  },
  {
    id: 'rgpd3',
    category: 'RGPD',
    question: "Une analyse d'impact (AIPD) est-elle réalisée pour les traitements susceptibles d'engendrer un risque élevé pour les personnes ?",
    description: "Source : CNIL, « Ce qu'il faut savoir sur l'analyse d'impact relative à la protection des données (AIPD) » (vérifié le 15/11/2026). La CNIL publie les listes des traitements pour lesquels une AIPD est requise ou non.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Identifier, avec les listes publiées par la CNIL, les traitements qui nécessitent une analyse d'impact (AIPD) et la réaliser avant leur mise en œuvre."
      ]
    }
  },
  {
    id: 'rgpd4',
    category: 'RGPD',
    question: "Une procédure permet-elle de documenter toute violation de données et de la notifier à la CNIL sous 72 h lorsqu'elle engendre un risque pour les personnes ?",
    description: "Source : CNIL, « Violations de données personnelles : les règles à suivre » (art. 33 et 34 RGPD, vérifié le 15/11/2026). Documentation interne dans tous les cas ; notification à la CNIL sous 72 h en cas de risque ; information des personnes en cas de risque élevé.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place une procédure de gestion des violations de données : registre interne de toutes les violations, notification à la CNIL sous 72 h en cas de risque, information des personnes en cas de risque élevé."
      ]
    }
  },
  {
    id: 'rgpd5',
    category: 'RGPD',
    question: "Une base légale (consentement, contrat, obligation légale, intérêt légitime…) est-elle identifiée pour chaque traitement de données personnelles ?",
    description: "Source : CNIL, « Les bases légales » (lu le 15/11/2026) : tout traitement doit se fonder sur l'une des bases légales prévues par le RGPD, choisie avant la mise en œuvre. Le consentement n'est qu'une de ces bases ; la CNIL détaille les conditions de son recueil.",
    type: 'scale',
    weight: 1,
    actionRecommendations: {
      lowScore: [
        "Identifier la base légale de chaque traitement (consentement, contrat, obligation légale, intérêt légitime…) avant sa mise en œuvre et la reporter dans le registre des traitements."
      ]
    }
  },
  {
    id: 'rgpd6',
    category: 'RGPD',
    question: "Les personnes sont-elles informées de leurs droits et peuvent-elles les exercer facilement (accès, rectification, effacement…) ?",
    description: "Source : CNIL, « Respecter les droits des personnes » (vérifié le 15/11/2026) : informer de façon concise, transparente et accessible, et permettre l'exercice des droits.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Informer les personnes de leurs droits (mentions d'information claires) et mettre en place une procédure pour répondre à leurs demandes d'exercice des droits."
      ]
    }
  },
  {
    id: 'rgpd7',
    category: 'RGPD',
    question: "Si des données personnelles sont transférées hors de l'Union européenne ou de l'EEE, le transfert est-il encadré par un outil juridique (décision d'adéquation, clauses contractuelles types, BCR…) ?",
    description: "Source : CNIL, « Transférer des données hors de l'UE » (lu le 15/11/2026) : le transfert est possible à condition d'assurer un niveau de protection suffisant et approprié, par différents outils juridiques. Répondre « oui » si aucune donnée n'est transférée hors UE/EEE.",
    type: 'boolean',
    weight: 1,
    actionRecommendations: {
      negativeAnswer: [
        "Recenser les transferts de données hors de l'UE/EEE (outils hébergés hors UE, prestataires) et les encadrer par un outil prévu par le RGPD : décision d'adéquation, clauses contractuelles types ou BCR."
      ]
    }
  },
  {
    id: 'rgpd8',
    category: 'RGPD',
    question: "La sécurité et la protection des données personnelles sont-elles intégrées au plus tôt dans les projets informatiques ?",
    description: "Source : CNIL, Guide de la sécurité des données personnelles, fiche 11 « Encadrer les développements informatiques » (intitulé lu le 15/11/2026) : intégrer sécurité et protection des données au plus tôt dans les projets.",
    type: 'scale',
    weight: 1,
    actionRecommendations: {
      lowScore: [
        "Intégrer la sécurité et la protection des données personnelles dès le début de chaque projet informatique (fiche 11 du guide de sécurité de la CNIL)."
      ]
    }
  },
  {
    id: 'rgpd9',
    category: 'RGPD',
    question: "Un contrat conforme à l'article 28 du RGPD est-il signé avec chaque sous-traitant qui traite des données personnelles pour votre compte ?",
    description: "Source : CNIL, « Travailler avec un sous-traitant » et Guide de la sécurité des données personnelles, fiche 14 (lus le 15/11/2026) : le traitement par un sous-traitant est encadré par un contrat avec le responsable de traitement ; ne pas entamer la prestation sans contrat reprenant les exigences de l'article 28.",
    type: 'scale',
    weight: 1,
    actionRecommendations: {
      lowScore: [
        "Signer avec chaque sous-traitant un contrat reprenant les exigences de l'article 28 du RGPD (objet, durée, finalité, sécurité, sort des données en fin de contrat, notification des incidents)."
      ]
    }
  },
  {
    id: 'rgpd10',
    category: 'RGPD',
    question: "Une durée de conservation est-elle déterminée pour chaque type de données, en fonction de la finalité du traitement ?",
    description: "Source : CNIL, « Les durées de conservation des données » (vérifié le 15/11/2026) : le responsable de traitement détermine la durée selon la finalité, sauf durée fixée par un texte.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Définir pour chaque traitement une durée de conservation adaptée à sa finalité (ou fixée par un texte) et supprimer ou archiver les données à l'issue de cette durée."
      ]
    }
  }
];

/**
 * Questions NIS2 (12 questions)
 */
export const nis2Questions: AuditQuestion[] = [
  {
    id: 'nis2_1',
    category: 'NIS2',
    question: "Une stratégie de gestion des risques cybersécurité est-elle formalisée ?",
    description: "Stratégie approuvée par la direction selon NIS2 art. 21.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Élaborer une stratégie de gestion des risques cybersécurité approuvée par la direction.",
        "Identifier et documenter les actifs critiques de l'organisation.",
        "Mettre en place un processus d'évaluation et de traitement des risques cybersécurité."
      ]
    }
  },
  {
    id: 'nis2_2',
    category: 'NIS2',
    question: "Les incidents cyber sont-ils notifiés aux autorités dans les 24h ?",
    description: "Notification ANSSI conforme aux exigences NIS2.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place une procédure de notification des incidents cyber aux autorités dans les 24h.",
        "Désigner un point de contact pour les notifications d'incidents auprès de l'ANSSI.",
        "Former le personnel aux exigences de notification d'incidents selon NIS2."
      ]
    }
  },
  {
    id: 'nis2_3',
    category: 'NIS2',
    question: "La continuité d'activité et la gestion de crise sont-elles testées ?",
    description: "Tests réguliers des plans de continuité et de reprise.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Élaborer et tester régulièrement un plan de continuité d'activité et de gestion de crise.",
        "Identifier les fonctions et processus critiques pour l'organisation.",
        "Organiser des exercices de simulation de crise cyber pour tester la coordination."
      ]
    }
  },
  {
    id: 'nis2_4',
    category: 'NIS2',
    question: "La sécurité de la chaîne d'approvisionnement est-elle évaluée ?",
    description: "Évaluation des risques cyber des fournisseurs critiques.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'nis2_5',
    category: 'NIS2',
    question: "Les mesures de cybersécurité sont-elles proportionnées aux risques ?",
    description: "Mesures techniques et organisationnelles adaptées.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'nis2_6',
    category: 'NIS2',
    question: "La formation en cybersécurité est-elle obligatoire pour tous ?",
    description: "Programme de formation continue pour tous les employés.",
    type: 'boolean',
    weight: 2,
  }
];

/**
 * Questions DORA - Secteur financier (10 questions)
 */
export const doraQuestions: AuditQuestion[] = [
  {
    id: 'dora_1',
    category: 'DORA',
    question: "Un cadre de gestion des risques TIC est-il établi ?",
    description: "Framework DORA pour la résilience opérationnelle numérique.",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'dora_2',
    category: 'DORA',
    question: "Les incidents TIC sont-ils classifiés et rapportés aux autorités ?",
    description: "Classification et notification selon les seuils DORA.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'dora_3',
    category: 'DORA',
    question: "Des tests de résilience opérationnelle sont-ils menés ?",
    description: "Tests de pénétration et TLPT (Threat-Led Penetration Testing).",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'dora_4',
    category: 'DORA',
    question: "La surveillance des prestataires TIC tiers est-elle effective ?",
    description: "Gestion des risques liés aux prestataires critiques.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'dora_5',
    category: 'DORA',
    question: "L'échange d'informations sur les cybermenaces est-il organisé ?",
    description: "Participation aux réseaux de partage d'informations.",
    type: 'boolean',
    weight: 2,
  }
];

/**
 * Questions LPM - Opérateurs d'Importance Vitale (8 questions)
 */
export const lmpQuestions: AuditQuestion[] = [
  {
    id: 'lmp_1',
    category: 'LPM',
    question: "Les systèmes d'information d'importance vitale (SIIV) sont-ils identifiés ?",
    description: "Cartographie et classification des SIIV selon LPM.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'lmp_2',
    category: 'LPM',
    question: "Une homologation de sécurité est-elle réalisée pour les SIIV ?",
    description: "Processus d'homologation conforme au RGS.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'lmp_3',
    category: 'LPM',
    question: "Les incidents sur SIIV sont-ils déclarés à l'ANSSI ?",
    description: "Déclaration obligatoire des incidents de sécurité.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'lmp_4',
    category: 'LPM',
    question: "Un responsable sécurité des systèmes d'information est-il nommé ?",
    description: "RSSI avec habilitation de défense si nécessaire.",
    type: 'boolean',
    weight: 2,
  }
];

/**
 * Questions Gestion des Incidents (8 questions)
 */
export const incidentQuestions: AuditQuestion[] = [
  {
    id: 'inc_1',
    category: 'Incidents',
    question: "Un plan de réponse aux incidents cyber est-il formalisé ?",
    description: "Procédures de détection, analyse et réponse aux incidents.",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'inc_2',
    category: 'Incidents',
    question: "Une cellule de crise cyber est-elle constituée et entraînée ?",
    description: "Équipe dédiée avec rôles et responsabilités définis.",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'inc_3',
    category: 'Incidents',
    question: "Les outils de détection d'incidents sont-ils déployés (SIEM, SOC) ?",
    description: "Capacité de détection et d'analyse des incidents 24/7.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'inc_4',
    category: 'Incidents',
    question: "Les preuves numériques sont-elles collectées selon les règles légales ?",
    description: "Processus forensique respectant la chaîne de preuves.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'inc_5',
    category: 'Incidents',
    question: "La communication de crise est-elle préparée ?",
    description: "Messages préparés pour clients, autorités, médias.",
    type: 'scale',
    weight: 2,
  }
];

/**
 * Questions Supply Chain Security (6 questions)
 */
export const supplyChainQuestions: AuditQuestion[] = [
  {
    id: 'sc_1',
    category: 'SupplyChain',
    question: "Une évaluation cyber des fournisseurs critiques est-elle réalisée ?",
    description: "Due diligence cybersécurité avant contractualisation.",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'sc_2',
    category: 'SupplyChain',
    question: "Les contrats incluent-ils des clauses de cybersécurité ?",
    description: "Obligations contractuelles en matière de sécurité.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'sc_3',
    category: 'SupplyChain',
    question: "La surveillance continue des fournisseurs est-elle assurée ?",
    description: "Monitoring des risques cyber des tiers.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'sc_4',
    category: 'SupplyChain',
    question: "Les accès des prestataires sont-ils contrôlés et tracés ?",
    description: "Gestion des accès privilégiés des tiers.",
    type: 'scale',
    weight: 2,
  }
];

/**
 * Questions Cloud & Infrastructure (8 questions)
 */
export const cloudQuestions: AuditQuestion[] = [
  {
    id: 'cloud_1',
    category: 'Cloud',
    question: "Une stratégie de sécurité cloud est-elle définie ?",
    description: "Politique de sécurité pour les environnements cloud.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'cloud_2',
    category: 'Cloud',
    question: "Le chiffrement des données est-il appliqué en transit et au repos ?",
    description: "Chiffrement bout en bout des données sensibles.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'cloud_3',
    category: 'Cloud',
    question: "La segmentation réseau et le Zero Trust sont-ils implémentés ?",
    description: "Architecture Zero Trust avec micro-segmentation.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'cloud_4',
    category: 'Cloud',
    question: "La surveillance et le monitoring sont-ils centralisés ?",
    description: "SIEM centralisé avec corrélation d'événements.",
    type: 'scale',
    weight: 2,
  }
];

/**
 * Questions CRA - Cyber Resilience Act (10 questions)
 */
export const craQuestions: AuditQuestion[] = [
  {
    id: 'cra_1',
    category: 'CRA',
    question: "Une évaluation de la résilience cyber est-elle réalisée pour les produits numériques ?",
    description: "Conformité aux exigences du CRA pour les fabricants de produits numériques.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Mettre en place un processus d'évaluation de la résilience cyber pour les produits numériques selon le CRA.",
        "Identifier les vulnérabilités critiques dans les produits numériux développés.",
        "Élaborer un plan de remédiation pour les vulnérabilités identifiées dans les produits."
      ]
    }
  },
  {
    id: 'cra_2',
    category: 'CRA',
    question: "Des mesures de sécurité par défaut sont-elles intégrées dans les produits ?",
    description: "Sécurité par défaut selon les exigences du CRA.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place des mesures de sécurité par défaut pour les produits numériques selon le CRA.",
        "Établir des critères de sécurité minimum pour tous les produits.",
        "Implémenter des mécanismes de sécurité pour protéger les données sensibles."
      ]
    }
  },
  {
    id: 'cra_3',
    category: 'CRA',
    question: "Un processus de gestion des vulnérabilités couvre-t-il toute la durée de vie du produit, avec signalement des vulnérabilités activement exploitées ?",
    description: "Source : Commission européenne, page « Cyber Resilience Act » (vérifié le 15/11/2026) : gestion des vulnérabilités sur le cycle de vie du produit ; signalement des vulnérabilités activement exploitées obligatoire depuis le 11/09/2026 ; obligations principales à partir du 11/12/2027.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Mettre en place un processus de gestion des vulnérabilités sur toute la durée de vie du produit et préparer le signalement des vulnérabilités activement exploitées (obligation applicable depuis le 11/09/2026)."
      ]
    }
  },
  {
    id: 'cra_4',
    category: 'CRA',
    question: "Un système de gestion de la sécurité est-il mis en place pour les produits ?",
    description: "SMSI conforme aux exigences du CRA.",
    type: 'boolean',
    weight: 2,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place un système de gestion de la sécurité pour les produits numériques selon le CRA.",
        "Établir des politiques de sécurité pour les produits.",
        "Implémenter des mécanismes de sécurité pour protéger les données sensibles."
      ]
    }
  },
  {
    id: 'cra_5',
    category: 'CRA',
    question: "Les fournisseurs de composants sont-ils évalués sur leurs pratiques de sécurité ?",
    description: "Évaluation de la chaîne d'approvisionnement selon CRA.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Mettre en place un processus d'évaluation de la sécurité des fournisseurs de composants selon le CRA.",
        "Identifier les fournisseurs critiques dans la chaîne d'approvisionnement.",
        "Établir des critères de sécurité minimum pour tous les fournisseurs de composants."
      ]
    }
  },
  {
    id: 'cra_6',
    category: 'CRA',
    question: "Des tests de pénétration sont-ils réalisés sur les produits ?",
    description: "Tests de sécurité réguliers selon CRA.",
    type: 'boolean',
    weight: 2,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place des tests de pénétration réguliers pour les produits numériques selon le CRA.",
        "Établir une équipe dédiée pour la réalisation des tests de pénétration.",
        "Implémenter des mécanismes de sécurité pour protéger les données sensibles."
      ]
    }
  },
  {
    id: 'cra_7',
    category: 'CRA',
    question: "La transparence sur les vulnérabilités est-elle assurée aux utilisateurs ?",
    description: "Communication proactive sur les vulnérabilités et correctifs.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'cra_8',
    category: 'CRA',
    question: "Les mises à jour de sécurité sont-elles fournies pendant toute la durée de vie du produit ?",
    description: "Support de sécurité pendant 5 ans minimum selon CRA.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'cra_9',
    category: 'CRA',
    question: "Les incidents de sécurité sont-ils notifiés aux autorités compétentes ?",
    description: "Notification dans les 24h selon CRA.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'cra_10',
    category: 'CRA',
    question: "La conformité CRA est-elle vérifiée par des audits indépendants ?",
    description: "Audits de conformité par des organismes accrédités.",
    type: 'boolean',
    weight: 2,
  }
];

/**
 * Questions ISO 27001 / 27002 (10 questions)
 */
export const isoQuestions: AuditQuestion[] = [
  {
    id: 'iso_1',
    category: 'ISO27001',
    question: "La politique de sécurité de l'information est-elle formalisée et approuvée ?",
    description: "Conformité à la clause 5.1 de l'ISO 27001.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'iso_2',
    category: 'ISO27001',
    question: "Un registre des actifs informationnels est-il tenu à jour ?",
    description: "Inventaire des actifs selon la clause 5.9.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'iso_3',
    category: 'ISO27001',
    question: "Les accès sont-ils accordés selon le principe du moindre privilège ?",
    description: "Contrôles d'accès (clause 5.15).",
    type: 'scale',
    weight: 3,
  },
  {
    id: 'iso_4',
    category: 'ISO27001',
    question: "Des revues régulières des accès utilisateurs sont-elles effectuées ?",
    description: "Clause 5.18.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'iso_5',
    category: 'ISO27001',
    question: "Les sauvegardes sont-elles testées périodiquement ?",
    description: "Sauvegardes et reprise après sinistre (clause 5.30).",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'iso_6',
    category: 'ISO27001',
    question: "Une évaluation des risques cybersécurité est-elle réalisée annuellement ?",
    description: "Processus d'appréciation des risques (clause 6).",
    type: 'scale',
    weight: 3,
  }
];

/**
 * Questions EBIOS Risk Manager (6 questions)
 */
export const ebiosQuestions: AuditQuestion[] = [
  {
    id: 'ebios_1',
    category: 'EBIOS',
    question: "Le périmètre d'étude est-il défini et validé ?",
    description: "Phase 1 – Cadrage et périmètre.",
    type: 'boolean',
    weight: 2,
  },
  {
    id: 'ebios_2',
    category: 'EBIOS',
    question: "Les événements redoutés sont-ils identifiés ?",
    description: "Phase 2 – Scénarios stratégiques.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'ebios_3',
    category: 'EBIOS',
    question: "Les sources de menace principales sont-elles cartographiées ?",
    description: "Phase 3 – Sources de menace.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'ebios_4',
    category: 'EBIOS',
    question: "Les mesures de sécurité existantes sont-elles évaluées ?",
    description: "Phase 4 – Scénarios opérationnels.",
    type: 'scale',
    weight: 2,
  },
  {
    id: 'ebios_5',
    category: 'EBIOS',
    question: "Un plan de traitement des risques est-il défini ?",
    description: "Phase 5 – Traitement des risques.",
    type: 'boolean',
    weight: 3,
  },
  {
    id: 'ebios_6',
    category: 'EBIOS',
    question: "Les décisions de traitement sont-elles approuvées par la direction ?",
    description: "Validation des mesures.",
    type: 'boolean',
    weight: 2,
  }
];

/**
 * Questions spécifiques par secteur
 */
export const sectorSpecificQuestions: Record<CompanySector, AuditQuestion[]> = {
  'Finance': [
    {
      id: 'fin_1',
      category: 'Secteur',
      question: "La conformité PCI DSS est-elle maintenue pour le traitement des cartes ?",
      description: "Certification PCI DSS à jour pour les paiements.",
      type: 'boolean',
      weight: 3,
    },
    {
      id: 'fin_2',
      category: 'Secteur',
      question: "Les tests de pénétration TLPT sont-ils réalisés ?",
      description: "Tests dirigés par les menaces selon DORA.",
      type: 'boolean',
      weight: 2,
    }
  ],
  'Santé': [
    {
      id: 'health_1',
      category: 'Secteur',
      question: "La certification HDS est-elle obtenue pour l'hébergement de données de santé ?",
      description: "Hébergement de Données de Santé certifié.",
      type: 'boolean',
      weight: 3,
    },
    {
      id: 'health_2',
      category: 'Secteur',
      question: "La pseudonymisation des données de santé est-elle appliquée ?",
      description: "Protection renforcée des données sensibles de santé.",
      type: 'scale',
      weight: 2,
    }
  ],
  'Énergie': [
    {
      id: 'energy_1',
      category: 'Secteur',
      question: "Les systèmes industriels (SCADA/ICS) sont-ils sécurisés ?",
      description: "Sécurisation des systèmes de contrôle industriel.",
      type: 'scale',
      weight: 3,
    }
  ],
  'Transport': [
    {
      id: 'transport_1',
      category: 'Secteur',
      question: "La cybersécurité des systèmes de transport est-elle assurée ?",
      description: "Protection des systèmes critiques de transport.",
      type: 'scale',
      weight: 3,
    }
  ],
  'Numérique': [
    {
      id: 'digital_1',
      category: 'Secteur',
      question: "La conformité CRA est-elle respectée pour les produits numériques ?",
      description: "Cyber Resilience Act pour les produits avec éléments numériques.",
      type: 'scale',
      weight: 2,
    }
  ],
  'Administration': [
    {
      id: 'admin_1',
      category: 'Secteur',
      question: "Le RGS (Référentiel Général de Sécurité) est-il appliqué ?",
      description: "Conformité au référentiel de sécurité de l'État.",
      type: 'scale',
      weight: 2,
    }
  ],
  'Industrie': [],
  'Commerce': [],
  'Autre': []
};

/**
 * Fonction pour obtenir toutes les questions selon le profil
 */
export function getQuestionsForProfile(regulations: RegulationScope[], sector: CompanySector): AuditQuestion[] {
  let questions: AuditQuestion[] = [];

  // Questions de base (toujours incluses)
  // On gardera les questions existantes de base

  // Questions par réglementation
  if (regulations.includes('RGPD')) {
    questions = questions.concat(rgpdQuestions);
  }
  if (regulations.includes('NIS2')) {
    questions = questions.concat(nis2Questions);
  }
  if (regulations.includes('DORA')) {
    questions = questions.concat(doraQuestions);
  }
  if (regulations.includes('LPM')) {
    questions = questions.concat(lmpQuestions);
  }
  if (regulations.includes('ISO27001')) {
    questions = questions.concat(isoQuestions);
  }
  if (regulations.includes('EBIOS')) {
    questions = questions.concat(ebiosQuestions);
  }

  // Questions transversales importantes
  questions = questions.concat(incidentQuestions);
  questions = questions.concat(supplyChainQuestions);
  questions = questions.concat(cloudQuestions);
  
  // Questions CRA : uniquement pour les fabricants / éditeurs de produits numériques
  if (regulations.includes('CRA')) {
    questions = questions.concat(craQuestions);
  }

  // Questions spécifiques au secteur
  const sectorQuestions = sectorSpecificQuestions[sector] || [];
  questions = questions.concat(sectorQuestions);

  return questions;
}
