const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Ajout de l\'ebook sur la gestion d\'incidents...');

  // Lecture du contenu de l'ebook
  const ebookPath = path.join(__dirname, '../ebooks/gestion-incidents-securite.md');
  const ebookContent = fs.readFileSync(ebookPath, 'utf8');

  // Création de l'ebook
  const ebookData = {
    title: "Gestion des Incidents de Sécurité",
    author: "StratCyber Formation",
    description: "Guide complet pour la gestion des incidents de sécurité, de la détection à la récupération complète",
    content: JSON.stringify({
      markdown: ebookContent,
      chapters: [
        {
          title: "Plan de réponse aux incidents",
          content: "Structure et organisation du plan de réponse pour une gestion efficace des incidents...",
          practicalExamples: ["Classification des incidents", "Processus d'activation"],
          actionItems: ["Créer le plan de réponse", "Définir les niveaux de criticité"]
        },
        {
          title: "Équipe de réponse (CSIRT)",
          content: "Constitution et formation d'une équipe de réponse aux incidents performante...",
          practicalExamples: ["Rôles et responsabilités", "Programme de formation"],
          actionItems: ["Constituer l'équipe CSIRT", "Planifier les formations"]
        },
        {
          title: "Processus de gestion d'incident",
          content: "Processus complet de A à Z pour gérer efficacement un incident de sécurité...",
          practicalExamples: ["Détection et signalement", "Confinement et éradication"],
          actionItems: ["Mettre en place la détection", "Préparer les procédures"]
        },
        {
          title: "Investigation et forensic",
          content: "Techniques d'investigation numérique pour comprendre l'origine et l'impact...",
          practicalExamples: ["Collecte de preuves", "Outils forensiques"],
          actionItems: ["Acquérir les outils", "Former aux techniques"]
        },
        {
          title: "Communication de crise",
          content: "Stratégies de communication interne et externe en situation de crise...",
          practicalExamples: ["Messages types", "Canaux de communication"],
          actionItems: ["Préparer les templates", "Identifier les porte-paroles"]
        }
      ]
    }),
    category: "Gestion",
    difficulty: "Intermédiaire",
    duration: "2h 45min",
    pages: 35,
    rating: 4.7,
    downloads: 0,
    tags: JSON.stringify(["Incidents", "Réponse", "Processus", "CSIRT"]),
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
    isPublished: true
  };

  const ebook = await prisma.ebook.create({
    data: ebookData
  });
  console.log(`Ebook créé avec succès. ID: ${ebook.id}`);

  // Création du quiz associé
  const quizData = {
    ebookId: ebook.id,
    title: "Quiz sur la gestion des incidents",
    description: "Testez vos connaissances sur la réponse aux incidents de sécurité",
    questions: JSON.stringify([
      {
        id: "q1",
        question: "Quel est le délai de notification à la CNIL en cas de violation de données personnelles ?",
        options: ["24 heures", "48 heures", "72 heures", "1 semaine"],
        correctAnswer: "72 heures",
        explanation: "Le RGPD impose un délai maximum de 72 heures pour notifier une violation à l'autorité de contrôle."
      },
      {
        id: "q2",
        question: "Dans quel ordre doit-on collecter les preuves numériques ?",
        options: [
          "Par importance pour l'enquête",
          "Par ordre de volatilité (du plus volatil au moins volatil)",
          "Par facilité d'accès",
          "Par taille des fichiers"
        ],
        correctAnswer: "Par ordre de volatilité (du plus volatil au moins volatil)",
        explanation: "Les preuves les plus volatiles (RAM, cache) doivent être collectées en premier car elles disparaissent rapidement."
      },
      {
        id: "q3",
        question: "Que signifie RTO dans un plan de continuité ?",
        options: [
          "Recovery Time Objective",
          "Rapid Technical Operation", 
          "Risk Treatment Option",
          "Real Time Operation"
        ],
        correctAnswer: "Recovery Time Objective",
        explanation: "RTO définit le temps maximum acceptable pour restaurer un service après un incident."
      },
      {
        id: "q4",
        question: "Quelle est la première action lors de la détection d'un incident critique ?",
        options: [
          "Analyser l'origine de l'attaque",
          "Notifier la direction",
          "Contenir la propagation", 
          "Collecter les preuves"
        ],
        correctAnswer: "Contenir la propagation",
        explanation: "Le confinement rapide permet de limiter l'impact et d'empêcher la propagation de l'incident."
      },
      {
        id: "q5",
        question: "Quelle est la fréquence recommandée pour les exercices de simulation d'incidents ?",
        options: [
          "Annuelle uniquement",
          "Table-top trimestriel, simulation technique semestrielle",
          "Uniquement en cas d'incident réel",
          "Mensuelle pour tous les types"
        ],
        correctAnswer: "Table-top trimestriel, simulation technique semestrielle",
        explanation: "Une fréquence adaptée permet de maintenir la préparation sans surcharger les équipes."
      }
    ]),
    passingScore: 75
  };

  const quiz = await prisma.ebookQuiz.create({
    data: quizData
  });
  console.log(`Quiz créé avec succès. ID: ${quiz.id}`);

  console.log('Ebook sur la gestion d\'incidents ajouté avec succès !');
}

main()
  .catch((e) => {
    console.error('Erreur lors de l\'ajout de l\'ebook:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
