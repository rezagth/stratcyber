/** Textes d'aide affichés à chaque étape d'une campagne (le guide complet est dans docs/campagne-scan/). */

export const SCAN_INTRO =
  "Une campagne contrôle ce que n'importe quel visiteur d'Internet peut voir du domaine d'un client : DNS et messagerie (SPF, DMARC), certificat HTTPS, en-têtes de sécurité de la page d'accueil, redirection HTTP vers HTTPS, fichier security.txt. " +
  "Ce n'est PAS un test d'intrusion : aucune attaque, aucun mot de passe testé, aucun scan de ports. Même ainsi, un contrôle sur le domaine d'un client exige son accord écrit AVANT.";

export const STEP_HELP = {
  autorisation:
    "1. Fais signer la lettre d'autorisation (bouton ci-dessous : elle se remplit avec le périmètre et les dates). Une fois signée, renseigne ici qui a signé, quand, et la référence du document que tu conserves. Sans cela, StratCyber refuse tout contrôle.",
  perimetre:
    "2. Liste uniquement les domaines que le client t'a autorisés à contrôler, un par un. Coche « contrôles DNS et messagerie » pour le domaine principal (exemple.fr), pas pour ses sous-domaines (www.exemple.fr). Ajouter un domaine après la confirmation de l'autorisation la retire : la lettre doit couvrir ce nouveau domaine.",
  controles:
    "3. Lance les contrôles domaine par domaine, pendant la période autorisée. Chaque contrôle dure quelques secondes, lit seulement des informations publiques et est tracé dans le journal des actions (domaine et adresses contactées).",
  constats:
    "4. Lis chaque constat. « Retenir » l'ajoute au registre de vulnérabilités du client et à son plan d'action (sans doublon). « Écarter » met de côté un faux positif ou un point hors sujet. Les points « OK » montrent ce qui est déjà bien : ils comptent dans le rapport.",
  rapport:
    "5. Imprime le rapport (PDF) et remets-le au client, de préférence en main propre ou par un canal chiffré. Puis termine la campagne : elle ne pourra plus lancer de contrôle.",
} as const;

export type OwnSideTool = { name: string; when: string; command?: string; caution: string };

/** Ce que StratCyber (hébergé sur Vercel) ne peut pas faire : à lancer toi-même, depuis ton VPS, puis à saisir en constats manuels. */
export const OWN_SIDE_TOOLS: OwnSideTool[] = [
  {
    name: 'Test TLS approfondi (anciens protocoles, chiffrements faibles)',
    when: "Toujours utile : StratCyber ne teste pas TLS 1.0/1.1 ni les chiffrements faibles.",
    command: 'testssl.sh --quiet --color 0 --htmlfile resultat-tls.html https://exemple.fr',
    caution: "Ou l'outil en ligne SSL Labs en cochant « Do not show the results on the boards ». Lecture seule, sans risque pour le client.",
  },
  {
    name: 'Ports ouverts sur les adresses IP du client (nmap)',
    when: "Seulement si le client possède ses adresses IP (serveur dédié, IP fixe du bureau) ET qu'elles sont écrites dans la lettre.",
    command: 'nmap -sT -sV --version-light -Pn --top-ports 100 -T3 -oN ports-exemple.txt 203.0.113.10',
    caution: "Jamais sur une IP d'hébergement mutualisé, de CDN (Cloudflare...) ou de Vercel : elle n'appartient pas au client. Remplace l'adresse d'exemple par celle de la lettre. Lance-le depuis ton VPS (note son IP dans la lettre), pas depuis ta connexion personnelle.",
  },
  {
    name: 'Scan applicatif du site (Nuclei, ZAP)',
    when: "Option avancée, hors du périmètre « externe non intrusif » : seulement si la lettre le prévoit explicitement, avec des horaires précis.",
    caution: "Plus intrusif : peut ralentir ou perturber le site. Désactive les tests de déni de service et de force brute, limite la cadence, et préviens le client avant de lancer.",
  },
];

export const OWN_SIDE_HOWTO =
  "Pour chaque résultat utile d'un outil lancé de ton côté, ajoute un constat manuel : titre clair, gravité, explication en une ou deux phrases, et en preuve la ligne exacte du résultat (sans mot de passe ni donnée personnelle).";
