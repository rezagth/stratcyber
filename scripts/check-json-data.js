const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJsonData() {
  try {
    const ebooks = await prisma.ebook.findMany({
      select: {
        id: true,
        title: true,
        tags: true,
        content: true
      }
    });

    console.log(`Checking ${ebooks.length} ebooks for JSON issues...\n`);

    for (const ebook of ebooks) {
      const issues = [];
      
      // Check tags field
      if (ebook.tags) {
        try {
          JSON.parse(ebook.tags);
        } catch (error) {
          issues.push(`Invalid JSON in tags: ${error.message}`);
          console.log(`\nEbook: ${ebook.title} (ID: ${ebook.id})`);
          console.log(`Tags value: ${ebook.tags.substring(0, 100)}...`);
        }
      }
      
      // Check content field
      if (ebook.content) {
        try {
          JSON.parse(ebook.content);
        } catch (error) {
          issues.push(`Invalid JSON in content: ${error.message}`);
          console.log(`\nEbook: ${ebook.title} (ID: ${ebook.id})`);
          console.log(`Content preview: ${ebook.content.substring(0, 200)}...`);
          
          // Check if it starts with "Incidents," which would cause the error
          if (ebook.content.startsWith('Incidents,') || ebook.content.includes('"Incidents,')) {
            console.log(`>>> Found "Incidents," pattern in content!`);
          }
        }
      }
      
      if (issues.length > 0) {
        console.log(`Issues found: ${issues.join(', ')}`);
      }
    }
    
    console.log('\nCheck complete!');
  } catch (error) {
    console.error('Error checking ebooks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJsonData();
