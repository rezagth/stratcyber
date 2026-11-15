import { auditQuestions } from './questions';
import { rgpdQuestions, craQuestions } from './questions-extended';

/**
 * Règle du questionnaire : PAS DE SOURCE VÉRIFIÉE, PAS DE QUESTION.
 *
 * Une question n'est posée (et ne compte dans le score) que si elle figure dans QUESTION_SOURCES, c'est-à-dire
 * si une page officielle a été lue et correspond à ce que la question affirme. Pour ajouter une question :
 * lire la source, reformuler la question pour qu'elle ne dise pas plus que la source, puis l'ajouter ici avec la
 * date de lecture. Toute évolution de la source impose de relire la page et de changer `verifiedOn`.
 */
export type SourceRef = {
  label: string;
  url: string;
  verifiedOn: string; // AAAA-MM-JJ
  note?: string;
};

const VERIFIED = '2026-11-15';

const SRC = {
  cm10: {
    label: 'Cybermalveillance.gouv.fr — Les 10 mesures essentielles pour votre cybersécurité (mise à jour le 27/10/2026)',
    url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/bonnes-pratiques/10-mesures-essentielles-assurer-securite-numerique',
    verifiedOn: VERIFIED,
    note: 'Mesures reprises : 1 mots de passe et double authentification, 2 sauvegardes, 3 mises à jour, 4 antivirus, 5 applications officielles, 6 messages inattendus, 9 usages personnels et professionnels, 10 Wi-Fi publics.',
  },
  cnilPilote: {
    label: 'CNIL — Désigner un pilote (cas où le DPO est obligatoire)',
    url: 'https://www.cnil.fr/fr/designer-un-pilote',
    verifiedOn: VERIFIED,
    note: 'DPO obligatoire : organisme public ; suivi régulier et systématique à grande échelle ; données sensibles ou pénales à grande échelle. Sinon un pilote est fortement recommandé.',
  },
  cnilConflits: {
    label: 'CNIL — DPO : identifier et gérer les conflits d’intérêts (10/08/2026)',
    url: 'https://www.cnil.fr/fr/dpo-identifier-gerer-conflits-interets',
    verifiedOn: VERIFIED,
    note: 'Le conflit d’intérêts s’apprécie au cas par cas : le DPO ne doit pas déterminer les finalités et les moyens des traitements.',
  },
  cnilRegistre: {
    label: 'CNIL — Cartographier vos traitements de données personnelles (registre, art. 30 RGPD)',
    url: 'https://www.cnil.fr/fr/cartographier-vos-traitements-de-donnees-personnelles',
    verifiedOn: VERIFIED,
  },
  cnilAipd: {
    label: 'CNIL — Ce qu’il faut savoir sur l’analyse d’impact (AIPD)',
    url: 'https://www.cnil.fr/fr/ce-quil-faut-savoir-sur-lanalyse-dimpact-relative-la-protection-des-donnees-aipd',
    verifiedOn: VERIFIED,
    note: 'AIPD pour les traitements susceptibles d’engendrer un risque élevé ; la CNIL publie les listes des traitements concernés.',
  },
  cnilViolations: {
    label: 'CNIL — Violations de données personnelles : les règles à suivre (art. 33 et 34 RGPD)',
    url: 'https://www.cnil.fr/fr/violations-de-donnees-personnelles-les-regles-suivre',
    verifiedOn: VERIFIED,
    note: 'Documentation interne dans tous les cas ; notification à la CNIL sous 72 h en cas de risque ; information des personnes en cas de risque élevé.',
  },
  cnilDroits: {
    label: 'CNIL — Respecter les droits des personnes',
    url: 'https://www.cnil.fr/fr/respecter-les-droits-des-personnes',
    verifiedOn: VERIFIED,
  },
  cnilConservation: {
    label: 'CNIL — Les durées de conservation des données',
    url: 'https://www.cnil.fr/fr/passer-laction/les-durees-de-conservation-des-donnees',
    verifiedOn: VERIFIED,
  },
  mac: {
    label: 'ANSSI — MonAideCyber : référentiel du diagnostic cyber (code source public, licence Apache-2.0)',
    url: 'https://github.com/betagouv/mon-aide-cyber/tree/main/mon-aide-cyber-api/src/diagnostic/referentiel',
    verifiedOn: VERIFIED,
    note: 'Diagnostic gratuit de 1 h 30 proposé par l’État (https://messervices.cyber.gouv.fr/services/mon-aide-cyber). Thèmes : gouvernance, sécurité des accès, sécurité des postes, sensibilisation, réaction à une cyberattaque.',
  },
  cra: {
    label: 'Commission européenne — Cyber Resilience Act',
    url: 'https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act',
    verifiedOn: VERIFIED,
    note: 'En vigueur depuis le 10/12/2024 ; signalement des vulnérabilités activement exploitées depuis le 11/09/2026 ; obligations principales à partir du 11/12/2027. Concerne les fabricants de produits numériques.',
  },
  cnilF1: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 1 « Piloter la sécurité des données »',
    url: 'https://www.cnil.fr/fr/securite-piloter-la-securite-des-donnees',
    verifiedOn: VERIFIED,
    note: 'Formaliser des objectifs généraux de sécurité et de protection des données validés par la direction ; plan d’action suivi ; revue de direction au moins annuelle.',
  },
  cnilF5: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 5 « Gérer les habilitations » (13/03/2024)',
    url: 'https://www.cnil.fr/fr/securite-gerer-les-habilitations',
    verifiedOn: VERIFIED,
    note: 'Supprimer les permissions dès qu’un utilisateur change de poste ou quitte l’organisation ; revue des habilitations a minima annuelle.',
  },
  cnilF7: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 7 « Sécuriser l’informatique mobile » (14/03/2024)',
    url: 'https://www.cnil.fr/fr/securite-securiser-linformatique-mobile',
    verifiedOn: VERIFIED,
    note: 'Prévoir le chiffrement des postes nomades et supports de stockage mobiles ; verrouillage automatique des smartphones avec un secret.',
  },
  cnilF11: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 11 « Encadrer les développements informatiques »',
    url: 'https://www.cnil.fr/fr/securite-encadrer-les-developpements-informatiques',
    verifiedOn: VERIFIED,
    note: 'Intitulé et résumé lus sur la page du guide : intégrer sécurité et protection des données au plus tôt dans les projets.',
  },
  cnilF14: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 14 « Gérer la sous-traitance »',
    url: 'https://www.cnil.fr/fr/securite-gerer-la-sous-traitance',
    verifiedOn: VERIFIED,
    note: 'Sous-traitants présentant des garanties suffisantes ; contrat reprenant les exigences de l’article 28 du RGPD ; ne pas entamer la prestation sans contrat.',
  },
  cnilF18: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 18 « Prévoir la continuité et la reprise d’activité »',
    url: 'https://www.cnil.fr/fr/securite-prevoir-la-continuite-et-la-reprise-dactivite',
    verifiedOn: VERIFIED,
    note: 'Rédiger un PCA et un PRA informatiques, même sommaires, avec la liste des intervenants ; tester régulièrement.',
  },
  cnilF19: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 19 « Gérer les incidents et les violations »',
    url: 'https://www.cnil.fr/fr/securite-gerer-les-incidents-et-les-violations',
    verifiedOn: VERIFIED,
    note: 'Diffuser la conduite à tenir et la liste des personnes à contacter ; sensibiliser au signalement des événements suspects ; notification CNIL sous 72 h si risque.',
  },
  cnilF20: {
    label: 'CNIL — Guide de la sécurité des données personnelles, fiche 20 « Analyse de risques »',
    url: 'https://www.cnil.fr/fr/securite-analyse-de-risques',
    verifiedOn: VERIFIED,
    note: 'Mener une analyse de risques, même minimale, en trois étapes (recenser, apprécier, identifier sources et menaces).',
  },
  cnilBases: {
    label: 'CNIL — Les bases légales',
    url: 'https://www.cnil.fr/fr/les-bases-legales',
    verifiedOn: VERIFIED,
    note: 'Tout traitement doit se fonder sur l’une des bases légales du RGPD (consentement, contrat, obligation légale, mission d’intérêt public, intérêt légitime), choisie avant sa mise en œuvre.',
  },
  cnilTransferts: {
    label: 'CNIL — Transférer des données hors de l’UE',
    url: 'https://www.cnil.fr/fr/les-outils-de-la-conformite/transferer-des-donnees-hors-de-lue',
    verifiedOn: VERIFIED,
    note: 'Transfert possible à condition d’assurer un niveau de protection suffisant et approprié, encadré par des outils juridiques (décision d’adéquation, clauses contractuelles types, BCR, dérogations de l’article 49).',
  },
  cnilSousTraitant: {
    label: 'CNIL — Travailler avec un sous-traitant',
    url: 'https://www.cnil.fr/fr/sous-traitant',
    verifiedOn: VERIFIED,
    note: 'Les traitements par un sous-traitant doivent respecter le RGPD et être encadrés par un contrat avec le responsable de traitement.',
  },
  cnil12: {
    label: 'CNIL — Sécurité des données : les règles essentielles (mise à jour le 19/06/2026)',
    url: 'https://www.cnil.fr/fr/securite-des-donnees-les-regles-essentielles',
    verifiedOn: VERIFIED,
    note: 'Douze recommandations, dont : protéger les matériels mobiles, sauvegardes hors de la société avec tests de restauration, formation régulière.',
  },
  cybermalveillanceRib: {
    label: 'Cybermalveillance.gouv.fr — Que faire en cas de fraude au virement ou au « faux RIB » ? (mise à jour le 14/10/2026)',
    url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/que-faire-en-cas-de-fraude-au-virement-ou-au-faux-rib',
    verifiedOn: VERIFIED,
    note: 'Pour toute demande de virement sur un nouveau RIB reçu par message, contacter directement le créancier sur son numéro habituel.',
  },
  anssiNis2: {
    label: 'ANSSI — MesServicesCyber : directive NIS 2',
    url: 'https://messervices.cyber.gouv.fr/nis2',
    verifiedOn: VERIFIED,
    note: 'Transposition en France en cours ; test en ligne pour savoir si l’entité est concernée ; pas d’obligation applicable tant que les textes ne sont pas publiés.',
  },
} satisfies Record<string, SourceRef>;

/** Questions autorisées : id → sources vérifiées sur lesquelles elles reposent. */
export const QUESTION_SOURCES: Record<string, SourceRef[]> = {
  h1: [SRC.cm10, SRC.mac],
  h2: [SRC.cm10],
  t1: [SRC.cm10, SRC.mac],
  t2: [SRC.cm10, SRC.mac],
  t3: [SRC.cm10, SRC.mac],
  g3: [SRC.mac],
  h3: [SRC.mac],
  t4: [SRC.mac],
  h6: [SRC.mac],
  h7: [SRC.mac],
  h9: [SRC.mac],
  h10: [SRC.mac],
  h11: [SRC.mac],
  h13: [SRC.mac],
  o1: [SRC.mac],
  gc1: [SRC.mac],
  n5: [SRC.mac],
  n6: [SRC.mac],
  n7: [SRC.mac],
  n8: [SRC.mac],
  n9: [SRC.mac],
  n1: [SRC.cm10],
  n2: [SRC.cm10],
  n3: [SRC.cm10],
  n4: [SRC.cm10],
  rgpd1: [SRC.cnilPilote, SRC.cnilConflits],
  rgpd2: [SRC.cnilRegistre],
  rgpd3: [SRC.cnilAipd],
  rgpd4: [SRC.cnilViolations],
  rgpd6: [SRC.cnilDroits],
  rgpd10: [SRC.cnilConservation],
  cra_3: [SRC.cra],
  g1: [SRC.cnilF1],
  o2: [SRC.cnilF18],
  o3: [SRC.cnilF5],
  h8: [SRC.cnilF5],
  h5: [SRC.cnilF7, SRC.cnil12],
  h12: [SRC.cnilF19],
  sc1: [SRC.cnilF14],
  n10: [SRC.cnilF20],
  n11: [SRC.anssiNis2],
  h14: [SRC.cybermalveillanceRib],
  rgpd5: [SRC.cnilBases],
  rgpd7: [SRC.cnilTransferts],
  rgpd8: [SRC.cnilF11],
  rgpd9: [SRC.cnilSousTraitant, SRC.cnilF14],
};

export function isQuestionSourced(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(QUESTION_SOURCES, id);
}

/**
 * Questions « à valider par le consultant » : posées pour que l'audit couvre ces sujets, mais SANS source
 * officielle vérifiée. Elles ne comptent PAS dans le score, ne produisent pas d'action au plan et sont
 * présentées à part dans le rapport, étiquetées comme déclaratives.
 */
export const CONSULTANT_QUESTION_IDS = ['g2', 'h4', 'grc1', 'grc2', 's1', 's2'] as const;

export function isConsultantQuestion(id: string): boolean {
  return (CONSULTANT_QUESTION_IDS as readonly string[]).includes(id);
}

const TEXT_TO_ID = new Map<string, string>(
  [...auditQuestions, ...rgpdQuestions, ...craQuestions].map((q) => [q.question, q.id]),
);

/** Une réponse enregistrée peut porter l'identifiant ou le texte de la question. */
export function resolveQuestionId(question: string): string | null {
  if (isQuestionSourced(question) || isConsultantQuestion(question)) return question;
  return TEXT_TO_ID.get(question) ?? null;
}

/**
 * Sources (sans doublon) des questions réellement posées, nombre de réponses sans source vérifiée
 * (ancien questionnaire) et réponses aux questions « à valider par le consultant » (hors score).
 */
export function referencesForResponses<T extends { question: string }>(responses: T[]): {
  sources: SourceRef[];
  unsourcedCount: number;
  consultantResponses: T[];
} {
  const seen = new Set<string>();
  const sources: SourceRef[] = [];
  const consultantResponses: T[] = [];
  let unsourcedCount = 0;
  for (const r of responses) {
    const id = resolveQuestionId(r.question);
    if (id && isConsultantQuestion(id)) {
      consultantResponses.push(r);
      continue;
    }
    if (!id || !isQuestionSourced(id)) {
      unsourcedCount += 1;
      continue;
    }
    for (const ref of QUESTION_SOURCES[id]) {
      if (seen.has(ref.url)) continue;
      seen.add(ref.url);
      sources.push(ref);
    }
  }
  return { sources, unsourcedCount, consultantResponses };
}

/** Périmètre NON couvert : à afficher tel quel dans le rapport pour ne pas laisser croire à un audit complet. */
export const NOT_COVERED_SCOPE =
  "DORA, ISO 27001 et EBIOS RM, qui sont des cadres de référence et non des points de contrôle ; les points « à valider par le consultant » (responsable de la sécurité, protection de la messagerie, cadre de conformité, cartographie des risques, phishing simulé, formation des arrivants) sont posés mais sans source officielle vérifiée et ne comptent pas dans le score";
