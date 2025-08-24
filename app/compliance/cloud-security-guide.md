# Guide de Sécurité Cloud - StratCyber

## Vue d'ensemble

Ce guide complet vous accompagne dans la sécurisation de vos environnements cloud, en s'appuyant sur les recommandations de l'ANSSI et les meilleures pratiques internationales de sécurité cloud.

> **Sources officielles** : [ANSSI - Guide Cloud](https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/) | [ANSSI - SecNumCloud](https://www.ssi.gouv.fr/entreprise/qualification/prestataires-de-services-de-confiance-qualifies/) | [NIST Cloud Security](https://csrc.nist.gov/publications/sp800)

---

## 1. Fondamentaux de la Sécurité Cloud

### 1.1 Modèle de responsabilité partagée

**Principe fondamental** : La sécurité cloud repose sur un partage des responsabilités entre le fournisseur cloud et l'utilisateur.

#### Responsabilités du fournisseur cloud
- Sécurité physique des datacenters
- Sécurité de l'infrastructure sous-jacente
- Sécurité de la plateforme (hyperviseur, OS hôte)
- Maintenance et mises à jour de l'infrastructure
- Chiffrement des communications réseau
- Certifications et conformité de l'infrastructure

#### Responsabilités du client
- **IaaS (Infrastructure as a Service)** :
  - Configuration et sécurisation des OS invités
  - Gestion des accès et identités
  - Chiffrement des données
  - Configuration réseau et firewall
  - Sauvegardes et continuité d'activité

- **PaaS (Platform as a Service)** :
  - Sécurisation des applications
  - Gestion des données et contenus
  - Configuration des services de plateforme
  - Contrôle d'accès aux applications

- **SaaS (Software as a Service)** :
  - Gestion des utilisateurs et permissions
  - Configuration des paramètres de sécurité
  - Sensibilisation des utilisateurs
  - Gestion des données métier

### 1.2 Risques spécifiques au cloud

**Risques techniques** :
- Compromission des interfaces de gestion
- Vulnérabilités de virtualisation
- Isolation insuffisante entre tenants
- Faille dans les APIs
- Configuration par défaut non sécurisée

**Risques organisationnels** :
- Perte de contrôle sur les données
- Dépendance au fournisseur (vendor lock-in)
- Localisation géographique des données
- Changements de conditions contractuelles
- Cessation d'activité du fournisseur

**Risques juridiques** :
- Non-conformité réglementaire (RGPD, NIS2)
- Accès gouvernemental aux données
- Transfert de données hors UE
- Responsabilité en cas d'incident
- Clause de reversibilité

---

## 2. Architecture Cloud Sécurisée

### 2.1 Conception "Security by Design"

**Principes architecturaux** :

1. **Défense en profondeur** : Multicouche de sécurité
2. **Principe du moindre privilège** : Accès minimum nécessaire
3. **Séparation des environnements** : Dev/Test/Prod isolés
4. **Chiffrement systématique** : Au repos et en transit
5. **Monitoring continu** : Surveillance et alertes
6. **Résilience** : Haute disponibilité et reprise d'activité

### 2.2 Modèle de référence sécurisé

```markdown
# Architecture Cloud Sécurisée StratCyber

## Couche Réseau
- [ ] VPC (Virtual Private Cloud) dédié
- [ ] Segmentation par sous-réseaux
- [ ] Groupes de sécurité restrictifs  
- [ ] WAF (Web Application Firewall)
- [ ] VPN ou connexion privée
- [ ] Protection DDoS

## Couche Identité et Accès
- [ ] IAM (Identity Access Management) centralisé
- [ ] MFA (Multi-Factor Authentication) obligatoire
- [ ] Rôles et politiques granulaires
- [ ] Rotation automatique des clés
- [ ] Audit des accès complet
- [ ] Fédération d'identités

## Couche Données
- [ ] Chiffrement au repos (AES-256)
- [ ] Chiffrement en transit (TLS 1.3+)
- [ ] Gestion centralisée des clés
- [ ] Classification des données
- [ ] Sauvegarde chiffrée
- [ ] Politique de rétention

## Couche Applications
- [ ] Conteneurs sécurisés
- [ ] Scan de vulnérabilités automatisé
- [ ] Tests de sécurité intégrés
- [ ] Gestion des secrets
- [ ] Logs applicatifs centralisés
- [ ] API sécurisées

## Couche Monitoring
- [ ] SIEM cloud-native
- [ ] Détection d'anomalies
- [ ] Alertes temps réel
- [ ] Tableau de bord sécurité
- [ ] Intégration SOC
- [ ] Réponse automatisée
```

### 2.3 Zones de sécurité

**Architecture multi-zones** :

```
┌─────────────────────────────────────────────────────┐
│ ZONE INTERNET                                       │
│ ┌─────────────┐    ┌─────────────────────────────┐  │
│ │ CDN/WAF     │────│ Load Balancer               │  │
│ └─────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────┐
│ ZONE PUBLIQUE (DMZ)                                 │
│ ┌─────────────┐    ┌─────────────┐                  │
│ │ Web Servers │    │ API Gateway │                  │
│ └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────┐
│ ZONE PRIVÉE                                         │
│ ┌─────────────┐    ┌─────────────┐                  │
│ │ App Servers │    │ Microservices│                 │
│ └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────┐
│ ZONE DONNÉES                                        │
│ ┌─────────────┐    ┌─────────────┐                  │
│ │ Databases   │    │ File Storage │                 │
│ └─────────────┘    └─────────────┘                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. Gestion des Identités et Accès Cloud (IAM)

### 3.1 Stratégie IAM cloud

**Composants essentiels** :

1. **Utilisateurs** : Personnes physiques
2. **Groupes** : Regroupement logique d'utilisateurs
3. **Rôles** : Ensemble de permissions
4. **Politiques** : Définition des droits d'accès
5. **Ressources** : Services et objets cloud

### 3.2 Bonnes pratiques IAM

#### Principe du moindre privilège
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::mon-bucket-prod/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": ["203.0.113.0/24"]
        },
        "DateGreaterThan": {
          "aws:CurrentTime": "2024-01-01T00:00:00Z"
        }
      }
    }
  ]
}
```

#### Authentification multi-facteurs (MFA)
**Configuration MFA obligatoire** :
- Comptes administrateur : MFA matériel (FIDO2/U2F)
- Comptes utilisateur : MFA application mobile
- Comptes de service : Certificats ou clés temporaires
- Accès privilégié : MFA + approval workflow

#### Rotation des accès
```bash
# Script de rotation automatique des clés StratCyber
#!/bin/bash

# Rotation des clés API
rotate_api_keys() {
  OLD_KEY=$(get_current_key)
  NEW_KEY=$(generate_new_key)
  
  # Mise à jour des applications
  update_applications $NEW_KEY
  
  # Test de connectivité
  test_connectivity $NEW_KEY
  
  # Révocation ancienne clé après délai de grâce
  sleep 300
  revoke_key $OLD_KEY
  
  log "Rotation completed for key: $OLD_KEY -> $NEW_KEY"
}

# Audit des permissions
audit_permissions() {
  for user in $(list_users); do
    last_login=$(get_last_login $user)
    if [ $last_login -gt 90 ]; then
      disable_user $user
      notify_admin "User $user disabled due to inactivity"
    fi
  done
}
```

### 3.3 Fédération d'identités

**Intégration Active Directory** :
- SAML 2.0 ou OpenID Connect
- Single Sign-On (SSO) cloud
- Provisioning automatique des comptes
- Synchronisation des groupes et rôles
- Déprovisioning lors des départs

**Template de configuration SAML** :
```xml
<saml2:Assertion>
  <saml2:AttributeStatement>
    <saml2:Attribute Name="Role">
      <saml2:AttributeValue>CloudAdmin</saml2:AttributeValue>
    </saml2:Attribute>
    <saml2:Attribute Name="Department">
      <saml2:AttributeValue>IT</saml2:AttributeValue>
    </saml2:Attribute>
    <saml2:Attribute Name="AccessLevel">
      <saml2:AttributeValue>Privileged</saml2:AttributeValue>
    </saml2:Attribute>
  </saml2:AttributeStatement>
</saml2:Assertion>
```

---

## 4. Chiffrement et Protection des Données

### 4.1 Stratégie de chiffrement

**Chiffrement au repos** :
- AES-256 minimum
- Clés gérées par HSM (Hardware Security Module)
- Séparation des clés de chiffrement et des données
- Rotation automatique des clés
- Chiffrement au niveau bloc et fichier

**Chiffrement en transit** :
- TLS 1.3 minimum pour HTTPS
- VPN IPSec pour les connexions privées
- Certificats avec validation étendue
- Perfect Forward Secrecy (PFS)
- Chiffrement end-to-end pour les données sensibles

### 4.2 Gestion des clés de chiffrement

#### Architecture KMS (Key Management Service)
```markdown
# Hiérarchie de clés StratCyber

## Clé Racine (Root Key)
- Stockée dans HSM physique
- Accès ultra-restreint
- Utilisée pour chiffrer les clés maîtres

## Clés Maîtres (Master Keys)
- Une par environnement (Prod/Test/Dev)
- Stockées dans KMS cloud
- Rotées annuellement

## Clés de données (Data Keys)
- Générées pour chaque objet/dataset
- Chiffrées par les clés maîtres
- Stockées avec les données chiffrées
- Rotées selon la criticité

## Clés d'application
- Générées par application/service
- Durée de vie limitée
- Révocation immédiate possible
```

#### Procédure de rotation des clés
```python
# Exemple de rotation automatisée - StratCyber
import boto3
import logging
from datetime import datetime, timedelta

class KeyRotationManager:
    def __init__(self):
        self.kms = boto3.client('kms')
        self.logger = logging.getLogger('key-rotation')
    
    def rotate_key(self, key_id):
        try:
            # Créer nouvelle version de clé
            response = self.kms.rotate_key(KeyId=key_id)
            
            # Log de l'opération
            self.logger.info(f"Clé {key_id} rotée avec succès")
            
            # Notification équipes
            self.notify_teams(key_id, "rotated")
            
            return response
            
        except Exception as e:
            self.logger.error(f"Erreur rotation clé {key_id}: {str(e)}")
            self.notify_teams(key_id, "rotation_failed", str(e))
    
    def schedule_rotation(self):
        # Lister les clés à rotation automatique
        keys = self.kms.list_keys()
        
        for key in keys['Keys']:
            key_metadata = self.kms.describe_key(KeyId=key['KeyId'])
            
            # Vérifier si rotation nécessaire (365 jours)
            creation_date = key_metadata['KeyMetadata']['CreationDate']
            if datetime.now() - creation_date > timedelta(days=365):
                self.rotate_key(key['KeyId'])
```

### 4.3 Classification et étiquetage des données

**Niveaux de classification StratCyber** :

| Niveau | Description | Chiffrement | Accès | Rétention |
|--------|-------------|-------------|-------|-----------|
| **Public** | Information publique | Optionnel | Ouvert | 7 ans |
| **Interne** | Usage interne uniquement | TLS en transit | Employés | 5 ans |
| **Confidentiel** | Données sensibles métier | AES-256 | Autorisation | 3 ans |
| **Secret** | Très haute criticité | AES-256 + HSM | Ultra-restreint | 10 ans |

**Étiquetage automatisé** :
```yaml
# Politique d'étiquetage StratCyber
DataClassificationPolicy:
  Rules:
    - Pattern: "*.csv"
      Contains: ["nom", "prénom", "email"]
      Classification: "Confidentiel"
      Encryption: "Required"
      
    - Pattern: "financial_*"
      Classification: "Secret" 
      Encryption: "HSM_Required"
      AccessControl: "Executive_Only"
      
    - Pattern: "public_*"
      Classification: "Public"
      Encryption: "Optional"
      
  DefaultClassification: "Interne"
  AutoTagging: true
  PolicyEnforcement: "Strict"
```

---

## 5. Surveillance et Détection Cloud

### 5.1 Architecture SIEM cloud

**Composants de surveillance** :

1. **Collecteurs de logs** : Agents sur chaque ressource
2. **Agrégateurs** : Centralisation des événements
3. **Moteur de corrélation** : Détection d'anomalies
4. **Dashboard** : Visualisation temps réel
5. **Alerting** : Notifications automatisées
6. **SOAR** : Réponse automatisée aux incidents

### 5.2 Sources de logs critiques

**Logs d'infrastructure** :
- Authentification et autorisation
- Modifications de configuration
- Trafic réseau (flow logs)
- Accès aux APIs de gestion
- Création/suppression de ressources

**Logs applicatifs** :
- Tentatives d'authentification
- Accès aux données sensibles
- Erreurs et exceptions
- Transactions critiques
- Changements de configuration

**Logs de sécurité** :
- Événements de sécurité réseau
- Détection de malwares
- Tentatives d'intrusion
- Violations de politiques
- Activités privilégiées

### 5.3 Règles de détection StratCyber

#### Détection d'anomalies d'accès
```yaml
# Règle : Accès inhabituel géographique
rule_geographic_anomaly:
  name: "Connexion depuis localisation inhabituelle"
  description: "Détecte les connexions depuis des pays non autorisés"
  severity: "High"
  
  conditions:
    - field: "source_country"
      operator: "not_in"
      values: ["FR", "DE", "IT", "ES", "BE"]
    - field: "user_role" 
      operator: "in"
      values: ["Admin", "PowerUser"]
      
  actions:
    - type: "alert"
      destinations: ["soc@company.com"]
    - type: "block_session"
      duration: "15m"
    - type: "require_additional_auth"
```

#### Détection de mouvement latéral
```yaml
# Règle : Escalade de privilèges suspecte
rule_privilege_escalation:
  name: "Escalade de privilèges détectée"
  description: "Changements de permissions suspects"
  severity: "Critical"
  
  conditions:
    - field: "event_type"
      operator: "equals" 
      value: "iam_role_modified"
    - field: "new_permissions"
      operator: "contains"
      value: "admin"
    - field: "change_frequency"
      operator: "greater_than"
      value: 3
      timeframe: "1h"
      
  actions:
    - type: "immediate_alert"
    - type: "suspend_user"
    - type: "create_incident"
```

### 5.4 Dashboard de sécurité cloud

**Métriques clés à surveiller** :

```markdown
# Dashboard Sécurité Cloud StratCyber

## Vue d'ensemble
- Nombre total d'événements sécurité (24h)
- Incidents critiques ouverts
- Taux de faux positifs
- Score de posture sécurité global

## Authentification
- Tentatives de connexion échouées
- Connexions depuis nouvelles localisations  
- Utilisation MFA (% du total)
- Comptes dormants (> 90 jours)

## Accès aux données
- Accès aux données sensibles
- Téléchargements massifs de données
- Partages externes non autorisés
- Violations de politique DLP

## Configuration
- Ressources mal configurées
- Politiques de sécurité non respectées
- Certificats expirés/expirant
- Patchs de sécurité en attente

## Réseau
- Trafic suspect inter-zones
- Connexions vers IPs blacklistées
- Anomalies de bande passante
- Tentatives DDoS détectées
```

---

## 6. Conformité et Gouvernance Cloud

### 6.1 Framework de gouvernance

**Structure de gouvernance** :

```markdown
# Gouvernance Cloud StratCyber

## Niveau Stratégique
- Comité de pilotage cloud
- Politique cloud d'entreprise  
- Budget et investissements
- KPIs et reporting dirigeants

## Niveau Tactique  
- Architecture cloud cible
- Standards et référentiels
- Procédures et processus
- Formation et sensibilisation

## Niveau Opérationnel
- Déploiements et configurations
- Monitoring et maintenance
- Support et incident response
- Optimisation continue
```

### 6.2 Politiques de sécurité cloud

#### Politique de gestion des accès
```markdown
# Politique IAM Cloud - StratCyber

## Principes généraux
1. Aucun accès par défaut (deny by default)
2. Principe du moindre privilège
3. Révision trimestrielle des accès
4. MFA obligatoire pour tout accès privilégié

## Comptes administrateur
- Comptes nominatifs uniquement
- MFA matériel obligatoire
- Session timeout : 30 minutes
- Logging complet des actions

## Comptes de service
- Certificats X.509 pour l'authentification
- Rotation automatique tous les 90 jours
- Permissions limitées au strict nécessaire
- Monitoring des activités

## Comptes temporaires
- Durée maximale : 24 heures
- Approbation managériale requise
- Révocation automatique à expiration
- Audit complet des actions
```

#### Politique de classification des données
```markdown
# Classification des Données Cloud - StratCyber

## Critères de classification
- Niveau de confidentialité
- Impact en cas de divulgation
- Exigences réglementaires
- Durée de conservation

## Obligations par niveau
### Données Publiques
- Aucune restriction d'accès
- Chiffrement optionnel
- Sauvegarde standard

### Données Internes  
- Accès limité aux employés
- Chiffrement en transit (TLS)
- Sauvegarde quotidienne

### Données Confidentielles
- Accès sur autorisation
- Chiffrement au repos (AES-256)
- Sauvegarde chiffrée
- Logs d'accès détaillés

### Données Secrètes
- Accès ultra-restreint
- Double chiffrement (transit + repos)
- HSM pour la gestion des clés
- Monitoring temps réel
- Révision mensuelle des accès
```

### 6.3 Audit et conformité

#### Checklist de conformité cloud
```markdown
# Audit de Conformité Cloud - StratCyber

## RGPD
- [ ] Cartographie des données personnelles
- [ ] Bases légales documentées  
- [ ] Procédures d'exercice des droits
- [ ] Transferts internationaux sécurisés
- [ ] Analyse d'impact (AIPD) réalisée
- [ ] Contrats de sous-traitance conformes

## NIS2 (si applicable)
- [ ] Mesures techniques appropriées
- [ ] Gestion des risques cyber
- [ ] Procédures de notification d'incidents
- [ ] Formation du personnel
- [ ] Tests de sécurité réguliers

## ISO 27001
- [ ] SMSI documenté et opérationnel
- [ ] Analyse de risques formalisée
- [ ] Contrôles de sécurité implémentés
- [ ] Audit interne annuel
- [ ] Revue de direction semestrielle

## Exigences sectorielles
- [ ] Réglementation bancaire (si applicable)
- [ ] Normes industrie spécifiques
- [ ] Certification prestataire requise
- [ ] Obligations de reporting
```

---

## 7. Continuité d'Activité et Sauvegarde Cloud

### 7.1 Stratégie de sauvegarde cloud

**Règle 3-2-1 adaptée au cloud** :
- **3 copies** : Production + 2 sauvegardes
- **2 médias** : Cloud + stockage local/autre cloud
- **1 copie hors site** : Région géographique différente

#### Architecture de sauvegarde
```markdown
# Stratégie de Sauvegarde Multi-Cloud StratCyber

## Niveau 1 : Sauvegarde locale (même région)
- Fréquence : Continue (snapshot automatique)
- RPO : 15 minutes
- RTO : 30 minutes
- Rétention : 30 jours

## Niveau 2 : Sauvegarde cross-région
- Fréquence : Quotidienne
- RPO : 24 heures  
- RTO : 4 heures
- Rétention : 1 an

## Niveau 3 : Sauvegarde cross-cloud
- Fréquence : Hebdomadaire
- RPO : 7 jours
- RTO : 24 heures
- Rétention : 7 ans (conformité)

## Tests de restauration
- Tests automatisés : Mensuels
- Tests complets : Trimestriels
- Exercices de crise : Annuels
```

### 7.2 Plan de reprise d'activité cloud

#### Procédure d'activation du PRA
```markdown
# PRA Cloud - Procédure d'activation StratCyber

## Phase 1 : Détection et évaluation (0-30 min)
1. Confirmation de l'incident majeur
2. Activation de la cellule de crise
3. Évaluation de l'impact et de la durée
4. Décision d'activation du PRA

## Phase 2 : Activation (30 min - 2h)
1. Notification des équipes et utilisateurs
2. Bascule vers l'infrastructure de secours
3. Restauration des données critiques
4. Tests de fonctionnement

## Phase 3 : Fonctionnement dégradé (2h - résolution)
1. Monitoring renforcé du site de secours
2. Communication régulière aux utilisateurs
3. Travail sur la résolution de l'incident principal
4. Préparation du plan de retour

## Phase 4 : Retour à la normale
1. Vérification de la résolution
2. Synchronisation des données
3. Bascule vers l'infrastructure principale
4. Post-mortem et amélioration
```

#### Template de test PRA
```bash
#!/bin/bash
# Test PRA Cloud - StratCyber

# Variables
TEST_DATE=$(date +%Y%m%d)
LOG_FILE="pra_test_$TEST_DATE.log"

# Fonction de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# Test 1: Vérification sauvegarde
test_backup() {
    log "Début test sauvegarde"
    
    # Vérifier dernière sauvegarde
    LAST_BACKUP=$(get_last_backup_date)
    CURRENT_TIME=$(date +%s)
    
    if [ $((CURRENT_TIME - LAST_BACKUP)) -gt 86400 ]; then
        log "ERREUR: Sauvegarde trop ancienne"
        return 1
    fi
    
    log "Sauvegarde OK"
    return 0
}

# Test 2: Bascule vers site de secours
test_failover() {
    log "Début test de bascule"
    
    # Activation DNS de secours
    switch_dns_to_backup
    
    # Vérification connectivité
    if ping -c 3 backup-site.company.com; then
        log "Bascule DNS réussie"
    else
        log "ERREUR: Bascule DNS échouée"
        return 1
    fi
    
    # Test des applications critiques
    test_critical_apps
    
    log "Test de bascule terminé"
}

# Exécution des tests
main() {
    log "Début test PRA Cloud"
    
    test_backup
    test_failover
    
    log "Test PRA terminé - Voir rapport dans $LOG_FILE"
}

main
```

---

## 8. Outils et Services Cloud Sécurisés

### 8.1 Sélection de fournisseurs cloud

#### Critères d'évaluation StratCyber

**Critères techniques** :
- Certifications sécurité (ISO 27001, SOC 2)
- Qualification SecNumCloud (pour la France)
- Chiffrement natif des données
- Isolation multi-tenant robuste
- APIs sécurisées et documentées

**Critères juridiques** :
- Localisation des données en UE
- Conformité RGPD native
- Clauses de reversibilité
- Garanties de niveau de service (SLA)
- Responsabilité en cas d'incident

**Critères opérationnels** :
- Support 24/7 en français
- Documentation complète
- Outils de monitoring intégrés
- Écosystème de partenaires
- Roadmap produit claire

#### Grille d'évaluation des fournisseurs
```markdown
# Évaluation Fournisseur Cloud - StratCyber

## Fournisseur : [NOM]
## Date d'évaluation : [DATE]

### Sécurité (30 points)
| Critère | Points | Note | Commentaire |
|---------|--------|------|-------------|
| Certifications | 5 | /5 | ISO 27001, SOC 2, etc. |
| Chiffrement | 5 | /5 | Au repos et en transit |
| IAM avancé | 4 | /4 | RBAC, MFA, SSO |
| Monitoring | 4 | /4 | SIEM, alertes, logs |
| Conformité RGPD | 5 | /5 | DPA, transferts, droits |
| Tests sécurité | 3 | /3 | Pentests, audits |
| Incident response | 4 | /4 | Procédures, SLA |

### Technique (25 points)
| Critère | Points | Note | Commentaire |
|---------|--------|------|-------------|
| Performance | 5 | /5 | Latence, débit |
| Disponibilité | 5 | /5 | SLA uptime |
| Scalabilité | 5 | /5 | Auto-scaling |
| APIs | 3 | /3 | Documentation, SDKs |
| Intégrations | 4 | /4 | Écosystème |
| Backup/Recovery | 3 | /3 | RPO/RTO |

### Commercial (20 points)
| Critère | Points | Note | Commentaire |
|---------|--------|------|-------------|
| Pricing | 5 | /5 | Transparence, compétitivité |
| Support | 5 | /5 | 24/7, expertise |
| Flexibilité | 5 | /5 | Termes contractuels |
| Reversibilité | 5 | /5 | Export données, standards |

### Juridique (25 points)
| Critère | Points | Note | Commentaire |
|---------|--------|------|-------------|
| Localisation | 5 | /5 | Données en UE |
| Contrat | 5 | /5 | Clauses favorables |
| Responsabilité | 5 | /5 | Assurance, garanties |
| Audit rights | 3 | /3 | Droit d'audit |
| Transparence | 4 | /4 | Reporting incidents |
| Exit strategy | 3 | /3 | Portabilité données |

## TOTAL : ___/100

## Recommandation : 
[ ] Approuvé    [ ] Conditionnel    [ ] Rejeté

## Actions correctives (si applicable) :
-
-
-
```

### 8.2 Configuration sécurisée par service

#### Stockage cloud sécurisé
```yaml
# Configuration S3 sécurisée - Template StratCyber
BucketConfiguration:
  BucketName: "company-secure-storage"
  Region: "eu-west-3"  # France
  
  # Chiffrement obligatoire
  Encryption:
    SSEAlgorithm: "AES256"
    KMSKeyId: "${kms_key_id}"
    BucketKeyEnabled: true
    
  # Versioning activé
  Versioning:
    Status: "Enabled"
    MfaDelete: "Enabled"
    
  # Blocage des accès publics
  PublicAccessBlock:
    BlockPublicAcls: true
    BlockPublicPolicy: true
    IgnorePublicAcls: true
    RestrictPublicBuckets: true
    
  # Logging des accès
  AccessLogging:
    DestinationBucket: "company-access-logs"
    LogFilePrefix: "s3-access/"
    
  # Notification d'événements
  EventNotifications:
    - Event: "s3:ObjectCreated:*"
      Destination: "security-monitoring-queue"
    - Event: "s3:ObjectRemoved:*"
      Destination: "data-loss-prevention-topic"
      
  # Politique de bucket
  BucketPolicy: |
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "DenyInsecureConnections",
          "Effect": "Deny",
          "Principal": "*",
          "Action": "s3:*",
          "Resource": [
            "arn:aws:s3:::company-secure-storage/*"
          ],
          "Condition": {
            "Bool": {
              "aws:SecureTransport": "false"
            }
          }
        }
      ]
    }
```

#### Base de données cloud sécurisée
```yaml
# Configuration RDS sécurisée - Template StratCyber
DatabaseConfiguration:
  DBName: "production-db"
  Engine: "postgresql"
  EngineVersion: "14.9"
  
  # Chiffrement
  StorageEncrypted: true
  KmsKeyId: "${rds_kms_key_id}"
  
  # Réseau et accès
  VpcSecurityGroups:
    - "${db_security_group_id}"
  DBSubnetGroup: "${private_subnet_group}"
  PubliclyAccessible: false
  
  # Authentification
  MasterUsername: "dbadmin"
  ManageMasterUserPassword: true  # AWS gère le mot de passe
  
  # Monitoring et logs
  MonitoringInterval: 60
  MonitoringRoleArn: "${rds_monitoring_role_arn}"
  EnabledCloudwatchLogsExports:
    - "postgresql"
    
  # Sauvegarde
  BackupRetentionPeriod: 30
  BackupWindow: "03:00-04:00"
  MaintenanceWindow: "sun:04:00-sun:05:00"
  DeleteAutomatedBackups: false
  DeletionProtection: true
  
  # Performance Insights
  EnablePerformanceInsights: true
  PerformanceInsightsKMSKeyId: "${pi_kms_key_id}"
  PerformanceInsightsRetentionPeriod: 7
  
  # Multi-AZ pour HA
  MultiAZ: true
  AvailabilityZone: "eu-west-3a"
```

---

## 9. Formation et Sensibilisation Cloud

### 9.1 Programme de formation cloud

**Parcours par rôle** :

#### Développeurs
- **Module 1** : Sécurité du développement cloud (4h)
  - Principes DevSecOps
  - Gestion sécurisée des secrets
  - Tests de sécurité automatisés
  - Conteneurs et orchestration sécurisés

- **Module 2** : APIs et microservices (3h)
  - Sécurisation des APIs REST
  - Authentification OAuth 2.0/OIDC
  - Rate limiting et protection DDoS
  - Monitoring applicatif

#### Administrateurs systèmes
- **Module 1** : Infrastructure cloud sécurisée (6h)
  - Architecture réseau cloud
  - Configuration IAM avancée
  - Chiffrement et gestion des clés
  - Monitoring et SIEM cloud

- **Module 2** : Réponse aux incidents cloud (4h)
  - Forensic en environnement cloud
  - Procédures d'isolation et containment
  - Analyse des logs cloud
  - Recovery et post-incident

#### Architectes
- **Module 1** : Architecture sécurisée (8h)
  - Design patterns sécurisés
  - Zero Trust Architecture
  - Résilience et haute disponibilité
  - Gouvernance et conformité

### 9.2 Ateliers pratiques

#### Atelier 1 : Sécurisation d'une infrastructure
```markdown
# Atelier Pratique - Sécurisation Infrastructure Cloud

## Objectif
Sécuriser une infrastructure web 3-tiers dans le cloud

## Prérequis  
- Compte cloud de formation
- Accès aux outils StratCyber
- Connaissances réseaux de base

## Déroulé (4h)

### Étape 1 : Audit initial (30min)
- Scan de l'infrastructure existante
- Identification des vulnérabilités
- Priorisation des risques

### Étape 2 : Sécurisation réseau (60min)
- Configuration VPC et subnets
- Mise en place des groupes de sécurité
- Déploiement WAF et load balancer

### Étape 3 : IAM et accès (60min)
- Création des rôles et politiques
- Configuration MFA
- Test des permissions

### Étape 4 : Chiffrement (45min)
- Configuration KMS
- Chiffrement des volumes
- Test de rotation des clés

### Étape 5 : Monitoring (45min)
- Déploiement agents de monitoring
- Configuration alertes
- Test de détection d'incidents

## Livrables
- Infrastructure sécurisée fonctionnelle
- Documentation des configurations
- Rapport d'audit final
```

### 9.3 Certification interne

#### Programme de certification "Cloud Security Expert"
```markdown
# Certification StratCyber Cloud Security Expert

## Prérequis
- 2 ans d'expérience cloud
- Formation modules obligatoires
- Projet réel de sécurisation

## Évaluation

### Examen théorique (2h)
- 100 questions QCM
- Score minimum : 80%
- Domaines couverts :
  - Architecture sécurisée (25%)
  - IAM et chiffrement (25%)  
  - Monitoring et incident response (20%)
  - Conformité et gouvernance (20%)
  - Outils et bonnes pratiques (10%)

### Étude de cas pratique (4h)
- Analyse d'architecture existante
- Identification des risques
- Proposition d'améliorations
- Chiffrage et planning

### Présentation orale (30min)
- Présentation des recommandations
- Questions du jury
- Défense des choix techniques

## Certification
- Validité : 3 ans
- Renouvellement : Formation continue + projet
- Badge numérique StratCyber
```

---

## 10. Ressources et Support StratCyber

### 10.1 Outils intégrés

**Dashboard sécurité cloud** :
- Vue consolidée multi-cloud
- Alertes temps réel
- Métriques de conformité
- Rapport automatisés

**Audit automatisé** :
- Scan de configuration 24/7
- Détection des dérives
- Recommandations automatiques
- Tracking de remediation

**Templates sécurisés** :
- Architectures de référence
- Configurations IaC (Terraform)
- Politiques IAM standards
- Procédures opérationnelles

### 10.2 Bibliothèque de ressources

**Guides techniques** :
- Configuration par service cloud
- Procédures pas-à-pas
- Troubleshooting courant
- Architecture patterns

**Modèles de documents** :
- Politiques de sécurité cloud
- Procédures d'incident
- Contrats avec fournisseurs
- Audits de conformité

**Scripts d'automatisation** :
- Déploiement sécurisé
- Monitoring et alerting
- Sauvegarde et recovery
- Tests de sécurité

### 10.3 Communauté et support

**Forum utilisateurs StratCyber** :
- Partage d'expériences
- Questions/réponses techniques
- Nouveautés et évolutions
- Retours d'expérience

**Support expert** :
- Assistance technique 24/7
- Consulting architecture
- Audit sur demande
- Formation personnalisée

---

## Sources et Contact

### Sources officielles
- **ANSSI** : [ssi.gouv.fr](https://www.ssi.gouv.fr)
- **SecNumCloud** : [Qualification ANSSI](https://www.ssi.gouv.fr/entreprise/qualification/prestataires-de-services-de-confiance-qualifies/)
- **NIST** : [Cloud Security Standards](https://csrc.nist.gov/publications/sp800)
- **ENISA** : [Cloud Security](https://www.enisa.europa.eu/topics/cloud-computing)

### Support StratCyber
- **Email** : cloud-security@stratcyber.com
- **Documentation** : Section Cloud du dashboard
- **Formation** : Modules cloud disponibles
- **Consulting** : Experts architecture sécurisée

---

*Dernière mise à jour : [DATE]*
*Version : 1.0*

> **Note** : Ce guide évolue avec les nouvelles menaces et les évolutions technologiques. Les recommandations sont adaptables selon votre contexte métier et vos contraintes réglementaires.
