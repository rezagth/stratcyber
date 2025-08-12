# Configuration Multi-Environnement par Branche Git

Ce système configure automatiquement votre base de données selon la branche Git active :

- **Branche `dev`** → SQLite locale (données de test)
- **Branche `main`** → PostgreSQL Neon (données de production)

## 🚀 Installation Initiale

### 1. Installer les hooks Git (recommandé)
```bash
npm run setup-hooks
```

Cette commande installe un hook Git qui configure automatiquement l'environnement lors des changements de branche.

### 2. Configuration manuelle
Si vous préférez configurer manuellement :
```bash
npm run setup-env
```

## 🔄 Utilisation

### Changement automatique (avec hooks)
```bash
git checkout dev    # → Configure automatiquement SQLite
git checkout main   # → Configure automatiquement PostgreSQL
```

### Changement rapide avec script
```bash
npm run switch-to-dev   # Bascule vers dev + configuration
npm run switch-to-main  # Bascule vers main + configuration
```

### Configuration manuelle
```bash
npm run setup-env  # Configure selon la branche actuelle
```

## 📁 Fichiers de Configuration

| Environnement | Fichier source | Base de données | Usage |
|---------------|---------------|-----------------|--------|
| **dev** | `.env.development` | SQLite (`./dev.db`) | Développement local |
| **main** | `.env.production` | PostgreSQL (Neon) | Production |
| **test** | `.env.test` | SQLite (`./dev-test.db`) | Tests automatisés |

## 🔧 Que fait le script automatiquement ?

1. **Détecte la branche Git courante**
2. **Copie le bon fichier `.env`** selon la branche
3. **Modifie le schéma Prisma** pour utiliser le bon provider
4. **Génère le client Prisma** adapté
5. **Affiche un résumé** de la configuration

## 🛠️ Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run setup-env` | Configuration manuelle selon branche |
| `npm run setup-hooks` | Installation des hooks Git |
| `npm run switch-to-dev` | Bascule vers dev + config |
| `npm run switch-to-main` | Bascule vers main + config |

## ⚠️ Important

- **Branche `dev`** : Données locales, pas de risque
- **Branche `main`** : **VRAIE BASE DE DONNÉES** - Attention aux migrations !

## 🐛 Dépannage

### Le script ne fonctionne pas
```bash
# Vérifier la branche courante
git branch --show-current

# Configuration manuelle
npm run setup-env
```

### Erreur de permissions (Linux/Mac)
```bash
chmod +x scripts/setup-env.js
chmod +x scripts/post-checkout
```

### Problème avec Prisma
```bash
npx prisma generate --force
npx prisma db push  # Pour synchroniser le schéma
```

## 🎯 Workflow Recommandé

1. **Développement local** :
   ```bash
   git checkout dev
   npm run setup-env  # Si pas de hooks
   npm run dev
   ```

2. **Déploiement production** :
   ```bash
   git checkout main
   npm run setup-env  # Si pas de hooks
   npm run build
   ```

3. **Tests** :
   ```bash
   npm run test  # Utilise automatiquement .env.test
   ```
