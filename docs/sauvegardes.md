# Sauvegardes de la base (Neon / PostgreSQL)

Les données clients (audits, politiques, preuves) sont dans Neon. Sans sauvegarde testée, une erreur de `db push` ou de suppression est irréversible.

## Niveau 1 — fourni par Neon
- La restauration à un instant donné (« point-in-time », par branche) dépend du plan Neon : **vérifier dans la console Neon la fenêtre de rétention du plan actuel** et la noter ici.
- Avant toute opération sensible (`db push`, nettoyage), créer une **branche Neon** à partir de la production : c'est une copie instantanée et gratuite à conserver quelques jours.

## Niveau 2 — export indépendant (à faire chaque semaine au minimum)
Un export hors de Neon protège contre une erreur de compte ou de plan.

```bash
# DATABASE_URL lue depuis votre environnement local, jamais écrite dans un fichier versionné
pg_dump "$DATABASE_URL" --format=custom --no-owner -f "sauvegarde-$(date +%F).dump"
```

- Stocker le fichier **chiffré** et hors du dépôt Git (disque chiffré ou coffre), pas dans le dossier du projet.
- Garder au moins 4 exports hebdomadaires.
- Le dump contient des données clients : même niveau de protection que la base.

## Niveau 3 — test de restauration (une fois avant le premier client, puis chaque trimestre)
1. Créer une base Neon vide (branche ou projet de test).
2. `pg_restore --no-owner -d "<url de test>" sauvegarde-AAAA-MM-JJ.dump`
3. Se connecter à l'app pointée sur cette base et vérifier qu'un audit et un client sont lisibles.
4. Supprimer la base de test.

Une sauvegarde jamais restaurée n'est pas une sauvegarde.
