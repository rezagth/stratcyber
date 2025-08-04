import { AuditQuestion, RegulationScope, CompanySector } from '../../types/audit';

/**
 * Questions RGPD complètes (15 questions)
 */
export const rgpdQuestions: AuditQuestion[] = [
  {
    id: 'rgpd1',
    category: 'RGPD',
    question: "Un DPO est-il désigné et les obligations RGPD sont-elles respectées ?",
    description: "DPO interne ou externe, registre des traitements, droits des personnes.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Désigner un Délégué à la Protection des Données (DPO) conformément aux exigences du RGPD.",
        "Élaborer et diffuser une charte de protection des données personnelles.",
        "Mettre en place un registre des traitements de données personnelles."
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
    question: "Les analyses d'impact (AIPD) sont-elles réalisées pour les traitements sensibles ?",
    description: "Conformément aux exigences du RGPD pour les traitements à risque élevé.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Réaliser des Analyses d'Impact sur la Protection des Données (AIPD) pour les traitements à risque élevé.",
        "Identifier les traitements de données qui nécessitent une AIPD selon le RGPD.",
        "Mettre en place un processus pour évaluer régulièrement les risques liés aux traitements de données."
      ]
    }
  },
  {
    id: 'rgpd4',
    category: 'RGPD',
    question: "Les violations de données sont-elles notifiées dans les 72h à la CNIL ?",
    description: "Procédure de notification des violations conforme à l'art. 33 RGPD.",
    type: 'boolean',
    weight: 3,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place une procédure de notification des violations de données dans les 72h à la CNIL.",
        "Former le personnel à identifier et signaler les violations de données.",
        "Élaborer un plan de réponse aux violations de données conformément à l'article 33 du RGPD."
      ]
    }
  },
  {
    id: 'rgpd5',
    category: 'RGPD',
    question: "Les consentements sont-ils collectés de manière licite et documentés ?",
    description: "Consentement libre, spécifique, éclairé et univoque (art. 7 RGPD).",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Mettre en place un système de gestion des consentements conforme à l'article 7 du RGPD.",
        "Réviser les formulaires de collecte de consentement pour assurer leur conformité.",
        "Implémenter des mécanismes pour permettre aux personnes de retirer facilement leur consentement."
      ]
    }
  },
  {
    id: 'rgpd6',
    category: 'RGPD',
    question: "Les droits des personnes (accès, rectification, effacement) sont-ils respectés ?",
    description: "Procédures pour exercer les droits dans les délais légaux (1 mois).",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Mettre en place des procédures claires pour permettre aux personnes d'exercer leurs droits RGPD.",
        "Former le personnel aux procédures de traitement des demandes des personnes concernées.",
        "Implémenter un système de suivi des demandes d'exercice des droits dans les délais légaux."
      ]
    }
  },
  {
    id: 'rgpd7',
    category: 'RGPD',
    question: "Les transferts internationaux de données sont-ils sécurisés ?",
    description: "Clauses contractuelles types, décisions d'adéquation ou BCR.",
    type: 'boolean',
    weight: 2,
    actionRecommendations: {
      negativeAnswer: [
        "Mettre en place des garanties appropriées pour les transferts internationaux de données.",
        "Utiliser des clauses contractuelles types approuvées par la Commission européenne.",
        "Évaluer les pays de destination pour s'assurer d'un niveau adéquat de protection."
      ]
    }
  },
  {
    id: 'rgpd8',
    category: 'RGPD',
    question: "La privacy by design est-elle appliquée dès la conception ?",
    description: "Protection des données intégrée dès la conception des systèmes.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Intégrer la protection de la vie privée dès la conception des nouveaux systèmes et processus.",
        "Mettre en place des contrôles de sécurité par défaut dans les développements informatiques.",
        "Former les équipes de développement aux principes de privacy by design."
      ]
    }
  },
  {
    id: 'rgpd9',
    category: 'RGPD',
    question: "Les sous-traitants respectent-ils leurs obligations RGPD ?",
    description: "Contrats de sous-traitance conformes à l'art. 28 RGPD.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Vérifier et auditer régulièrement les sous-traitants pour leur conformité RGPD.",
        "Mettre à jour les contrats de sous-traitance pour inclure toutes les obligations RGPD.",
        "Établir des clauses de responsabilité claires avec les sous-traitants en matière de protection des données."
      ]
    }
  },
  {
    id: 'rgpd10',
    category: 'RGPD',
    question: "Les durées de conservation des données sont-elles définies et respectées ?",
    description: "Politique de rétention avec suppression automatique.",
    type: 'scale',
    weight: 2,
    actionRecommendations: {
      lowScore: [
        "Établir une politique claire de conservation des données avec des durées définies par type de données.",
        "Implémenter des mécanismes de suppression automatique des données à l'expiration de leur durée de conservation.",
        "Former le personnel aux règles de conservation des données et à l'importance du respect des délais."
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
    question: "Les vulnérabilités sont-elles signalées et corrigées dans les délais requis ?",
    description: "Processus de divulgation responsable et correction dans les 90 jours.",
    type: 'scale',
    weight: 3,
    actionRecommendations: {
      lowScore: [
        "Mettre en place un processus de correction des vulnérabilités dans les délais requis selon le CRA.",
        "Établir une équipe dédiée pour la gestion des vulnérabilités.",
        "Implémenter un système de suivi pour s'assurer du respect des délais de correction."
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
  
  // Questions CRA (toujours incluses)
  questions = questions.concat(craQuestions);

  // Questions spécifiques au secteur
  const sectorQuestions = sectorSpecificQuestions[sector] || [];
  questions = questions.concat(sectorQuestions);

  return questions;
}
