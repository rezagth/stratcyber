import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

interface EbookTemplate {
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  description: string;
  tags: string[];
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  content: string;
  practicalExamples: string[];
  actionItems: string[];
}

// Templates d'ebooks par catégorie d'audit
const EBOOK_TEMPLATES = {
  'Sécurité des accès': {
    base: {
      category: 'Fondamentaux',
      difficulty: 'Débutant',
      tags: ['Accès', 'Authentification', 'Contrôle'],
    },
    chapters: [
      {
        title: 'Principes de la gestion des accès',
        baseContent: 'La gestion des accès est un pilier fondamental de la sécurité informatique...',
        practices: [
          'Principe du moindre privilège',
          'Séparation des tâches',
          'Révision régulière des droits'
        ]
      },
      {
        title: 'Mise en place de l\'authentification forte',
        baseContent: 'L\'authentification multifacteur (MFA) représente une couche de sécurité essentielle...',
        practices: [
          'Configuration de l\'authentification à deux facteurs',
          'Gestion des tokens d\'authentification',
          'Stratégies de récupération de compte'
        ]
      }
    ]
  },
  'Sécurité des données': {
    base: {
      category: 'Conformité',
      difficulty: 'Intermédiaire',
      tags: ['Données', 'Chiffrement', 'RGPD'],
    },
    chapters: [
      {
        title: 'Classification et protection des données',
        baseContent: 'La classification des données permet d\'appliquer les mesures de protection appropriées...',
        practices: [
          'Inventaire des données sensibles',
          'Mise en place de la classification',
          'Stratégies de chiffrement'
        ]
      },
      {
        title: 'Conformité RGPD et protection',
        baseContent: 'Le Règlement Général sur la Protection des Données impose des obligations strictes...',
        practices: [
          'Registre des traitements',
          'Analyse d\'impact (DPIA)',
          'Gestion des droits des personnes'
        ]
      }
    ]
  },
  'Sécurité réseau': {
    base: {
      category: 'Réseau',
      difficulty: 'Avancé',
      tags: ['Réseau', 'Firewall', 'Monitoring'],
    },
    chapters: [
      {
        title: 'Architecture réseau sécurisée',
        baseContent: 'Une architecture réseau bien conçue constitue la première ligne de défense...',
        practices: [
          'Segmentation réseau',
          'Configuration des firewalls',
          'Mise en place de DMZ'
        ]
      },
      {
        title: 'Surveillance et détection d\'intrusions',
        baseContent: 'La surveillance continue du trafic réseau permet de détecter rapidement les anomalies...',
        practices: [
          'Déploiement d\'IDS/IPS',
          'Analyse des logs réseau',
          'Corrélation d\'événements'
        ]
      }
    ]
  },
  'Gestion des incidents': {
    base: {
      category: 'Gestion',
      difficulty: 'Intermédiaire',
      tags: ['Incidents', 'Réponse', 'Processus'],
    },
    chapters: [
      {
        title: 'Plan de réponse aux incidents',
        baseContent: 'Un plan de réponse structuré permet de réagir efficacement lors d\'un incident...',
        practices: [
          'Équipe de réponse aux incidents',
          'Procédures d\'escalade',
          'Communication de crise'
        ]
      },
      {
        title: 'Investigation et récupération',
        baseContent: 'L\'investigation technique permet de comprendre l\'origine et l\'impact d\'un incident...',
        practices: [
          'Techniques d\'investigation numérique',
          'Conservation des preuves',
          'Plans de continuité d\'activité'
        ]
      }
    ]
  },
  'Formation et sensibilisation': {
    base: {
      category: 'Gestion',
      difficulty: 'Débutant',
      tags: ['Formation', 'Sensibilisation', 'Humain'],
    },
    chapters: [
      {
        title: 'Programme de sensibilisation',
        baseContent: 'La sensibilisation des utilisateurs est cruciale pour réduire les risques humains...',
        practices: [
          'Campagnes de sensibilisation',
          'Formations régulières',
          'Tests de phishing'
        ]
      },
      {
        title: 'Culture sécurité en entreprise',
        baseContent: 'Développer une culture de sécurité implique tous les niveaux de l\'organisation...',
        practices: [
          'Engagement de la direction',
          'Ambassadeurs sécurité',
          'Indicateurs de sensibilisation'
        ]
      }
    ]
  }
};

function generateEbookFromAudit(audit: any, actions: any[]): EbookTemplate[] {
  const ebooks: EbookTemplate[] = [];
  
  // Analyser les réponses d'audit par catégorie
  const categoriesAnalysis = audit.responses.reduce((acc: any, response: any) => {
    if (!acc[response.category]) {
      acc[response.category] = {
        responses: [],
        avgScore: 0,
        totalScore: 0,
        count: 0,
        actions: []
      };
    }
    
    acc[response.category].responses.push(response);
    acc[response.category].totalScore += response.score || 0;
    acc[response.category].count += 1;
    acc[response.category].avgScore = acc[response.category].totalScore / acc[response.category].count;
    
    return acc;
  }, {});

  // Associer les actions aux catégories
  actions.forEach(action => {
    if (categoriesAnalysis[action.category]) {
      categoriesAnalysis[action.category].actions.push(action);
    }
  });

  // Générer un ebook pour chaque catégorie avec un score faible
  Object.entries(categoriesAnalysis).forEach(([category, data]: [string, any]) => {
    const avgScore = data.avgScore;
    const scorePercent = Math.round((avgScore / 5) * 100);
    
    // Générer un ebook si le score est faible (< 3.5 sur 5)
    if (avgScore < 3.5 && EBOOK_TEMPLATES[category as keyof typeof EBOOK_TEMPLATES]) {
      const template = EBOOK_TEMPLATES[category as keyof typeof EBOOK_TEMPLATES];
      const categoryActions = data.actions;
      const categoryResponses = data.responses;
      
      const ebook: EbookTemplate = {
        title: `Plan d'amélioration - ${category}`,
        category: template.base.category,
        difficulty: template.base.difficulty,
        duration: `${Math.max(2, Math.ceil(categoryActions.length * 0.5))}h 30min`,
        description: `Guide personnalisé pour améliorer votre niveau en ${category}. Score actuel: ${scorePercent}%. Ce guide est basé sur votre audit et contient ${categoryActions.length} actions spécifiques.`,
        tags: [...template.base.tags, 'Personnalisé', 'Audit'],
        chapters: []
      };

      // Chapitre 1: Analyse de situation
      ebook.chapters.push({
        title: 'Analyse de votre situation actuelle',
        content: `
## Évaluation de votre niveau en ${category}

Votre audit révèle un score de **${scorePercent}%** dans le domaine "${category}".

### Points identifiés lors de l'audit :

${categoryResponses.map((resp: any, index: number) => 
  `**${index + 1}. ${resp.question}**
  - Votre réponse : "${resp.answer}"
  - Score obtenu : ${Math.round((resp.score / 5) * 100)}%
  ${resp.score < 3 ? '⚠️ *Point d\'amélioration prioritaire*' : '✅ *Point satisfaisant*'}
  
`).join('')}

### Actions recommandées pour votre organisation :

${categoryActions.map((action: any, index: number) => 
  `**${index + 1}. ${action.title}** (Priorité: ${action.priority})
  - Description : ${action.description}
  - Échéance recommandée : ${new Date(action.dueDate).toLocaleDateString('fr-FR')}
  - Impact business : ${action.businessImpact}
  
`).join('')}
        `,
        practicalExamples: categoryActions.map((action: any) => action.title),
        actionItems: categoryActions.map((action: any) => `${action.title} - À réaliser avant le ${new Date(action.dueDate).toLocaleDateString('fr-FR')}`)
      });

      // Ajouter les chapitres techniques du template
      template.chapters.forEach(chapterTemplate => {
        const relatedActions = categoryActions.filter((action: any) => 
          action.title.toLowerCase().includes(chapterTemplate.title.toLowerCase().split(' ')[0]) ||
          action.description.toLowerCase().includes(chapterTemplate.title.toLowerCase().split(' ')[0])
        );

        ebook.chapters.push({
          title: chapterTemplate.title,
          content: `
${chapterTemplate.baseContent}

### Applications dans votre contexte :

${relatedActions.length > 0 ? 
  relatedActions.map((action: any) => 
    `- **${action.title}** : ${action.description}`
  ).join('\n') :
  'Les bonnes pratiques générales de ce domaine s\'appliquent à votre organisation.'
}

### Bonnes pratiques recommandées :

${chapterTemplate.practices.map(practice => `- ${practice}`).join('\n')}

### Mesures de succès :

Pour évaluer l'efficacité de votre démarche dans ce domaine :
- Mesurer l'amélioration de votre score d'audit
- Suivre la réalisation des actions recommandées
- Évaluer la réduction des incidents liés à ce domaine
- Obtenir des retours des utilisateurs sur les nouvelles mesures
          `,
          practicalExamples: chapterTemplate.practices,
          actionItems: relatedActions.map((action: any) => action.title)
        });
      });

      // Chapitre de synthèse
      ebook.chapters.push({
        title: 'Plan d\'action et suivi',
        content: `
## Votre feuille de route personnalisée

### Planning recommandé :

${categoryActions.map((action: any, index: number) => {
  const dueDate = new Date(action.dueDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return `**Étape ${index + 1} - ${action.title}**
- Priorité : ${action.priority}
- Délai : ${daysUntilDue} jours (${dueDate.toLocaleDateString('fr-FR')})
- Effort estimé : ${action.estimatedHours || 'Non estimé'}h
- Responsable recommandé : ${action.owner || 'À définir'}

*Action détaillée :* ${action.description}

---`;
}).join('\n')}

### Indicateurs de suivi :

1. **Taux de réalisation** : ${categoryActions.length} actions à compléter
2. **Score cible** : Améliorer votre score de ${scorePercent}% à au moins 85%
3. **Budget estimé** : ${categoryActions.reduce((sum: number, action: any) => sum + (action.budget || 0), 0).toLocaleString()}€
4. **Durée totale** : ${Math.ceil(categoryActions.reduce((sum: number, action: any) => sum + (action.estimatedHours || 8), 0) / 8)} jours de travail

### Ressources et support :

- Contactez votre RSSI pour l'accompagnement technique
- Planifiez des sessions de formation pour vos équipes
- Considérez l'accompagnement par des experts externes si nécessaire
- Documentez vos progrès pour le prochain audit

### Prochaines étapes :

1. Validez ce plan avec votre direction
2. Assignez les responsabilités pour chaque action
3. Planifiez les ressources nécessaires
4. Commencez par les actions de priorité "Critique"
5. Planifiez un audit de suivi dans 6 mois
        `,
        practicalExamples: ['Planning', 'Budget', 'Ressources', 'Suivi'],
        actionItems: [
          'Valider le plan d\'action avec la direction',
          'Assigner les responsabilités',
          'Planifier les ressources',
          'Démarrer les actions critiques',
          'Programmer l\'audit de suivi'
        ]
      });

      ebooks.push(ebook);
    }
  });

  return ebooks;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le dernier audit avec les réponses
    const latestAudit = await prisma.audit.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        responses: true,
        strategicActions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestAudit || latestAudit.responses.length === 0) {
      return NextResponse.json({
        error: 'Aucun audit trouvé. Veuillez d\'abord compléter un audit pour générer des ebooks personnalisés.'
      }, { status: 404 });
    }

    // Générer les ebooks basés sur l'audit
    const generatedEbooks = generateEbookFromAudit(latestAudit, latestAudit.strategicActions);

    // Supprimer les anciens ebooks générés automatiquement pour cet utilisateur
    await prisma.ebook.deleteMany({
      where: {
        author: `Système - ${session.user.name || session.user.email}`,
      }
    });

    // Sauvegarder les nouveaux ebooks
    const savedEbooks = [];
    for (const ebook of generatedEbooks) {
      const savedEbook = await prisma.ebook.create({
        data: {
          title: ebook.title,
          author: `Système - ${session.user.name || session.user.email}`,
          description: ebook.description,
          content: JSON.stringify({
            chapters: ebook.chapters,
            metadata: {
              generatedFrom: latestAudit.id,
              generatedAt: new Date(),
              userSpecific: true
            }
          }),
          category: ebook.category,
          difficulty: ebook.difficulty,
          duration: ebook.duration,
          pages: Math.ceil(ebook.chapters.length * 8), // Estimation : 8 pages par chapitre
          rating: 5.0, // Ebooks personnalisés ont une note maximale
          downloads: 0,
          tags: JSON.stringify(ebook.tags),
          isPublished: true
        }
      });

      savedEbooks.push(savedEbook);
    }

    return NextResponse.json({
      success: true,
      message: `${generatedEbooks.length} ebooks personnalisés générés avec succès`,
      ebooks: savedEbooks,
      auditId: latestAudit.id,
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Erreur lors de la génération des ebooks:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération des ebooks',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
