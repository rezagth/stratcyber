# Guide RGPD Complet - StratCyber

## Vue d'ensemble

Ce guide complet vous accompagne dans la mise en conformité RGPD de votre organisation, en s'appuyant sur les recommandations officielles de la CNIL et les meilleures pratiques éprouvées.

> **Sources officielles** : [CNIL - Guide du sous-traitant](https://www.cnil.fr/fr/rgpd-guide-du-sous-traitant) | [CNIL - Guide du responsable de traitement](https://www.cnil.fr/fr/rgpd-guide-du-responsable-de-traitement)

---

## 1. Comprendre le RGPD

### 1.1 Principes fondamentaux

Le RGPD repose sur 8 principes clés que toute organisation doit respecter :

1. **Licéité** : Le traitement doit avoir une base légale
2. **Loyauté** : Information claire des personnes concernées
3. **Transparence** : Accessibilité des informations
4. **Limitation des finalités** : Objectifs déterminés et légitimes
5. **Minimisation** : Données adéquates et non excessives
6. **Exactitude** : Données exactes et à jour
7. **Limitation de la conservation** : Durées appropriées
8. **Intégrité et confidentialité** : Sécurité des données

### 1.2 Champ d'application

**Critère territorial** :
- Organisations établies dans l'UE
- Organisations hors UE traitant des données de résidents UE

**Critères matériels** :
- Traitement automatisé de données personnelles
- Traitement non automatisé dans un fichier structuré

---

## 2. Identification des Rôles et Responsabilités

### 2.1 Responsable de traitement

**Définition** : Personne physique ou morale qui détermine les finalités et moyens du traitement.

**Obligations principales** :
- Respecter les principes du RGPD
- Mettre en place des mesures de sécurité
- Tenir un registre des traitements
- Effectuer une AIPD si nécessaire
- Notifier les violations de données
- Répondre aux demandes d'exercice des droits

### 2.2 Sous-traitant

**Définition** : Personne physique ou morale qui traite des données pour le compte du responsable.

**Obligations spécifiques** :
- Ne traiter que sur instruction documentée
- Assurer la sécurité du traitement
- Tenir un registre des traitements
- Notifier les violations au responsable
- Assister le responsable dans ses obligations

### 2.3 Délégué à la Protection des Données (DPD)

**Désignation obligatoire** :
- Autorités publiques
- Traitement systématique et étendu de données sensibles
- Traitement systématique et étendu pour surveillance

**Missions** :
- Informer et conseiller
- Contrôler le respect du RGPD
- Coopérer avec l'autorité de contrôle
- Faire office de point de contact

---

## 3. Registre des Traitements

### 3.1 Contenu obligatoire

Pour chaque traitement, documenter :

**Informations générales** :
- Nom et coordonnées du responsable/sous-traitant
- Finalités du traitement
- Catégories de personnes concernées
- Catégories de données personnelles

**Informations techniques** :
- Destinataires des données
- Transferts hors UE
- Durées de conservation
- Mesures de sécurité

### 3.2 Template de registre StratCyber

```markdown
## Fiche Traitement : [NOM_TRAITEMENT]

### Identification
- **Responsable** : [Nom, fonction, coordonnées]
- **DPD** : [Nom, coordonnées]
- **Date de création** : [Date]
- **Dernière mise à jour** : [Date]

### Description du traitement
- **Finalité** : [Objectif précis]
- **Base légale** : [Article 6 RGPD]
- **Intérêt légitime** : [Si applicable]

### Données traitées
- **Catégories de personnes** : [Ex: clients, employés]
- **Données personnelles** : [Liste détaillée]
- **Données sensibles** : [Si applicable avec base légale spéciale]

### Destinataires
- **Internes** : [Services concernés]
- **Externes** : [Prestataires, partenaires]
- **Transferts hors UE** : [Pays, garanties]

### Conservation
- **Durée** : [Période précise]
- **Critère** : [Justification]
- **Sort final** : [Suppression/archivage]

### Sécurité
- **Mesures techniques** : [Chiffrement, accès, sauvegarde]
- **Mesures organisationnelles** : [Procédures, formation]
```

---

## 4. Droits des Personnes Concernées

### 4.1 Droit d'information (Articles 13-14)

**Information à fournir** :
- Identité du responsable et du DPD
- Finalités et base légale
- Intérêts légitimes poursuivis
- Destinataires des données
- Durée de conservation
- Droits de la personne
- Droit de réclamation

### 4.2 Droit d'accès (Article 15)

**Contenu de la réponse** :
- Confirmation de l'existence du traitement
- Copie des données personnelles
- Finalités du traitement
- Catégories de données
- Destinataires
- Durée de conservation
- Droits de rectification et d'effacement
- Source des données si non collectées directement

**Template de réponse d'accès** :
```
Madame, Monsieur,

Suite à votre demande du [DATE], nous vous confirmons que nous traitons vos données personnelles dans le cadre de [FINALITÉ].

Données vous concernant :
- [Liste des données]

Ces données sont conservées pendant [DURÉE] et peuvent être transmises à [DESTINATAIRES].

Vous disposez d'un droit de rectification, d'effacement, de limitation et de portabilité de vos données.

Cordialement,
[SIGNATURE]
```

### 4.3 Droit de rectification (Article 16)

**Obligations** :
- Rectifier sans délai
- Informer les destinataires si possible
- Preuves à l'appui de la demande

### 4.4 Droit à l'effacement (Article 17)

**Cas d'application** :
- Données non nécessaires
- Retrait du consentement
- Traitement illicite
- Obligation légale d'effacement
- Données collectées auprès d'enfants

**Exceptions** :
- Liberté d'expression
- Obligation légale
- Intérêt public
- Constatation de droits en justice

### 4.5 Droit de portabilité (Article 20)

**Conditions** :
- Données fournies par la personne
- Traitement automatisé
- Base légale : consentement ou contrat

**Format** : Structuré, usuel et lisible par machine

---

## 5. Sécurité des Données

### 5.1 Mesures de sécurité obligatoires

**Mesures techniques** :
- Chiffrement des données
- Pseudonymisation
- Contrôle d'accès
- Sauvegarde et restauration
- Test de sécurité régulier

**Mesures organisationnelles** :
- Politique de sécurité
- Formation du personnel
- Gestion des accès
- Procédures d'incident
- Audit et contrôle

### 5.2 Analyse d'impact (AIPD)

**Obligation d'AIPD** :
- Évaluation systématique et approfondie
- Traitement systématique et étendu de données sensibles
- Surveillance systématique de zones accessibles au public
- Liste CNIL des traitements nécessitant une AIPD

**Contenu de l'AIPD** :
1. Description systématique du traitement
2. Évaluation de la nécessité et proportionnalité
3. Évaluation des risques
4. Mesures envisagées

### 5.3 Template AIPD StratCyber

```markdown
# Analyse d'Impact RGPD - [TRAITEMENT]

## 1. Description du traitement
- **Finalité** : 
- **Nature des données** : 
- **Volume** : 
- **Fonctionnement** : 

## 2. Nécessité et proportionnalité
- **Objectif légitime** : 
- **Adéquation** : 
- **Nécessité** : 
- **Proportionnalité** : 

## 3. Risques identifiés
- **Accès illégal** : [Impact/Vraisemblance]
- **Modification non désirée** : [Impact/Vraisemblance]
- **Disparition des données** : [Impact/Vraisemblance]

## 4. Mesures de protection
- **Mesures existantes** : 
- **Mesures supplémentaires** : 
- **Calendrier de mise en œuvre** : 

## 5. Validation
- **Date** : 
- **Validateur** : 
- **Avis DPD** : 
```

---

## 6. Violations de Données

### 6.1 Détection et qualification

**Types de violations** :
- Violation en confidentialité
- Violation en intégrité
- Violation en disponibilité

**Processus de détection** :
- Monitoring automatisé
- Signalement interne
- Découverte fortuite
- Signalement externe

### 6.2 Notification à la CNIL (Article 33)

**Délai** : 72 heures maximum après en avoir eu connaissance

**Contenu obligatoire** :
- Nature de la violation
- Catégories et nombre de personnes concernées
- Catégories et nombre d'enregistrements
- Conséquences probables
- Mesures prises ou envisagées

**Template de notification CNIL** :
```
NOTIFICATION DE VIOLATION DE DONNÉES PERSONNELLES

1. IDENTIFICATION
- Responsable de traitement : [NOM]
- Date/heure de la violation : [DATE/HEURE]
- Date de découverte : [DATE]

2. NATURE DE LA VIOLATION
- Type : [Confidentialité/Intégrité/Disponibilité]
- Origine : [Interne/Externe/Inconnue]
- Description : [Détails factuels]

3. DONNÉES CONCERNÉES
- Nombre de personnes : [NOMBRE]
- Catégories : [Ex: clients, employés]
- Types de données : [Ex: identité, coordonnées]
- Données sensibles : [OUI/NON - Si oui, préciser]

4. CONSÉQUENCES
- Risques identifiés : [Liste]
- Impact potentiel : [Faible/Modéré/Élevé]

5. MESURES PRISES
- Actions immédiates : [Liste]
- Mesures correctives : [Liste avec calendrier]
- Communication aux personnes : [OUI/NON - Justification]
```

### 6.3 Information des personnes concernées (Article 34)

**Obligation si** :
- Risque élevé pour les droits et libertés
- Pas de mesures de protection appropriées

**Contenu** :
- Nature de la violation
- Coordonnées du DPD
- Conséquences probables
- Mesures prises ou envisagées

---

## 7. Transferts Internationaux

### 7.1 Décision d'adéquation

**Pays avec décision d'adéquation** :
- Andorre, Argentine, Canada (commercial)
- Îles Féroé, Guernesey, Israël
- Île de Man, Jersey, Nouvelle-Zélande
- Suisse, Uruguay, Royaume-Uni
- Corée du Sud, Japon

### 7.2 Garanties appropriées

**Instruments juridiques** :
- Clauses contractuelles types
- Règles d'entreprise contraignantes
- Codes de conduite approuvés
- Mécanismes de certification

**Clauses contractuelles types** :
- Version 2021 en vigueur
- 4 modules selon les rôles
- Annexes obligatoires

### 7.3 Template d'évaluation de transfert

```markdown
## Évaluation de Transfert - [DESTINATAIRE]

### Identification
- **Destinataire** : [Nom, pays]
- **Finalité** : [Objectif du transfert]
- **Données** : [Catégories transférées]

### Base juridique
- **Décision d'adéquation** : [OUI/NON]
- **Garanties appropriées** : [Type utilisé]
- **Dérogation spécifique** : [Si applicable]

### Évaluation complémentaire
- **Législation locale** : [Analyse des lois]
- **Mesures supplémentaires** : [Si nécessaires]
- **Conclusion** : [Autorisation/Interdiction]
```

---

## 8. Contrôles et Sanctions

### 8.1 Pouvoirs de la CNIL

**Pouvoirs d'investigation** :
- Demande d'informations
- Contrôle sur place ou sur pièces
- Audition de personnes

**Pouvoirs correctifs** :
- Avertissement et rappel à l'ordre
- Injonction de mise en conformité
- Limitation temporaire du traitement
- Ordre de rectification ou d'effacement
- Suspension des flux de données
- Amende administrative

### 8.2 Montant des amendes

**Niveau 1** (maximum) :
- 10 millions d'euros OU
- 2% du chiffre d'affaires annuel mondial

**Niveau 2** (maximum) :
- 20 millions d'euros OU
- 4% du chiffre d'affaires annuel mondial

### 8.3 Critères d'évaluation

**Facteurs aggravants** :
- Nature, gravité et durée
- Caractère intentionnel
- Catégories de données concernées
- Nombre de personnes affectées
- Coopération avec l'autorité

**Facteurs atténuants** :
- Mesures techniques et organisationnelles
- Notification proactive
- Coopération active
- Antécédents

---

## 9. Outils Pratiques StratCyber

### 9.1 Checklist de conformité RGPD

- [ ] Registre des traitements complet
- [ ] Information des personnes concernées
- [ ] Procédure de gestion des droits
- [ ] Mesures de sécurité appropriées
- [ ] Procédure de notification des violations
- [ ] AIPD réalisées si nécessaire
- [ ] Contrats avec les sous-traitants
- [ ] Formation du personnel
- [ ] Désignation DPD si obligatoire
- [ ] Documentation des mesures prises

### 9.2 Modèles de documents

**Disponibles sur StratCyber** :
- Registre de traitement
- Mentions d'information
- Formulaires d'exercice des droits
- Contrat de sous-traitance RGPD
- Procédure de gestion des violations
- Template d'AIPD
- Politique de confidentialité

### 9.3 Formation et sensibilisation

**Modules disponibles** :
- RGPD pour les dirigeants
- RGPD pour les RH
- RGPD pour les équipes IT
- RGPD pour les équipes marketing
- Gestion des violations de données
- Droits des personnes concernées

---

## 10. Ressources et Contact

### 10.1 Sources officielles

- **CNIL** : [cnil.fr](https://www.cnil.fr)
- **EDPB** : [edpb.europa.eu](https://edpb.europa.eu)
- **Texte du RGPD** : [eur-lex.europa.eu](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32016R0679)

### 10.2 Support StratCyber

Pour toute question sur cette documentation :
- **Email** : compliance@stratcyber.com
- **Documentation** : Section RGPD de votre dashboard
- **Formation** : Modules interactifs disponibles

---

*Dernière mise à jour : [DATE]*
*Version : 1.0*

> **Avertissement** : Cette documentation est fournie à titre informatif. Elle ne constitue pas un conseil juridique. Pour des situations spécifiques, consultez un avocat spécialisé en protection des données.
