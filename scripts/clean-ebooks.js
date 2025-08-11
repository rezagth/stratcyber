const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanEbooks() {
  try {
    console.log('🧹 Nettoyage des anciens ebooks...');
    
    await prisma.ebookQuizAttempt.deleteMany({});
    await prisma.ebookQuiz.deleteMany({});
    await prisma.readingSession.deleteMany({});
    await prisma.ebook.deleteMany({});
    
    console.log('✅ Nettoyage terminé !');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanEbooks();
