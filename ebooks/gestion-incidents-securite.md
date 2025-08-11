# Gestion des Incidents de Sécurité

**Auteur**: StratCyber Formation  
**Catégorie**: Gestion  
**Difficulté**: Intermédiaire  
**Durée estimée**: 2h 45min  
**Tags**: #Incidents #Réponse #Processus #CSIRT

## Table des matières

1. [Introduction](#introduction)
2. [Plan de réponse aux incidents](#plan-reponse-incidents)
3. [Équipe de réponse (CSIRT)](#equipe-reponse-csirt)
4. [Processus de gestion d'incident](#processus-gestion-incident)
5. [Investigation et forensic](#investigation-forensic)
6. [Communication de crise](#communication-crise)
7. [Récupération et continuité](#recuperation-continuite)
8. [Apprentissage et amélioration](#apprentissage-amelioration)
9. [Quiz de validation](#quiz)

---

## Introduction

La gestion des incidents de sécurité est devenue une compétence critique pour toute organisation. Face à l'augmentation des cyberattaques, avoir un plan structuré et une équipe préparée fait la différence entre une interruption mineure et une catastrophe majeure.

### Statistiques alarmantes

- **Temps moyen de détection** : 287 jours
- **Temps moyen de confinement** : 80 jours
- **Coût d'un incident majeur** : 4,45M$ en moyenne
- **93% des entreprises** victimes d'une violation dans les 5 ans

### Ce que vous allez maîtriser

✅ Créer un plan de réponse efficace  
✅ Constituer et former votre équipe CSIRT  
✅ Gérer les incidents de A à Z  
✅ Conduire une investigation forensique  
✅ Communiquer en situation de crise  
✅ Assurer la continuité d'activité  

---

## Plan de réponse aux incidents {#plan-reponse-incidents}

### Structure du plan

#### Document maître
```yaml
1. Objectifs et portée
   • Définition des types d'incidents couverts
   • Objectifs de temps de réponse (SLA)
   • Périmètre d'application

2. Organisation de crise
   • Rôles et responsabilités
   • Chaîne de commandement
   • Processus d'escalade

3. Procédures opérationnelles
   • Détection et signalement
   • Classification et priorisation
   • Confinement et éradication
   • Récupération et retour d'expérience

4. Ressources et outils
   • Contacts d'urgence
   • Outils techniques
   • Documentation de référence
```

### Classification des incidents

#### Matrice de criticité
```
Niveau 1 - CRITIQUE (< 1h)
• Compromission massive des systèmes
• Fuite de données personnelles à grande échelle
• Arrêt total des services critiques
• Attaque en cours avec impact imminent

Niveau 2 - MAJEUR (< 4h)  
• Compromission d'un système critique
• Fuite de données confidentielles limitée
• Dégradation significative des services
• Tentative d'intrusion sophistiquée

Niveau 3 - MODÉRÉ (< 24h)
• Incident sur système non critique
• Tentative d'accès non autorisé
• Anomalie de sécurité détectée
• Violation de politique mineure

Niveau 4 - MINEUR (< 72h)
• Événements suspects à investiguer
• Violations de procédures internes
• Problèmes de conformité ponctuels
```

### Processus d'activation

#### Déclenchement automatique
```yaml
Alertes système:
  • SIEM/SOC : corrélation d'événements
  • Antivirus : détection de malware
  • DLP : tentative d'exfiltration
  • IDS/IPS : attaque réseau détectée
  • Monitoring : anomalie de performance

Seuils d'activation:
  • Nombre d'événements par heure
  • Criticité des systèmes impactés
  • Score de risque calculé
```

#### Signalement humain
```yaml
Sources de signalement:
  • Utilisateurs finaux
  • Équipes techniques
  • Partenaires externes
  • Autorités (ANSSI, police)

Canaux de signalement:
  • Hotline dédiée 24/7
  • Email sécurisé
  • Portail web interne
  • Application mobile
```

---

## Équipe de réponse (CSIRT) {#equipe-reponse-csirt}

### Structure organisationnelle

#### Rôles principaux
```yaml
Responsable CSIRT (Incident Commander):
  • Coordination générale de la réponse
  • Décisions stratégiques
  • Interface avec la direction
  • Communication externe

Analyste Sécurité Senior:
  • Investigation technique approfondie
  • Analyse forensique
  • Évaluation de l'impact
  • Recommandations techniques

Analyste Réseau:
  • Analyse du trafic réseau
  • Identification des vecteurs d'attaque
  • Mise en place des mesures de confinement réseau
  • Configuration firewall/IPS

Administrateur Système:
  • Mesures de confinement système
  • Collecte des preuves techniques
  • Restauration des services
  • Monitoring des systèmes critiques

Spécialiste Communication:
  • Communication interne
  • Relations presse si nécessaire
  • Interface avec les autorités
  • Documentation des actions
```

#### Organisation étendue
```yaml
Équipe juridique:
  • Aspects légaux et réglementaires
  • Notification aux autorités (CNIL, ANSSI)
  • Gestion des aspects contractuels
  • Protection des preuves légales

RH/Management:
  • Communication aux employés
  • Gestion du personnel en crise
  • Interface avec la direction
  • Aspects disciplinaires si nécessaire

Relations externes:
  • Partenaires et fournisseurs
  • Clients impactés
  • Autorités de régulation
  • Prestataires spécialisés
```

### Formation et préparation

#### Programme de formation
```yaml
Formation initiale (40h):
  • Méthodologies de réponse aux incidents
  • Outils forensiques et d'investigation
  • Aspects légaux et réglementaires
  • Communication de crise
  • Certification (ex: GCIH, GCFA)

Formation continue (16h/an):
  • Nouvelles menaces et techniques d'attaque
  • Évolution des outils et technologies
  • Retours d'expérience d'incidents
  • Exercices pratiques et simulations

Exercices de simulation:
  • Table-top exercises: Trimestriel
  • Simulations techniques: Semestriel  
  • Exercice grandeur nature: Annuel
  • Red team exercises: Selon besoin
```

---

## Processus de gestion d'incident {#processus-gestion-incident}

### Phase 1 : Détection et Signalement

#### Détection
```yaml
Sources de détection:
  • Monitoring automatisé (SIEM, SOC)
  • Alertes systèmes et applications
  • Signalement utilisateurs
  • Veille externe (threat intelligence)
  • Contrôles de sécurité réguliers

Temps de détection cible:
  • Incidents critiques: < 15 minutes
  • Incidents majeurs: < 1 heure
  • Incidents modérés: < 4 heures
```

#### Signalement initial
```yaml
Informations à collecter:
  □ Horodatage de l'événement
  □ Nature de l'incident suspecté
  □ Systèmes potentiellement impactés
  □ Utilisateurs concernés
  □ Actions déjà entreprises
  □ Contact du signalant

Template de signalement:
  • Formulaire standardisé
  • Classification préliminaire
  • Niveau d'urgence estimé
  • Preuves disponibles
```

### Phase 2 : Classification et Priorisation

#### Évaluation initiale
```yaml
Critères d'évaluation:
  • Impact métier (chiffre d'affaires, réputation)
  • Nombre d'utilisateurs/systèmes affectés
  • Type de données compromises
  • Durée de l'interruption estimée
  • Risque d'escalade

Matrice de priorisation:
  Impact/Probabilité → Faible/Moyen/Fort/Critique
  Délai d'action → Immédiat/4h/24h/72h
  Ressources requises → 1 personne/équipe/externe
```

### Phase 3 : Confinement

#### Confinement immédiat
```yaml
Actions rapides (<30 min):
  • Isolation du système compromis
  • Blocage des comptes suspectés
  • Sauvegarde des preuves volatiles
  • Documentation des actions

Confinement réseau:
  • Isolation VLAN des systèmes infectés
  • Blocage IP/domaines malveillants
  • Règles firewall d'urgence
  • Déconnexion temporaire si nécessaire
```

#### Confinement étendu
```yaml
Actions moyennes (2-4h):
  • Analyse approfondie de l'impact
  • Extension du périmètre de confinement
  • Mise à jour des systèmes de détection
  • Communication aux parties prenantes

Mesures préventives:
  • Renforcement des contrôles d'accès
  • Surveillance renforcée des systèmes critiques
  • Mise à jour des signatures antivirus/IPS
  • Sensibilisation ciblée des utilisateurs
```

### Phase 4 : Investigation et Éradication

#### Collecte de preuves
```yaml
Preuves volatiles (ordre de volatilité):
  1. Registres et cache processeur
  2. Contenu de la mémoire vive (RAM)
  3. État du réseau et connexions
  4. Processus en cours d'exécution
  5. Système de fichiers
  6. Logs et audit trails

Outils forensiques:
  • Images disque: dd, FTK Imager
  • Analyse mémoire: Volatility, Rekall
  • Analyse réseau: Wireshark, tcpdump
  • Timeline: Plaso, log2timeline
  • Mobile: Cellebrite, XRY
```

### Phase 5 : Récupération

#### Plan de récupération
```yaml
Priorités de restauration:
  1. Services critiques métier
  2. Systèmes de sécurité
  3. Infrastructure de base
  4. Services de support
  5. Applications non critiques

Étapes de récupération:
  • Validation de l'éradication complète
  • Tests des systèmes restaurés
  • Surveillance renforcée post-incident
  • Validation métier des services
  • Communication de fin d'incident
```

---

## Investigation et forensic {#investigation-forensic}

### Méthodologie forensique

#### Approche structurée
```yaml
1. Préparation:
   • Préservation de la chaîne de preuves
   • Documentation des actions
   • Outils calibrés et certifiés
   • Autorisations légales

2. Identification:
   • Inventaire des preuves potentielles
   • Priorisation selon la volatilité
   • Évaluation de la faisabilité
   • Stratégie de collecte

3. Collection:
   • Copie bit-à-bit des supports
   • Hachage cryptographique (MD5/SHA)
   • Documentation détaillée
   • Étiquetage et stockage sécurisé

4. Analyse:
   • Reconstruction de la chronologie
   • Identification des artéfacts
   • Corrélation des événements
   • Validation des hypothèses

5. Présentation:
   • Rapport technique détaillé
   • Résumé exécutif
   • Recommandations d'amélioration
   • Support pour actions légales
```

### Outils d'investigation

#### Suite forensique complète
```yaml
Distributions spécialisées:
  • CAINE (Computer Aided INvestigative Environment)
  • DEFT (Digital Evidence & Forensics Toolkit)
  • Kali Linux (outils de sécurité)
  • SANS SIFT (SANS Investigative Forensics Toolkit)

Outils commerciaux:
  • EnCase Forensic (Guidance Software)
  • FTK (AccessData Forensic Toolkit)
  • X-Ways Forensics
  • Cellebrite Mobile Forensics

Outils open source:
  • Autopsy (interface graphique Sleuth Kit)
  • Volatility (analyse mémoire)
  • Wireshark (analyse réseau)
  • YARA (détection de malware)
```

### Analyse des différents types d'incidents

#### Malware et ransomware
```yaml
Indicateurs à rechercher:
  • Fichiers modifiés/chiffrés
  • Processus anormaux en mémoire
  • Communications réseau suspectes
  • Modifications du registre Windows
  • Tâches planifiées malveillantes

Techniques d'analyse:
  • Sandbox dynamique (Cuckoo, Joe Sandbox)
  • Analyse statique (IDA Pro, Ghidra)
  • Recherche d'IOC (Indicators of Compromise)
  • Corrélation threat intelligence
```

#### Intrusion et mouvement latéral
```yaml
Artifacts de persistance:
  • Services Windows modifiés
  • Tâches planifiées
  • Clés de registre d'autorun
  • Scripts de démarrage
  • Backdoors WMI

Traces de mouvement latéral:
  • Authentifications anormales
  • Utilisation d'outils d'administration
  • Transferts de fichiers suspects
  • Élévation de privilèges
  • Discovery et reconnaissance interne
```

---

## Communication de crise {#communication-crise}

### Stratégie de communication

#### Principes fondamentaux
```yaml
Transparence contrôlée:
  • Communiquer les faits vérifiés
  • Éviter la spéculation
  • Reconnaître les incertitudes
  • Mise à jour régulière

Cohérence des messages:
  • Message unifié toutes parties prenantes
  • Porte-parole unique designé
  • Validation préalable des communications
  • Adaptation selon l'audience
```

### Communication interne

#### Équipes techniques
```yaml
Format technique détaillé:
  • Nature précise de l'incident
  • Systèmes impactés et statut
  • Actions en cours et planifiées
  • Mesures de protection à appliquer
  • Mise à jour horaire pendant la crise

Canaux privilegiés:
  • Chat sécurisé équipe technique
  • Conférences téléphoniques régulières
  • Tableau de bord temps réel
  • Documentation collaborative
```

#### Direction et management
```yaml
Format exécutif synthétique:
  • Impact métier et financier
  • Évaluation des risques
  • Actions critiques en cours
  • Décisions requises
  • Timeline de résolution estimée

Fréquence adaptée:
  • Incidents critiques: Toutes les heures
  • Incidents majeurs: Toutes les 4h
  • Rapport de synthèse quotidien
  • Débriefing de fin d'incident
```

### Communication externe

#### Clients et partenaires
```yaml
Message type:
  "Nous avons détecté un incident de sécurité le [date] à [heure].
   Nos équipes techniques travaillent activement à la résolution.
   [Impact sur les services si applicable]
   Nous vous tiendrons informés de l'évolution.
   Contact: incident@societe.com"

Canaux de diffusion:
  • Site web - page statut
  • Réseaux sociaux officiels
  • Email aux contacts clés
  • Hotline dédiée
```

#### Autorités et régulateurs
```yaml
Notifications obligatoires:
  • CNIL (72h max pour RGPD)
  • ANSSI (selon secteur d'activité)
  • Commissaire aux comptes
  • Autorités sectorielles

Contenu minimum:
  • Nature de l'incident
  • Données potentiellement compromises
  • Nombre de personnes concernées
  • Mesures prises et à prendre
  • Point de contact dédié
```

---

## Récupération et continuité {#recuperation-continuite}

### Plan de continuité d'activité (PCA)

#### Objectifs de continuité
```yaml
Définitions clés:
  • RTO (Recovery Time Objective): Temps max acceptable d'interruption
  • RPO (Recovery Point Objective): Perte de données max acceptable
  • MTPD (Maximum Tolerable Period of Disruption): Limite absolue

Classification des services:
  • Critiques: RTO < 4h, RPO < 1h
  • Importants: RTO < 24h, RPO < 4h
  • Standard: RTO < 72h, RPO < 24h
  • Support: RTO < 1 semaine, RPO < 48h
```

### Stratégies de récupération

#### Solutions techniques
```yaml
Sauvegarde et restauration:
  • Sauvegardes régulières testées
  • Sites de sauvegarde sécurisés
  • Procédures de restauration documentées
  • Tests de restauration planifiés

Haute disponibilité:
  • Clusters de serveurs
  • Réplication de données
  • Basculement automatique
  • Sites de secours (warm/hot sites)

Cloud et virtualisation:
  • Infrastructure as Code (IaC)
  • Snapshots automatiques
  • Multi-région deployment
  • Auto-scaling et self-healing
```

#### Solutions organisationnelles
```yaml
Équipes de crise:
  • Personnel de continuité formé
  • Sites de travail alternatifs
  • Équipements de secours
  • Communications alternatives

Processus métier:
  • Procédures d'urgence simplifiées
  • Workflows manuels de backup
  • Fournisseurs alternatifs
  • Clients et partenaires informés
```

### Tests et validation

#### Programme de tests
```yaml
Tests techniques:
  • Restauration de sauvegardes: Mensuel
  • Basculement vers site de secours: Trimestriel
  • Récupération complète: Semestriel
  • Test de bout en bout: Annuel

Tests organisationnels:
  • Activation équipe de crise: Trimestriel
  • Communication d'urgence: Semestriel
  • Coordination avec partenaires: Annuel
  • Exercice grandeur nature: Annuel
```

---

## Apprentissage et amélioration {#apprentissage-amelioration}

### Post-incident review

#### Processus de débriefing
```yaml
Timeline reconstruction:
  1. Chronologie détaillée des événements
  2. Actions entreprises et délais
  3. Décisions clés et justifications
  4. Ressources mobilisées
  5. Communications effectuées

Analyse des performances:
  • Temps de détection vs objectifs
  • Efficacité des mesures de confinement
  • Qualité de la communication
  • Coordination des équipes
  • Utilisation des outils et procédures
```

#### Identification des améliorations
```yaml
Catégories d'amélioration:
  • Technique: Outils, monitoring, automatisation
  • Processus: Procédures, escalade, communication
  • Organisationnel: Formation, rôles, ressources
  • Stratégique: Politique, budget, gouvernance

Priorisation:
  • Impact sur la réduction des risques
  • Complexité de mise en œuvre
  • Coût/bénéfice de l'amélioration
  • Urgence selon les leçons apprises
```

### Mise à jour des procédures

#### Cycle d'amélioration continue
```yaml
1. Identification (Post-incident, audits):
   • Gaps identifiés dans les processus
   • Nouvelles menaces découvertes
   • Évolution technologique
   • Retours d'expérience externes

2. Planification des améliorations:
   • Roadmap des améliorations
   • Budget et ressources allouées
   • Timeline de déploiement
   • Responsables des actions

3. Implémentation:
   • Mise à jour de la documentation
   • Formation des équipes
   • Tests des nouveaux processus
   • Communication des changements

4. Validation:
   • Exercices de simulation
   • Tests de performance
   • Feedback des utilisateurs
   • Métriques de succès
```

---

## Quiz de validation {#quiz}

### Questions de compréhension

**1. Quel est le délai de notification à la CNIL en cas de violation de données personnelles ?**
- a) 24 heures
- b) 48 heures
- c) 72 heures
- d) 1 semaine

**2. Dans quelle ordre doit-on collecter les preuves numériques ?**
- a) Par importance pour l'enquête
- b) Par ordre de volatilité (du plus volatil au moins volatil)
- c) Par facilité d'accès
- d) Par taille des fichiers

**3. Que signifie RTO dans un plan de continuité ?**
- a) Recovery Time Objective
- b) Rapid Technical Operation
- c) Risk Treatment Option
- d) Real Time Operation

**4. Quelle est la première action lors de la détection d'un incident critique ?**
- a) Analyser l'origine de l'attaque
- b) Notifier la direction
- c) Contenir la propagation
- d) Collecter les preuves

### Cas pratique

**Situation :** Vendredi 14h, votre système de détection alerte sur une activité anormale. Plusieurs serveurs montrent des connexions suspectes vers des IPs externes. Les utilisateurs rapportent des lenteurs réseau.

**Questions :**
1. Classifiez cet incident et justifiez votre réponse
2. Quelles sont vos 3 premières actions ?
3. Qui devez-vous alerter immédiatement ?
4. Quelles preuves devez-vous collecter en priorité ?

### Exercice de timeline

Reconstituez la chronologie d'incident à partir des éléments suivants :
- 09:15 - Alerte antivirus sur poste utilisateur
- 09:45 - Détection connexions réseau suspectes  
- 10:30 - Isolation du poste infecté
- 08:45 - Email de phishing reçu par l'utilisateur
- 11:00 - Découverte de fichiers chiffrés sur serveur de fichiers
- 09:30 - Utilisateur ouvre pièce jointe malveillante

### Solutions

**QCM :** 1-c, 2-b, 3-a, 4-c

**Cas pratique :**
1. Incident Majeur (niveau 2) - Compromission potentielle multi-systèmes avec impact service
2. Actions : Contenir (isoler serveurs), Alerter (équipe CSIRT + management), Collecter (preuves volatiles)
3. Alerter : CSIRT, RSSI, Direction IT, Communication selon matrice d'escalade
4. Preuves : RAM serveurs, logs connexions, trafic réseau, processus actifs

**Timeline reconstituée :**
08:45 → 09:30 → 09:15 → 09:45 → 10:30 → 11:00

---

*© 2024 StratCyber. Guide de gestion d'incidents sous licence Creative Commons Attribution 4.0.*

**Version :** 1.0  
**Dernière révision :** 7 janvier 2024  
**Standards :** NIST SP 800-61, ISO 27035, ENISA Guidelines
