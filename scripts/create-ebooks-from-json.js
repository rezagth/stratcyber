const fs = require('fs');
const path = require('path');

// Données des ebooks extraites du fichier JSON
const ebooks = [
  {
    id: "666e8680-7811-4b26-b0a4-e2b3d92dd042",
    title: "Sécurité des Accès et Authentification",
    author: "StratCyber Formation",
    description: "Guide complet sur la sécurité des accès et l'authentification forte en entreprise",
    content: {
      markdown: "# Sécurité des Accès et Authentification\n\n**Auteur**: StratCyber Formation  \n**Catégorie**: Fondamentaux  \n**Difficulté**: Débutant  \n**Durée estimée**: 2h 30min  \n**Tags**: #Accès #Authentification #Contrôle #Sécurité\n\n## Table des matières\n\n1. [Introduction](#introduction)\n2. [Principes fondamentaux de la gestion des accès](#principes-fondamentaux)\n3. [Authentification forte et multifacteur](#authentification-forte)\n4. [Contrôle d'accès basé sur les rôles](#controle-acces-rbac)\n5. [Gestion du cycle de vie des identités](#cycle-vie-identites)\n6. [Surveillance et audit des accès](#surveillance-audit)\n7. [Plan d'action pratique](#plan-action)\n8. [Quiz de validation](#quiz)\n\n---\n\n## Introduction\n\nLa sécurité des accès constitue le premier rempart de votre système d'information. Dans un contexte où les cyberattaques se multiplient et se sophistiquent, la maîtrise de l'authentification et du contrôle d'accès devient cruciale pour toute organisation.\n\n### Pourquoi ce guide ?\n\n- **68% des violations** de données impliquent des identifiants compromis\n- **81% des attaques** exploitent des mots de passe faibles ou volés  \n- **Le coût moyen** d'une violation liée aux accès : 4,5M€\n\n### Ce que vous allez apprendre\n\n✅ Les principes fondamentaux de la gestion des accès  \n✅ Comment mettre en place une authentification forte  \n✅ Les meilleures pratiques de contrôle d'accès  \n✅ Comment surveiller et auditer les accès  \n✅ Un plan d'action concret pour votre organisation  \n\n---\n\n## Principes fondamentaux de la gestion des accès {#principes-fondamentaux}\n\n### Le principe du moindre privilège\n\n**Définition**: Chaque utilisateur ne dispose que des droits strictement nécessaires à l'accomplissement de ses tâches.\n\n#### Mise en pratique :\n\n1. **Analyse des besoins**\n   - Cartographier les rôles et responsabilités\n   - Identifier les ressources nécessaires par fonction\n   - Documenter les accès légitimes\n\n2. **Attribution granulaire**\n   ```\n   Exemple pratique :\n   - Comptable : Accès lecture/écriture sur les fichiers financiers uniquement\n   - RH : Accès aux données personnelles dans le SIRH uniquement  \n   - IT : Accès administrateur sur l'infrastructure, lecture sur les données métier\n   ```\n\n3. **Révision régulière**\n   - Audit trimestriel des droits\n   - Révision lors des changements de poste\n   - Suppression automatique des comptes inactifs\n\n### Séparation des tâches (SoD)\n\n**Objectif**: Empêcher qu'une seule personne puisse compromettre un processus critique.\n\n#### Exemples concrets :\n\n**Dans la finance :**\n- Personne A : Saisie des factures\n- Personne B : Validation des paiements\n- Personne C : Exécution des virements\n\n**Dans l'IT :**\n- Admin système : Gestion infrastructure\n- Admin sécurité : Gestion des politiques\n- Auditeur : Contrôle et reporting\n\n### Authentification défense en profondeur\n\n#### Les 3 facteurs d'authentification :\n\n1. **Ce que vous savez** (mot de passe, PIN)\n2. **Ce que vous avez** (token, smartphone)\n3. **Ce que vous êtes** (biométrie, comportement)\n\n---\n\n## Authentification forte et multifacteur {#authentification-forte}\n\n### Pourquoi l'authentification multifacteur (MFA) ?\n\n**Statistiques clés :**\n- Réduit les risques de compromission de **99,9%**\n- Protection contre **99,9%** des attaques automatisées\n- ROI moyen de **300%** sur 3 ans\n\n### Types de MFA recommandés\n\n#### 1. TOTP (Time-based One-Time Password)\n```\nAvantages :\n✅ Gratuit et facile à déployer\n✅ Fonctionne hors ligne\n✅ Applications : Google Authenticator, Authy, Microsoft Authenticator\n\nInconvénients :\n❌ Vulnérable au phishing sophistiqué\n❌ Peut être perdu avec le téléphone\n```\n\n#### 2. Push notifications\n```\nAvantages :\n✅ Expérience utilisateur fluide\n✅ Informations contextuelles (localisation, appareil)\n✅ Difficult à intercepter\n\nInconvénients :\n❌ Nécessite une connexion internet\n❌ Fatigue d'authentification possible\n```\n\n#### 3. Clés de sécurité hardware (FIDO2/WebAuthn)\n```\nAvantages :\n✅ Protection maximale contre le phishing\n✅ Pas de batterie, très fiable\n✅ Standard ouvert\n\nInconvénients :\n❌ Coût initial plus élevé\n❌ Peut être perdu physiquement\n```\n\n### Plan de déploiement MFA\n\n#### Phase 1 : Préparation (2 semaines)\n- [ ] Audit des applications et services\n- [ ] Choix de la solution MFA\n- [ ] Formation des équipes IT\n- [ ] Communication aux utilisateurs\n\n#### Phase 2 : Pilote (2 semaines)  \n- [ ] Déploiement sur un groupe test (IT, Direction)\n- [ ] Tests et ajustements\n- [ ] Recueil des retours d'expérience\n- [ ] Affinement des procédures\n\n#### Phase 3 : Déploiement général (4-8 semaines)\n- [ ] Déploiement par vagues (priorité aux comptes privilégiés)\n- [ ] Support utilisateur renforcé\n- [ ] Monitoring des incidents\n- [ ] Documentation des bonnes pratiques\n\n---\n\n*Guide complet avec plus de 8000 mots couvrant tous les aspects de la sécurité des accès et de l'authentification.*",
      chapters: [
        {
          title: "Introduction",
          content: "La sécurité des accès constitue le premier rempart de votre système d'information...",
          practicalExamples: ["Statistiques d'attaques", "Coûts des violations"],
          actionItems: ["Évaluer vos pratiques actuelles", "Identifier les points faibles"]
        },
        {
          title: "Principes fondamentaux de la gestion des accès",
          content: "Le principe du moindre privilège est essentiel pour limiter les risques...",
          practicalExamples: ["Attribution granulaire", "Séparation des tâches"],
          actionItems: ["Cartographier les rôles", "Mettre en place les revues trimestrielles"]
        },
        {
          title: "Authentification forte et multifacteur",
          content: "L'authentification multifacteur réduit les risques de compromission de 99,9%...",
          practicalExamples: ["TOTP", "Push notifications", "Clés FIDO2"],
          actionItems: ["Déployer la MFA", "Former les utilisateurs"]
        },
        {
          title: "Plan d'action pratique",
          content: "Voici les étapes pratiques pour améliorer votre niveau de sécurité...",
          practicalExamples: ["Questionnaire d'auto-évaluation", "Roadmap de déploiement"],
          actionItems: ["Inventaire des comptes", "Activer la MFA", "Mettre en place le RBAC"]
        }
      ]
    },
    category: "Fondamentaux",
    difficulty: "Débutant",
    duration: "2h 30min",
    pages: 25,
    rating: 4.8,
    downloads: 0,
    tags: ["Accès", "Authentification", "Contrôle", "Sécurité"],
    thumbnailUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    isPublished: true
  },
  {
    id: "815b1299-1b40-43af-ad44-4fc9c77b3fca",
    title: "Sécurité Réseau et Protection du Périmètre",
    author: "StratCyber Formation",
    description: "Guide avancé sur la sécurisation des infrastructures réseau et la défense périmétrique",
    content: {
      markdown: "# Sécurité Réseau et Protection du Périmètre\n\n**Auteur**: StratCyber Formation  \n**Catégorie**: Réseau  \n**Difficulté**: Avancé  \n**Durée estimée**: 4h 00min  \n**Tags**: #Réseau #Firewall #IDS #Zero Trust\n\n## Table des matières\n\n1. [Architecture réseau sécurisée](#architecture)\n2. [Pare-feu nouvelle génération](#firewall)\n3. [Détection et réponse](#detection)\n4. [Zero Trust Architecture](#zero-trust)\n5. [Monitoring réseau](#monitoring)\n6. [Plan de mise en œuvre](#plan)\n\n---\n\n## Architecture réseau sécurisée {#architecture}\n\nUne architecture bien conçue constitue la première ligne de défense contre les cyberattaques. Ce chapitre couvre les principes fondamentaux d'une infrastructure réseau robuste.\n\n### Principes de base\n\n#### Segmentation réseau\nLa segmentation permet d'isoler les différents types de trafic et de limiter la propagation des menaces :\n\n- **DMZ (Zone démilitarisée)** : Serveurs exposés à Internet\n- **Réseau interne** : Postes de travail et serveurs métier\n- **Réseau d'administration** : Équipements de gestion\n- **Réseau invités** : Accès temporaires\n\n#### Défense en profondeur\n```\nInternet → Firewall périmétrique → DMZ → Firewall interne → LAN\n           ↓                              ↓\n         IPS/IDS                      Proxy/WAF\n```\n\n### Modèle Zero Trust\n\n**Principe**: \"Never trust, always verify\" (Ne jamais faire confiance, toujours vérifier)\n\n#### Composants clés :\n1. **Vérification d'identité** pour chaque connexion\n2. **Inspection du trafic** en temps réel\n3. **Accès conditionnel** basé sur le risque\n4. **Microsegmentation** des ressources\n5. **Monitoring continu** des comportements\n\n---\n\n## Pare-feu nouvelle génération {#firewall}\n\nLes NGFW (Next Generation Firewall) offrent des capacités avancées de filtrage et d'inspection du trafic.\n\n### Fonctionnalités avancées\n\n#### Inspection SSL/TLS\n- Déchiffrement et inspection du trafic chiffré\n- Détection de malware dans les communications HTTPS\n- Respect de la confidentialité et conformité\n\n#### Filtrage applicatif\n- Contrôle granulaire par application\n- Gestion de la bande passante\n- Blocage des applications non autorisées\n\n#### Prévention d'intrusion intégrée\n- Signatures comportementales\n- Détection d'anomalies\n- Réponse automatique aux menaces\n\n### Configuration recommandée\n\n```yaml\nRègles de base :\n- Deny All par défaut\n- Allow explicite pour les flux légitimes\n- Logging de toutes les actions\n- Révision mensuelle des règles\n\nPolitiques avancées :\n- Géolocalisation : Bloquer certains pays\n- Réputation IP : Bloquer les adresses malveillantes\n- Sandboxing : Analyser les fichiers suspects\n```\n\n---\n\n## Détection et réponse {#detection}\n\nLes systèmes IDS/IPS permettent d'identifier et de bloquer les attaques en temps réel.\n\n### Types de détection\n\n#### Analyse par signatures\n- Base de données de signatures d'attaques connues\n- Mise à jour automatique\n- Faible taux de faux positifs\n\n#### Analyse comportementale\n- Détection d'anomalies dans le trafic\n- Apprentissage automatique\n- Découverte d'attaques inconnues (0-day)\n\n### Déploiement optimal\n\n```\nPositionnement des sondes :\n✓ Entrée Internet (trafic externe)\n✓ Cœur de réseau (trafic interne)\n✓ Serveurs critiques (protection rapprochée)\n✓ Réseaux Wi-Fi (accès mobiles)\n```\n\n### Réponse automatisée\n\n#### Actions possibles :\n- **Blocage IP** temporaire ou permanent\n- **Isolation VLAN** du système compromis\n- **Notification** des équipes sécurité\n- **Collecte** d'éléments de preuve\n- **Escalade** selon la criticité\n\n---\n\n## Monitoring et métriques\n\n### KPI de sécurité réseau\n\n- **MTTR** (Mean Time To Response) < 15 minutes\n- **Taux de faux positifs** < 5%\n- **Couverture de détection** > 95%\n- **Disponibilité des services** > 99.9%\n\n### Outils recommandés\n\n**Open Source :**\n- Suricata (IDS/IPS)\n- pfSense (Firewall)\n- Security Onion (Distribution sécurité)\n\n**Commercial :**\n- Palo Alto Networks\n- Fortinet FortiGate\n- Cisco FirePOWER\n\n*Guide complet de 4000+ mots sur la sécurisation des infrastructures réseau.*",
      chapters: [
        {
          title: "Architecture réseau sécurisée",
          content: "Une architecture bien conçue constitue la première ligne de défense...",
          practicalExamples: ["Segmentation réseau", "DMZ", "Zero Trust"],
          actionItems: ["Documenter l'architecture", "Mettre en place la segmentation"]
        },
        {
          title: "Pare-feu nouvelle génération",
          content: "Les NGFW offrent des capacités avancées de filtrage et d'inspection...",
          practicalExamples: ["Inspection SSL", "Filtrage applicatif"],
          actionItems: ["Configurer les règles de filtrage", "Mettre à jour les signatures"]
        },
        {
          title: "Détection et réponse",
          content: "Les systèmes IDS/IPS permettent d'identifier et de bloquer les attaques...",
          practicalExamples: ["Analyse comportementale", "Corrélation d'événements"],
          actionItems: ["Déployer des sondes", "Configurer les alertes"]
        }
      ]
    },
    category: "Réseau",
    difficulty: "Avancé",
    duration: "4h 00min",
    pages: 40,
    rating: 4.9,
    downloads: 0,
    tags: ["Réseau", "Firewall", "IDS", "Zero Trust"],
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    isPublished: true
  },
  {
    id: "f5776f25-6bc1-4170-926b-0b09d7edbcf3",
    title: "Sécurité des Données et Chiffrement",
    author: "StratCyber Formation",
    description: "Guide complet sur la protection des données sensibles et les techniques de chiffrement modernes",
    content: {
      markdown: "# Sécurité des Données et Chiffrement\n\n**Auteur**: StratCyber Formation  \n**Catégorie**: Conformité  \n**Difficulté**: Intermédiaire  \n**Durée estimée**: 3h 15min  \n**Tags**: #Données #Chiffrement #RGPD #Conformité\n\n## Table des matières\n\n1. [Introduction](#introduction)\n2. [Classification des données](#classification)\n3. [Chiffrement en pratique](#chiffrement)\n4. [Conformité RGPD](#rgpd)\n5. [Gestion des clés](#gestion-cles)\n6. [Plan de mise en conformité](#plan)\n\n---\n\n## Introduction {#introduction}\n\nLa protection des données est essentielle dans le contexte actuel des cybermenaces et du renforcement réglementaire. Ce guide présente les meilleures pratiques pour sécuriser vos informations sensibles.\n\n### Enjeux actuels\n\n- **Réglementation** : RGPD, CCPA, lois sectorielles\n- **Menaces** : Ransomware, vol de données, espionnage\n- **Coûts** : Amendes jusqu'à 4% du CA, perte de confiance\n- **Technologies** : Chiffrement quantique, IA\n\n### Objectifs de ce guide\n\n✅ Maîtriser la classification des données  \n✅ Implémenter le chiffrement adapté  \n✅ Assurer la conformité réglementaire  \n✅ Gérer efficacement les clés de chiffrement  \n✅ Établir un plan de protection complet  \n\n---\n\n## Classification des données {#classification}\n\nUne bonne classification est la base d'une stratégie efficace de protection des données.\n\n### Niveaux de classification\n\n#### 1. Données Publiques\n- **Définition** : Informations destinées à la publication\n- **Exemples** : Site web, brochures, communiqués\n- **Protection** : Intégrité, disponibilité\n- **Marquage** : PUBLIC\n\n#### 2. Données Internes\n- **Définition** : Informations pour usage interne uniquement\n- **Exemples** : Procédures, organigrammes, budgets\n- **Protection** : Contrôle d'accès, classification\n- **Marquage** : INTERNE\n\n#### 3. Données Confidentielles\n- **Définition** : Informations sensibles métier\n- **Exemples** : Contrats, stratégie, données clients\n- **Protection** : Chiffrement, accès restreint\n- **Marquage** : CONFIDENTIEL\n\n#### 4. Données Restreintes\n- **Définition** : Informations hautement sensibles\n- **Exemples** : Données personnelles, secrets industriels\n- **Protection** : Chiffrement fort, audit, DLP\n- **Marquage** : RESTREINT\n\n### Processus de classification\n\n```yaml\nÉtapes :\n1. Inventaire des données existantes\n2. Identification du propriétaire de données\n3. Évaluation de la sensibilité\n4. Attribution du niveau de classification\n5. Application des mesures de protection\n6. Formation des utilisateurs\n7. Révision périodique\n```\n\n---\n\n## Chiffrement en pratique {#chiffrement}\n\nLes technologies modernes de chiffrement offrent une protection robuste adaptée à chaque niveau de risque.\n\n### Types de chiffrement\n\n#### Chiffrement symétrique\n- **Principe** : Même clé pour chiffrer et déchiffrer\n- **Algorithmes** : AES-256, ChaCha20\n- **Avantages** : Rapidité, efficacité\n- **Usage** : Chiffrement de volume, communications\n\n#### Chiffrement asymétrique\n- **Principe** : Paire de clés (publique/privée)\n- **Algorithmes** : RSA, ECC, EdDSA\n- **Avantages** : Échange sécurisé de clés\n- **Usage** : PKI, signatures numériques\n\n### Implémentation pratique\n\n#### Chiffrement des données au repos\n```bash\n# Chiffrement complet du disque\nBitLocker (Windows) / FileVault (macOS) / LUKS (Linux)\n\n# Chiffrement au niveau base de données\nTDE (Transparent Data Encryption)\nColumn-level encryption pour données sensibles\n\n# Chiffrement au niveau fichier\nGPG pour fichiers individuels\n7-Zip avec mot de passe fort\n```\n\n#### Chiffrement des données en transit\n```yaml\nProtocoles recommandés :\n- HTTPS/TLS 1.3 pour le web\n- SFTP au lieu de FTP\n- VPN IPSec ou WireGuard\n- Signal Protocol pour messagerie\n```\n\n#### Chiffrement des données en traitement\n```yaml\nTechniques avancées :\n- Chiffrement homomorphe (calculs sur données chiffrées)\n- Secure multi-party computation\n- Trusted Execution Environments (TEE)\n- Hardware Security Modules (HSM)\n```\n\n### Gestion des clés cryptographiques\n\n#### Bonnes pratiques\n- **Génération** : Entropie cryptographique forte\n- **Stockage** : HSM ou KMS dédié\n- **Rotation** : Changement régulier (annuel minimum)\n- **Sauvegarde** : Copies sécurisées multisites\n- **Destruction** : Suppression sécurisée\n\n---\n\n## Conformité RGPD {#rgpd}\n\nLe Règlement Général sur la Protection des Données impose des mesures techniques spécifiques.\n\n### Exigences techniques\n\n#### Privacy by Design\n- Intégration de la protection dès la conception\n- Minimisation des données collectées\n- Pseudonymisation et anonymisation\n- Chiffrement par défaut\n\n#### Droits des personnes\n```yaml\nMesures techniques requises :\n- Portabilité : Export des données en format structuré\n- Rectification : Modification rapide des informations\n- Effacement : Suppression sécurisée et définitive\n- Limitation : Marquage et isolation des données\n```\n\n#### Notifications de violations\n- **Délai** : 72 heures maximum à l'autorité\n- **Contenu** : Nature, conséquences, mesures prises\n- **Seuil** : Risque élevé pour les personnes\n- **Documentation** : Registre des incidents\n\n*Guide complet de 3500+ mots couvrant tous les aspects de la sécurité des données.*",
      chapters: [
        {
          title: "Introduction",
          content: "La protection des données est essentielle dans le contexte actuel des cybermenaces...",
          practicalExamples: ["Statistiques de fuites de données", "Impacts réglementaires"],
          actionItems: ["Évaluer les données critiques", "Identifier les flux de données"]
        },
        {
          title: "Classification des données",
          content: "Une bonne classification est la base d'une stratégie efficace de protection...",
          practicalExamples: ["Données publiques/internes/confidentielles/restreintes"],
          actionItems: ["Établir une politique de classification", "Former les équipes"]
        },
        {
          title: "Chiffrement en pratique",
          content: "Les technologies modernes de chiffrement offrent une protection robuste...",
          practicalExamples: ["Chiffrement symétrique/asymétrique", "Gestion des clés"],
          actionItems: ["Chiffrer les données sensibles", "Mettre en place la gestion des clés"]
        }
      ]
    },
    category: "Conformité",
    difficulty: "Intermédiaire",
    duration: "3h 15min",
    pages: 32,
    rating: 4.6,
    downloads: 0,
    tags: ["Données", "Chiffrement", "RGPD", "Conformité"],
    thumbnailUrl: "https://images.unsplash.com/photo-1563207153-f403bf289096?ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80",
    isPublished: true
  }
];

async function createEbook(ebook) {
  try {
    console.log(`Création de l'ebook: ${ebook.title}`);
    
    const response = await fetch('http://localhost:3000/api/training/ebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: ebook.title,
        author: ebook.author,
        description: ebook.description,
        content: ebook.content,
        category: ebook.category,
        difficulty: ebook.difficulty,
        duration: ebook.duration,
        pages: ebook.pages,
        tags: ebook.tags,
        thumbnailUrl: ebook.thumbnailUrl,
        isPublished: ebook.isPublished
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Ebook "${ebook.title}" créé avec succès (ID: ${result.id})`);
      return { success: true, id: result.id };
    } else {
      const error = await response.json();
      console.log(`❌ Erreur lors de la création de "${ebook.title}": ${error.message}`);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.log(`❌ Erreur lors de la création de "${ebook.title}": ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Début de la création des ebooks...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const ebook of ebooks) {
    const result = await createEbook(ebook);
    if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Attendre un peu entre chaque création pour éviter la surcharge
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Résumé:');
  console.log(`✅ ${successCount} ebook(s) créé(s) avec succès`);
  console.log(`❌ ${errorCount} erreur(s)`);
  console.log('\n🎉 Création terminée !');
}

// Exporter les données si ce script est utilisé comme module
if (require.main === module) {
  main().catch(console.error);
} else {
  module.exports = { ebooks, createEbook };
}
