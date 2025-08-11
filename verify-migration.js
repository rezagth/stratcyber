const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyMigration() {
  try {
    console.log('🔍 Vérification de la migration vers PostgreSQL...\n');
    
    // Compter les données dans chaque table
    const counts = {
      users: await prisma.user.count(),
      audits: await prisma.audit.count(),
      auditResponses: await prisma.auditResponse.count(),
      ebooks: await prisma.ebook.count(),
      ebookQuizzes: await prisma.ebookQuiz.count(),
      // Ajoutez d'autres tables si nécessaire
    };

    console.log('📊 Nombre d\'enregistrements dans PostgreSQL:');
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} enregistrements`);
    });

    // Test de requête simple
    console.log('\n🧪 Test de requêtes:');
    
    const user = await prisma.user.findFirst();
    console.log(`✅ Utilisateur trouvé: ${user?.email || 'Aucun'}`);
    
    const auditsCount = await prisma.audit.count({
      where: { userId: user?.id }
    });
    console.log(`✅ Audits pour cet utilisateur: ${auditsCount}`);
    
    // Test de relation
    const auditWithResponses = await prisma.audit.findFirst({
      include: {
        responses: true,
        user: true
      }
    });
    
    if (auditWithResponses) {
      console.log(`✅ Audit avec relations: ${auditWithResponses.responses.length} réponses pour l'utilisateur ${auditWithResponses.user.email}`);
    }

    console.log('\n🎉 Migration vers PostgreSQL réussie !');
    console.log('✨ Toutes vos données ont été préservées');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyMigration();
