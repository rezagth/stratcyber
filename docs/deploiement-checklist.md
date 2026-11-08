# Mise en ligne de StratCyber / InfraCyb — checklist

À faire dans cet ordre. Aucun secret ne doit être écrit dans ce fichier, dans Git ou dans Notion.

## 1. Avant de pousser
- [ ] `npm run safe-commit` puis `git push origin dev`
- [ ] `npx tsc --noEmit` et `npx vitest run` passent en local

## 2. Base de données (Neon)
- [ ] Faire une **sauvegarde avant** (voir `docs/sauvegardes.md`)
- [ ] Appliquer le schéma : `npx prisma db push` (pas de dossier de migrations dans ce dépôt)
- [ ] Vérifier qu'aucun avertissement de perte de données n'est affiché ; sinon s'arrêter

## 3. Variables d'environnement Vercel (Preview puis Production)
- [ ] `DATABASE_URL` (Neon)
- [ ] `NEXTAUTH_URL` (URL exacte du déploiement) et `NEXTAUTH_SECRET` (valeur longue aléatoire, différente en prod)
- [ ] `CRON_SECRET` (sans lui, `/api/cron/reminders` répond 503)
- [ ] Fournisseur e-mail (voir `docs/configuration-ia-email-relances.md`)
- [ ] Clé IA : optionnelle ; sans elle les fonctions IA restent désactivées

## 4. Test du déploiement de prévisualisation (obligatoire avant la prod)
- [ ] Connexion admin, création d'un client de test
- [ ] Audit → plan d'action → **Rapport PDF** (audit) : le fichier se télécharge et est lisible
- [ ] **Rapport mensuel (PDF)** depuis la fiche client, puis depuis l'espace client
- [ ] Si le PDF échoue : lire les logs de la fonction Vercel (erreur Chromium / délai dépassé). Réglages déjà en place : `maxDuration` 60 s sur les 3 routes PDF et `serverExternalPackages` pour `@sparticuz/chromium`. Si le délai de 60 s est dépassé, vérifier la limite du plan Vercel.
- [ ] Création d'un compte client, connexion, vérification qu'il ne voit que son entreprise
- [ ] Un brouillon de politique n'apparaît pas côté client ; l'envoi est refusé s'il reste des `{{variables}}`
- [ ] Appel du cron avec l'en-tête `Authorization: Bearer <CRON_SECRET>` (sans la valeur dans l'historique partagé)

## 5. Mise en production
- [ ] Fusion `dev` → `main` seulement si l'étape 4 est entièrement cochée
- [ ] Supprimer les clients et comptes de test de la base de production
- [ ] Vérifier le domaine, le HTTPS et les en-têtes de sécurité
