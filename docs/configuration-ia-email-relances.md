# Configuration : IA, envoi d'e-mails et relances planifiées

Tout est **désactivé par défaut**. Aucune valeur secrète ne doit être écrite dans le dépôt, dans Notion ou dans une conversation : elles se définissent uniquement dans les variables d'environnement (`.env` en local, réglages du projet sur Vercel).

## IA (synthèse du rapport, aide à la réponse aux questionnaires)
- `ANTHROPIC_API_KEY` : clé API.
- `AI_MODEL` : identifiant du modèle à utiliser.
- Sans ces deux variables, la synthèse du rapport est construite sans IA à partir des chiffres de l'audit, et l'aide à la réponse ne propose que les réponses déjà enregistrées.
- Confidentialité : la synthèse n'envoie que des faits agrégés (scores, domaines, intitulés d'actions). L'aide à la réponse n'envoie à l'IA, sur demande explicite de l'administrateur, que les réponses retenues du client concerné. Ajouter ce fournisseur au registre des sous-traitants du cabinet avant de l'activer pour un client.

## Envoi d'e-mails
- `EMAIL_MODE` : `simulation` (défaut, rien ne part) ou `live`.
- En `live` : `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` (adresse d'expédition d'un domaine vérifié chez le fournisseur). Si l'un manque, l'envoi échoue explicitement.

## Relances planifiées
- `CRON_SECRET` : secret partagé. Sans lui, la route `/api/cron/reminders` répond 503 et reste fermée.
- `vercel.json` déclenche la route chaque jour à 06:00 UTC ; Vercel envoie le secret dans l'en-tête `Authorization`.
- Contenu : résumé quotidien pour chaque administrateur (délais NIS2/CNIL urgents ou dépassés, actions en retard) et relances client **approuvées** par l'administrateur. Les brouillons ne partent jamais.
