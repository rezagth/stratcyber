const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Démarrage de l\'insertion des ebooks...');

  // 1. Supprimer les ebooks existants (optionnel, commentez si vous voulez conserver les existants)
  console.log('Suppression des ebooks existants...');
  await prisma.ebookQuiz.deleteMany({});
  await prisma.ebook.deleteMany({});
  console.log('Ebooks existants supprimés.');

  // 2. Lecture du contenu de l'ebook
  const ebookPath = path.join(__dirname, '../ebooks/securite-acces-authentification.md');
  const ebookContent = fs.readFileSync(ebookPath, 'utf8');

  // 3. Préparation des données de l'ebook
  const ebookData = {
    title: "Sécurité des Accès et Authentification",
    author: "StratCyber Formation",
    description: "Guide complet sur la sécurité des accès et l'authentification forte en entreprise",
    content: JSON.stringify({
      markdown: ebookContent,
      chapters: [
        {
          title: "Introduction",
          content: "La sécurité des accès constitue le premier rempart de votre système d'information...",
          practicalExamples: ["Statistiques d'attaques", "Coûts des violations"],
          actionItems: ["Évaluer vos pratiques actuelles", "Identifier les points faibles"]
        },
        {
          title: "Principes fondamentaux de la gestion des accès",
          content: "Le principe du moindre privilège est essentiel pour limiter les risques...",
          practicalExamples: ["Attribution granulaire", "Séparation des tâches"],
          actionItems: ["Cartographier les rôles", "Mettre en place les revues trimestrielles"]
        },
        {
          title: "Authentification forte et multifacteur",
          content: "L'authentification multifacteur réduit les risques de compromission de 99,9%...",
          practicalExamples: ["TOTP", "Push notifications", "Clés FIDO2"],
          actionItems: ["Déployer la MFA", "Former les utilisateurs"]
        },
        {
          title: "Plan d'action pratique",
          content: "Voici les étapes pratiques pour améliorer votre niveau de sécurité...",
          practicalExamples: ["Questionnaire d'auto-évaluation", "Roadmap de déploiement"],
          actionItems: ["Inventaire des comptes", "Activer la MFA", "Mettre en place le RBAC"]
        }
      ]
    }),
    category: "Fondamentaux",
    difficulty: "Débutant",
    duration: "2h 30min",
    pages: 25,
    rating: 4.8,
    downloads: 0,
    tags: JSON.stringify(["Accès", "Authentification", "Contrôle", "Sécurité"]),
    thumbnailUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    isPublished: true
  };

  // 4. Création de l'ebook dans la base de données
  console.log('Création de l\'ebook...');
  const ebook = await prisma.ebook.create({
    data: ebookData
  });
  console.log(`Ebook créé avec succès. ID: ${ebook.id}`);

  // 5. Création d'un quiz pour l'ebook
  console.log('Création du quiz associé...');
  const quizData = {
    ebookId: ebook.id,
    title: "Quiz sur la sécurité des accès",
    description: "Testez vos connaissances sur l'authentification et la gestion des accès",
    questions: JSON.stringify([
      {
        id: "q1",
        question: "Quel pourcentage de réduction des risques apporte la MFA ?",
        options: ["50%", "80%", "99.9%", "75%"],
        correctAnswer: "99.9%",
        explanation: "La MFA réduit les risques de compromission de 99.9% selon les études récentes."
      },
      {
        id: "q2",
        question: "Le principe du moindre privilège signifie :",
        options: [
          "Donner tous les droits aux utilisateurs importants", 
          "Attribuer uniquement les droits nécessaires à chaque fonction",
          "Limiter le nombre d'utilisateurs administrateurs à 2",
          "Interdire l'accès internet aux utilisateurs"
        ],
        correctAnswer: "Attribuer uniquement les droits nécessaires à chaque fonction",
        explanation: "Ce principe fondamental de sécurité consiste à ne donner que les accès strictement nécessaires."
      },
      {
        id: "q3",
        question: "Dans un système RBAC, l'ordre correct est :",
        options: [
          "Ressources → Rôles → Permissions → Utilisateurs",
          "Utilisateurs → Permissions → Rôles → Ressources",
          "Utilisateurs → Rôles → Permissions → Ressources",
          "Rôles → Utilisateurs → Ressources → Permissions"
        ],
        correctAnswer: "Utilisateurs → Rôles → Permissions → Ressources",
        explanation: "L'utilisateur reçoit un rôle qui définit ses permissions sur les ressources."
      },
      {
        id: "q4",
        question: "Quelle est la meilleure pratique pour la gestion des mots de passe ?",
        options: [
          "Expiration tous les 30 jours avec complexité élevée",
          "Phrases de passe longues sans expiration forcée",
          "Rotation aléatoire générée par l'administrateur",
          "Utilisation du même mot de passe partout pour facilité"
        ],
        correctAnswer: "Phrases de passe longues sans expiration forcée",
        explanation: "Les recherches montrent que les phrases de passe longues sont plus sécurisées et mémorisables."
      },
      {
        id: "q5",
        question: "Quel est le délai recommandé pour désactiver les accès d'un employé quittant l'entreprise ?",
        options: [
          "Dans les 24 heures",
          "Immédiatement à l'heure exacte du départ",
          "Dans la semaine suivant le départ",
          "À la fin du mois"
        ],
        correctAnswer: "Immédiatement à l'heure exacte du départ",
        explanation: "Les accès doivent être désactivés immédiatement pour éviter tout risque de sécurité."
      }
    ]),
    passingScore: 80
  };

  const quiz = await prisma.ebookQuiz.create({
    data: quizData
  });
  console.log(`Quiz créé avec succès. ID: ${quiz.id}`);

  // 6. Création d'un deuxième ebook
  console.log('Création du deuxième ebook...');
  const ebook2Data = {
    title: "Sécurité des Données et Chiffrement",
    author: "StratCyber Formation",
    description: "Guide complet sur la protection des données sensibles et les techniques de chiffrement modernes",
    content: JSON.stringify({
      markdown: "# Sécurité des Données et Chiffrement\n\n## Introduction\n\nLa protection des données est essentielle dans le contexte actuel des cybermenaces. Ce guide vous présente les meilleures pratiques.\n\n## Classification des données\n\nApprenez à classifier vos données selon leur niveau de sensibilité pour appliquer les protections adaptées.\n\n## Techniques de chiffrement\n\nDécouvrez les algorithmes modernes et leur application pratique dans votre infrastructure.\n\n## Conformité RGPD\n\nComprenez les exigences légales et mettez en place les mesures techniques appropriées.",
      chapters: [
        {
          title: "Introduction",
          content: "La protection des données est essentielle dans le contexte actuel des cybermenaces...",
          practicalExamples: ["Statistiques de fuites de données", "Impacts réglementaires"],
          actionItems: ["Évaluer les données critiques", "Identifier les flux de données"]
        },
        {
          title: "Classification des données",
          content: "Une bonne classification est la base d'une stratégie efficace de protection...",
          practicalExamples: ["Données publiques/internes/confidentielles/restreintes"],
          actionItems: ["Établir une politique de classification", "Former les équipes"]
        },
        {
          title: "Chiffrement en pratique",
          content: "Les technologies modernes de chiffrement offrent une protection robuste...",
          practicalExamples: ["Chiffrement symétrique/asymétrique", "Gestion des clés"],
          actionItems: ["Chiffrer les données sensibles", "Mettre en place la gestion des clés"]
        }
      ]
    }),
    category: "Conformité",
    difficulty: "Intermédiaire",
    duration: "3h 15min",
    pages: 32,
    rating: 4.6,
    downloads: 0,
    tags: JSON.stringify(["Données", "Chiffrement", "RGPD", "Conformité"]),
    thumbnailUrl: "https://images.unsplash.com/photo-1563207153-f403bf289096?ixlib=rb-1.2.1&auto=format&fit=crop&w=1051&q=80",
    isPublished: true
  };

  const ebook2 = await prisma.ebook.create({
    data: ebook2Data
  });
  console.log(`Deuxième ebook créé avec succès. ID: ${ebook2.id}`);

  const quiz2Data = {
    ebookId: ebook2.id,
    title: "Quiz sur la sécurité des données",
    description: "Testez vos connaissances sur la protection des données et le chiffrement",
    questions: JSON.stringify([
      {
        id: "q1",
        question: "Quelle méthode de chiffrement utilise la même clé pour chiffrer et déchiffrer ?",
        options: ["Chiffrement symétrique", "Chiffrement asymétrique", "Hachage", "Chiffrement quantique"],
        correctAnswer: "Chiffrement symétrique",
        explanation: "Le chiffrement symétrique utilise une clé unique pour les deux opérations."
      },
      {
        id: "q2",
        question: "Quelle est la taille minimale recommandée pour une clé RSA ?",
        options: ["512 bits", "1024 bits", "2048 bits", "4096 bits"],
        correctAnswer: "2048 bits",
        explanation: "2048 bits est le minimum recommandé actuellement, avec 4096 bits pour les données très sensibles."
      },
      {
        id: "q3",
        question: "Selon le RGPD, comment doivent être traitées les données personnelles ?",
        options: [
          "Toujours chiffrées sans exception",
          "Selon une approche basée sur les risques",
          "Uniquement avec consentement écrit",
          "Jamais stockées plus de 30 jours"
        ],
        correctAnswer: "Selon une approche basée sur les risques",
        explanation: "Le RGPD recommande une approche proportionnée basée sur l'analyse des risques."
      }
    ]),
    passingScore: 70
  };

  const quiz2 = await prisma.ebookQuiz.create({
    data: quiz2Data
  });
  console.log(`Second quiz créé avec succès. ID: ${quiz2.id}`);

  // 7. Création d'un troisième ebook sur la sécurité réseau
  console.log('Création du troisième ebook...');
  const ebook3Data = {
    title: "Sécurité Réseau et Protection du Périmètre",
    author: "StratCyber Formation",
    description: "Guide avancé sur la sécurisation des infrastructures réseau et la défense périmétrique",
    content: JSON.stringify({
      markdown: "# Sécurité Réseau et Protection du Périmètre\n\n## Architecture sécurisée\n\nDécouvrez les principes d'une architecture réseau robuste et résiliente.\n\n## Défense en profondeur\n\nMettez en place une stratégie multi-couche pour protéger vos actifs critiques.\n\n## Détection d'intrusion\n\nDéployez des solutions efficaces pour identifier les menaces en temps réel.",
      chapters: [
        {
          title: "Architecture réseau sécurisée",
          content: "Une architecture bien conçue constitue la première ligne de défense...",
          practicalExamples: ["Segmentation réseau", "DMZ", "Zero Trust"],
          actionItems: ["Documenter l'architecture", "Mettre en place la segmentation"]
        },
        {
          title: "Pare-feu nouvelle génération",
          content: "Les NGFW offrent des capacités avancées de filtrage et d'inspection...",
          practicalExamples: ["Inspection SSL", "Filtrage applicatif"],
          actionItems: ["Configurer les règles de filtrage", "Mettre à jour les signatures"]
        },
        {
          title: "Détection et réponse",
          content: "Les systèmes IDS/IPS permettent d'identifier et de bloquer les attaques...",
          practicalExamples: ["Analyse comportementale", "Corrélation d'événements"],
          actionItems: ["Déployer des sondes", "Configurer les alertes"]
        }
      ]
    }),
    category: "Réseau",
    difficulty: "Avancé",
    duration: "4h 00min",
    pages: 40,
    rating: 4.9,
    downloads: 0,
    tags: JSON.stringify(["Réseau", "Firewall", "IDS", "Zero Trust"]),
    thumbnailUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    isPublished: true
  };

  const ebook3 = await prisma.ebook.create({
    data: ebook3Data
  });
  console.log(`Troisième ebook créé avec succès. ID: ${ebook3.id}`);

  console.log('Insertion des ebooks terminée avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors de l\'insertion des ebooks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
