const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugJsonContent() {
  try {
    // Récupérer tous les ebooks
    const ebooks = await prisma.ebook.findMany({
      select: {
        id: true,
        title: true,
        tags: true,
        content: true
      }
    });

    console.log(`\n=== Analyse de ${ebooks.length} ebooks ===\n`);

    for (const ebook of ebooks) {
      console.log(`\n--- Ebook: ${ebook.title} (ID: ${ebook.id}) ---`);
      
      // Vérifier le champ tags
      if (ebook.tags) {
        console.log(`\nTags (type: ${typeof ebook.tags}):`);
        console.log(`Première partie: "${ebook.tags.substring(0, 50)}..."`);
        
        // Vérifier si c'est du JSON valide
        try {
          const parsed = JSON.parse(ebook.tags);
          console.log(`✅ Tags JSON valide:`, parsed);
        } catch (error) {
          console.log(`❌ Tags JSON invalide!`);
          console.log(`Erreur: ${error.message}`);
          
          // Vérifier si ça commence par "Incidents"
          if (ebook.tags.startsWith('Incidents')) {
            console.log(`⚠️ TROUVÉ: Tags commence par "Incidents"`);
            console.log(`Contenu complet des tags: "${ebook.tags}"`);
          }
        }
      }
      
      // Vérifier le champ content
      if (ebook.content) {
        console.log(`\nContent (type: ${typeof ebook.content}):`);
        console.log(`Première partie: "${ebook.content.substring(0, 100)}..."`);
        
        // Vérifier si c'est du JSON valide
        try {
          const parsed = JSON.parse(ebook.content);
          console.log(`✅ Content JSON valide`);
        } catch (error) {
          console.log(`❌ Content JSON invalide!`);
          console.log(`Erreur: ${error.message}`);
          
          // Vérifier si ça commence par "Incidents"
          if (ebook.content.startsWith('Incidents')) {
            console.log(`⚠️ TROUVÉ: Content commence par "Incidents"`);
            console.log(`Début du contenu (200 caractères): "${ebook.content.substring(0, 200)}"`);
          }
        }
      }
    }
    
    console.log('\n=== Fin de l\'analyse ===\n');
    
  } catch (error) {
    console.error('Erreur lors de l\'analyse:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugJsonContent();
