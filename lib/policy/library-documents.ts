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
  {
    id: 'droits-personnes',
    type: 'Droits des personnes',
    name: "Procédure d'exercice des droits des personnes (RGPD)",
    description: 'Comment recevoir, vérifier, traiter et tracer une demande d’accès, de rectification, d’effacement, etc.',
    content: `PROCÉDURE D'EXERCICE DES DROITS DES PERSONNES
{{entreprise}} - applicable à compter du {{date_effet}}
Contact pour les demandes : {{contact_donnees}}

1. OBJET
Toute personne dont {{entreprise}} traite les données (client, prospect, salarié, candidat, visiteur du site) peut demander l'accès à ses données, leur rectification, leur effacement, la limitation du traitement, la portabilité, et s'opposer à un traitement. Cette procédure explique comment ces demandes sont reçues et traitées.

2. DROITS CONCERNÉS
- Accès : obtenir une copie des données et des informations sur leur traitement.
- Rectification : corriger des données inexactes ou incomplètes.
- Effacement : demander la suppression, dans les cas prévus par le RGPD.
- Limitation : geler temporairement l'usage des données.
- Opposition : refuser un traitement, et refuser à tout moment la prospection commerciale.
- Portabilité : récupérer ses données dans un format courant, lorsque le traitement repose sur le consentement ou le contrat et qu'il est automatisé.

3. RÉCEPTION D'UNE DEMANDE
Une demande peut arriver par tout canal (courriel, courrier, téléphone, formulaire, réseaux sociaux). Toute personne de l'entreprise qui la reçoit la transmet le jour même à {{contact_donnees}}, sans y répondre elle-même sur le fond. La date de réception est notée : c'est le point de départ du délai.

4. VÉRIFICATION DE L'IDENTITÉ
Si un doute existe sur l'identité du demandeur, on demande uniquement les éléments nécessaires pour la confirmer, de façon proportionnée. Ne pas demander une pièce d'identité systématiquement. Jamais de donnée supplémentaire inutile.

5. TRAITEMENT ET DÉLAIS
- Accusé de réception rapide.
- Réponse dans un délai d'un mois à compter de la réception de la demande. Si la demande est complexe ou nombreuses, ce délai peut être prolongé de deux mois, en en informant la personne dans le premier mois avec le motif.
- La réponse est gratuite, sauf demande manifestement infondée ou excessive.
- En cas de refus, la personne est informée du motif et de la possibilité de saisir la CNIL.
- Les destinataires des données (dont les sous-traitants, par exemple {{prestataire_it}} et {{hebergeur_donnees}}) sont informés des rectifications ou effacements, lorsque c'est applicable.

6. SUIVI
Chaque demande est consignée dans un registre des demandes : date de réception, nature du droit, identité vérifiée oui/non, date de réponse, décision, motif en cas de refus. Ce registre est conservé {{duree_conservation_donnees}}.

7. REVUE
Cette procédure est revue au moins une fois par an par {{dirigeant}} ou son délégué, et testée sur un cas fictif.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'violation-donnees',
    type: 'Violation de données',
    name: 'Procédure et registre des violations de données personnelles',
    description: 'Que faire en cas de perte, vol ou fuite de données personnelles : évaluer, notifier la CNIL, informer, tracer.',
    content: `PROCÉDURE EN CAS DE VIOLATION DE DONNÉES PERSONNELLES
{{entreprise}} - applicable à compter du {{date_effet}}
Contact interne : {{contact_securite}} - Contact protection des données : {{contact_donnees}}

1. DÉFINITION
Une violation de données personnelles est une atteinte à leur sécurité : perte, vol, destruction, altération, divulgation ou accès non autorisé, accidentels ou malveillants (ordinateur volé, courriel envoyé au mauvais destinataire, rançongiciel, compte piraté, base exposée).

2. SIGNALER IMMÉDIATEMENT
Toute personne qui constate ou soupçonne une violation le signale sans délai à {{contact_securite}}. Ne pas supprimer de preuves, ne pas éteindre brutalement les machines sans consigne, ne pas communiquer à l'extérieur.

3. CONTENIR ET ÉVALUER
{{referent_securite}} avec l'appui de {{rssi}} :
a) arrête ou limite l'incident (changement de mots de passe, déconnexion, isolement du poste) ;
b) note ce qui s'est passé, les données et les personnes concernées, le nombre approximatif ;
c) évalue le risque pour les personnes : faible, probable, élevé (identité, coordonnées bancaires, santé, mots de passe, données de mineurs, volume, facilité d'identification).

4. NOTIFICATION À LA CNIL
Si la violation est susceptible d'engendrer un risque pour les droits et libertés des personnes, elle est notifiée à la CNIL dès que possible et, si possible, au plus tard 72 heures après en avoir pris connaissance (article 33 du RGPD), via le téléservice de notification de la CNIL. Si toutes les informations ne sont pas disponibles, la notification est faite par étapes. Si la notification dépasse 72 heures, le retard est motivé.
Si le risque est faible, la violation n'est pas notifiée mais elle est consignée au registre.

5. INFORMATION DES PERSONNES
Si le risque est élevé pour les personnes, elles sont informées dans les meilleurs délais, en termes clairs : nature de la violation, conséquences probables, mesures prises, conseils pour se protéger, contact {{contact_donnees}} (article 34 du RGPD).

6. SOUS-TRAITANTS
Lorsqu'un sous-traitant ({{prestataire_it}}, {{hebergeur_donnees}}) est concerné, il avertit {{entreprise}} sans délai, conformément à l'accord de sous-traitance. Le délai de 72 heures court à partir du moment où {{entreprise}} en a connaissance.

7. REGISTRE DES VIOLATIONS
Toute violation, notifiée ou non, est inscrite au registre :
- Date et heure de découverte, date présumée de survenue
- Description des faits et cause
- Données et nombre de personnes concernées
- Conséquences probables et niveau de risque retenu
- Mesures prises pour y remédier
- Notification à la CNIL : oui/non, date, justification si non
- Information des personnes : oui/non, date
- Leçons tirées et actions de prévention

8. APRÈS L'INCIDENT
Un retour d'expérience est fait sous un mois : cause racine, correction, mise à jour des mesures de sécurité et information des équipes. En cas de fraude, d'extorsion ou de piratage, un dépôt de plainte est envisagé.

9. REVUE ET EXERCICE
Procédure revue chaque année par {{dirigeant}}, et testée au moins une fois par an par un exercice simulé.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'conservation-donnees',
    type: 'Conservation',
    name: 'Politique de durées de conservation des données',
    description: 'Combien de temps garder chaque catégorie de données, puis archiver ou supprimer.',
    content: `POLITIQUE DE DURÉES DE CONSERVATION DES DONNÉES
{{entreprise}} - applicable à compter du {{date_effet}}
Responsable : {{contact_donnees}}

1. PRINCIPE
Les données personnelles ne sont conservées que le temps nécessaire à la finalité pour laquelle elles ont été collectées (principe de limitation de la conservation, RGPD). Passé ce délai, elles sont supprimées ou anonymisées, ou archivées avec accès restreint lorsqu'une obligation légale l'impose.

2. LES TROIS TEMPS DE LA CONSERVATION
- Base active : les données servent au quotidien, accès aux équipes concernées.
- Archivage intermédiaire : les données ne servent plus au quotidien mais doivent être gardées (obligation légale, preuve, contentieux possible) ; accès limité aux personnes habilitées.
- Suppression ou anonymisation à l'échéance.

3. DURÉES APPLIQUÉES
Durées retenues par {{entreprise}} : {{duree_conservation_donnees}}.
Pour chaque catégorie (clients, prospects, salariés, candidats non retenus, journaux de connexion, vidéosurveillance, sauvegardes), les durées sont fixées d'après la finalité et les obligations légales applicables, à confirmer au cas par cas : [compléter la durée légale ou usuelle de chaque ligne et sa justification].

4. MISE EN ŒUVRE
- Une revue d'épuration est faite au moins une fois par an par {{referent_securite}} sur chaque outil (messagerie, logiciel de gestion, espaces partagés, sauvegardes).
- Les suppressions sont tracées (date, périmètre, personne).
- Les sauvegardes expirent selon leur durée propre ; une donnée supprimée peut subsister dans les sauvegardes jusqu'à leur expiration.
- Les supports et équipements mis au rebut sont effacés de façon sûre.

5. DEMANDES DES PERSONNES
Une demande d'effacement est traitée selon la procédure d'exercice des droits.

6. REVUE
Cette politique est revue chaque année et à chaque nouveau traitement. {{dirigeant}} la valide.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'usage-ia',
    type: 'Usage de l’IA',
    name: "Charte d'usage des outils d'intelligence artificielle",
    description: 'Quels outils d’IA sont autorisés, quelles données ne jamais y mettre, comment vérifier les résultats.',
    content: `CHARTE D'USAGE DES OUTILS D'INTELLIGENCE ARTIFICIELLE
{{entreprise}} - applicable à compter du {{date_effet}}
Référent : {{referent_securite}} - Contact : {{contact_securite}}

Note : cette charte repose sur du bon sens de sécurité et sur les principes généraux du RGPD (minimisation, sécurité, sous-traitance). Aucune source officielle spécifique n'a été vérifiée pour ce document : point à valider par le consultant.

1. OBJET
Encadrer l'usage des assistants et outils d'IA générative (chatbots, traduction, rédaction, génération d'images, assistants de code, transcription de réunions) par les collaborateurs de {{entreprise}}.

2. OUTILS AUTORISÉS
Seuls les outils validés par {{referent_securite}} peuvent être utilisés pour le travail : [liste des outils autorisés, version et type de compte professionnel]. Tout autre outil, y compris sur un compte personnel, est interdit pour des contenus professionnels. Une demande d'ajout d'outil passe par {{contact_securite}}.

3. CE QU'ON NE SAISIT JAMAIS DANS UN OUTIL NON VALIDÉ
- données personnelles de clients, salariés, candidats ou prospects ;
- informations confidentielles de l'entreprise ou de ses clients (contrats, tarifs, plans, code source non public) ;
- mots de passe, clés d'accès, jetons, identifiants ;
- documents couverts par un engagement de confidentialité.
Dans un outil validé, on saisit le minimum nécessaire et on anonymise dès que possible.

4. VÉRIFICATION DES RÉSULTATS
Une réponse d'IA peut être fausse, incomplète ou inventée. Toute information utilisée est vérifiée avant diffusion. Une décision qui concerne une personne (recrutement, sanction, crédit, évaluation) ne repose jamais uniquement sur un outil d'IA. La personne qui utilise l'outil reste responsable du résultat.

5. TRANSPARENCE
Les contenus produits avec une IA et destinés à l'extérieur sont relus par un humain. Lorsqu'un client ou un partenaire l'exige, l'usage de l'IA lui est indiqué.

6. PRESTATAIRES ET CONTRATS
Avant de valider un outil, on vérifie : où sont hébergées les données, si elles servent à entraîner le modèle, la durée de conservation, la possibilité de désactiver l'historique, la présence d'un accord de sous-traitance lorsque des données personnelles sont concernées.

7. INCIDENTS
Une donnée saisie par erreur dans un outil non autorisé est signalée aussitôt à {{contact_securite}}, qui évalue s'il y a violation de données (voir la procédure dédiée).

8. REVUE
Charte revue au moins tous les six mois, les outils évoluant vite. {{dirigeant}} la valide.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
  {
    id: 'teletravail-appareils',
    type: 'Télétravail',
    name: 'Politique de télétravail et d’usage des appareils personnels',
    description: 'Règles de sécurité en télétravail, en déplacement et pour les appareils personnels utilisés au travail.',
    content: `POLITIQUE DE TÉLÉTRAVAIL ET D'USAGE DES APPAREILS PERSONNELS
{{entreprise}} - applicable à compter du {{date_effet}}
Référent : {{referent_securite}} - Contact : {{contact_securite}} - Urgence : {{telephone_urgence}}

Note : ces règles reprennent des mesures de sécurité courantes (accès, mises à jour, chiffrement, sauvegardes). Aucune source officielle spécifique n'a été vérifiée pour ce document : point à valider par le consultant.

1. OBJET ET PÉRIMÈTRE
Fixer les règles de sécurité quand les collaborateurs de {{entreprise}} travaillent hors des locaux (domicile, déplacement, lieu public) et quand un appareil personnel est utilisé pour le travail.

2. ÉQUIPEMENT
- Préférer l'équipement fourni par l'entreprise. Un appareil personnel n'est utilisé que s'il est autorisé par {{referent_securite}} et respecte les conditions du point 5.
- Le matériel professionnel n'est pas prêté à un tiers, y compris à la famille.

3. ACCÈS À DISTANCE
- Accès aux ressources de l'entreprise uniquement par les moyens validés, avec double authentification.
- Pas de connexion à des services professionnels depuis un ordinateur public ou partagé.
- Wi-Fi du domicile protégé par un mot de passe robuste ; Wi-Fi public évité, ou utilisé uniquement avec le moyen d'accès sécurisé validé.

4. LIEU DE TRAVAIL
- Écran verrouillé dès qu'on s'éloigne ; écran non visible par des tiers dans un lieu public.
- Documents papier confidentiels rangés ; pas d'impression de données sensibles à domicile, ou détruites de façon sûre.
- Conversations confidentielles tenues hors de portée d'oreilles extérieures et d'assistants vocaux.

5. APPAREILS PERSONNELS (si autorisés)
- Système et applications à jour, protection contre les logiciels malveillants active, verrouillage par code ou biométrie, stockage chiffré.
- Compte professionnel séparé du compte personnel ; aucune donnée de l'entreprise copiée dans des services personnels.
- L'entreprise peut effacer à distance les données professionnelles de l'appareil en cas de perte ou de départ ; elle n'accède pas aux données personnelles.
- Appareil débridé ou non à jour : accès refusé.

6. PERTE OU VOL
Perte ou vol d'un équipement : signalement immédiat à {{contact_securite}} ou au {{telephone_urgence}}, changement des mots de passe concernés, verrouillage ou effacement à distance si possible. Si des données personnelles sont concernées, appliquer la procédure de violation de données.

7. SAUVEGARDE
Les fichiers de travail sont enregistrés sur les espaces de l'entreprise et non uniquement sur l'appareil.

8. DÉPART OU FIN DE MISSION
Matériel restitué, accès supprimés le jour du départ, données professionnelles effacées des appareils personnels.

9. REVUE
Politique revue chaque année par {{dirigeant}}.

Fait à {{ville}}, le {{date_effet}}
{{dirigeant}}
${FOOTER}`,
  },
];
