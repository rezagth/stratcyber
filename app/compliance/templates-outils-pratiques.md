# Templates et Outils Pratiques - StratCyber

## Vue d'ensemble

Cette collection regroupe tous les templates, outils et modèles pratiques développés par StratCyber pour faciliter votre mise en conformité et améliorer votre posture de cybersécurité.

---

## 📋 Templates RGPD

### 1. Registre des Traitements
```markdown
# REGISTRE DES TRAITEMENTS - STRATCYBER

## FICHE TRAITEMENT N° [NUMERO]

### IDENTIFICATION
- **Nom du traitement** : [Nom explicite]
- **Responsable de traitement** : [Nom, fonction, coordonnées]
- **DPD** : [Nom, coordonnées si applicable]
- **Date de création** : [JJ/MM/AAAA]
- **Dernière mise à jour** : [JJ/MM/AAAA]

### FINALITÉS ET BASE LÉGALE
- **Finalité principale** : [Objectif principal du traitement]
- **Finalités secondaires** : [Autres objectifs le cas échéant]
- **Base légale (Art. 6 RGPD)** : 
  [ ] Consentement (a)
  [ ] Contrat (b)
  [ ] Obligation légale (c)
  [ ] Sauvegarde des intérêts vitaux (d)
  [ ] Mission d'intérêt public (e)
  [ ] Intérêt légitime (f) - Préciser : [détails]

### PERSONNES CONCERNÉES
- **Catégories** : [Ex: clients, prospects, employés, fournisseurs]
- **Nombre approximatif** : [Ordre de grandeur]
- **Données sensibles** : [ ] Oui [ ] Non
- **Si oui, base légale spéciale (Art. 9)** : [Préciser]

### DONNÉES TRAITÉES
- **Identité** : [ ] Nom [ ] Prénom [ ] Date naissance [ ] Photo
- **Coordonnées** : [ ] Adresse [ ] Email [ ] Téléphone
- **Professionnelles** : [ ] Fonction [ ] Entreprise [ ] Salaire
- **Financières** : [ ] IBAN [ ] CB [ ] Revenus
- **Techniques** : [ ] IP [ ] Cookies [ ] Logs
- **Autres** : [Préciser]

### DESTINATAIRES
- **Internes** : [Services ayant accès]
- **Sous-traitants** : [Nom, type de service, localisation]
- **Partenaires** : [Nom, finalité du partage]
- **Autorités** : [Lesquelles, dans quels cas]

### TRANSFERTS INTERNATIONAUX
- **Pays de destination** : [Liste des pays]
- **Garantie appropriée** :
  [ ] Décision d'adéquation
  [ ] Clauses contractuelles types
  [ ] BCR (Binding Corporate Rules)
  [ ] Dérogation spécifique - Préciser : [laquelle]

### CONSERVATION
- **Durée active** : [Période en base active]
- **Durée archive** : [Période en archivage]
- **Critère de conservation** : [Justification de la durée]
- **Sort final** : [ ] Suppression [ ] Anonymisation [ ] Archive définitive

### MESURES DE SÉCURITÉ
- **Techniques** :
  [ ] Chiffrement des données
  [ ] Contrôle d'accès
  [ ] Journalisation
  [ ] Sauvegarde sécurisée
  [ ] Antivirus/anti-malware
  [ ] Autres : [préciser]

- **Organisationnelles** :
  [ ] Politique de sécurité
  [ ] Formation du personnel
  [ ] Clauses de confidentialité
  [ ] Gestion des habilitations
  [ ] Procédure d'incident
  [ ] Autres : [préciser]

### DROITS DES PERSONNES
- **Information** : [ ] Notice d'information rédigée
- **Accès** : [ ] Procédure définie
- **Rectification** : [ ] Procédure définie
- **Effacement** : [ ] Procédure définie et testée
- **Portabilité** : [ ] Applicable [ ] Non applicable
- **Opposition** : [ ] Procédure définie

### CONTRÔLES ET AUDIT
- **AIPD réalisée** : [ ] Oui [ ] Non [ ] Non nécessaire
- **Date dernière révision** : [JJ/MM/AAAA]
- **Prochain contrôle prévu** : [JJ/MM/AAAA]
- **Observations** : [Points d'attention particuliers]

---
Fiche validée par : [Nom] - [Date]
```

### 2. Formulaire d'Exercice des Droits
```html
<!-- FORMULAIRE DROITS RGPD - STRATCYBER -->
<form id="rgpd-rights-form" action="/rgpd/request" method="POST">
  
  <h2>Exercice de vos droits RGPD</h2>
  
  <!-- Identification -->
  <fieldset>
    <legend>Vos informations</legend>
    <label for="lastname">Nom* :</label>
    <input type="text" id="lastname" name="lastname" required>
    
    <label for="firstname">Prénom* :</label>
    <input type="text" id="firstname" name="firstname" required>
    
    <label for="email">Email* :</label>
    <input type="email" id="email" name="email" required>
    
    <label for="phone">Téléphone :</label>
    <input type="tel" id="phone" name="phone">
  </fieldset>
  
  <!-- Type de demande -->
  <fieldset>
    <legend>Type de demande*</legend>
    <label><input type="radio" name="request_type" value="access" required> 
           Droit d'accès - Obtenir une copie de mes données</label>
    
    <label><input type="radio" name="request_type" value="rectification" required> 
           Droit de rectification - Corriger mes données</label>
    
    <label><input type="radio" name="request_type" value="erasure" required> 
           Droit à l'effacement - Supprimer mes données</label>
    
    <label><input type="radio" name="request_type" value="portability" required> 
           Droit de portabilité - Récupérer mes données</label>
    
    <label><input type="radio" name="request_type" value="objection" required> 
           Droit d'opposition - M'opposer au traitement</label>
    
    <label><input type="radio" name="request_type" value="restriction" required> 
           Droit de limitation - Limiter le traitement</label>
  </fieldset>
  
  <!-- Précisions -->
  <fieldset>
    <legend>Précisions sur votre demande</legend>
    <label for="details">Détails (optionnel) :</label>
    <textarea id="details" name="details" rows="4" 
              placeholder="Précisez votre demande, les données concernées, etc."></textarea>
  </fieldset>
  
  <!-- Justificatifs -->
  <fieldset>
    <legend>Justificatif d'identité*</legend>
    <label for="id_document">Pièce d'identité (recto uniquement) :</label>
    <input type="file" id="id_document" name="id_document" 
           accept=".pdf,.jpg,.jpeg,.png" required>
    <small>Formats acceptés : PDF, JPG, PNG - Taille max : 5MB</small>
  </fieldset>
  
  <!-- Consentement -->
  <fieldset>
    <legend>Consentement</legend>
    <label>
      <input type="checkbox" name="consent" required>
      J'accepte que mes données soient traitées pour la gestion de ma demande*
    </label>
    
    <label>
      <input type="checkbox" name="identity_consent" required>
      J'atteste sur l'honneur être la personne concernée par cette demande*
    </label>
  </fieldset>
  
  <!-- Informations légales -->
  <div class="legal-info">
    <h3>Informations importantes</h3>
    <ul>
      <li><strong>Délai de réponse</strong> : 1 mois (prolongeable à 3 mois si complexité)</li>
      <li><strong>Gratuité</strong> : Cette demande est gratuite</li>
      <li><strong>Vérification d'identité</strong> : Obligatoire pour la sécurité de vos données</li>
      <li><strong>Contact DPD</strong> : dpo@company.com</li>
      <li><strong>Réclamation CNIL</strong> : En cas de désaccord, vous pouvez saisir la CNIL</li>
    </ul>
  </div>
  
  <button type="submit">Envoyer ma demande</button>
  
</form>

<script>
// Validation côté client
document.getElementById('rgpd-rights-form').addEventListener('submit', function(e) {
  const fileInput = document.getElementById('id_document');
  const file = fileInput.files[0];
  
  if (file && file.size > 5 * 1024 * 1024) {
    e.preventDefault();
    alert('Le fichier dépasse 5MB. Veuillez choisir un fichier plus petit.');
  }
});
</script>
```

### 3. Modèle de Politique de Confidentialité
```markdown
# POLITIQUE DE CONFIDENTIALITÉ - [NOM ENTREPRISE]

*Dernière mise à jour : [DATE]*

## QUI SOMMES-NOUS ?

[Nom de l'entreprise] (ci-après "nous", "notre", "la Société") est une [type d'entreprise] immatriculée sous le numéro [SIREN/SIRET], dont le siège social est situé [adresse complète].

**Responsable de traitement** : [Nom, fonction]
**Délégué à la Protection des Données** : [Nom, contact] (si applicable)

## QUELLES DONNÉES COLLECTONS-NOUS ?

### Données collectées directement
- **Données d'identité** : nom, prénom, date de naissance
- **Données de contact** : adresse, email, téléphone
- **Données professionnelles** : fonction, entreprise
- **Données de connexion** : adresse IP, cookies, logs

### Données collectées automatiquement
- **Données de navigation** : pages visitées, durée, référent
- **Données techniques** : type de navigateur, système d'exploitation
- **Données de géolocalisation** : pays, ville (si autorisé)

## POURQUOI TRAITONS-NOUS VOS DONNÉES ?

| Finalité | Base légale | Données utilisées | Durée |
|----------|-------------|-------------------|-------|
| Gestion des comptes clients | Contrat | Identité, contact | Durée de la relation + 5 ans |
| Facturation | Obligation légale | Identité, financières | 10 ans |
| Marketing direct | Intérêt légitime | Contact, comportement | 3 ans |
| Amélioration du site | Intérêt légitime | Navigation, technique | 25 mois |
| Newsletter | Consentement | Email | Jusqu'à désinscription |

## À QUI TRANSMETTONS-NOUS VOS DONNÉES ?

- **Personnel habilité** de notre entreprise
- **Sous-traitants** : hébergeur [nom], prestataire email [nom]
- **Partenaires commerciaux** (avec votre consentement)
- **Autorités légales** (si obligation)

**Transferts hors UE** : [Préciser si applicable - garanties appropriées]

## COMBIEN DE TEMPS CONSERVONS-NOUS VOS DONNÉES ?

- **Clients actifs** : Durée de la relation commerciale
- **Prospects** : 3 ans après dernier contact
- **Données comptables** : 10 ans (obligation légale)
- **Cookies** : 25 mois maximum
- **Logs de connexion** : 12 mois

## QUELS SONT VOS DROITS ?

Vous disposez des droits suivants :

### Droit d'accès
Obtenir la confirmation du traitement et une copie de vos données

### Droit de rectification
Corriger des données inexactes ou incomplètes

### Droit à l'effacement ("droit à l'oubli")
Demander la suppression de vos données dans certains cas

### Droit de portabilité
Récupérer vos données dans un format structuré (si traitement automatisé)

### Droit d'opposition
Vous opposer au traitement pour des raisons légitimes

### Droit de limitation
Demander la limitation du traitement dans certains cas

### Directives post-mortem
Définir le sort de vos données après votre décès

## COMMENT EXERCER VOS DROITS ?

**En ligne** : [lien vers formulaire]
**Par email** : [email DPD ou service client]
**Par courrier** : [adresse postale]

**Pièces à joindre** : Copie d'une pièce d'identité
**Délai de réponse** : 1 mois (prolongeable à 3 mois si complexité)

## COMMENT PROTÉGEONS-NOUS VOS DONNÉES ?

### Mesures techniques
- Chiffrement des données sensibles
- Contrôle d'accès strict
- Sauvegarde sécurisée
- Mise à jour sécuritaire régulière

### Mesures organisationnelles
- Formation du personnel
- Politique de sécurité
- Clauses de confidentialité
- Audit régulier

## COOKIES ET TECHNOLOGIES SIMILAIRES

Nous utilisons des cookies pour :
- Le fonctionnement du site (cookies techniques)
- L'amélioration de votre expérience (cookies analytiques)
- La personnalisation du contenu (cookies marketing)

**Gestion** : Vous pouvez gérer vos préférences via [lien paramètres cookies]

## RÉCLAMATIONS

En cas de désaccord, vous pouvez :
1. Nous contacter directement : [contact]
2. Saisir la CNIL : www.cnil.fr ou par courrier

## MODIFICATIONS

Cette politique peut être modifiée. La version en vigueur est datée du [DATE] en haut de cette page.

---

**Contact** : [Nom du DPD/responsable] - [Email] - [Téléphone]
```

---

## 🔐 Templates Sécurité Cloud

### 1. Checklist de Configuration Sécurisée
```markdown
# CHECKLIST SÉCURITÉ CLOUD - STRATCYBER

## ☑️ RÉSEAU ET ACCÈS

### VPC et Segmentation
- [ ] VPC dédié créé (pas de VPC par défaut)
- [ ] Sous-réseaux publics/privés séparés
- [ ] Tables de routage configurées
- [ ] NAT Gateway pour accès sortant sécurisé
- [ ] Internet Gateway limité aux besoins

### Groupes de Sécurité / Firewalls
- [ ] Principe du moindre privilège appliqué
- [ ] Règles entrantes restrictives (ports nécessaires uniquement)
- [ ] Règles sortantes limitées
- [ ] Pas de règle 0.0.0.0/0 sauf justification
- [ ] Documentation des règles

### Accès VPN/Connexions Privées
- [ ] VPN ou connexion dédiée configurée
- [ ] Authentification forte (certificats)
- [ ] Chiffrement IPSec/SSL
- [ ] Logs de connexion activés
- [ ] Accès conditionnel par IP source

## ☑️ IDENTITÉ ET AUTHENTIFICATION

### Comptes et Utilisateurs
- [ ] Pas de compte root/admin pour usage quotidien
- [ ] Comptes de service avec permissions minimales
- [ ] MFA activé pour tous les comptes privilégiés
- [ ] Rotation des mots de passe/clés programmée
- [ ] Désactivation automatique des comptes inactifs

### IAM (Identity Access Management)
- [ ] Politiques d'accès granulaires
- [ ] Rôles basés sur le principe du moindre privilège
- [ ] Groupes d'utilisateurs organisés par fonction
- [ ] Révision trimestrielle des permissions
- [ ] Logs d'accès et d'authentification activés

### Single Sign-On (SSO)
- [ ] Intégration avec Active Directory/LDAP
- [ ] Protocole SAML 2.0 ou OpenID Connect
- [ ] Provisioning/Déprovisioning automatique
- [ ] Session timeout configuré
- [ ] Logs de connexion SSO

## ☑️ CHIFFREMENT ET PROTECTION DES DONNÉES

### Chiffrement au Repos
- [ ] Chiffrement activé sur tous les volumes
- [ ] Chiffrement activé sur toutes les bases de données
- [ ] Chiffrement activé sur le stockage objet
- [ ] Algorithme AES-256 minimum
- [ ] Clés gérées par KMS/HSM

### Chiffrement en Transit
- [ ] TLS 1.3 minimum pour HTTPS
- [ ] Certificats SSL avec validation étendue
- [ ] Perfect Forward Secrecy activé
- [ ] Chiffrement inter-services
- [ ] VPN pour connexions administratives

### Gestion des Clés
- [ ] Service KMS (Key Management Service) utilisé
- [ ] Séparation des clés par environnement
- [ ] Rotation automatique des clés (annuelle min)
- [ ] Accès aux clés audité et restreint
- [ ] Sauvegarde sécurisée des clés

## ☑️ SURVEILLANCE ET LOGGING

### Collecte de Logs
- [ ] Logs d'authentification centralisés
- [ ] Logs d'accès aux données sensibles
- [ ] Logs des modifications de configuration
- [ ] Logs de sécurité réseau (Flow Logs)
- [ ] Logs des APIs et services cloud

### Monitoring et Alertes
- [ ] SIEM ou solution de monitoring déployé
- [ ] Alertes sur tentatives d'accès suspects
- [ ] Alertes sur modifications non autorisées
- [ ] Dashboard de sécurité temps réel
- [ ] Escalade automatique des alertes critiques

### Analyse et Forensic
- [ ] Logs intègres et non modifiables
- [ ] Rétention des logs selon politique
- [ ] Outils d'analyse et corrélation
- [ ] Procédures d'investigation définies
- [ ] Chain of custody pour investigations

## ☑️ SAUVEGARDE ET CONTINUITÉ

### Stratégie de Sauvegarde
- [ ] Règle 3-2-1 appliquée (3 copies, 2 supports, 1 hors site)
- [ ] Sauvegarde automatisée quotidienne
- [ ] Sauvegarde chiffrée
- [ ] Tests de restauration mensuels
- [ ] Documentation des procédures

### Plan de Reprise d'Activité (PRA)
- [ ] RPO (Recovery Point Objective) défini
- [ ] RTO (Recovery Time Objective) défini
- [ ] Site de secours configuré
- [ ] Procédures de bascule testées
- [ ] Formation des équipes au PRA

### Haute Disponibilité
- [ ] Déploiement multi-zones (Multi-AZ)
- [ ] Load balancers configurés
- [ ] Auto-scaling paramétré
- [ ] Base de données en cluster
- [ ] Monitoring de disponibilité

## ☑️ CONFORMITÉ ET GOUVERNANCE

### Conformité RGPD
- [ ] Localisation des données en UE vérifiée
- [ ] Contrats de sous-traitance conformes
- [ ] Procédures de notification de violation
- [ ] Exercice des droits des personnes
- [ ] AIPD réalisées si nécessaire

### Politiques de Sécurité
- [ ] Politique de sécurité cloud documentée
- [ ] Classification des données appliquée
- [ ] Procédures d'incident documentées
- [ ] Formation du personnel effectuée
- [ ] Audit de sécurité annuel

### Documentation et Contrôles
- [ ] Architecture documentée
- [ ] Configurations sauvegardées
- [ ] Procédures opérationnelles à jour
- [ ] Registre des incidents tenu
- [ ] Contrôles de conformité réguliers

## ☑️ SÉCURITÉ APPLICATIVE

### Développement Sécurisé
- [ ] Tests de sécurité intégrés (SAST/DAST)
- [ ] Scan de vulnérabilités automatisé
- [ ] Gestion sécurisée des secrets
- [ ] Code review incluant la sécurité
- [ ] Dépendances tierces auditées

### Conteneurs et Orchestration
- [ ] Images de base sécurisées et à jour
- [ ] Scan de sécurité des images
- [ ] Politiques de sécurité Pod/Container
- [ ] Réseau conteneur isolé
- [ ] Runtime security monitoring

### APIs et Microservices
- [ ] Authentification OAuth 2.0/JWT
- [ ] Rate limiting configuré
- [ ] Validation des entrées stricte
- [ ] Logs d'accès aux APIs
- [ ] Versioning et dépréciation gérés

---

**Validation** : Cette checklist doit être revue trimestriellement
**Responsable** : [Nom du responsable sécurité cloud]
**Dernière révision** : [Date]
```

### 2. Template d'Incident Response Cloud
```markdown
# PROCÉDURE DE RÉPONSE AUX INCIDENTS CLOUD - STRATCYBER

## 🚨 PHASE 1 : DÉTECTION ET SIGNALEMENT (0-15 minutes)

### Canaux de détection
- [ ] Monitoring automatisé (SIEM, alertes)
- [ ] Signalement utilisateur
- [ ] Audit de sécurité
- [ ] Notification du fournisseur cloud
- [ ] Découverte fortuite

### Actions immédiates
1. **Horodater** l'incident (heure de détection)
2. **Qualifier** la nature de l'incident
3. **Évaluer** l'impact initial (critique/majeur/mineur)
4. **Notifier** l'équipe de réponse aux incidents
5. **Documenter** dans le registre des incidents

### Classification des incidents
- **P1 - Critique** : Service indisponible, data breach majeur
- **P2 - Majeur** : Dégradation significative, compromission partielle  
- **P3 - Mineur** : Impact limité, incident de sécurité mineur

## 🔍 PHASE 2 : ÉVALUATION ET CONTAINMENT (15 min - 2h)

### Équipe d'intervention
- **Chef d'incident** : [Nom/Fonction]
- **Expert sécurité** : [Nom/Contact]
- **Administrateur cloud** : [Nom/Contact]
- **Responsable métier** : [Nom/Contact]
- **Communication** : [Nom/Contact]

### Actions d'évaluation
```bash
# Template de commandes d'investigation cloud
# À adapter selon votre environnement (AWS/Azure/GCP)

## 1. Vérification des logs d'authentification
aws logs filter-log-events \
  --log-group-name /aws/cloudtrail \
  --start-time 1234567890000 \
  --filter-pattern "{ $.eventName = ConsoleLogin && $.responseElements.ConsoleLogin = Failure }"

## 2. Analyse des modifications de configuration
aws logs filter-log-events \
  --log-group-name /aws/cloudtrail \
  --filter-pattern "{ $.eventName = CreateUser || $.eventName = AttachUserPolicy }"

## 3. Vérification des accès suspects
aws logs filter-log-events \
  --log-group-name /aws/cloudtrail \
  --filter-pattern "{ $.sourceIPAddress != \"IP_AUTORISEE\" }"

## 4. Contrôle des ressources critiques
aws ec2 describe-security-groups --query 'SecurityGroups[?IpPermissions[?IpRanges[?CidrIp==`0.0.0.0/0`]]]'
```

### Mesures de containment
- [ ] **Isoler** les systèmes compromis
- [ ] **Révoquer** les accès suspects
- [ ] **Bloquer** les IPs malveillantes
- [ ] **Sauvegarder** les preuves forensics
- [ ] **Notifier** les autorités si requis

### Matrice de containment
| Type d'incident | Containment immédiat | Containment à long terme |
|-----------------|---------------------|--------------------------|
| Compromission compte | Révocation accès + MFA | Rotation clés + audit |
| Malware | Isolation instance | Reconstruction clean |
| Déni de service | Rate limiting + WAF | Architecture résiliente |
| Data breach | Blocage accès données | Chiffrement renforcé |

## 🔧 PHASE 3 : ÉRADICATION ET RECOVERY (2h - 24h)

### Éradication
- [ ] **Identifier** la cause racine
- [ ] **Supprimer** les artefacts malveillants
- [ ] **Corriger** les vulnérabilités exploitées
- [ ] **Renforcer** les contrôles de sécurité
- [ ] **Valider** l'éradication complète

### Recovery
- [ ] **Restaurer** les systèmes depuis sauvegardes saines
- [ ] **Appliquer** les patchs de sécurité
- [ ] **Reconfigurer** avec paramètres sécurisés
- [ ] **Tester** le fonctionnement normal
- [ ] **Surveiller** les signes de récidive

### Checklist de recovery
```markdown
## Recovery Checklist Cloud

### Infrastructure
- [ ] Instances restaurées depuis snapshots sains
- [ ] Configurations réseau vérifiées
- [ ] Groupes de sécurité auditées
- [ ] Certificats SSL renouvelés si compromis
- [ ] DNS et load balancers fonctionnels

### Identité et Accès
- [ ] Comptes compromis désactivés/supprimés
- [ ] Nouvelles clés API générées
- [ ] Mots de passe changés
- [ ] Politiques IAM renforcées
- [ ] Logs d'accès vérifiés

### Applications
- [ ] Code source audité
- [ ] Dépendances mises à jour
- [ ] Configuration sécurisée appliquée
- [ ] Tests de sécurité passés
- [ ] Monitoring applicatif actif

### Données
- [ ] Intégrité des données vérifiée
- [ ] Données sensibles auditées
- [ ] Sauvegardes testées
- [ ] Chiffrement vérifié
- [ ] Classification respectée
```

## 📊 PHASE 4 : POST-INCIDENT (24h - 1 semaine)

### Rapport d'incident
```markdown
# RAPPORT D'INCIDENT - [NUMERO] - [DATE]

## RÉSUMÉ EXÉCUTIF
- **Date/Heure** : [début] - [fin]
- **Durée totale** : [heures/minutes]
- **Impact** : [description]
- **Cause racine** : [explication]
- **Actions correctives** : [résumé]

## CHRONOLOGIE DÉTAILLÉE
| Heure | Événement | Responsable | Action |
|-------|-----------|-------------|---------|
| [HH:MM] | [description] | [nom] | [action prise] |

## IMPACT MÉTIER
- **Utilisateurs affectés** : [nombre]
- **Services indisponibles** : [liste]
- **Durée d'indisponibilité** : [temps]
- **Perte de données** : [oui/non - détails]
- **Coût estimé** : [montant]

## ANALYSE TECHNIQUE
### Cause racine
[Description détaillée de la cause première]

### Vulnérabilité exploitée
[Description de la faille de sécurité]

### Vecteur d'attaque
[Comment l'incident s'est produit]

## ACTIONS CORRECTIVES IMMÉDIATES
1. [Action 1] - [Responsable] - [Échéance]
2. [Action 2] - [Responsable] - [Échéance]
3. [Action 3] - [Responsable] - [Échéance]

## PLAN D'AMÉLIORATION
### Court terme (1 mois)
- [Amélioration 1]
- [Amélioration 2]

### Moyen terme (3 mois)
- [Amélioration 1]
- [Amélioration 2]

### Long terme (6-12 mois)
- [Amélioration 1]
- [Amélioration 2]

## LEÇONS APPRISES
### Points positifs
- [Ce qui a bien fonctionné]

### Points d'amélioration
- [Ce qui peut être amélioré]

### Recommandations
- [Recommandations pour éviter la récidive]

---
**Rédigé par** : [Nom]
**Validé par** : [Nom du responsable sécurité]
**Date** : [Date de finalisation]
```

### Métriques et KPIs
- **MTTD** (Mean Time To Detect) : [temps moyen de détection]
- **MTTR** (Mean Time To Respond) : [temps moyen de réponse]
- **MTBF** (Mean Time Between Failures) : [temps entre incidents]
- **Taux de récidive** : [pourcentage d'incidents récurrents]

## 📞 CONTACTS D'URGENCE

### Équipe interne
| Rôle | Nom | Téléphone | Email |
|------|-----|-----------|-------|
| RSSI | [Nom] | [Tel] | [Email] |
| Admin Cloud | [Nom] | [Tel] | [Email] |
| DPO | [Nom] | [Tel] | [Email] |
| Direction | [Nom] | [Tel] | [Email] |

### Contacts externes
| Service | Contact | Téléphone | Conditions |
|---------|---------|-----------|------------|
| Police/Gendarmerie | Brigade cybercriminalité | [Tel] | Infractions pénales |
| ANSSI | CERT-FR | [Tel] | Incidents critiques |
| CNIL | Service des plaintes | [Tel] | Violation données personnelles |
| Assurance | [Assureur] | [Tel] | Sinistre cyber |

---

**Mise à jour** : Cette procédure doit être révisée semestriellement
**Formation** : Simulation d'incident trimestrielle obligatoire
**Validation** : [Nom RSSI] - [Date]
```

---

## 🎯 Templates Sensibilisation

### 1. Quiz Interactif de Sensibilisation
```html
<!-- QUIZ CYBERSÉCURITÉ INTERACTIF - STRATCYBER -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Quiz Cybersécurité StratCyber</title>
    <style>
        .quiz-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .question { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .correct { background-color: #d4edda; border-color: #c3e6cb; }
        .incorrect { background-color: #f8d7da; border-color: #f5c6cb; }
        .explanation { margin-top: 10px; font-style: italic; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>

<div class="quiz-container">
    <h1>🛡️ Quiz Cybersécurité StratCyber</h1>
    <p><strong>Instructions :</strong> Répondez aux questions suivantes pour tester vos connaissances en cybersécurité.</p>

    <form id="cyber-quiz">
        
        <!-- Question 1: Mots de passe -->
        <div class="question">
            <h3>1. Quelle est la longueur minimum recommandée pour un mot de passe professionnel ?</h3>
            <label><input type="radio" name="q1" value="a"> 6 caractères</label><br>
            <label><input type="radio" name="q1" value="b"> 8 caractères</label><br>
            <label><input type="radio" name="q1" value="c"> 12 caractères</label><br>
            <label><input type="radio" name="q1" value="d"> 16 caractères</label><br>
        </div>

        <!-- Question 2: Phishing -->
        <div class="question">
            <h3>2. Comment identifier un email de phishing ?</h3>
            <label><input type="checkbox" name="q2" value="a"> Vérifier l'adresse de l'expéditeur</label><br>
            <label><input type="checkbox" name="q2" value="b"> Analyser les fautes d'orthographe</label><br>
            <label><input type="checkbox" name="q2" value="c"> Vérifier les liens avant de cliquer</label><br>
            <label><input type="checkbox" name="q2" value="d"> Se méfier des demandes urgentes</label><br>
        </div>

        <!-- Question 3: Wi-Fi Public -->
        <div class="question">
            <h3>3. Que faire quand vous utilisez un Wi-Fi public ?</h3>
            <label><input type="radio" name="q3" value="a"> Éviter les sites sensibles (banque, email pro)</label><br>
            <label><input type="radio" name="q3" value="b"> Utiliser un VPN</label><br>
            <label><input type="radio" name="q3" value="c"> Vérifier que les sites sont en HTTPS</label><br>
            <label><input type="radio" name="q3" value="d"> Toutes les réponses ci-dessus</label><br>
        </div>

        <!-- Question 4: Sauvegarde -->
        <div class="question">
            <h3>4. Quelle est la règle "3-2-1" de sauvegarde ?</h3>
            <label><input type="radio" name="q4" value="a"> 3 copies, 2 supports différents, 1 hors site</label><br>
            <label><input type="radio" name="q4" value="b"> 3 sauvegardes par jour, 2 par semaine, 1 par mois</label><br>
            <label><input type="radio" name="q4" value="c"> 3 serveurs, 2 datacenters, 1 cloud</label><br>
            <label><input type="radio" name="q4" value="d"> 3 administrateurs, 2 mots de passe, 1 clé</label><br>
        </div>

        <!-- Question 5: RGPD -->
        <div class="question">
            <h3>5. En combien de temps maximum devez-vous signaler une violation de données à la CNIL ?</h3>
            <label><input type="radio" name="q5" value="a"> 24 heures</label><br>
            <label><input type="radio" name="q5" value="b"> 72 heures</label><br>
            <label><input type="radio" name="q5" value="c"> 7 jours</label><br>
            <label><input type="radio" name="q5" value="d"> 30 jours</label><br>
        </div>

        <!-- Question 6: Réseaux sociaux -->
        <div class="question">
            <h3>6. Quelles informations ne devez-vous jamais publier sur les réseaux sociaux professionnels ?</h3>
            <label><input type="checkbox" name="q6" value="a"> Votre poste de travail avec écrans visibles</label><br>
            <label><input type="checkbox" name="q6" value="b"> L'architecture réseau de l'entreprise</label><br>
            <label><input type="checkbox" name="q6" value="c"> Vos déplacements professionnels en temps réel</label><br>
            <label><input type="checkbox" name="q6" value="d"> Des informations sur les projets confidentiels</label><br>
        </div>

        <button type="button" onclick="checkQuiz()">Vérifier mes réponses</button>
        <button type="button" onclick="resetQuiz()">Recommencer</button>

    </form>

    <div id="results" style="margin-top: 20px;"></div>
</div>

<script>
// Réponses correctes
const correctAnswers = {
    q1: ['c'], // 12 caractères minimum
    q2: ['a', 'b', 'c', 'd'], // Toutes les réponses sont correctes
    q3: ['d'], // Toutes les réponses
    q4: ['a'], // 3-2-1 rule
    q5: ['b'], // 72 heures
    q6: ['a', 'b', 'c', 'd'] // Toutes sont des informations sensibles
};

// Explications pour chaque question
const explanations = {
    q1: "12 caractères minimum avec majuscules, minuscules, chiffres et symboles. L'ANSSI recommande des phrases de passe pour plus de sécurité.",
    q2: "Tous ces éléments sont des indicateurs de phishing. La vigilance doit être maximale avec les emails suspects.",
    q3: "Les Wi-Fi publics sont non sécurisés. Il faut prendre toutes ces précautions pour protéger ses données.",
    q4: "La règle 3-2-1 : 3 copies de vos données, sur 2 supports différents, avec 1 copie externalisée.",
    q5: "Le RGPD impose un délai de 72h maximum pour notifier une violation de données personnelles à l'autorité de contrôle.",
    q6: "Ces informations peuvent être exploitées par des cybercriminels pour des attaques ciblées ou de l'ingénierie sociale."
};

function checkQuiz() {
    let score = 0;
    let totalQuestions = Object.keys(correctAnswers).length;
    
    // Vérifier chaque question
    for (let questionId in correctAnswers) {
        let question = document.querySelector(`[name="${questionId}"]`);
        let questionDiv = question.closest('.question');
        let selectedAnswers = [];
        
        // Récupérer les réponses sélectionnées
        let inputs = questionDiv.querySelectorAll(`input[name="${questionId}"]:checked`);
        inputs.forEach(input => selectedAnswers.push(input.value));
        
        // Comparer avec les bonnes réponses
        let isCorrect = arraysEqual(selectedAnswers.sort(), correctAnswers[questionId].sort());
        
        // Affichage visuel
        if (isCorrect) {
            questionDiv.classList.add('correct');
            questionDiv.classList.remove('incorrect');
            score++;
        } else {
            questionDiv.classList.add('incorrect');
            questionDiv.classList.remove('correct');
        }
        
        // Ajouter l'explication
        let existingExplanation = questionDiv.querySelector('.explanation');
        if (existingExplanation) {
            existingExplanation.remove();
        }
        
        let explanation = document.createElement('div');
        explanation.className = 'explanation';
        explanation.innerHTML = `<strong>Explication :</strong> ${explanations[questionId]}`;
        questionDiv.appendChild(explanation);
    }
    
    // Afficher le score
    let percentage = Math.round((score / totalQuestions) * 100);
    let resultDiv = document.getElementById('results');
    let message = getScoreMessage(percentage);
    
    resultDiv.innerHTML = `
        <h3>Résultats du Quiz</h3>
        <p><strong>Score : ${score}/${totalQuestions} (${percentage}%)</strong></p>
        <p>${message}</p>
        <div style="margin-top: 15px;">
            <h4>🎯 Recommandations :</h4>
            <ul>
                <li>Consultez notre documentation complète sur la cybersécurité</li>
                <li>Suivez nos modules de formation e-learning</li>
                <li>Participez aux sessions de sensibilisation mensuelles</li>
                <li>Signalez tout incident suspect à l'équipe IT</li>
            </ul>
        </div>
    `;
}

function getScoreMessage(percentage) {
    if (percentage >= 90) {
        return "🏆 Excellent ! Vous maîtrisez bien les bases de la cybersécurité.";
    } else if (percentage >= 70) {
        return "👍 Bien ! Quelques points à revoir pour parfaire vos connaissances.";
    } else if (percentage >= 50) {
        return "⚠️ Moyen. Une formation complémentaire serait bénéfique.";
    } else {
        return "🚨 Attention ! Une formation en cybersécurité est urgente.";
    }
}

function resetQuiz() {
    // Effacer les sélections
    document.getElementById('cyber-quiz').reset();
    
    // Supprimer les classes de style
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('correct', 'incorrect');
        let explanation = q.querySelector('.explanation');
        if (explanation) explanation.remove();
    });
    
    // Effacer les résultats
    document.getElementById('results').innerHTML = '';
}

function arraysEqual(a, b) {
    return Array.isArray(a) && Array.isArray(b) && 
           a.length === b.length && 
           a.every((val, index) => val === b[index]);
}
</script>

</body>
</html>
```

### 2. Calendrier de Sensibilisation Annuel
```markdown
# CALENDRIER DE SENSIBILISATION CYBERSÉCURITÉ 2024 - STRATCYBER

## 📅 PLANNING MENSUEL

### 🎊 JANVIER - "Nouvelle Année, Nouvelles Habitudes Cyber"
**Thème** : Bonnes résolutions cybersécurité
**Objectif** : Motiver les bonnes pratiques pour l'année

#### Actions
- **Newsletter** : "10 résolutions cyber pour 2024"
- **Affiche** : "Mes bonnes résolutions cyber"
- **Quiz** : Évaluation des connaissances post-vacances
- **Formation** : Session "Remise à niveau sécurité" (2h)

#### Contenu spécialisé par métier
- **RH** : Sécurisation du recrutement digital
- **Finance** : Protection contre la fraude au président
- **Commercial** : Sécurité des données prospects/clients
- **IT** : Nouvelles menaces 2024

---

### 🔐 FÉVRIER - "Mots de Passe et Authentification"
**Thème** : Authentification forte
**Objectif** : Améliorer la sécurité des accès

#### Actions
- **Formation interactive** : "Créer des mots de passe robustes" (1h)
- **Outil** : Déploiement générateur de mots de passe
- **Challenge** : "Défi mot de passe parfait"
- **Audit** : Vérification des mots de passe faibles

#### Livrables
- Guide de création de phrases de passe
- Politique de mots de passe mise à jour
- Configuration MFA sur tous les comptes critiques

---

### 🎣 MARS - "Attention au Phishing !"
**Thème** : Détection et signalement du phishing
**Objectif** : Réduire le taux de clic sur liens malveillants

#### Actions
- **Simulation** : Campagne de phishing simulé
- **Atelier** : "Détecter les emails suspects" (45min)
- **Concours** : "Meilleur signalement de phishing"
- **Tableau de bord** : Suivi des performances par service

#### Templates d'emails de simulation
1. **Niveau facile** : Email bancaire grossier
2. **Niveau moyen** : Notification RH crédible  
3. **Niveau avancé** : Spear phishing personnalisé

---

### 📱 AVRIL - "Sécurité Mobile et Nomadisme"
**Thème** : Travail en mobilité sécurisé
**Objectif** : Protéger les données en déplacement

#### Actions
- **Webinaire** : "Télétravail et déplacements sécurisés" (1h)
- **Checklist** : "Partir en mission en sécurité"
- **Test** : Audit de configuration des appareils mobiles
- **Politique** : Mise à jour BYOD et MDM

#### Points clés
- Configuration VPN sur tous les appareils
- Chiffrement des disques durs
- Verrouillage automatique
- Applications autorisées/interdites

---

### ⚖️ MAI - "RGPD et Protection des Données"
**Thème** : Confidentialité et vie privée
**Objectif** : Respecter le RGPD au quotidien

#### Actions
- **E-learning** : "RGPD pour tous" (30min)
- **Cas pratiques** : Exercices par métier
- **Audit** : Vérification des traitements de données
- **Procédures** : Test d'exercice des droits

#### Modules spécialisés
- **Marketing** : Consentement et cookies
- **RH** : Données des employés
- **Support** : Gestion des demandes clients
- **Direction** : Responsabilités et sanctions

---

### 🌐 JUIN - "Navigation et Réseaux Sécurisés"
**Thème** : Internet et Wi-Fi sécurisés
**Objectif** : Naviguer sans risque

#### Actions
- **Newsletter** : "Bonnes pratiques de navigation"
- **Tips hebdomadaires** : Conseils courts par email
- **Configuration** : Audit des navigateurs
- **Sensibilisation** : Dangers des Wi-Fi publics

#### Outils recommandés
- Extensions de sécurité navigateur
- DNS sécurisés (Quad9, Cloudflare)
- Configuration HTTPS partout
- Blocage des publicités malveillantes

---

### 🏖️ JUILLET - "Cybersécurité en Vacances"
**Thème** : Protection pendant les congés
**Objectif** : Rester vigilant même en vacances

#### Actions
- **Guide pratique** : "Vacances connectées, vacances protégées"
- **Checklist** : "Avant de partir en congés"
- **Rappels** : Messages automatiques pendant l'absence
- **Procédures** : Gestion des accès pendant les absences

#### Conseils vacances
- Réseaux sociaux : pas de géolocalisation
- Wi-Fi hôtels : précautions d'usage
- Applications de voyage : vérifier les permissions
- Photos : attention aux informations sensibles

---

### 🚨 AOÛT - "Ransomware et Malwares"
**Thème** : Protection contre les logiciels malveillants
**Objectif** : Prévenir et réagir aux infections

#### Actions
- **Simulation** : Exercice ransomware (équipes IT)
- **Formation** : "Reconnaître et éviter les malwares" (1h)
- **Test** : Vérification des sauvegardes
- **Procédure** : Mise à jour du plan d'incident

#### Scénarios testés
- Email avec pièce jointe infectée
- Site web compromis
- Clé USB trouvée dans le parking
- Logiciel gratuit infecté

---

### 🎓 SEPTEMBRE - "Rentrée Cyber Sécurisée"
**Thème** : Formation des nouveaux arrivants
**Objectif** : Intégrer la cybersécurité dès l'arrivée

#### Actions
- **Session d'intégration** : "Cybersécurité chez [Entreprise]" (2h)
- **Kit du nouvel arrivant** : Documentation et outils
- **Parcours e-learning** : Modules obligatoires
- **Test de validation** : QCM de fin de parcours

#### Contenu formation nouveaux arrivants
1. Politique de sécurité de l'entreprise
2. Outils et procédures internes
3. Signalement des incidents
4. Contacts et ressources utiles

---

### 🏛️ OCTOBRE - "Mois Européen de la Cybersécurité"
**Thème** : Événement d'envergure
**Objectif** : Fédérer autour de la cybersécurité

#### Actions
- **Conférence** : Intervention expert externe (2h)
- **Stand sécurité** : Démonstrations interactives
- **Concours** : "Challenge cybersécurité inter-services"
- **Récompenses** : Prix des meilleurs "cyber-citoyens"

#### Thèmes de conférence
- Nouvelles menaces et tendances
- Intelligence artificielle et sécurité
- Retours d'expérience d'incidents
- Évolutions réglementaires

---

### 🎭 NOVEMBRE - "Ingénierie Sociale et Manipulation"
**Thème** : Techniques de manipulation
**Objectif** : Résister aux attaques psychologiques

#### Actions
- **Jeu de rôle** : Simulations d'ingénierie sociale
- **Formation management** : "Protéger son équipe"
- **Tests** : Appels téléphoniques suspects
- **Sensibilisation** : Techniques de manipulateurs

#### Scénarios d'ingénierie sociale
- Faux support informatique par téléphone
- Fausse livraison pour accès physique
- Usurpation d'identité sur LinkedIn
- Demande urgente du "patron"

---

### 📊 DÉCEMBRE - "Bilan et Perspectives"
**Thème** : Rétrospective annuelle
**Objectif** : Mesurer les progrès et planifier

#### Actions
- **Newsletter bilan** : Statistiques de l'année
- **Enquête satisfaction** : Retours sur les formations
- **Planification 2025** : Priorités pour l'année suivante
- **Récompenses** : Reconnaissance des ambassadeurs cyber

#### Métriques annuelles
- Évolution du taux de phishing
- Nombre d'incidents signalés
- Participation aux formations
- Score de maturité cyber global

---

## 🎯 ÉVÉNEMENTS TRANSVERSAUX

### Simulations de Phishing (Mensuel)
**Fréquence** : 1ère semaine de chaque mois
**Cibles** : Rotation par service
**Progression** : Difficulté croissante
**Suivi** : Tableaux de bord individuels et collectifs

### Alertes Sécurité (Si besoin)
**Déclenchement** : Nouvelles menaces critiques
**Délai** : Dans les 24h
**Canaux** : Email + Intranet + Affichage
**Contenu** : Description + Actions à prendre

### Formations Spécialisées (Trimestriel)
**Q1** : Développeurs - Sécurité applicative
**Q2** : Managers - Gestion de crise
**Q3** : Finance - Fraudes sophistiquées  
**Q4** : Support - Protection des données clients

---

## 📈 MESURE D'EFFICACITÉ

### KPIs Mensuels
- **Participation formations** : Taux de présence
- **Quiz de connaissances** : Score moyen par service
- **Simulations phishing** : Taux de clic et d'amélioration
- **Incidents signalés** : Nombre et qualité des signalements

### Évaluation Trimestrielle
- **Audit comportemental** : Observation des pratiques
- **Tests techniques** : Vérification des configurations
- **Enquête de satisfaction** : Retours utilisateurs
- **Analyse d'incidents** : Facteur humain dans les incidents

### Rapport Annuel
- **Évolution de la maturité** : Progression des équipes
- **ROI de la sensibilisation** : Réduction des incidents
- **Benchmark sectoriel** : Comparaison avec l'industrie
- **Plan d'amélioration** : Priorités pour l'année suivante

---

**Responsable programme** : [Nom du RSSI ou responsable formation]
**Budget annuel** : [Montant alloué]
**Mise à jour** : Ce calendrier est révisé chaque trimestre
```

---

## 🔧 Outils d'Automatisation

### 1. Script de Monitoring de Conformité
```python
#!/usr/bin/env python3
"""
MONITORING DE CONFORMITÉ STRATCYBER
Script de vérification automatisée des contrôles de sécurité
"""

import json
import smtplib
import datetime
import subprocess
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

class ComplianceMonitor:
    def __init__(self, config_file="compliance_config.json"):
        """Initialise le moniteur avec la configuration"""
        with open(config_file, 'r') as f:
            self.config = json.load(f)
        
        self.results = {
            'timestamp': datetime.datetime.now().isoformat(),
            'checks': {},
            'score': 0,
            'alerts': []
        }
    
    def check_password_policy(self):
        """Vérification de la politique des mots de passe"""
        print("🔐 Vérification politique des mots de passe...")
        
        checks = {
            'min_length': self.check_password_length(),
            'complexity': self.check_password_complexity(),
            'history': self.check_password_history(),
            'lockout': self.check_account_lockout()
        }
        
        self.results['checks']['password_policy'] = checks
        return all(checks.values())
    
    def check_access_control(self):
        """Vérification des contrôles d'accès"""
        print("🚪 Vérification contrôles d'accès...")
        
        checks = {
            'admin_accounts': self.check_admin_accounts(),
            'user_permissions': self.check_user_permissions(),
            'inactive_accounts': self.check_inactive_accounts(),
            'privileged_access': self.check_privileged_access()
        }
        
        self.results['checks']['access_control'] = checks
        return all(checks.values())
    
    def check_logging_monitoring(self):
        """Vérification des logs et monitoring"""
        print("📊 Vérification logs et monitoring...")
        
        checks = {
            'log_retention': self.check_log_retention(),
            'security_events': self.check_security_events(),
            'log_integrity': self.check_log_integrity(),
            'alerting': self.check_alerting_config()
        }
        
        self.results['checks']['logging'] = checks
        return all(checks.values())
    
    def check_encryption(self):
        """Vérification du chiffrement"""
        print("🔒 Vérification chiffrement...")
        
        checks = {
            'data_at_rest': self.check_data_encryption_rest(),
            'data_in_transit': self.check_data_encryption_transit(),
            'key_management': self.check_key_management(),
            'certificate_validity': self.check_certificates()
        }
        
        self.results['checks']['encryption'] = checks
        return all(checks.values())
    
    def check_backup_recovery(self):
        """Vérification sauvegardes et recovery"""
        print("💾 Vérification sauvegardes...")
        
        checks = {
            'backup_frequency': self.check_backup_frequency(),
            'backup_testing': self.check_backup_testing(),
            'offsite_backup': self.check_offsite_backup(),
            'recovery_time': self.check_recovery_procedures()
        }
        
        self.results['checks']['backup'] = checks
        return all(checks.values())
    
    def check_rgpd_compliance(self):
        """Vérification conformité RGPD"""
        print("⚖️ Vérification conformité RGPD...")
        
        checks = {
            'data_inventory': self.check_data_inventory(),
            'consent_management': self.check_consent_management(),
            'rights_procedures': self.check_rights_procedures(),
            'breach_procedures': self.check_breach_procedures()
        }
        
        self.results['checks']['rgpd'] = checks
        return all(checks.values())
    
    # Méthodes de vérification détaillées
    def check_password_length(self):
        """Vérifie la longueur minimum des mots de passe"""
        try:
            # Vérification via politique système (exemple Windows)
            result = subprocess.run([
                'net', 'accounts'
            ], capture_output=True, text=True)
            
            if "Minimum password length" in result.stdout:
                min_length = int(result.stdout.split("Minimum password length:")[1].split()[0])
                return min_length >= 12
            return False
        except:
            return False
    
    def check_admin_accounts(self):
        """Vérifie les comptes administrateur"""
        try:
            # Exemple : vérifier les comptes admin sur Windows
            result = subprocess.run([
                'net', 'localgroup', 'administrators'
            ], capture_output=True, text=True)
            
            admin_count = len([line for line in result.stdout.split('\n') 
                             if line.strip() and not line.startswith('-')])
            
            # Alerte si trop de comptes admin
            if admin_count > self.config.get('max_admin_accounts', 3):
                self.results['alerts'].append(f"Trop de comptes administrateur: {admin_count}")
                return False
            return True
        except:
            return False
    
    def check_certificates(self):
        """Vérifie la validité des certificats"""
        try:
            domains = self.config.get('domains_to_check', [])
            expired_soon = []
            
            for domain in domains:
                # Vérification SSL avec openssl
                result = subprocess.run([
                    'openssl', 's_client', '-connect', f'{domain}:443', 
                    '-servername', domain
                ], input='', capture_output=True, text=True)
                
                if "Verify return code: 0" not in result.stderr:
                    expired_soon.append(domain)
            
            if expired_soon:
                self.results['alerts'].append(f"Certificats expirant: {', '.join(expired_soon)}")
                return False
            return True
        except:
            return False
    
    def generate_report(self):
        """Génère le rapport de conformité"""
        print("📋 Génération du rapport...")
        
        # Calcul du score global
        total_checks = 0
        passed_checks = 0
        
        for category, checks in self.results['checks'].items():
            for check, status in checks.items():
                total_checks += 1
                if status:
                    passed_checks += 1
        
        self.results['score'] = int((passed_checks / total_checks) * 100) if total_checks > 0 else 0
        
        # Génération du rapport HTML
        html_report = self.generate_html_report()
        
        # Sauvegarde
        report_filename = f"compliance_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(report_filename, 'w', encoding='utf-8') as f:
            f.write(html_report)
        
        print(f"📄 Rapport sauvegardé: {report_filename}")
        return report_filename
    
    def generate_html_report(self):
        """Génère le rapport HTML"""
        score = self.results['score']
        score_color = "green" if score >= 80 else "orange" if score >= 60 else "red"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Rapport de Conformité StratCyber</title>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .header {{ background: #f8f9fa; padding: 20px; border-radius: 5px; }}
                .score {{ font-size: 2em; color: {score_color}; font-weight: bold; }}
                .category {{ margin: 20px 0; }}
                .check {{ margin: 10px 0; padding: 10px; border-left: 3px solid #ccc; }}
                .passed {{ border-left-color: green; background: #d4edda; }}
                .failed {{ border-left-color: red; background: #f8d7da; }}
                .alert {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🛡️ Rapport de Conformité StratCyber</h1>
                <p><strong>Date:</strong> {self.results['timestamp']}</p>
                <p><strong>Score global:</strong> <span class="score">{score}%</span></p>
            </div>
        """
        
        # Alertes
        if self.results['alerts']:
            html += "<h2>🚨 Alertes</h2>"
            for alert in self.results['alerts']:
                html += f'<div class="alert">⚠️ {alert}</div>'
        
        # Détail des vérifications
        html += "<h2>📋 Détail des Vérifications</h2>"
        
        category_names = {
            'password_policy': '🔐 Politique des Mots de Passe',
            'access_control': '🚪 Contrôles d\'Accès',
            'logging': '📊 Logs et Monitoring',
            'encryption': '🔒 Chiffrement',
            'backup': '💾 Sauvegardes',
            'rgpd': '⚖️ Conformité RGPD'
        }
        
        for category, checks in self.results['checks'].items():
            html += f'<div class="category"><h3>{category_names.get(category, category)}</h3>'
            
            for check, status in checks.items():
                status_class = "passed" if status else "failed"
                status_icon = "✅" if status else "❌"
                html += f'<div class="check {status_class}">{status_icon} {check.replace("_", " ").title()}</div>'
            
            html += '</div>'
        
        html += """
            <div style="margin-top: 40px; text-align: center; color: #666;">
                <p>Rapport généré automatiquement par StratCyber Compliance Monitor</p>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def send_report_email(self, report_filename):
        """Envoie le rapport par email"""
        if not self.config.get('email_enabled', False):
            return
        
        print("📧 Envoi du rapport par email...")
        
        # Configuration email
        smtp_server = self.config['smtp_server']
        smtp_port = self.config['smtp_port']
        email_user = self.config['email_user']
        email_password = self.config['email_password']
        recipients = self.config['email_recipients']
        
        # Création du message
        msg = MimeMultipart()
        msg['From'] = email_user
        msg['To'] = ', '.join(recipients)
        msg['Subject'] = f"Rapport de Conformité - Score: {self.results['score']}%"
        
        # Corps du message
        body = f"""
        Rapport de conformité StratCyber généré automatiquement.
        
        Score global: {self.results['score']}%
        Date: {self.results['timestamp']}
        Alertes: {len(self.results['alerts'])}
        
        Le rapport détaillé est joint à ce message.
        
        -- 
        StratCyber Compliance Monitor
        """
        
        msg.attach(MimeText(body, 'plain'))
        
        # Pièce jointe
        with open(report_filename, 'r', encoding='utf-8') as f:
            attachment = MimeText(f.read(), 'html')
            attachment.add_header('Content-Disposition', f'attachment; filename="{report_filename}"')
            msg.attach(attachment)
        
        # Envoi
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(email_user, email_password)
            server.send_message(msg)
            server.quit()
            print("✅ Rapport envoyé par email")
        except Exception as e:
            print(f"❌ Erreur envoi email: {e}")
    
    def run_full_audit(self):
        """Lance l'audit complet"""
        print("🚀 Début de l'audit de conformité StratCyber")
        print("=" * 50)
        
        # Exécution des vérifications
        checks = [
            self.check_password_policy,
            self.check_access_control,
            self.check_logging_monitoring,
            self.check_encryption,
            self.check_backup_recovery,
            self.check_rgpd_compliance
        ]
        
        for check in checks:
            try:
                check()
            except Exception as e:
                print(f"❌ Erreur lors de {check.__name__}: {e}")
        
        # Génération et envoi du rapport
        report_file = self.generate_report()
        
        if self.config.get('email_enabled', False):
            self.send_report_email(report_file)
        
        print("=" * 50)
        print(f"🏁 Audit terminé - Score: {self.results['score']}%")
        
        return self.results

# Configuration d'exemple
if __name__ == "__main__":
    # Créer la configuration si elle n'existe pas
    config = {
        "max_admin_accounts": 3,
        "domains_to_check": ["company.com", "intranet.company.com"],
        "email_enabled": False,
        "smtp_server": "smtp.company.com",
        "smtp_port": 587,
        "email_user": "monitoring@company.com",
        "email_password": "password",
        "email_recipients": ["rssi@company.com", "it@company.com"]
    }
    
    with open('compliance_config.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    # Lancer l'audit
    monitor = ComplianceMonitor()
    results = monitor.run_full_audit()
```

### 2. Configuration Automatisée et Intégration
```bash
#!/bin/bash
# INSTALLATION ET CONFIGURATION STRATCYBER TOOLS

# Configuration du monitoring de conformité
setup_compliance_monitoring() {
    echo "🔧 Configuration du monitoring de conformité..."
    
    # Créer le répertoire de travail
    mkdir -p /opt/stratcyber/compliance
    cd /opt/stratcyber/compliance
    
    # Copier le script de monitoring
    cp compliance_monitor.py .
    chmod +x compliance_monitor.py
    
    # Configuration cron pour exécution quotidienne
    cat << 'EOF' > /etc/cron.d/stratcyber-compliance
# StratCyber Compliance Monitoring
# Exécution quotidienne à 6h du matin
0 6 * * * root /usr/bin/python3 /opt/stratcyber/compliance/compliance_monitor.py
EOF
    
    echo "✅ Monitoring de conformité configuré"
}

# Installation des dépendances
install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    # Python et modules nécessaires
    apt-get update
    apt-get install -y python3 python3-pip openssl
    
    pip3 install requests smtplib email datetime subprocess json
    
    echo "✅ Dépendances installées"
}

# Configuration des alertes
setup_alerting() {
    echo "🚨 Configuration des alertes..."
    
    # Script d'alerte simple
    cat << 'EOF' > /opt/stratcyber/alert.sh
#!/bin/bash
# Script d'alerte StratCyber

SEVERITY=$1
MESSAGE=$2
WEBHOOK_URL="YOUR_WEBHOOK_URL"

case $SEVERITY in
    "critical")
        COLOR="danger"
        EMOJI="🚨"
        ;;
    "warning")
        COLOR="warning"
        EMOJI="⚠️"
        ;;
    *)
        COLOR="good"
        EMOJI="ℹ️"
        ;;
esac

# Envoi vers Slack/Teams (exemple)
curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$EMOJI StratCyber Alert: $MESSAGE\"}" \
    $WEBHOOK_URL

# Log local
echo "$(date): [$SEVERITY] $MESSAGE" >> /var/log/stratcyber-alerts.log
EOF

    chmod +x /opt/stratcyber/alert.sh
    echo "✅ Système d'alerte configuré"
}

# Fonction principale
main() {
    echo "🚀 Installation des outils StratCyber"
    echo "===================================="
    
    install_dependencies
    setup_compliance_monitoring
    setup_alerting
    
    echo "===================================="
    echo "✅ Installation terminée !"
    echo "📋 Rapport quotidien configuré pour 6h00"
    echo "🚨 Alertes disponibles via /opt/stratcyber/alert.sh"
    echo "📂 Logs disponibles dans /var/log/stratcyber-alerts.log"
}

# Exécution si appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
```

---

## 📞 Support et Utilisation

### Accès aux Templates
Tous ces templates sont disponibles dans votre dashboard StratCyber :
- **Section Documentation** → Templates pratiques
- **Téléchargement** en formats Word/PDF/HTML selon le besoin
- **Personnalisation** selon votre contexte d'entreprise

### Support Technique
- **Email** : templates@stratcyber.com
- **Documentation** : Guide d'utilisation détaillé
- **Formation** : Sessions de prise en main disponibles

### Mises à Jour
Ces templates évoluent régulièrement :
- **Nouveautés réglementaires** intégrées automatiquement
- **Retours utilisateurs** pris en compte
- **Bonnes pratiques** sectorielles ajoutées

---

*Collection mise à jour régulièrement - Version courante disponible sur votre dashboard StratCyber*
