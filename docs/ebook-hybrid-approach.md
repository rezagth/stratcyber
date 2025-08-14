# Approche Hybride pour les Ebooks

## Structure recommandée

```
ebooks/
├── content/                    # Contenu en Markdown
│   ├── securite-reseau.md
│   ├── gestion-incidents.md
│   └── conformite-gdpr.md
├── metadata/                   # Métadonnées en YAML/JSON
│   ├── securite-reseau.yaml
│   ├── gestion-incidents.yaml
│   └── conformite-gdpr.yaml
└── assets/                     # Ressources
    ├── images/
    └── diagrams/
```

## Exemple de métadonnées (YAML)

```yaml
# ebooks/metadata/securite-reseau.yaml
id: securite-reseau
title: "Sécurité des Réseaux d'Entreprise"
author: "Expert StratCyber"
category: "Réseau"
difficulty: "Intermédiaire"
duration: "3h 30min"
pages: 85
tags:
  - firewall
  - vpn
  - monitoring
  - intrusion-detection
description: |
  Guide complet sur la sécurisation des infrastructures
  réseau en entreprise, de la conception à la maintenance.
prerequisites:
  - "Bases TCP/IP"
  - "Notions de sécurité IT"
learning_objectives:
  - "Configurer un firewall entreprise"
  - "Mettre en place un VPN site-to-site"
  - "Déployer une solution de monitoring"
quiz_id: "quiz-securite-reseau"
estimated_completion: "4 heures"
last_updated: "2024-01-15"
version: "2.1"
```

## API hybride

```typescript
// Lecture combinée : BDD + fichiers
async function getEbook(id: string) {
  // 1. Récupérer métadonnées depuis BDD
  const ebookMeta = await prisma.ebook.findUnique({
    where: { id },
    include: { readingSessions: true, quizzes: true }
  });

  // 2. Charger contenu depuis fichier
  const contentPath = path.join(process.cwd(), 'ebooks/content', `${id}.md`);
  const markdownContent = await fs.readFile(contentPath, 'utf-8');

  // 3. Combiner
  return {
    ...ebookMeta,
    content: markdownContent,
    parsedContent: parseMarkdown(markdownContent)
  };
}
```

## Avantages de cette approche

1. **Meilleur des deux mondes**
   - Contenu versionné (Git)
   - Métadonnées riches (BDD)

2. **Workflow optimal**
   - Rédacteurs : éditent en Markdown
   - Développeurs : gèrent via BDD
   - Utilisateurs : expérience fluide

3. **Performance**
   - Cache du contenu
   - Index BDD pour recherche
   - CDN pour assets

4. **Évolutivité**
   - Génération IA → fichiers
   - Import/export facile
   - Multi-formats (PDF, EPUB, etc.)
