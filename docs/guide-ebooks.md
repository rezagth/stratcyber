# 📚 Guide du Système d'Ebooks Hybride StratCyber

## 🎯 Vue d'ensemble

StratCyber utilise une **approche hybride** pour gérer les ebooks :
- **Source de vérité** : Fichiers Markdown + métadonnées YAML (versionnés Git)
- **Performance** : Base de données pour requêtes rapides et analytics
- **Synchronisation** : Scripts automatiques fichiers → BDD

## 📁 Structure des Dossiers

```
ebooks/
├── content/                    # 📝 Contenu des ebooks (Markdown)
│   ├── gestion-incidents-securite.md
│   ├── securite-acces-authentification.md
│   └── securite-donnees-chiffrement.md
├── metadata/                   # 📊 Métadonnées (YAML)
│   ├── gestion-incidents-securite.yaml
│   ├── securite-acces-authentification.yaml
│   └── securite-donnees-chiffrement.yaml
└── assets/                     # 🖼️ Ressources (images, diagrammes)
    ├── images/
    └── diagrams/
```

## 🚀 Scripts Disponibles

### Synchronisation
```bash
# Synchronisation ponctuelle (fichiers → BDD)
npm run ebooks:sync

# Surveillance automatique des changements
npm run ebooks:watch

# Validation des fichiers avant sync
npm run ebooks:validate
```

### Environnement
```bash
# Configuration selon la branche Git
npm run setup-env

# Basculement rapide
npm run switch-to-dev      # SQLite locale
npm run switch-to-master   # PostgreSQL production
```

## ✍️ Comment Créer un Nouvel Ebook

### 1. Créer le contenu Markdown

Créez `ebooks/content/nouveau-ebook.md` :
```markdown
# Titre de l'Ebook

**Auteur**: StratCyber Formation  
**Catégorie**: Fondamentaux  
**Difficulté**: Débutant  
**Durée estimée**: 1h 30min  
**Tags**: #sécurité #débutant

## Introduction

Contenu de l'ebook en Markdown...

### Section 1

Avec du code :
```bash
sudo firewall-cmd --list-all
```

### Section 2

Et des listes :
- Point important 1
- Point important 2
```

### 2. Créer les métadonnées YAML

Créez `ebooks/metadata/nouveau-ebook.yaml` :
```yaml
id: nouveau-ebook
title: "Titre de l'Ebook"
author: "StratCyber Formation"
category: "Fondamentaux"
difficulty: "Débutant"
duration: "1h 30min"
pages: 25
published: true

description: |
  Description détaillée de l'ebook pour améliorer
  le référencement et l'expérience utilisateur.

tags:
  - sécurité
  - débutant
  - fondamentaux

# Quiz optionnel
quiz:
  title: "Quiz de validation"
  description: "Testez vos connaissances"
  passingScore: 70
  questions:
    - id: "q1"
      question: "Quelle est la première étape de sécurité ?"
      options:
        - "Installer un antivirus"
        - "Faire un audit"
        - "Former les utilisateurs"
      correctAnswer: "Faire un audit"
      explanation: "Un audit permet d'identifier les vulnérabilités."
```

### 3. Valider et synchroniser

```bash
# 1. Valider la cohérence
npm run ebooks:validate

# 2. Synchroniser vers la BDD
npm run ebooks:sync
```

## 📋 Bonnes Pratiques

### Nommage
- **ID** : `kebab-case` (exemple: `gestion-incidents-securite`)
- **Fichiers** : même nom que l'ID
- **Cohérence** : ID dans YAML = nom du fichier

### Contenu Markdown
- **Titre H1** : Une seule fois au début
- **Structure** : H2 pour les sections, H3 pour sous-sections
- **Code** : Utiliser les blocs de code avec langue
- **Liens** : Privilégier les liens relatifs pour les ressources internes

### Métadonnées
- **Catégories** : `Fondamentaux`, `Réseau`, `Gestion`, `Cloud`, `Conformité`, `Tests`
- **Difficulté** : `Débutant`, `Intermédiaire`, `Avancé`
- **Tags** : Mots-clés simples en minuscules
- **Description** : 2-3 phrases explicatives

### Quiz
- **Questions** : 3-10 questions maximum
- **Options** : 2-4 choix possibles
- **Explications** : Toujours fournir une explication
- **Score** : 70% recommandé pour la validation

## 🔄 Workflow de Développement

### Pour les Rédacteurs

1. **Éditer** les fichiers `.md` avec votre éditeur préféré
2. **Mettre à jour** les métadonnées `.yaml` si nécessaire
3. **Valider** avec `npm run ebooks:validate`
4. **Commit** dans Git
5. **Push** → la synchronisation se fait automatiquement

### Pour les Développeurs

1. **Surveiller** les changements avec `npm run ebooks:watch`
2. **Tester** en local avec SQLite (branche `dev`)
3. **Déployer** en production avec PostgreSQL (branche `master`)

## 🔧 Configuration Multi-Environnement

### Développement (branche `dev`)
- **BDD** : SQLite locale (`./dev.db`)
- **Config** : `.env.development`
- **Avantages** : Rapide, pas de connexion réseau

### Production (branche `master`)
- **BDD** : PostgreSQL (Neon)
- **Config** : `.env.production`  
- **Avantages** : Scalable, backups automatiques

### Basculement Automatique
```bash
# Le script détecte automatiquement la branche
npm run setup-env
```

## 🐛 Dépannage

### Erreur de synchronisation
```bash
# Régénérer le client Prisma
npm run setup-env

# Vérifier la configuration
npm run ebooks:validate
```

### Incohérence fichiers/BDD
```bash
# Forcer la resynchronisation
npm run ebooks:sync
```

### Migration de l'ancien système
```bash
# Migrer automatiquement les .md existants
npm run ebooks:migrate
```

## 📈 Avantages de ce Système

### ✅ Pour l'Équipe
- **Versioning Git** : Historique complet, branches, merge requests
- **Édition simple** : Markdown familier, preview temps réel
- **Collaboration** : Plusieurs personnes peuvent contribuer
- **Validation** : Erreurs détectées avant publication

### ✅ Pour l'Application  
- **Performance** : BDD optimisée pour les requêtes
- **Analytics** : Tracking complet des lectures
- **Recherche** : Index full-text sur le contenu
- **Relations** : Quiz, progrès utilisateur, statistiques

### ✅ Pour la Production
- **Backup** : Double sécurité (Git + BDD)
- **Scalabilité** : PostgreSQL en production
- **CI/CD** : Déploiement automatisé
- **Monitoring** : Logs et métriques

## 🎓 Exemples d'Usage

### Ajouter un ebook existant
```bash
# 1. Copier le .md dans ebooks/content/
# 2. Créer le .yaml correspondant
# 3. Valider et synchroniser
npm run ebooks:validate && npm run ebooks:sync
```

### Modifier un ebook existant
```bash
# 1. Éditer le .md ou .yaml
# 2. La synchronisation se fait automatiquement si ebooks:watch est actif
# Ou manuellement :
npm run ebooks:sync
```

### Déployer en production
```bash
# 1. Push vers la branche master
git push origin master

# 2. Sur le serveur, la CI/CD fait automatiquement :
npm run setup-env     # Configure PostgreSQL
npm run ebooks:sync   # Synchronise les ebooks
```

---

*Ce guide évolue avec le projet. N'hésitez pas à contribuer et améliorer ! 🚀*
