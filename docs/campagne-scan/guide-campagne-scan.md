# Guide — mener une campagne de scan de vulnérabilités avec StratCyber

Ce guide te mène de A à Z : de la première discussion avec le client jusqu'à la clôture. Il décrit ce que fait StratCyber (onglet **Scan** du dossier client), ce que tu fais toi-même, et ce qu'il ne faut jamais faire.

## 0. Ce que c'est, et ce que ce n'est pas

Une campagne StratCyber est un **contrôle externe non intrusif** : elle lit ce que n'importe quel visiteur d'Internet peut voir du domaine d'un client.

| Contrôlé automatiquement par StratCyber | Pas fait par StratCyber |
|---|---|
| DNS public : SPF, DMARC, MX, CAA | Scan de ports (nmap) |
| Certificat HTTPS (validité, nom, chaîne, protocole négocié) | Test des anciens protocoles TLS 1.0/1.1 et des chiffrements faibles |
| En-têtes de la page d'accueil : HSTS, CSP, cookies, CORS, versions exposées | Recherche de failles applicatives (injections, XSS...) |
| Redirection HTTP vers HTTPS | Tests de mots de passe, d'authentification |
| Présence d'un fichier security.txt | Réseau interne du client |

Ce n'est donc **pas un test d'intrusion**. Dans le rapport et à l'oral, dis « contrôle de sécurité externe », jamais « pentest ».

StratCyber tourne sur Vercel : il ne peut ni lancer nmap ni tenir un scan long. Ces outils se lancent **de ton côté** (section 5), et tu saisis les résultats utiles comme constats manuels.

## 1. Préparer une seule fois

1. **Appliquer le schéma de base de données.** Le module ajoute trois tables (`ScanCampaign`, `ScanTarget`, `ScanFinding`) et une relation sur `Organization`. Aucune table existante n'est modifiée ni supprimée. Depuis le dossier du projet : `npx prisma db push` (voir `MIGRATIONS_NEON.md`), puis `npx prisma generate`. Fais-le d'abord sur une base de test (branche Neon) si tu en as une. **Sans cette étape, l'onglet Scan affichera des erreurs** : le déploiement Vercel ne modifie pas la base.
2. **Être en règle pour facturer et signer.** La lettre d'autorisation identifie le prestataire avec son **SIRET** : immatricule l'activité avant d'envoyer une lettre à un vrai client. Une assurance responsabilité civile professionnelle est vivement recommandée avant la première campagne chez un client (ce n'est pas une obligation légale pour cette prestation, mais c'est ta protection).
3. **Avoir un VPS pour les outils complémentaires** (facultatif au début) : un petit serveur dont tu notes l'adresse IP, pour la mentionner dans la lettre. Ne lance jamais de scan de ports depuis ta connexion personnelle.
4. **Installer les outils de ton côté** (facultatif au début) : `testssl.sh` pour TLS, `nmap` pour les ports.

## 2. Avant le contrôle : cadrer avec le client

À faire en 15 minutes, par téléphone ou en visio :

- **Quels domaines** exactement ? (le site principal, `www`, la messagerie ; pas ceux de ses prestataires)
- **Qui est titulaire** du nom de domaine ? (parfois c'est l'agence web ou l'ancien prestataire : l'autorisation doit venir du titulaire ou de quelqu'un qui a qualité pour la donner)
- **Qui héberge** le site ? Pour un hébergement mutualisé, un CDN ou un site chez Wix/Shopify/OVH, les conditions de l'hébergeur peuvent encadrer les tests : un contrôle de lecture comme celui-ci ne pose en général pas de problème, mais le client doit être informé.
- **Quand** ? Choisis une période courte (quelques jours), idéalement hors période de forte activité du site.
- **Qui prévenir** côté client et **comment le joindre** en urgence pendant la période.

## 3. L'autorisation écrite (obligatoire, non négociable)

Accéder à un système informatique ou chercher à y accéder sans autorisation est une infraction pénale (articles 323-1 et suivants du Code pénal). L'accord oral ne suffit pas : en cas de problème, c'est l'écrit qui te protège.

1. Dans StratCyber, ouvre le dossier du client, onglet **Scan**, crée une campagne.
2. Étape 2 : ajoute les domaines du périmètre.
3. Étape 1 : renseigne les dates de la période, puis ouvre **la lettre d'autorisation**. Elle se remplit avec le périmètre et les dates. Complète les champs surlignés (ton identité, ton SIRET, ton adresse IP éventuelle, le contact du client), imprime-la ou enregistre-la en PDF.
4. Le client la lit, la date, la signe avec la mention « Bon pour accord » et te la renvoie. **Fais relire le modèle par un juriste avant ton premier usage** : il ne constitue pas un conseil juridique.
5. Conserve l'exemplaire signé (au moins pendant la durée de conservation des constats, voir section 8).
6. Dans StratCyber, saisis le signataire, sa fonction, la date de signature, la référence du fichier conservé, puis clique sur **« J'ai reçu la lettre signée : confirmer l'autorisation »**.

StratCyber applique ces règles **côté serveur**, à chaque lancement :

- pas de confirmation, pas de contrôle ;
- une information manquante, pas de contrôle ;
- hors de la période autorisée (jour de fin inclus), pas de contrôle ;
- période limitée à 90 jours ;
- seuls les domaines du périmètre peuvent être contrôlés (l'API ne reçoit qu'un identifiant de domaine du périmètre, jamais un nom libre) ;
- ajouter un domaine après la confirmation retire l'autorisation : le client doit avoir autorisé ce nouveau domaine, donc complète la lettre et reconfirme ;
- une campagne terminée ou annulée ne lance plus rien.

## 4. Lancer les contrôles automatiques

Étape 3 de l'onglet : un bouton par domaine. Chaque contrôle dure quelques secondes (6 secondes maximum par sonde) et ne fait que lire : une résolution DNS, une connexion TLS, trois requêtes GET sur la page d'accueil, le port 80 et `/.well-known/security.txt`. Les requêtes portent l'identifiant `StratCyber-ControleExterne/1.0`, ce qui permet au client de les reconnaître dans ses journaux.

Garde-fous techniques déjà en place :

- le nom est résolu une seule fois et la connexion se fait à l'adresse validée, qui doit être publique (jamais d'adresse interne, locale ou de métadonnées cloud : protection contre la falsification de requête côté serveur, ou SSRF) ;
- uniquement les ports 80 et 443, chemins figés, aucune redirection suivie ;
- pas plus d'un contrôle par minute et par domaine ;
- chaque contrôle est tracé dans le journal des actions (domaine et adresses contactées), ce qui te permet de prouver ce qui a été fait.

Pour un sous-domaine (`www.exemple.fr`), décoche les contrôles DNS et messagerie : ils se font sur le domaine principal.

## 5. Ce que tu fais de ton côté (facultatif au début)

À lancer **depuis ton VPS**, sur **les seuls éléments listés dans la lettre**.

**TLS approfondi** (toujours utile, sans risque) : `testssl.sh --quiet --color 0 --htmlfile resultat-tls.html https://exemple.fr`, ou SSL Labs en cochant « Do not show the results on the boards ». Cherche : TLS 1.0/1.1 acceptés, chiffrements faibles, certificat incomplet.

**Ports ouverts** (uniquement si le client possède ses adresses IP et qu'elles sont dans la lettre) : `nmap -sT -sV --version-light -Pn --top-ports 100 -T3 -oN ports.txt <adresse IP de la lettre>`. **Jamais** sur l'adresse d'un hébergement mutualisé, d'un CDN (Cloudflare...) ou de Vercel : elle n'appartient pas au client et tu scannerais des tiers. Les services qui ne devraient pas être visibles : bureau à distance (3389), SMB (445), bases de données (3306, 5432, 1433, 27017), Telnet (23), FTP (21), interfaces d'administration.

**Scan applicatif** (Nuclei, ZAP) : hors du périmètre « externe non intrusif ». Seulement si la lettre le prévoit explicitement avec des horaires précis, en désactivant les tests de déni de service et de force brute, et en prévenant le client avant.

Ensuite, pour chaque résultat utile, ajoute un **constat manuel** (étape 4 : « Ajouter un constat saisi à la main ») : titre clair, gravité, explication en une ou deux phrases, preuve (la ligne exacte du résultat, sans mot de passe ni donnée personnelle).

## 6. Lire et traiter les constats

Gravités : **Critique** (corriger tout de suite), **Haute** (sous 15 jours), **Moyenne** (sous 60 jours), **Info** (au fil de l'eau), **OK** (ce qui est déjà bien : il compte dans le rapport).

Pour chaque constat : **Retenir** l'ajoute au registre de vulnérabilités du client et à son plan d'action, liés entre eux et sans doublon (catégorie Technique, responsable « DSI », priorité selon la gravité, un « Info » devient « Faible »). **Écarter** met de côté un faux positif ou un point hors sujet. Un nouveau contrôle met à jour les constats existants, conserve ceux déjà traités et fait disparaître les constats « Nouveau » qui n'apparaissent plus (corrigés).

| Constat | Pourquoi c'est important | Correction en une ligne |
|---|---|---|
| SPF absent, ouvert (`+all`) ou en plusieurs exemplaires | N'importe qui peut se faire passer pour le domaine par e-mail | Publier un seul SPF listant les expéditeurs légitimes et finissant par `-all` (ou `~all` au départ) |
| DMARC absent ou `p=none` | Les e-mails usurpés ne sont pas bloqués | Publier `v=DMARC1; p=quarantine; rua=mailto:...`, puis passer à `reject` après analyse des rapports |
| Certificat expiré, expirant, non reconnu, mauvais nom | Alerte de sécurité pour les visiteurs, perte de confiance | Renouveler ou automatiser (Let's Encrypt), installer la chaîne complète, vérifier les noms couverts |
| HTTPS indisponible, ou HTTP sans redirection | Échanges lisibles et modifiables sur un réseau non maîtrisé | Activer HTTPS et rediriger tout le port 80 vers `https://` |
| HSTS absent ou court | Attaques de rétrogradation vers HTTP | `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| CSP absente ou affaiblie | Une faille XSS est beaucoup plus facile à exploiter | Déployer une CSP progressivement, d'abord en `Content-Security-Policy-Report-Only` |
| Versions de logiciels exposées (`Server`, `X-Powered-By`) | Aide l'attaquant à chercher les failles connues | Masquer ou réduire ces en-têtes ; surtout, mettre à jour le logiciel |
| Cookies sans `Secure` ou session sans `HttpOnly` | Vol ou interception de session | Ajouter les attributs `Secure; HttpOnly; SameSite=Lax` |
| CORS ouvert à tous (avec identifiants : Haute) | Une page tierce peut lire des données du visiteur | Limiter à la liste des origines légitimes, jamais `*` avec identifiants |
| Pas de CAA | N'importe quelle autorité peut émettre un certificat | Publier `0 issue "letsencrypt.org"` (ou l'autorité utilisée) |
| Pas de security.txt | Personne ne sait comment signaler une faille | Publier `/.well-known/security.txt` avec `Contact:` et `Expires:` |

Un constat « Info » est une bonne pratique non appliquée, pas une faille : présente-le ainsi au client pour ne pas l'inquiéter inutilement.

## 7. Rapport et restitution

1. Étape 5 : ouvre le rapport, imprime-le en PDF. Il contient le périmètre, la méthode et ses limites, la synthèse par gravité avec les délais recommandés, les constats à traiter (les écartés n'y figurent pas) et les points conformes.
2. Remets-le **au signataire**, en main propre ou par un canal chiffré, jamais en pièce jointe d'un mail non protégé. Il contient des informations qu'un attaquant pourrait exploiter.
3. Prévois 20 minutes de restitution : commence par les points conformes, puis les 3 priorités, puis le plan d'action avec qui fait quoi. C'est le moment de proposer l'accompagnement à la correction.
4. **Faille critique pendant la période** : préviens le client immédiatement, par téléphone puis par écrit, avant la fin de la campagne. Ne la détaille à personne d'autre.

## 8. Clôture

1. Clique sur **Terminer la campagne** : plus aucun contrôle ne peut être lancé.
2. Les vulnérabilités retenues continuent d'être suivies dans le registre et le plan d'action du client.
3. Supprime les constats bruts au plus tard à l'échéance prévue dans la lettre (12 mois par défaut), et les éventuels fichiers de résultats d'outils (`resultat-tls.html`, `ports.txt`) conservés sur ton VPS ou ton poste.
4. Pour vérifier les corrections, crée une **nouvelle campagne** (nouvelle autorisation, éventuellement par simple avenant à la lettre). Ne rouvre jamais une campagne terminée.

## 9. Ce qu'il ne faut jamais faire

- Contrôler un domaine sans lettre signée, ou en dehors de la période, ou qui n'est pas dans la lettre.
- Scanner les ports d'une adresse IP qui n'appartient pas au client (hébergeur, CDN, Vercel).
- Tester des mots de passe, tenter de se connecter, exploiter une faille « pour voir ».
- Lancer un outil qui n'est pas explicitement couvert par la lettre.
- Mettre dans un constat un mot de passe, une valeur de cookie, une donnée personnelle ou un secret.
- Communiquer un résultat à quelqu'un d'autre que le client, y compris en exemple pour ta prospection (anonymise toujours).
- Coller dans un message, un document ou Notion une clé, un mot de passe ou un jeton.

## 10. Cadre légal et limites de ce guide

- **Code pénal, articles 323-1 à 323-8** : accès ou maintien frauduleux dans un système de traitement automatisé de données, entrave, altération. L'autorisation écrite et la limitation au périmètre sont ta protection.
- **RGPD** : ces contrôles ne visent aucune donnée personnelle ; les éléments techniques observés (adresses IP des serveurs, en-têtes) ne servent qu'à la mission. Ajoute une clause de confidentialité et de traitement des données à ton contrat de prestation.
- **Hébergeurs et tiers** : l'autorisation du client ne couvre pas les systèmes de ses prestataires.
- Je ne suis pas juriste : fais relire la lettre et ton contrat par un juriste ou une assurance spécialisée cyber avant ta première mission payante.

## 11. Dépannage

| Message | Cause probable |
|---|---|
| « Lancement impossible… autorisation n'est pas confirmée » | Étape 1 non confirmée, ou repassée en brouillon (champ modifié ou domaine ajouté) |
| « La période autorisée est terminée / n'a pas encore commencé » | Dates de la lettre : fais une nouvelle autorisation ou corrige les dates si la lettre le permet |
| « pointe vers une adresse non publique » | Le domaine résout vers une adresse interne : normal que StratCyber refuse, vérifie le DNS du client |
| « ne se résout pas (DNS) » | Faute de frappe ou domaine non actif |
| « attends une minute » | Limite d'un contrôle par minute et par domaine |
| Erreurs 500 dans l'onglet Scan | Schéma de base non appliqué (section 1, point 1) |
