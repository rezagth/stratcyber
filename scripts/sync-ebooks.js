const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Script de synchronisation automatique des ebooks
 * Lecture des fichiers .md + .yaml → sync BDD
 */

async function syncEbooks() {
  console.log('🚀 Démarrage de la synchronisation des ebooks...');

  const ebooksDir = path.join(__dirname, '../ebooks');
  const contentDir = path.join(ebooksDir, 'content');
  const metadataDir = path.join(ebooksDir, 'metadata');

  // Vérifier que les dossiers existent
  if (!fs.existsSync(contentDir) || !fs.existsSync(metadataDir)) {
    console.log('📁 Création de la structure de dossiers...');
    fs.mkdirSync(contentDir, { recursive: true });
    fs.mkdirSync(metadataDir, { recursive: true });
    
    // Migrer les fichiers existants
    await migrateExistingFiles();
  }

  // Lire tous les fichiers de métadonnées
  const metadataFiles = fs.readdirSync(metadataDir)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

  console.log(`📚 ${metadataFiles.length} ebooks trouvés`);

  for (const metaFile of metadataFiles) {
    try {
      await syncSingleEbook(metaFile);
    } catch (error) {
      console.error(`❌ Erreur avec ${metaFile}:`, error.message);
    }
  }

  console.log('✅ Synchronisation terminée !');
}

async function syncSingleEbook(metaFile) {
  const ebookId = path.basename(metaFile, path.extname(metaFile));
  const metadataPath = path.join(__dirname, '../ebooks/metadata', metaFile);
  const contentPath = path.join(__dirname, '../ebooks/content', `${ebookId}.md`);

  // Lire les métadonnées
  const metadataContent = fs.readFileSync(metadataPath, 'utf8');
  const metadata = yaml.parse(metadataContent);

  // Lire le contenu Markdown
  if (!fs.existsSync(contentPath)) {
    console.warn(`⚠️  Fichier de contenu manquant: ${ebookId}.md`);
    return;
  }
  
  const markdownContent = fs.readFileSync(contentPath, 'utf8');

  // Préparer les données pour la BDD
  const ebookData = {
    id: ebookId,
    title: metadata.title,
    author: metadata.author || 'StratCyber Formation',
    description: metadata.description,
    content: JSON.stringify({
      markdown: markdownContent,
      metadata: {
        source: 'file',
        lastSync: new Date().toISOString(),
        version: metadata.version || '1.0',
        ...metadata.metadata
      }
    }),
    category: metadata.category,
    difficulty: metadata.difficulty,
    duration: metadata.duration,
    pages: metadata.pages || estimatePages(markdownContent),
    rating: metadata.rating || 0,
    downloads: 0, // Préservé depuis BDD existante
    tags: JSON.stringify(metadata.tags || []),
    thumbnailUrl: metadata.thumbnailUrl,
    isPublished: metadata.published !== false
  };

  // Upsert en BDD (créer ou mettre à jour)
  const existingEbook = await prisma.ebook.findUnique({ where: { id: ebookId } });
  
  if (existingEbook) {
    // Préserver les stats d'usage
    ebookData.downloads = existingEbook.downloads;
    ebookData.rating = existingEbook.rating || metadata.rating || 0;
    
    await prisma.ebook.update({
      where: { id: ebookId },
      data: ebookData
    });
    console.log(`🔄 Ebook mis à jour: ${metadata.title}`);
  } else {
    await prisma.ebook.create({ data: ebookData });
    console.log(`✨ Nouvel ebook créé: ${metadata.title}`);
  }

  // Synchroniser le quiz s'il existe
  if (metadata.quiz) {
    await syncEbookQuiz(ebookId, metadata.quiz);
  }
}

async function syncEbookQuiz(ebookId, quizData) {
  const existingQuiz = await prisma.ebookQuiz.findFirst({ where: { ebookId } });
  
  const quizPayload = {
    ebookId,
    title: quizData.title,
    description: quizData.description,
    questions: JSON.stringify(quizData.questions),
    passingScore: quizData.passingScore || 70
  };

  if (existingQuiz) {
    await prisma.ebookQuiz.update({
      where: { id: existingQuiz.id },
      data: quizPayload
    });
  } else {
    await prisma.ebookQuiz.create({ data: quizPayload });
  }
}

async function migrateExistingFiles() {
  console.log('📦 Migration des fichiers existants...');
  
  // Migrer les .md existants
  const ebooksDir = path.join(__dirname, '../ebooks');
  const markdownFiles = fs.readdirSync(ebooksDir)
    .filter(file => file.endsWith('.md'));

  for (const mdFile of markdownFiles) {
    const baseName = path.basename(mdFile, '.md');
    const oldPath = path.join(ebooksDir, mdFile);
    const newPath = path.join(ebooksDir, 'content', mdFile);
    
    // Déplacer le fichier
    fs.renameSync(oldPath, newPath);
    
    // Créer un fichier de métadonnées basique
    const metadata = await extractMetadataFromMarkdown(newPath);
    const metadataPath = path.join(ebooksDir, 'metadata', `${baseName}.yaml`);
    fs.writeFileSync(metadataPath, yaml.stringify(metadata));
    
    console.log(`📝 Migré: ${mdFile}`);
  }
}

async function extractMetadataFromMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Extraire les métadonnées du header si présent
  let title = 'Ebook Sans Titre';
  let author = 'StratCyber Formation';
  let category = 'Fondamentaux';
  let difficulty = 'Intermédiaire';
  let duration = '2h 30min';
  let tags = [];

  // Chercher le titre (première ligne #)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) title = titleMatch[1];

  // Chercher les métadonnées dans les premières lignes
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const line = lines[i];
    if (line.includes('**Auteur**:')) author = line.split(':')[1].trim();
    if (line.includes('**Catégorie**:')) category = line.split(':')[1].trim();
    if (line.includes('**Difficulté**:')) difficulty = line.split(':')[1].trim();
    if (line.includes('**Durée**:')) duration = line.split(':')[1].trim();
    if (line.includes('**Tags**:')) {
      const tagLine = line.split(':')[1].trim();
      tags = tagLine.split('#').filter(t => t.trim()).map(t => t.trim());
    }
  }

  return {
    id: path.basename(filePath, '.md'),
    title,
    author,
    category,
    difficulty,
    duration,
    pages: estimatePages(content),
    tags,
    description: `Guide complet sur ${title.toLowerCase()}`,
    published: true,
    version: '1.0'
  };
}

function estimatePages(markdownContent) {
  // Estimation: ~300 mots par page, ~5 caractères par mot
  const charCount = markdownContent.length;
  return Math.max(1, Math.round(charCount / 1500));
}

// Exécution
if (require.main === module) {
  syncEbooks()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { syncEbooks };
