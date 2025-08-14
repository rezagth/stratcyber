# Sécurité des Accès et Authentification

**Auteur**: StratCyber Formation  
**Catégorie**: Fondamentaux  
**Difficulté**: Débutant  
**Durée estimée**: 2h 30min  
**Tags**: #Accès #Authentification #Contrôle #Sécurité

## Table des matières

1. [Introduction](#introduction)
2. [Principes fondamentaux de la gestion des accès](#principes-fondamentaux)
3. [Authentification forte et multifacteur](#authentification-forte)
4. [Contrôle d'accès basé sur les rôles](#controle-acces-rbac)
5. [Gestion du cycle de vie des identités](#cycle-vie-identites)
6. [Surveillance et audit des accès](#surveillance-audit)
7. [Plan d'action pratique](#plan-action)
8. [Quiz de validation](#quiz)

---

## Introduction

La sécurité des accès constitue le premier rempart de votre système d'information. Dans un contexte où les cyberattaques se multiplient et se sophistiquent, la maîtrise de l'authentification et du contrôle d'accès devient cruciale pour toute organisation.

### Pourquoi ce guide ?

- **68% des violations** de données impliquent des identifiants compromis
- **81% des attaques** exploitent des mots de passe faibles ou volés  
- **Le coût moyen** d'une violation liée aux accès : 4,5M€

### Ce que vous allez apprendre

✅ Les principes fondamentaux de la gestion des accès  
✅ Comment mettre en place une authentification forte  
✅ Les meilleures pratiques de contrôle d'accès  
✅ Comment surveiller et auditer les accès  
✅ Un plan d'action concret pour votre organisation  

---

## Principes fondamentaux de la gestion des accès {#principes-fondamentaux}

### Le principe du moindre privilège

**Définition**: Chaque utilisateur ne dispose que des droits strictement nécessaires à l'accomplissement de ses tâches.

#### Mise en pratique :

1. **Analyse des besoins**
   - Cartographier les rôles et responsabilités
   - Identifier les ressources nécessaires par fonction
   - Documenter les accès légitimes

2. **Attribution granulaire**
   ```
   Exemple pratique :
   - Comptable : Accès lecture/écriture sur les fichiers financiers uniquement
   - RH : Accès aux données personnelles dans le SIRH uniquement  
   - IT : Accès administrateur sur l'infrastructure, lecture sur les données métier
   ```

3. **Révision régulière**
   - Audit trimestriel des droits
   - Révision lors des changements de poste
   - Suppression automatique des comptes inactifs

### Séparation des tâches (SoD)

**Objectif**: Empêcher qu'une seule personne puisse compromettre un processus critique.

#### Exemples concrets :

**Dans la finance :**
- Personne A : Saisie des factures
- Personne B : Validation des paiements
- Personne C : Exécution des virements

**Dans l'IT :**
- Admin système : Gestion infrastructure
- Admin sécurité : Gestion des politiques
- Auditeur : Contrôle et reporting

### Authentification défense en profondeur

#### Les 3 facteurs d'authentification :

1. **Ce que vous savez** (mot de passe, PIN)
2. **Ce que vous avez** (token, smartphone)
3. **Ce que vous êtes** (biométrie, comportement)

---

## Authentification forte et multifacteur {#authentification-forte}

### Pourquoi l'authentification multifacteur (MFA) ?

**Statistiques clés :**
- Réduit les risques de compromission de **99,9%**
- Protection contre **99,9%** des attaques automatisées
- ROI moyen de **300%** sur 3 ans

### Types de MFA recommandés

#### 1. TOTP (Time-based One-Time Password)
```
Avantages :
✅ Gratuit et facile à déployer
✅ Fonctionne hors ligne
✅ Applications : Google Authenticator, Authy, Microsoft Authenticator

Inconvénients :
❌ Vulnérable au phishing sophistiqué
❌ Peut être perdu avec le téléphone
```

#### 2. Push notifications
```
Avantages :
✅ Expérience utilisateur fluide
✅ Informations contextuelles (localisation, appareil)
✅ Difficult à intercepter

Inconvénients :
❌ Nécessite une connexion internet
❌ Fatigue d'authentification possible
```

#### 3. Clés de sécurité hardware (FIDO2/WebAuthn)
```
Avantages :
✅ Protection maximale contre le phishing
✅ Pas de batterie, très fiable
✅ Standard ouvert

Inconvénients :
❌ Coût initial plus élevé
❌ Peut être perdu physiquement
```

### Plan de déploiement MFA

#### Phase 1 : Préparation (2 semaines)
- [ ] Audit des applications et services
- [ ] Choix de la solution MFA
- [ ] Formation des équipes IT
- [ ] Communication aux utilisateurs

#### Phase 2 : Pilote (2 semaines)  
- [ ] Déploiement sur un groupe test (IT, Direction)
- [ ] Tests et ajustements
- [ ] Recueil des retours d'expérience
- [ ] Affinement des procédures

#### Phase 3 : Déploiement général (4-8 semaines)
- [ ] Déploiement par vagues (priorité aux comptes privilégiés)
- [ ] Support utilisateur renforcé
- [ ] Monitoring des incidents
- [ ] Documentation des bonnes pratiques

### Gestion des mots de passe

#### Politique de mots de passe robuste

```
Exigences recommandées :
- Longueur minimale : 12 caractères
- Pas de restrictions de complexité arbitraires
- Pas d'expiration forcée (sauf compromission)
- Vérification contre les dictionnaires de mots de passe compromis
- Utilisation encouragée de gestionnaires de mots de passe
```

#### Gestionnaires de mots de passe recommandés

**Pour l'entreprise :**
- Bitwarden Business
- 1Password Business  
- Keeper Business

**Pour les particuliers :**
- Bitwarden
- KeePass
- 1Password

---

## Contrôle d'accès basé sur les rôles (RBAC) {#controle-acces-rbac}

### Architecture RBAC

```
Utilisateur → Rôle → Permissions → Ressources

Exemple :
Jean Dupont → Responsable Comptable → [Lecture/Écriture Finance] → [SAP, Excel Budgets]
```

### Définition des rôles types

#### Rôles administratifs
- **Admin Système** : Gestion infrastructure
- **Admin Sécurité** : Politiques et contrôles
- **Admin Base de Données** : Gestion des données
- **Admin Réseau** : Infrastructure réseau

#### Rôles métier
- **Manager** : Équipe + données départementales
- **Utilisateur Standard** : Données personnelles + partagées
- **Invité** : Accès limité et temporaire
- **Service Account** : Applications automatisées

### Matrice des droits

| Ressource | Admin Sys | Admin Sec | Manager | User | Invité |
|-----------|-----------|-----------|---------|------|--------|
| Serveurs | RW | R | - | - | - |
| Logs sécurité | R | RW | - | - | - |
| Données équipe | R | R | RW | R | - |
| Données personnelles | - | R | R | RW | - |
| Internet | RW | RW | RW | RW | R |

**Légende :** R=Lecture, W=Écriture, RW=Lecture+Écriture, -=Aucun accès

---

## Gestion du cycle de vie des identités {#cycle-vie-identites}

### Processus d'arrivée (Joiner)

#### Checklist d'arrivée
- [ ] Création du compte utilisateur
- [ ] Attribution du rôle selon le poste
- [ ] Provisioning des accès nécessaires
- [ ] Remise des équipements (laptop, badge, tokens)
- [ ] Formation sécurité obligatoire
- [ ] Signature de la charte informatique
- [ ] Test des accès avec l'utilisateur

#### Délais recommandés
- **J-3** : Préparation technique
- **J0** : Activation et formation
- **J+1** : Vérification fonctionnelle

### Processus de changement (Mover)

#### Changement de poste
- [ ] Révision des rôles et permissions
- [ ] Suppression des anciens accès
- [ ] Attribution des nouveaux accès
- [ ] Validation avec le nouveau manager
- [ ] Documentation du changement

#### Changement temporaire (mission, remplacement)
- [ ] Accès temporaires avec date d'expiration
- [ ] Validation du manager et du remplacé
- [ ] Révision automatique à l'échéance

### Processus de départ (Leaver)

#### Checklist de départ
- [ ] **H-1** : Planification de la désactivation
- [ ] **H0** : Désactivation immédiate des comptes
- [ ] **H+1** : Récupération des équipements
- [ ] **J+1** : Transfert/archivage des données
- [ ] **J+7** : Suppression définitive des comptes
- [ ] **J+30** : Audit de la procédure

---

## Surveillance et audit des accès {#surveillance-audit}

### Indicateurs clés (KPI)

#### Métriques de sécurité
- **Taux d'adoption MFA** : > 95%
- **Tentatives d'authentification échouées** : < 5% du total
- **Comptes dormants** : < 5% du total
- **Accès privilégiés** : < 10% des utilisateurs
- **Temps de désactivation départ** : < 4 heures

#### Métriques d'efficacité
- **Temps de provisioning** : < 2 heures
- **Incidents liés aux accès** : < 2 par mois
- **Durée de résolution des problèmes d'accès** : < 30 minutes
- **Satisfaction utilisateur** : > 4/5

### Outils de monitoring

#### Solutions SIEM recommandées
- **PME** : Wazuh (gratuit), AlienVault OSSIM
- **Moyennes entreprises** : Splunk, QRadar
- **Grandes entreprises** : ArcSight, LogRhythm

#### Logs à surveiller
```
- Authentifications réussies/échouées
- Élévations de privilèges  
- Accès aux ressources sensibles
- Modifications des permissions
- Connexions depuis des lieux inhabituels
- Tentatives d'accès hors horaires
```

### Alertes critiques

#### Configuration d'alertes
```yaml
Alerte Critique:
  - Tentatives de connexion admin échouées > 3
  - Accès privilégié hors horaires
  - Connexion depuis pays à risque
  - Modification des groupes d'administration
  
Alerte Important:
  - Connexions multiples simultanées
  - Accès à des ressources inhabituelles  
  - Échecs d'authentification répétés
  
Alerte Information:
  - Première connexion d'un nouvel utilisateur
  - Connexion depuis un nouvel appareil
```

---

## Plan d'action pratique {#plan-action}

### Évaluation de votre maturité actuelle

#### Questionnaire d'auto-évaluation

**Authentification** (Score sur 20)
- [ ] MFA activée sur tous les comptes privilégiés (5 pts)
- [ ] MFA activée sur tous les comptes utilisateurs (5 pts)  
- [ ] Politique de mots de passe robuste (3 pts)
- [ ] Gestionnaire de mots de passe déployé (3 pts)
- [ ] Formation utilisateurs réalisée (2 pts)
- [ ] Tests de phishing réguliers (2 pts)

**Contrôle d'accès** (Score sur 20)
- [ ] Principe du moindre privilège appliqué (5 pts)
- [ ] RBAC implémenté (4 pts)
- [ ] Séparation des tâches respectée (3 pts)
- [ ] Révision des droits trimestrielle (3 pts)
- [ ] Processus joiner/mover/leaver documenté (3 pts)
- [ ] Gestion des comptes de service (2 pts)

**Surveillance** (Score sur 20)
- [ ] Logs centralisés et surveillés (5 pts)
- [ ] Alertes automatisées configurées (4 pts)
- [ ] Tableau de bord des accès (3 pts)
- [ ] Audit des accès privilégiés (3 pts)
- [ ] Reporting mensuel (3 pts)
- [ ] Tests d'intrusion réguliers (2 pts)

#### Interprétation des scores
- **50-60** : Excellence - Maintenir et améliorer
- **40-49** : Bon niveau - Quelques ajustements  
- **30-39** : Acceptable - Efforts nécessaires
- **< 30** : Critique - Action immédiate requise

### Roadmap de déploiement

#### Phase 1 - Fondations (Mois 1-2)
**Priorité Critique**
- [ ] Inventaire de tous les comptes utilisateurs
- [ ] Activation MFA sur les comptes administrateurs
- [ ] Politique de mots de passe renforcée
- [ ] Formation équipe IT

**Budget estimé** : 5 000€ - 10 000€  
**Ressources** : 1 ETP IT pendant 2 semaines

#### Phase 2 - Déploiement (Mois 3-4)  
**Priorité Haute**
- [ ] Déploiement MFA généralisé
- [ ] Implémentation RBAC
- [ ] Processus joiner/mover/leaver
- [ ] Formation utilisateurs

**Budget estimé** : 15 000€ - 25 000€  
**Ressources** : 0.5 ETP IT pendant 2 mois

#### Phase 3 - Surveillance (Mois 5-6)
**Priorité Moyenne**
- [ ] Solution SIEM ou logs centralisés
- [ ] Tableaux de bord et KPI
- [ ] Automatisation des processus
- [ ] Tests et audits

**Budget estimé** : 10 000€ - 20 000€  
**Ressources** : 0.3 ETP IT + prestataire externe

### Actions immédiates (Cette semaine)

1. **Lundi** : Audit des comptes administrateurs
2. **Mardi** : Activation MFA pour les admins  
3. **Mercredi** : Installation gestionnaire de mots de passe
4. **Jeudi** : Formation équipe IT sur les bonnes pratiques
5. **Vendredi** : Communication aux utilisateurs du plan

### Ressources et outils

#### Solutions recommandées par budget

**Budget < 5K€/an**
- MFA : Microsoft Authenticator + Azure AD Basic
- Monitoring : Wazuh (gratuit)
- Formation : Ressources internes + guides gratuits

**Budget 5-20K€/an** 
- MFA : Duo Security ou Okta Starter
- SIEM : Splunk Free ou LogRhythm Community
- Formation : E-learning spécialisé

**Budget > 20K€/an**
- IAM : Okta, Azure AD Premium, CyberArk
- SIEM : Splunk Enterprise, QRadar
- Formation : Accompagnement consultant + certifications

---

## Quiz de validation {#quiz}

### Questions à choix multiples

**1. Quel pourcentage de réduction des risques apporte la MFA ?**
- a) 50%
- b) 80% 
- c) 99.9%
- d) 75%

**2. Le principe du moindre privilège signifie :**
- a) Donner tous les droits aux utilisateurs importants
- b) Attribuer uniquement les droits nécessaires à chaque fonction
- c) Limiter le nombre d'utilisateurs administrateurs à 2
- d) Interdire l'accès internet aux utilisateurs

**3. Dans un système RBAC, l'ordre correct est :**
- a) Ressources → Rôles → Permissions → Utilisateurs
- b) Utilisateurs → Permissions → Rôles → Ressources
- c) Utilisateurs → Rôles → Permissions → Ressources
- d) Rôles → Utilisateurs → Ressources → Permissions

**4. Combien de temps maximum pour désactiver un compte lors d'un départ ?**
- a) 24 heures
- b) 1 semaine
- c) 4 heures  
- d) 1 heure

**5. Quelle métrique indique un bon niveau de sécurité des accès ?**
- a) Taux d'adoption MFA > 95%
- b) 50% des utilisateurs ont des droits admin
- c) Les mots de passe expirent chaque mois
- d) Aucun logging des accès

### Questions ouvertes

**6. Décrivez en 3 étapes comment vous implanteriez la MFA dans votre organisation.**

**7. Donnez 3 exemples concrets d'application du principe de séparation des tâches.**

**8. Quels sont les 5 logs les plus importants à surveiller pour la sécurité des accès ?**

### Cas pratique

**Situation :** Vous êtes RSSI d'une PME de 150 personnes. Un audit révèle que :
- Aucune MFA n'est déployée
- 80% des utilisateurs ont des droits administrateurs locaux
- Les mots de passe n'expirent jamais
- Aucun monitoring des accès n'existe
- Les anciens employés gardent leurs accès 2 semaines en moyenne

**Mission :** Rédigez un plan d'action prioritaire sur 6 mois avec budget et ressources.

---

## Solutions du quiz

**QCM :** 1-c, 2-b, 3-c, 4-c, 5-a

**Questions ouvertes - Exemples de réponses :**

6. Étapes MFA :
   - Choix de la solution et pilote sur l'équipe IT
   - Formation et communication aux utilisateurs  
   - Déploiement par vagues (privilégiés puis généralisé)

7. Séparation des tâches :
   - Finance : saisie ≠ validation ≠ paiement
   - Code : développement ≠ test ≠ déploiement
   - Sécurité : monitoring ≠ investigation ≠ décision

8. Logs critiques :
   - Authentifications échouées
   - Élévations de privilèges
   - Accès aux fichiers sensibles
   - Connexions administrateur
   - Modifications de permissions

---

*© 2024 StratCyber. Ce document est sous licence Creative Commons Attribution 4.0. Vous pouvez le redistribuer et le modifier en citant la source.*

**Version** : 1.0  
**Dernière mise à jour** : 7 janvier 2024  
**Auteur** : Équipe StratCyber  
**Validation** : ANSSI, ISO 27001, NIST Framework
