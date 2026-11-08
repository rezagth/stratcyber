/**
 * Modèles intégrés de l'assistant de dossier de conformité. Ce sont des BASES À ADAPTER, à faire
 * relire par un juriste : jamais du conseil juridique. Variables au format {{nom}} (moteur simple
 * de lib/policy/template-engine.ts : une variable non renseignée reste visible dans le texte).
 * Les éléments entre crochets [ ... ] sont des points à compléter à la main.
 */
import type { POLICY_TYPES } from '@/lib/api/policy-fields';

export type LibraryDocument = {
  id: string;
  type: (typeof POLICY_TYPES)[number];
  name: string;
  description: string;
  content: string;
};

const FOOTER = `
---
Modèle fourni par InfraCyb : base à adapter à la situation de l'entreprise et à faire relire par un juriste avant validation.`;

export const DOCUMENTS: LibraryDocument[] = [
  {
    id: 'pssi',
    type: 'PSSI',
    name: "Politique de sécurité des systèmes d'information (PSSI)",
    description: 'Principes de sécurité de l’entreprise, rôles et revue annuelle.',
    content: `POLITIQUE DE SÉCURITÉ DES SYSTÈMES D'INFORMATION (PSSI)
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET ET PÉRIMÈTRE
Cette politique définit les principes de sécurité applicables au système d'information de {{entreprise}} : postes de travail, serveurs, messagerie, applications, services en ligne, équipements mobiles et données. Elle s'applique à tous les collaborateurs, stagiaires, prestataires et partenaires qui accèdent à ce système.

2. ENGAGEMENT DE LA DIRECTION
{{dirigeant}} s'engage à donner à la sécurité de l'information les moyens nécessaires et à faire respecter cette politique. Le référent sécurité est {{referent_securite}}. Il est accompagné par {{rssi}} (contact : {{contact_securite}}).

3. PRINCIPES
3.1 Accès : comptes nominatifs, droits limités au strict nécessaire, double authentification pour la messagerie, les accès à distance et les comptes d'administration. Les droits sont revus au moins une fois par an, et à chaque départ ou changement de poste.
3.2 Postes et logiciels : systèmes et applications maintenus à jour, protection contre les logiciels malveillants active, disques des ordinateurs portables chiffrés, verrouillage automatique de session.
3.3 Sauvegardes : sauvegardes régulières avec une copie hors site ou hors ligne, testées périodiquement (voir la politique de sauvegarde).
3.4 Messagerie et navigation : vigilance face au hameçonnage ; tout message suspect est signalé à {{contact_securite}} sans l'ouvrir ni y répondre.
3.5 Données : trois niveaux (public, interne, confidentiel) ; les données personnelles sont traitées conformément au RGPD ; les données sont stockées uniquement sur les espaces autorisés.
3.6 Réseau : réseau invité séparé du réseau interne, Wi-Fi protégé, accès à distance uniquement par un moyen sécurisé avec double authentification.
3.7 Prestataires : exigences de sécurité et de confidentialité dans les contrats, accord de sous-traitance lorsque des données personnelles sont concernées. Prestataire informatique actuel : {{prestataire_it}}.
3.8 Sensibilisation : information de chaque nouveau collaborateur à son arrivée, puis rappel au moins une fois par an.
3.9 Incidents : tout incident ou soupçon d'incident est signalé sans délai (voir la procédure de gestion des incidents).

4. RÔLES
La direction décide et fournit les moyens. Le référent sécurité applique et suit cette politique. Chaque collaborateur respecte les règles et signale les anomalies. Les prestataires respectent les exigences prévues à leur contrat.

5. CONTRÔLE ET REVUE
Cette politique est revue au moins une fois par an, et après tout incident majeur ou changement important du système d'information. Les manquements peuvent donner lieu aux mesures prévues par le règlement intérieur ou les contrats.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'charte-informatique',
    type: 'Charte informatique',
    name: 'Charte informatique',
    description: 'Règles d’usage du matériel, de la messagerie et d’internet par les collaborateurs.',
    content: `CHARTE INFORMATIQUE
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET
Cette charte précise les règles d'utilisation des ressources informatiques de {{entreprise}} (ordinateurs, téléphones, messagerie, internet, logiciels, espaces de stockage) par toutes les personnes qui les utilisent. Elle est portée à la connaissance de chacun et annexée au règlement intérieur lorsqu'il existe.

2. COMPTES ET MOTS DE PASSE
Chaque utilisateur dispose d'un compte personnel. Les mots de passe sont personnels, longs et uniques, ne sont jamais communiqués ni écrits à la vue de tous. L'utilisation d'un gestionnaire de mots de passe est recommandée. La double authentification est activée dès qu'elle est proposée.

3. MATÉRIEL ET LOGICIELS
Le matériel est fourni pour un usage professionnel ; un usage personnel raisonnable est toléré s'il ne gêne pas le travail ni la sécurité. Il est interdit d'installer des logiciels non autorisés, de désactiver les protections et de brancher des supports de stockage d'origine inconnue. Le vol ou la perte d'un équipement est signalé immédiatement à {{contact_securite}}.

4. MESSAGERIE ET INTERNET
La messagerie professionnelle sert aux échanges professionnels. Chacun reste vigilant face aux messages suspects (pièces jointes inattendues, demandes urgentes de paiement ou d'identifiants) et les signale à {{contact_securite}}. Les sites illicites ou sans rapport avec l'activité sont à éviter.

5. DONNÉES
Les données de l'entreprise sont stockées sur les espaces prévus, pas sur des services personnels. Les données confidentielles et personnelles ne sont communiquées qu'aux personnes autorisées. Un document confidentiel n'est envoyé hors de l'entreprise que par un moyen sécurisé.

6. TÉLÉTRAVAIL ET DÉPLACEMENTS
Les accès à distance se font uniquement par les moyens fournis. Les écrans sont verrouillés en cas d'absence, et les équipements ne sont pas laissés sans surveillance en dehors des locaux.

7. CONTRÔLES
Pour assurer la sécurité du système, {{entreprise}} peut journaliser les connexions et les usages et analyser ces journaux de manière proportionnée, dans le respect de la vie privée des utilisateurs et de la réglementation. Les utilisateurs en sont informés par la présente charte. Les messages clairement identifiés comme personnels ne sont pas consultés hors cas prévus par la loi.

8. NON-RESPECT
Le non-respect de cette charte peut entraîner des mesures prévues par le règlement intérieur et par la loi. Pour toute question : {{referent_securite}}.

9. ENTRÉE EN VIGUEUR
La présente charte entre en vigueur le {{date_effet}}.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'sauvegarde',
    type: 'Sauvegarde',
    name: 'Politique de sauvegarde',
    description: 'Ce qui est sauvegardé, à quel rythme, où, et comment on teste la restauration.',
    content: `POLITIQUE DE SAUVEGARDE
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET
Garantir que les données et systèmes essentiels de {{entreprise}} peuvent être restaurés après une panne, une erreur ou une attaque (notamment un rançongiciel).

2. DONNÉES ET SYSTÈMES SAUVEGARDÉS
Priorité : {{systemes_critiques}}.
Les postes de travail ne sont pas considérés comme un lieu de stockage : les données de l'entreprise sont conservées sur les espaces sauvegardés.

3. RÈGLES
3.1 Fréquence : sauvegarde {{frequence_sauvegarde}}.
3.2 Règle des trois copies : au moins trois copies des données, sur deux types de supports différents, dont une copie hors site ou hors ligne, hors de portée d'une attaque sur le réseau principal.
3.3 Lieu de stockage : {{lieu_sauvegardes}}.
3.4 Conservation : {{duree_conservation_sauvegardes}}.
3.5 Protection : sauvegardes chiffrées ; accès réservé aux personnes autorisées, avec double authentification pour les consoles de sauvegarde.

4. SURVEILLANCE ET TESTS
Le résultat de chaque sauvegarde est contrôlé et toute anomalie est traitée sous un jour ouvré. Un test de restauration est réalisé au moins deux fois par an et consigné (date, données restaurées, résultat, durée).

5. RESPONSABILITÉS
Le suivi est assuré par {{referent_securite}}, avec l'appui de {{prestataire_it}} et de {{rssi}}. La direction ({{dirigeant}}) est informée des anomalies durables et des tests non concluants.

6. REVUE
Cette politique est revue au moins une fois par an et à chaque évolution importante du système d'information.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'acces-mots-de-passe',
    type: 'Accès',
    name: 'Politique de gestion des accès et des mots de passe',
    description: 'Comptes nominatifs, mots de passe, double authentification, arrivées et départs.',
    content: `POLITIQUE DE GESTION DES ACCÈS ET DES MOTS DE PASSE
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET
Définir qui peut accéder à quoi, et comment ces accès sont accordés, protégés, contrôlés et retirés.

2. PRINCIPES
2.1 Comptes nominatifs : un compte par personne ; les comptes partagés sont interdits (sauf exception justifiée, validée et tracée par {{referent_securite}}).
2.2 Moindre privilège : chacun n'a que les droits nécessaires à sa fonction. Les droits d'administration sont réservés à des comptes dédiés, distincts du compte de travail quotidien.
2.3 Double authentification : obligatoire pour la messagerie, les accès à distance, les outils d'administration et tout service contenant des données sensibles.

3. MOTS DE PASSE
Mots de passe ou phrases de passe longs (au moins 12 caractères), uniques pour chaque service, stockés dans un gestionnaire de mots de passe validé. Aucun mot de passe n'est transmis par e-mail ou messagerie instantanée en clair. Tout mot de passe suspecté d'avoir été divulgué est changé immédiatement et signalé à {{contact_securite}}.

4. ARRIVÉES, CHANGEMENTS ET DÉPARTS
Arrivée : les accès sont créés sur demande du responsable hiérarchique, limités aux besoins du poste. Changement de poste : les droits sont ajustés. Départ : les comptes sont désactivés au plus tard le dernier jour, les équipements et accès récupérés.

5. REVUE
Une revue des comptes et des droits est réalisée au moins une fois par an par {{referent_securite}} : comptes inactifs, droits excessifs, comptes d'administration. Le résultat est conservé.

6. ACCÈS DES PRESTATAIRES
Les prestataires disposent de comptes nominatifs et limités dans le temps, avec double authentification. Prestataire informatique : {{prestataire_it}}.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'incident',
    type: 'Incident',
    name: 'Procédure de gestion des incidents de sécurité',
    description: 'Signaler, qualifier, contenir, notifier (CNIL, NIS2 si concerné) et tirer les leçons.',
    content: `PROCÉDURE DE GESTION DES INCIDENTS DE SÉCURITÉ
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET
Permettre à {{entreprise}} de réagir vite et de manière organisée à un incident de sécurité : attaque, perte ou vol d'équipement, fuite de données, compromission de compte, indisponibilité grave.

2. SIGNALER
Toute personne qui constate ou soupçonne un incident le signale immédiatement :
- par e-mail à {{contact_securite}} ;
- en cas d'urgence, par téléphone au {{telephone_urgence}}.
Elle note l'heure et ce qu'elle a observé, n'éteint pas l'appareil concerné et ne supprime rien.

3. CELLULE DE CRISE
Direction : {{dirigeant}}. Référent sécurité : {{referent_securite}}. Appui cybersécurité : {{rssi}}. Appui informatique : {{prestataire_it}}. Un journal horodaté des décisions et des actions est tenu dès le début.

4. ÉTAPES
4.1 Qualifier : systèmes, comptes et données touchés ; des données personnelles sont-elles concernées ? Quelle gravité ?
4.2 Préserver les preuves : journaux, copies, captures, avant toute remise en état.
4.3 Contenir : isoler les appareils et comptes compromis, changer les identifiants concernés, bloquer les accès suspects.
4.4 Éradiquer et restaurer : corriger la cause, restaurer à partir de sauvegardes saines, renforcer la surveillance.
4.5 Communiquer : informer la direction, puis les personnes et organismes concernés (voir 5).
4.6 Tirer les leçons : retour d'expérience, rapport, actions correctives ajoutées au plan d'action.

5. NOTIFICATIONS
5.1 Violation de données personnelles : lorsqu'elle est susceptible d'engendrer un risque pour les droits et libertés des personnes, elle est notifiée à la CNIL dans les 72 heures après en avoir pris connaissance (article 33 du RGPD). Si le risque est élevé, les personnes concernées sont informées (article 34). Toute violation, notifiée ou non, est consignée dans un registre interne.
5.2 Si {{entreprise}} entre dans le champ de la directive NIS2, l'incident significatif donne lieu à une alerte précoce sous 24 heures, une notification sous 72 heures et un rapport final dans un délai d'un mois, auprès de l'autorité compétente. Cette qualification doit être vérifiée avec {{rssi}}.
5.3 Assureur cyber et plainte : l'assureur est prévenu dans le délai prévu au contrat ; une plainte est déposée si nécessaire.
5.4 Un sous-traitant qui constate une violation affectant les données de {{entreprise}} la lui notifie dans les meilleurs délais.

6. TESTS ET REVUE
Cette procédure est testée par un exercice au moins une fois par an et revue après chaque incident majeur.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'pca-pra',
    type: 'PCA',
    name: "Plan de continuité et de reprise d'activité (PCA/PRA)",
    description: 'Activités vitales, délais de reprise visés, scénarios de crise et organisation.',
    content: `PLAN DE CONTINUITÉ ET DE REPRISE D'ACTIVITÉ (PCA/PRA)
{{entreprise}} - applicable à compter du {{date_effet}}

1. OBJET
Assurer la poursuite des activités essentielles de {{entreprise}} en cas d'incident grave (cyberattaque, panne, sinistre des locaux, indisponibilité d'un prestataire ou de personnel clé), puis leur reprise complète.

2. ACTIVITÉS ESSENTIELLES
{{activites_critiques}}

3. OBJECTIFS
- Délai de reprise visé (arrêt maximal acceptable) : {{delai_reprise}}.
- Perte de données maximale acceptable : {{perte_maximale}}.
Ces objectifs guident la fréquence des sauvegardes et le choix des solutions de reprise.

4. SCÉNARIOS COUVERTS
a) Cyberattaque rendant le système inutilisable (rançongiciel, compromission de comptes).
b) Panne matérielle ou logicielle majeure.
c) Sinistre des locaux (incendie, dégât des eaux, accès impossible).
d) Indisponibilité d'un prestataire ou d'un service en ligne essentiel.
e) Absence prolongée de personnes clés.
Pour chaque scénario, un mode dégradé est défini : travail depuis un autre lieu, outils de remplacement, procédures papier, communication par un canal alternatif.

5. ORGANISATION DE CRISE
Décision : {{dirigeant}}. Coordination : {{referent_securite}}. Appui technique : {{rssi}} et {{prestataire_it}}. Contact d'urgence : {{contact_securite}} / {{telephone_urgence}}. L'annuaire de crise (équipe, clients clés, fournisseurs, assureur) est tenu à jour et disponible hors du système d'information.

6. COMMUNICATION
La direction décide des messages adressés aux clients, partenaires, salariés et autorités. Une seule personne s'exprime au nom de l'entreprise.

7. REPRISE
La reprise suit l'ordre des activités essentielles. Chaque étape est validée avant de passer à la suivante, et les données restaurées sont vérifiées.

8. TESTS ET MISE À JOUR
Le plan est testé par un exercice au moins une fois par an, puis mis à jour avec les enseignements tirés. Il est relu à chaque changement important de l'organisation ou du système d'information.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'confidentialite',
    type: 'Confidentialité',
    name: 'Politique de confidentialité (information des personnes)',
    description: 'Information RGPD des personnes dont l’entreprise traite les données.',
    content: `POLITIQUE DE CONFIDENTIALITÉ
{{entreprise}} - {{site_web}} - mise à jour du {{date_effet}}

1. QUI EST RESPONSABLE DE VOS DONNÉES ?
{{entreprise}}, {{adresse}}, est responsable du traitement des données personnelles décrit ci-dessous. Contact pour toute question sur vos données : {{contact_donnees}}.

2. POURQUOI ET SUR QUELLE BASE ?
Nous traitons des données personnelles pour les finalités suivantes :
{{finalites}}
Chaque finalité repose sur une base légale à préciser : [exécution d'un contrat / obligation légale / intérêt légitime / consentement].

3. À QUI SONT-ELLES COMMUNIQUÉES ?
Aux seules personnes habilitées de {{entreprise}}, et à nos prestataires agissant sur nos instructions (hébergement, maintenance, messagerie...) ainsi qu'aux autorités lorsque la loi l'exige. Hébergement : {{hebergeur_donnees}}. [Indiquer ici tout transfert hors de l'Union européenne et ses garanties, ou « aucun transfert ».]

4. COMBIEN DE TEMPS ?
{{duree_conservation_donnees}}
À l'issue de ces durées, les données sont supprimées ou anonymisées.

5. VOS DROITS
Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et, le cas échéant, de portabilité de vos données, ainsi que du droit de définir des directives sur leur sort après votre décès. Pour les exercer, écrivez à {{contact_donnees}} en joignant, si nécessaire, un justificatif d'identité. Une réponse vous est apportée dans un délai d'un mois.
Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).

6. SÉCURITÉ
Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données (contrôle des accès, sauvegardes, chiffrement, sensibilisation).

7. COOKIES ET TRACEURS
[Décrire les traceurs utilisés sur {{site_web}} et le mode de recueil du consentement, ou indiquer qu'aucun traceur soumis à consentement n'est utilisé.]

8. MISE À JOUR
Cette politique peut évoluer ; la date de dernière mise à jour figure en en-tête.
${FOOTER}`,
  },
  {
    id: 'registre-rgpd',
    type: 'Registre RGPD',
    name: 'Registre des activités de traitement (RGPD, article 30)',
    description: 'Trame du registre avec trois traitements courants à compléter.',
    content: `REGISTRE DES ACTIVITÉS DE TRAITEMENT
Responsable de traitement : {{entreprise}}, {{adresse}}
Représentant légal : {{dirigeant}}
Contact protection des données : {{contact_donnees}}
Dernière mise à jour : {{date_effet}}

Chaque fiche décrit un traitement. Les trois fiches ci-dessous sont des exemples courants : à adapter, compléter ou supprimer selon l'activité réelle. Les éléments entre crochets sont à renseigner.

---
TRAITEMENT 1 : Gestion du personnel et de la paie
- Finalité : gérer les contrats, la paie, les congés et les obligations sociales.
- Base légale : exécution du contrat de travail ; obligation légale.
- Personnes concernées : salariés, candidats retenus.
- Catégories de données : identité, coordonnées, situation familiale utile à la paie, données de rémunération, [numéro de sécurité sociale pour les déclarations sociales].
- Destinataires : service RH/direction, expert-comptable, organismes sociaux.
- Transferts hors Union européenne : [aucun / à préciser].
- Durée de conservation : [durée du contrat + durées légales].
- Mesures de sécurité : accès restreint, comptes nominatifs avec double authentification, sauvegardes, [chiffrement].

---
TRAITEMENT 2 : Gestion de la relation client et prospection
- Finalité : gérer les clients, devis, factures, contacts commerciaux.
- Base légale : exécution du contrat ; intérêt légitime pour la prospection professionnelle.
- Personnes concernées : clients, prospects, contacts professionnels.
- Catégories de données : identité, coordonnées professionnelles, historique des échanges, facturation.
- Destinataires : équipe commerciale et administrative, hébergeur : {{hebergeur_donnees}}, expert-comptable.
- Transferts hors Union européenne : [aucun / à préciser].
- Durée de conservation : [durée de la relation + délai à définir ; prospects : délai à définir sans contact].
- Mesures de sécurité : accès restreint, double authentification, sauvegardes, journalisation.

---
TRAITEMENT 3 : Gestion technique et sécurité du système d'information
- Finalité : assurer la sécurité du système (comptes, journaux de connexion, détection d'incidents).
- Base légale : intérêt légitime ; obligation de sécurité (RGPD, article 32).
- Personnes concernées : collaborateurs et prestataires utilisant le système.
- Catégories de données : identifiants, adresses IP, journaux de connexion et d'usage.
- Destinataires : référent sécurité, prestataire informatique ({{prestataire_it}}), {{rssi}}.
- Transferts hors Union européenne : [aucun / à préciser].
- Durée de conservation : [durée à définir pour les journaux].
- Mesures de sécurité : accès restreint aux journaux, horodatage fiable, sauvegardes.

---
SOUS-TRAITANTS (à lister)
[Nom, service rendu, pays d'hébergement, accord de sous-traitance signé : oui/non]
${FOOTER}`,
  },
  {
    id: 'sous-traitance-rgpd',
    type: 'Sous-traitance',
    name: 'Accord de sous-traitance de données personnelles (RGPD, article 28)',
    description: 'Contrat entre le client (responsable de traitement) et le prestataire (sous-traitant).',
    content: `ACCORD DE SOUS-TRAITANCE DE DONNÉES PERSONNELLES
(article 28 du règlement (UE) 2016/679, « RGPD »)

ENTRE
{{entreprise}}, {{adresse}}, représentée par {{dirigeant}}, ci-après « le responsable de traitement »,
ET
{{sous_traitant_nom}}, {{sous_traitant_adresse}}, ci-après « le sous-traitant ».

Le présent accord complète le contrat de prestation conclu entre les parties et prend effet le {{date_effet}}.

ARTICLE 1 - OBJET ET DURÉE
Le sous-traitant traite des données personnelles pour le compte du responsable de traitement dans le cadre suivant : {{objet_prestation}}.
Durée du traitement : {{duree_prestation}}.

ARTICLE 2 - DONNÉES ET PERSONNES CONCERNÉES
Nature et finalité : réalisation de la prestation décrite à l'article 1, et uniquement elle.
Types de données : {{types_donnees}}.
Catégories de personnes concernées : {{categories_personnes}}.

ARTICLE 3 - OBLIGATIONS DU SOUS-TRAITANT
Le sous-traitant s'engage à :
a) traiter les données uniquement sur instruction documentée du responsable de traitement, y compris pour les transferts hors Union européenne, sauf obligation légale (il en informe alors le responsable avant le traitement, sauf interdiction) ;
b) garantir que les personnes autorisées à traiter les données s'engagent à la confidentialité ;
c) mettre en œuvre les mesures de sécurité appropriées (article 32 du RGPD) : contrôle des accès, double authentification, journalisation, sauvegardes, mises à jour ;
d) ne recruter un autre sous-traitant qu'avec l'autorisation écrite préalable du responsable de traitement, et lui imposer les mêmes obligations. Sous-traitants ultérieurs autorisés à la date de l'accord : {{sous_traitants_ulterieurs}} ;
e) aider le responsable de traitement à répondre aux demandes d'exercice des droits des personnes ;
f) l'aider à respecter ses obligations de sécurité, de notification des violations et d'analyse d'impact, compte tenu de la nature du traitement ;
g) notifier au responsable de traitement toute violation de données personnelles dans les meilleurs délais après en avoir pris connaissance, à l'adresse {{contact_securite}}, avec les informations utiles à sa propre notification ;
h) au terme de la prestation, selon le choix du responsable de traitement, supprimer toutes les données ou les lui restituer, et détruire les copies existantes, sauf obligation légale de conservation ;
i) mettre à disposition les informations nécessaires pour démontrer le respect de ses obligations et permettre des audits, y compris des inspections, réalisés par le responsable de traitement ou un auditeur qu'il a mandaté, avec un préavis raisonnable ;
j) informer immédiatement le responsable de traitement si une instruction lui paraît contraire à la réglementation sur la protection des données.

ARTICLE 4 - OBLIGATIONS DU RESPONSABLE DE TRAITEMENT
Le responsable de traitement fournit les données nécessaires, documente ses instructions, veille au respect du RGPD et de ses propres obligations, notamment l'information des personnes concernées.

ARTICLE 5 - CONTACTS
Pour les questions de protection des données : {{contact_donnees}}.

ARTICLE 6 - DROIT APPLICABLE
Le présent accord est soumis au droit français. [Préciser la juridiction compétente.]

Fait en deux exemplaires, à {{ville}}, le {{date_effet}}

Pour le responsable de traitement :          Pour le sous-traitant :
{{dirigeant}}                                 [Nom et fonction du signataire]
${FOOTER}`,
  },
];
