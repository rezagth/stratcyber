# 🚀 Guide Complet - Workflow Développement & Production

## 📋 Vue d'ensemble du système

Votre projet utilise un **système multi-environnement automatique** :

- **Branche `dev`** → SQLite locale (développement sécurisé)
- **Branche `master`** → PostgreSQL Neon (production)
- **Configuration automatique** selon la branche Git active

---

## 🎯 Workflow Recommandé

### 1. 🛠️ **Développement d'une nouvelle fonctionnalité**

#### Étape 1 : Basculer sur dev
```bash
git checkout dev
# ✅ Configuration automatique : SQLite + environnement de dev
```

#### Étape 2 : Développer votre feature
```bash
# Codez normalement
# Testez en local avec : npm run dev
# Vos données sont dans ./dev.db (SQLite local)
```

#### Étape 3 : Vérifier avant commit (IMPORTANT!)
```bash
npm run safe-commit
```
**➡️ Ce script vérifie que vous n'allez pas committer de fichiers dangereux !**

#### Étape 4 : Commit sécurisé
```bash
# ❌ NE JAMAIS faire :
git add .                    # DANGEREUX !
git add -A                   # DANGEREUX !

# ✅ TOUJOURS faire :
git add src/components/MaNouvelleFonctionnalite.tsx
git add app/nouvelle-page/page.tsx
git add package.json         # Si vous avez ajouté une dépendance

# Vérifier une dernière fois
npm run safe-commit

# Si tout est vert :
git commit -m "✨ Ajouter nouvelle fonctionnalité"
```

#### Étape 5 : Push de dev (sécurisé)
```bash
git push origin dev
```
**➡️ Cela ne touche PAS à la production ! Vous pouvez pusher dev autant que vous voulez.**

---

### 2. 🚀 **Mise en production**

#### ⚠️ ATTENTION : Cette étape impacte la VRAIE production !

#### Étape 1 : Tester en local sur master
```bash
git checkout master
# ✅ Configuration automatique : PostgreSQL + environnement de prod

# Testez que tout fonctionne avec la vraie base
npm run dev
```

#### Étape 2 : Merger dev vers master
```bash
git merge dev
# ⚠️ Vérifiez les conflits s'il y en a
```

#### Étape 3 : Push vers production
```bash
git push origin master
```
**➡️ Vercel va automatiquement redéployer la production !**

---

## 🛡️ Sécurité - Fichiers à ne JAMAIS committer

### Fichiers automatiquement modifiés (ne PAS committer) :
- ✅ `prisma/schema.prisma` → Modifié automatiquement selon la branche
- ✅ `prisma/dev.db` → Base de données locale
- ✅ `.env` → Copié automatiquement selon la branche

### Comment éviter les erreurs :
1. **Utilisez toujours** `npm run safe-commit` avant de committer
2. **Ajoutez les fichiers un par un** avec `git add <fichier>`
3. **Ne jamais utiliser** `git add .` ou `git add -A`

---

## ⚡ Scripts disponibles

| Script | Description | Quand l'utiliser |
|--------|-------------|------------------|
| `npm run safe-commit` | Vérifie les fichiers avant commit | **TOUJOURS avant de committer** |
| `npm run setup-env` | Configure l'environnement selon la branche | Si la config auto ne marche pas |
| `npm run switch-to-dev` | Bascule vers dev + config auto | Raccourci pour aller sur dev |
| `npm run switch-to-master` | Bascule vers master + config auto | Raccourci pour aller sur master |
| `npm run setup-hooks` | Installe les hooks Git | Une seule fois au début |

---

## 🗄️ Bases de données

### En développement (branche `dev`)
- **Type** : SQLite
- **Fichier** : `./dev.db`
- **Avantages** : Rapide, local, aucun risque
- **Données** : Données de test uniquement

### En production (branche `master`)
- **Type** : PostgreSQL sur Neon
- **URL** : Configurée dans `.env.production`
- **⚠️ ATTENTION** : Vraies données de production !

---

## 🔄 Exemple complet : Développer une nouvelle page

### Scenario : Ajouter une page "Contact"

```bash
# 1. Basculer sur dev
git checkout dev
# ✅ Configuration auto : SQLite activé

# 2. Créer les fichiers
mkdir app/contact
nano app/contact/page.tsx      # Créer la page

# 3. Tester en local
npm run dev
# Tester sur http://localhost:3000/contact

# 4. Vérifier avant commit
npm run safe-commit
# ✅ Script vérifie que tout est sécurisé

# 5. Commit de la nouvelle feature
git add app/contact/page.tsx
git commit -m "✨ Add contact page"

# 6. Push de dev (sans risque)
git push origin dev

# 7. Quand prêt pour la production
git checkout master
# ✅ Configuration auto : PostgreSQL activé

# 8. Tester avec la vraie base
npm run dev
# Vérifier que tout fonctionne

# 9. Merger dev
git merge dev

# 10. Push en production
git push origin master
# 🚀 Vercel déploie automatiquement !
```

---

## 🚨 Situations d'urgence

### "J'ai ajouté `prisma/schema.prisma` par erreur !"
```bash
git reset HEAD prisma/schema.prisma
npm run safe-commit  # Vérifier que c'est clean
```

### "J'ai fait `git add .` par erreur !"
```bash
git reset HEAD .              # Retirer tout
npm run safe-commit           # Voir ce qui était problématique
# Puis ajouter seulement les bons fichiers un par un
```

### "Ma configuration automatique ne fonctionne plus !"
```bash
npm run setup-env            # Forcer la reconfiguration
npm run setup-hooks          # Réinstaller les hooks si nécessaire
```

### "Je ne sais plus sur quelle branche je suis !"
```bash
git branch                    # Voir la branche actuelle
git status                    # Voir l'état des fichiers
npm run safe-commit           # Voir ce qui va être commité
```

---

## 🌐 Configuration Vercel

### Variables d'environnement à configurer :

**Pour la branche `master` (production) :**
```
DATABASE_URL = postgresql://votre-url-neon-production
NEXTAUTH_SECRET = 061f57745c621d75334f7bcf9c354939
NEXTAUTH_URL = https://stratcyber.vercel.app
NODE_ENV = production
```

---

## ✅ Checklist avant chaque commit

- [ ] Je suis sur la bonne branche (`git branch`)
- [ ] J'ai testé ma fonctionnalité (`npm run dev`)
- [ ] J'ai vérifié les fichiers (`npm run safe-commit`)
- [ ] J'ai ajouté les fichiers un par un (`git add <fichier>`)
- [ ] J'ai re-vérifié (`npm run safe-commit`)
- [ ] Mon message de commit est descriptif

---

## ❌ Ce qu'il ne faut JAMAIS faire

```bash
# ❌ JAMAIS ces commandes :
git add .
git add -A  
git commit -a
git push --force

# ❌ JAMAIS committer ces fichiers :
prisma/schema.prisma
prisma/dev.db
.env
```

---

## ✅ Ce qu'il faut TOUJOURS faire

```bash
# ✅ TOUJOURS ces commandes :
npm run safe-commit           # Avant chaque commit
git add <fichier-specifique>  # Ajouter fichier par fichier
git status                    # Vérifier l'état
git diff --cached            # Voir ce qui va être commité
```

---

## 🎯 Résumé des branches

| Branche | Base de données | Environnement | Sécurité | Usage |
|---------|-----------------|---------------|----------|--------|
| **dev** | SQLite locale | Développement | ✅ 100% sécurisé | Coder, tester, expérimenter |
| **master** | PostgreSQL Neon | Production | ⚠️ Vraie prod | Déploiement final uniquement |

---

**🚀 Avec ce système, vous pouvez développer en toute sérénité !**

*En cas de doute, utilisez toujours `npm run safe-commit` - c'est votre filet de sécurité !* 🛡️
