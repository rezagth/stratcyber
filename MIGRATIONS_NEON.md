# 🚀 Guide des Migrations PostgreSQL avec Neon

Ce guide explique comment gérer les migrations de base de données avec PostgreSQL Neon.

## 🔧 Commandes recommandées

### Pour le développement :
```bash
# Synchroniser les changements de schéma avec la base (pas de migrations)
npx prisma db push

# Générer le client Prisma après les changements
npx prisma generate
```

### Pour la production :
```bash
# Appliquer les migrations en production
npx prisma migrate deploy

# Générer le client Prisma
npx prisma generate
```

### Pour vérifier l'état :
```bash
# Voir le statut des migrations
npx prisma migrate status

# Voir la différence entre schéma et base
npx prisma db diff
```

## ⚠️ Limitations avec Neon

**`npx prisma migrate dev` ne fonctionne pas** avec Neon car :
- Neon ne supporte pas nativement les "shadow databases"
- Cette commande est destinée au développement local avec des bases comme PostgreSQL classique

## 🔄 Workflow recommandé

### 1. Développement local
```bash
# Modifier votre schéma Prisma
# Puis synchroniser avec la base :
npx prisma db push
npx prisma generate
```

### 2. Préparation pour la production
```bash
# Créer une migration basée sur les changements
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --script > migration.sql

# Ou utiliser directement db push si pas de migration nécessaire
npx prisma db push
```

### 3. Déploiement en production
```bash
# Appliquer les migrations
npx prisma migrate deploy
```

## 🎯 Cas d'usage spécifiques

### Créer une nouvelle migration manuelle
```bash
# Générer le SQL de différence
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > new_migration.sql

# Créer le dossier de migration
mkdir "prisma/migrations/$(date +%Y%m%d%H%M%S)_description"

# Déplacer le fichier
mv new_migration.sql "prisma/migrations/$(date +%Y%m%d%H%M%S)_description/migration.sql"

# Marquer comme appliquée si nécessaire
npx prisma migrate resolve --applied MIGRATION_NAME
```

### Reset complet (⚠️ DESTRUCTEUR)
```bash
# ⚠️ ATTENTION : Supprime toutes les données !
npx prisma migrate reset
```

## ✅ Avantages de cette approche

- ✅ **Compatible Neon** - Pas de problème de shadow database
- ✅ **Simple** - `db push` est plus direct pour le développement
- ✅ **Rapide** - Synchronisation immédiate des changements
- ✅ **Production-ready** - `migrate deploy` fonctionne parfaitement

## 📝 Variables d'environnement

```env
# Base de données principale
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Pour la production, vous pouvez avoir :
PROD_DATABASE_URL="postgresql://user:pass@prod-host/db?sslmode=require"
```

## 🔗 Liens utiles

- [Documentation Prisma avec Neon](https://www.prisma.io/docs/guides/database/neon)
- [Guide des migrations Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Troubleshooting Neon + Prisma](https://neon.tech/docs/guides/prisma)
