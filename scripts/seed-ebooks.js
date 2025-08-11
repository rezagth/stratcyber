const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleEbooks = [
  {
    title: "Fondamentaux de la Cybersécurité",
    author: "Dr. Sarah Martin",
    description: "Guide complet pour comprendre les bases de la sécurité informatique, les menaces courantes et les bonnes pratiques.",
    category: "Fondamentaux",
    difficulty: "Débutant",
    duration: "2h 30min",
    pages: 45,
    rating: 4.8,
    tags: ["Sécurité", "Débutant", "Bonnes pratiques"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Introduction à la cybersécurité",
          content: "La cybersécurité est l'ensemble des techniques et pratiques..."
        },
        {
          title: "Les menaces principales",
          content: "Les principales menaces informatiques incluent..."
        }
      ]
    })
  },
  {
    title: "Sécurité Réseau Avancée",
    author: "Marc Dubois",
    description: "Approfondissez vos connaissances en sécurité réseau : firewalls, IDS/IPS, VPN et détection d'intrusions.",
    category: "Réseau",
    difficulty: "Avancé",
    duration: "4h 15min",
    pages: 78,
    rating: 4.9,
    tags: ["Réseau", "Firewall", "IDS/IPS"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Architecture réseau sécurisée",
          content: "Les principes d'une architecture réseau sécurisée..."
        },
        {
          title: "Configuration avancée des firewalls",
          content: "Guide pratique pour configurer et optimiser..."
        }
      ]
    })
  },
  {
    title: "Gestion des Incidents de Sécurité",
    author: "Claire Rousseau",
    description: "Méthodologie complète pour gérer et répondre aux incidents de sécurité dans votre organisation.",
    category: "Gestion",
    difficulty: "Intermédiaire",
    duration: "3h 45min",
    pages: 62,
    rating: 4.7,
    tags: ["Incident", "Gestion", "Réponse"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Processus de gestion d'incidents",
          content: "Les étapes clés pour une gestion efficace..."
        },
        {
          title: "Outils et techniques",
          content: "Présentation des principaux outils..."
        }
      ]
    })
  },
  {
    title: "Sécurité dans le Cloud",
    author: "Thomas Leroy",
    description: "Sécurisez vos infrastructures cloud AWS, Azure, GCP : bonnes pratiques, configurations et monitoring.",
    category: "Cloud",
    difficulty: "Intermédiaire",
    duration: "3h 20min",
    pages: 58,
    rating: 4.6,
    tags: ["Cloud", "AWS", "Azure"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Modèles de sécurité cloud",
          content: "Les différents modèles de responsabilité..."
        },
        {
          title: "Sécurisation AWS",
          content: "Configuration sécurisée des services AWS..."
        }
      ]
    })
  },
  {
    title: "Protection des Données et RGPD",
    author: "Anne Moreau",
    description: "Guide pratique pour la mise en conformité RGPD et la protection des données personnelles.",
    category: "Conformité",
    difficulty: "Intermédiaire",
    duration: "2h 50min",
    pages: 52,
    rating: 4.5,
    tags: ["RGPD", "Conformité", "Données"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Principes du RGPD",
          content: "Les bases réglementaires et obligations..."
        },
        {
          title: "Mise en pratique",
          content: "Actions concrètes pour la conformité..."
        }
      ]
    })
  },
  {
    title: "Guide du Test de Pénétration",
    author: "Jean-Paul Mercier",
    description: "Méthodologie complète pour réaliser des tests de pénétration efficaces et documenter les vulnérabilités.",
    category: "Tests",
    difficulty: "Avancé",
    duration: "5h 10min",
    pages: 95,
    rating: 4.9,
    tags: ["Pentest", "Vulnérabilités", "Tests"],
    isPublished: true,
    content: JSON.stringify({
      chapters: [
        {
          title: "Méthodologie OWASP",
          content: "Application de la méthodologie OWASP..."
        },
        {
          title: "Outils de pentest",
          content: "Présentation des outils essentiels..."
        }
      ]
    })
  }
];

async function seedEbooks() {
  try {
    console.log('🌱 Ajout des ebooks d\'exemple...');
    
    // Supprimer les anciens ebooks
    await prisma.ebook.deleteMany({});
    
    // Ajouter les nouveaux ebooks
    for (const ebook of sampleEbooks) {
      await prisma.ebook.create({
        data: {
          ...ebook,
          tags: JSON.stringify(ebook.tags)
        }
      });
    }
    
    console.log(`✅ ${sampleEbooks.length} ebooks ajoutés avec succès !`);
    
    // Créer quelques quiz d'exemple
    const ebooks = await prisma.ebook.findMany();
    
    for (const ebook of ebooks.slice(0, 3)) {
      await prisma.ebookQuiz.create({
        data: {
          ebookId: ebook.id,
          title: `Quiz - ${ebook.title}`,
          description: `Testez vos connaissances sur ${ebook.title}`,
          questions: JSON.stringify([
            {
              id: 1,
              question: "Quelle est la première étape d'une approche sécurisée ?",
              type: "multiple_choice",
              options: ["Audit", "Formation", "Installation", "Configuration"],
              correctAnswer: "Audit",
              explanation: "L'audit permet d'évaluer l'état actuel avant toute action."
            },
            {
              id: 2,
              question: "La sécurité informatique ne concerne que la technique.",
              type: "true_false",
              correctAnswer: "false",
              explanation: "La sécurité informatique inclut aussi les aspects humains et organisationnels."
            }
          ]),
          passingScore: 70
        }
      });
    }
    
    console.log('✅ Quiz d\'exemple créés !');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des ebooks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEbooks();
