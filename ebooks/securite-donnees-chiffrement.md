# Sécurité des Données et Chiffrement

**Auteur**: StratCyber Formation  
**Catégorie**: Conformité  
**Difficulté**: Intermédiaire  
**Durée estimée**: 3h 15min  
**Tags**: #Données #Chiffrement #RGPD #Conformité

## Table des matières

1. [Introduction](#introduction)
2. [Classification des données](#classification-donnees)
3. [Techniques de chiffrement modernes](#chiffrement-moderne)
4. [Conformité RGPD et protection des données](#conformite-rgpd)
5. [Gestion des clés cryptographiques](#gestion-cles)
6. [Sauvegardes sécurisées](#sauvegardes-securisees)
7. [Plan d'implémentation](#plan-implementation)
8. [Quiz de validation](#quiz)

---

## Introduction

La protection des données est devenue l'un des défis majeurs de la cybersécurité moderne. Avec l'explosion des volumes de données et le durcissement des réglementations, les organisations doivent adopter une approche structurée pour protéger leurs actifs informationnels.

### Enjeux contemporains

- **263 violations de données** par jour en moyenne
- **Coût moyen d'une violation** : 4,45M$ (2023)
- **RGPD** : amendes jusqu'à 4% du CA annuel
- **86% des attaques** visent les données sensibles

### Ce que vous allez apprendre

✅ Comment classifier efficacement vos données  
✅ Les techniques de chiffrement adaptées à chaque usage  
✅ L'implémentation de la conformité RGPD  
✅ La gestion sécurisée des clés cryptographiques  
✅ Une stratégie complète de protection des données  

---

## Classification des données {#classification-donnees}

### Pourquoi classifier ?

La classification permet d'appliquer des niveaux de protection appropriés selon la sensibilité et la valeur des données.

#### Modèle de classification à 4 niveaux

**1. Données Publiques**
```
• Informations destinées au grand public
• Publications marketing, communiqués de presse
• Pas de protection spécifique requise
• Exemples : Site web, brochures commerciales
```

**2. Données Internes**
```
• Informations d'usage interne non critique
• Procédures générales, organigrammes
• Protection basique (accès restreint aux employés)
• Exemples : Annuaire interne, procédures IT générales
```

**3. Données Confidentielles**
```
• Informations sensibles pour l'organisation
• Stratégies, données financières, contrats
• Protection renforcée (chiffrement, accès restreint)
• Exemples : Plans d'affaires, budgets, contrats clients
```

**4. Données Restreintes**
```
• Informations hautement sensibles
• Données personnelles, secrets commerciaux
• Protection maximale (chiffrement fort, journalisation)
• Exemples : Données RH, propriété intellectuelle, données médicales
```

### Implémentation pratique

#### Étape 1 : Inventaire des données
```yaml
Processus d'inventaire:
  1. Identifier toutes les sources de données
  2. Cartographier les flux de données
  3. Cataloguer par type et sensibilité
  4. Documenter les propriétaires de données
  5. Évaluer les risques associés
```

#### Étape 2 : Définition des critères
```
Critères de classification:
• Impact en cas de divulgation (Faible/Moyen/Élevé/Critique)
• Exigences réglementaires (RGPD, sectorielles)
• Valeur commerciale
• Durée de conservation
• Besoins d'accès
```

#### Étape 3 : Attribution des labels
- **Automatique** : Règles basées sur le contenu, métadonnées
- **Manuelle** : Classification par les utilisateurs/propriétaires
- **Hybride** : Combinaison des deux approches

### Outils de classification

#### Solutions recommandées
- **Microsoft Purview Information Protection**
- **Forcepoint Data Classification**
- **Varonis Data Classification Framework**
- **Solutions open source** : Apache Ranger, DataHub

---

## Techniques de chiffrement modernes {#chiffrement-moderne}

### Types de chiffrement

#### Chiffrement symétrique
**Principe** : Une seule clé pour chiffrer et déchiffrer

```
Avantages:
✅ Très rapide et efficace
✅ Adapté aux gros volumes
✅ Faible consommation de ressources

Inconvénients:
❌ Distribution sécurisée de la clé
❌ Gestion complexe avec nombreux utilisateurs

Algorithmes recommandés:
• AES-256 (Advanced Encryption Standard)
• ChaCha20-Poly1305
• Salsa20
```

#### Chiffrement asymétrique
**Principe** : Paire de clés publique/privée

```
Avantages:
✅ Pas de partage de clé secrète
✅ Signatures numériques possibles
✅ Échange de clés sécurisé

Inconvénients:
❌ Plus lent que le symétrique
❌ Taille des clés plus importantes
❌ Plus complexe à implémenter

Algorithmes recommandés:
• RSA-4096 (en transition vers 2048 minimum)
• ECC P-384 (Elliptic Curve Cryptography)
• Ed25519 (signatures)
```

#### Chiffrement hybride
**Principe** : Combinaison asymétrique + symétrique

```
Processus typique:
1. Génération clé symétrique aléatoire
2. Chiffrement des données avec clé symétrique
3. Chiffrement de la clé symétrique avec clé publique
4. Transmission des données chiffrées + clé chiffrée

Exemples d'usage:
• TLS/SSL
• PGP/GPG
• S/MIME
```

### Chiffrement selon les cas d'usage

#### Données au repos
```yaml
Base de données:
  - Transparent Data Encryption (TDE)
  - Chiffrement au niveau colonnes sensibles
  - Chiffrement des sauvegardes

Fichiers:
  - BitLocker (Windows) / LUKS (Linux)
  - VeraCrypt pour volumes
  - Chiffrement individuel par fichier

Cloud:
  - Chiffrement côté client avant upload
  - Gestion des clés séparée du provider
  - Solutions: AWS KMS, Azure Key Vault
```

#### Données en transit
```yaml
Protocoles sécurisés:
  - HTTPS/TLS 1.3 minimum
  - SFTP au lieu de FTP
  - VPN IPsec ou WireGuard
  - Email: S/MIME ou PGP

Configuration TLS:
  - Désactiver TLS < 1.2
  - Perfect Forward Secrecy (PFS)
  - Cipher suites sécurisées uniquement
```

#### Données en cours de traitement
```yaml
Solutions de chiffrement homomorphique:
  - Calculs sur données chiffrées
  - Confidential Computing (Intel SGX, AMD SEV)
  - Solutions émergentes: FHE, MPC

Pratiques actuelles:
  - Déchiffrement temporaire en mémoire sécurisée
  - Purge immédiate des clés en RAM
  - Isolation des environnements de traitement
```

---

## Conformité RGPD et protection des données {#conformite-rgpd}

### Principes fondamentaux du RGPD

#### Les 7 principes de base
1. **Licéité, loyauté, transparence**
2. **Limitation des finalités**
3. **Minimisation des données**
4. **Exactitude**
5. **Limitation de la conservation**
6. **Intégrité et confidentialité**
7. **Responsabilité**

#### Mesures techniques et organisationnelles

**Sécurité dès la conception (Privacy by Design)**
```
Exigences techniques:
• Chiffrement des données personnelles
• Pseudonymisation quand possible
• Contrôles d'accès stricts
• Journalisation des accès
• Tests réguliers de sécurité
```

**Analyse d'impact (DPIA)**
```
Déclencheurs obligatoires:
• Évaluation systématique automatisée
• Traitement à grande échelle de données sensibles
• Surveillance systématique de lieux publics

Contenu minimum:
• Description du traitement
• Évaluation de la nécessité
• Risques pour les droits et libertés
• Mesures d'atténuation prévues
```

### Droits des personnes concernées

#### Droits fondamentaux
```yaml
Droit d'accès:
  - Copie des données traitées
  - Informations sur le traitement
  - Délai: 1 mois maximum

Droit de rectification:
  - Correction des données inexactes
  - Complément des données incomplètes
  - Délai: 1 mois maximum

Droit à l'effacement:
  - "Droit à l'oubli"
  - Conditions strictes d'application
  - Exceptions légales à respecter

Droit à la portabilité:
  - Format structuré et interopérable
  - Uniquement traitement automatisé
  - Base légale: consentement ou contrat
```

#### Implémentation technique
```yaml
Système de gestion des demandes:
  - Interface dédiée ou formulaire
  - Authentification de la personne
  - Workflow de traitement
  - Suivi des délais
  - Notification aux tiers si nécessaire

Architecture technique:
  - Identification unique des données personnelles
  - Liens entre systèmes différents
  - Capacité d'extraction/modification/suppression
  - Logs des opérations sur les données
```

### Transferts internationaux

#### Mécanismes de transfert autorisés
```
1. Décision d'adéquation UE
   • Pays reconnus "adéquats": Canada, Japon, UK post-Brexit

2. Garanties appropriées
   • Clauses contractuelles types (SCC 2021)
   • Règles d'entreprise contraignantes (BCR)
   • Certification approuvée

3. Dérogations spécifiques
   • Consentement explicite
   • Nécessité contractuelle
   • Intérêt légitime impérieux
```

#### Mesures supplémentaires post-Schrems II
```yaml
Évaluation des transferts:
  1. Cartographier tous les transferts
  2. Évaluer le cadre légal du pays tiers
  3. Analyse des risques d'accès gouvernemental
  4. Mesures techniques complémentaires si nécessaire

Mesures techniques renforcées:
  • Chiffrement de bout en bout
  • Pseudonymisation avancée
  • Clés de chiffrement conservées dans l'UE
  • Accords renforcés avec les sous-traitants
```

---

## Gestion des clés cryptographiques {#gestion-cles}

### Cycle de vie des clés

#### Génération
```yaml
Bonnes pratiques:
  • Générateur cryptographiquement sûr (CSPRNG)
  • Entropie suffisante (>= 256 bits)
  • Algorithmes certifiés (FIPS 140-2)
  • Environnement sécurisé (HSM recommandé)

Standards:
  • NIST SP 800-57 (gestion des clés)
  • Common Criteria EAL4+
  • FIPS 140-2 Level 3 minimum pour HSM
```

#### Stockage
```yaml
Options techniques:
  1. Hardware Security Module (HSM)
     • Protection physique contre l'extraction
     • Génération et stockage sécurisés
     • Performances élevées

  2. Key Management Service (KMS)
     • AWS KMS, Azure Key Vault, Google KMS
     • Intégration cloud native
     • Séparation des responsabilités

  3. Software-based solutions
     • HashiCorp Vault
     • Solutions intégrées (PKCS#11)
     • Protection par chiffrement des clés
```

#### Distribution
```yaml
Mécanismes sécurisés:
  • Protocoles d'échange de clés (ECDH, DH)
  • Canaux sécurisés (TLS, IPsec)
  • Chiffrement asymétrique pour clés symétriques
  • Attestation des récepteurs

Bonnes pratiques:
  • Authentification mutuelle
  • Perfect Forward Secrecy (PFS)
  • Limitation des privilèges
  • Journalisation des échanges
```

#### Rotation
```yaml
Fréquences recommandées:
  • Clés symétriques: Annuelle ou selon usage
  • Clés RSA: 2-3 ans
  • Clés ECC: 2-3 ans
  • Clés racine CA: 10-20 ans

Processus automatisé:
  1. Génération nouvelle clé
  2. Distribution sécurisée
  3. Période de coexistence
  4. Migration progressive
  5. Révocation ancienne clé
  6. Archivage sécurisé si nécessaire
```

#### Révocation
```yaml
Cas de révocation:
  • Compromission suspectée ou avérée
  • Fin d'emploi/changement de rôle
  • Changement d'affectation de la clé
  • Fin de vie programmée

Mécanismes:
  • Certificate Revocation Lists (CRL)
  • Online Certificate Status Protocol (OCSP)
  • Listes de révocation distribuées
  • Notification automatique des systèmes
```

### Architecture de PKI

#### Composants essentiels
```yaml
Autorité de Certification Racine (Root CA):
  • Offline, sécurisation physique maximale
  • Durée de vie longue (10-20 ans)
  • Utilisée uniquement pour signer les CA intermédiaires

CA Intermédiaires:
  • Émission des certificats finaux
  • Durée de vie plus courte (2-5 ans)
  • Révocation possible sans impact sur Root CA

Autorité d'Enregistrement (RA):
  • Vérification identité des demandeurs
  • Processus d'approbation des demandes
  • Interface avec les utilisateurs finaux
```

---

## Sauvegardes sécurisées {#sauvegardes-securisees}

### Stratégie 3-2-1-1-0

**Règle moderne adaptée:**
- **3** copies de vos données
- **2** supports différents
- **1** copie hors site (offsite)
- **1** copie offline (air gap)
- **0** erreur dans les tests de restauration

### Chiffrement des sauvegardes

#### Chiffrement de bout en bout
```yaml
Client-side encryption:
  • Chiffrement avant transfert
  • Clés gérées côté client
  • Provider n'a pas accès aux données

Recommandations:
  • AES-256 pour le chiffrement des données
  • RSA-4096 ou ECC P-384 pour les clés
  • Authentification des sauvegardes (HMAC)
  • Vérification d'intégrité systématique
```

#### Gestion des clés de sauvegarde
```yaml
Approche recommandée:
  • Clés dérivées d'une clé maître (key derivation)
  • Escrowing sécurisé des clés
  • Rotation périodique
  • Tests de récupération des clés

Stockage sécurisé:
  • HSM pour clés critiques
  • Multi-signature pour accès d'urgence
  • Documentation des procédures d'accès
  • Audit trail complet
```

### Tests de restauration

#### Programme de tests
```yaml
Fréquence:
  • Tests complets: Trimestriel
  • Tests partiels: Mensuel
  • Tests applicatifs: Hebdomadaire
  • Tests automatisés: Quotidien

Métriques à mesurer:
  • RTO (Recovery Time Objective)
  • RPO (Recovery Point Objective)
  • Intégrité des données restaurées
  • Temps de déchiffrement
  • Performance post-restauration
```

---

## Plan d'implémentation {#plan-implementation}

### Évaluation initiale

#### Audit de l'existant
```yaml
Inventaire des données:
  □ Cartographie des systèmes et bases de données
  □ Identification des flux de données
  □ Classification selon la sensibilité
  □ Évaluation des mesures existantes

Analyse des risques:
  □ Menaces identifiées par type de donnée
  □ Vulnérabilités techniques et organisationnelles
  □ Impact potentiel des incidents
  □ Probabilité de réalisation des risques
```

### Roadmap de déploiement

#### Phase 1 - Fondations (Mois 1-3)
```yaml
Priorité Critique:
  □ Classification des données critiques
  □ Chiffrement des données de catégorie "Restreinte"
  □ Mise en conformité RGPD minimale
  □ Formation des équipes techniques

Budget estimé: 15K€ - 30K€
Ressources: 1 ETP sécurité + consultant externe
```

#### Phase 2 - Déploiement (Mois 4-8)
```yaml
Priorité Haute:
  □ Chiffrement généralisé (confidentielles)
  □ Mise en place KMS/HSM
  □ Automatisation de la classification
  □ Processus de gestion des droits RGPD

Budget estimé: 30K€ - 60K€
Ressources: 0.5 ETP sécurité + prestataires spécialisés
```

#### Phase 3 - Optimisation (Mois 9-12)
```yaml
Priorité Moyenne:
  □ Chiffrement des données internes
  □ Solutions de DLP (Data Loss Prevention)
  □ Automatisation complète des processus
  □ Monitoring et alerting avancés

Budget estimé: 20K€ - 40K€
Ressources: Équipes internes + maintenance
```

### Actions immédiates

#### Cette semaine
1. **Lundi**: Inventaire des données critiques et sensibles
2. **Mardi**: Évaluation des solutions de chiffrement
3. **Mercredi**: Audit de conformité RGPD basic
4. **Jeudi**: Formation sensibilisation équipes
5. **Vendredi**: Plan de communication aux utilisateurs

#### Ce mois-ci
```yaml
Semaine 2-3:
  • Choix et acquisition des outils
  • Configuration environnement de test
  • Début formation technique équipes
  • Rédaction des politiques

Semaine 4:
  • Tests pilotes sur données non critiques
  • Ajustement des configurations
  • Préparation déploiement production
  • Validation procédures d'urgence
```

### Indicateurs de succès

#### Métriques techniques
```yaml
Chiffrement:
  • Couverture: > 95% des données sensibles
  • Performance: < 10% de dégradation
  • Disponibilité: > 99.9%

Conformité:
  • Délai de réponse RGPD: < 15 jours
  • Taux de satisfaction demandes: > 95%
  • Incidents de conformité: 0

Sécurité:
  • Incidents liés aux données: < 1/trimestre
  • Temps de détection: < 24h
  • Temps de résolution: < 72h
```

---

## Quiz de validation {#quiz}

### Questions techniques

**1. Quelle taille de clé RSA est recommandée en 2024 ?**
- a) 1024 bits
- b) 2048 bits  
- c) 3072 bits
- d) 4096 bits

**2. Le chiffrement AES-256 utilise une clé de :**
- a) 128 bits
- b) 192 bits
- c) 256 bits
- d) 512 bits

**3. Dans le contexte RGPD, la pseudonymisation :**
- a) Remplace totalement l'anonymisation
- b) Est une mesure technique recommandée
- c) N'est pas reconnue par le règlement
- d) Supprime toute obligation de protection

**4. La règle 3-2-1 pour les sauvegardes signifie :**
- a) 3 copies, 2 supports, 1 site distant
- b) 3 sites, 2 copies, 1 support
- c) 3 supports, 2 copies, 1 site
- d) 3 algorithmes, 2 clés, 1 copie

### Cas pratiques

**Situation 1**: Une PME de 200 employés stocke des données clients incluant noms, emails, et données de paiement. Concevez une stratégie de classification et de chiffrement.

**Situation 2**: Un sous-traitant basé aux États-Unis doit traiter des données personnelles d'employés européens. Quelles mesures techniques devez-vous mettre en place ?

### Solutions

**QCM**: 1-c, 2-c, 3-b, 4-a

**Cas pratique 1**:
- Classification: Données clients = Confidentielles, données paiement = Restreintes
- Chiffrement: AES-256 pour BDD, TLS 1.3 pour transit, clés gérées par KMS
- Accès: RBAC avec principe du moindre privilège
- Audit: Logs d'accès et modification

---

*© 2024 StratCyber. Guide sous licence Creative Commons Attribution 4.0.*

**Version**: 1.0  
**Dernière mise à jour**: 7 janvier 2024  
**Références**: NIST, ANSSI, CNIL, ENISA
