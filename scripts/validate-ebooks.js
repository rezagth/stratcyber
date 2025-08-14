const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Script de validation des ebooks
 * Vérifie la cohérence entre fichiers .md et .yaml
 */

async function validateEbooks() {
  console.log('🔍 Validation des ebooks...\n');

  const ebooksDir = path.join(__dirname, '../ebooks');
  const contentDir = path.join(ebooksDir, 'content');
  const metadataDir = path.join(ebooksDir, 'metadata');

  let errors = 0;
  let warnings = 0;

  // Vérifier la structure des dossiers
  if (!fs.existsSync(contentDir)) {
    console.error('❌ Dossier ebooks/content manquant');
    errors++;
  }
  
  if (!fs.existsSync(metadataDir)) {
    console.error('❌ Dossier ebooks/metadata manquant');
    errors++;
  }

  if (errors > 0) {
    console.log(`\n🚫 ${errors} erreur(s) critiques détectées`);
    process.exit(1);
  }

  // Lire les fichiers de métadonnées
  const metadataFiles = fs.readdirSync(metadataDir)
    .filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

  console.log(`📚 ${metadataFiles.length} fichier(s) de métadonnées trouvés\n`);

  for (const metaFile of metadataFiles) {
    const ebookId = path.basename(metaFile, path.extname(metaFile));
    console.log(`📖 Validation: ${ebookId}`);
    
    try {
      const result = await validateSingleEbook(ebookId, metaFile);
      errors += result.errors;
      warnings += result.warnings;
    } catch (error) {
      console.error(`❌ Erreur lors de la validation de ${ebookId}:`, error.message);
      errors++;
    }
    
    console.log(''); // Ligne vide
  }

  // Résumé
  console.log('📊 Résumé de la validation:');
  console.log(`   ✅ ${metadataFiles.length - errors} ebooks valides`);
  if (warnings > 0) console.log(`   ⚠️  ${warnings} avertissements`);
  if (errors > 0) console.log(`   ❌ ${errors} erreurs`);

  if (errors === 0) {
    console.log('\n🎉 Tous les ebooks sont valides !');
  } else {
    console.log(`\n🚫 ${errors} erreur(s) trouvées. Veuillez corriger avant de synchroniser.`);
    process.exit(1);
  }
}

async function validateSingleEbook(ebookId, metaFile) {
  let errors = 0;
  let warnings = 0;

  const metadataPath = path.join(__dirname, '../ebooks/metadata', metaFile);
  const contentPath = path.join(__dirname, '../ebooks/content', `${ebookId}.md`);

  // 1. Vérifier que le fichier de contenu existe
  if (!fs.existsSync(contentPath)) {
    console.error(`   ❌ Fichier de contenu manquant: ${ebookId}.md`);
    errors++;
    return { errors, warnings };
  }

  // 2. Parser les métadonnées
  let metadata;
  try {
    const metadataContent = fs.readFileSync(metadataPath, 'utf8');
    metadata = yaml.parse(metadataContent);
  } catch (error) {
    console.error(`   ❌ Erreur de parsing YAML:`, error.message);
    errors++;
    return { errors, warnings };
  }

  // 3. Vérifier les champs obligatoires
  const requiredFields = ['id', 'title', 'author', 'category', 'difficulty'];
  for (const field of requiredFields) {
    if (!metadata[field]) {
      console.error(`   ❌ Champ obligatoire manquant: ${field}`);
      errors++;
    }
  }

  // 4. Vérifier l'ID
  if (metadata.id !== ebookId) {
    console.error(`   ❌ ID incohérent: fichier=${ebookId}, metadata=${metadata.id}`);
    errors++;
  }

  // 5. Vérifier les valeurs des énumérations
  const validCategories = ['Fondamentaux', 'Réseau', 'Gestion', 'Cloud', 'Conformité', 'Tests'];
  if (metadata.category && !validCategories.includes(metadata.category)) {
    console.error(`   ❌ Catégorie invalide: ${metadata.category}`);
    console.error(`       Valeurs autorisées: ${validCategories.join(', ')}`);
    errors++;
  }

  const validDifficulties = ['Débutant', 'Intermédiaire', 'Avancé'];
  if (metadata.difficulty && !validDifficulties.includes(metadata.difficulty)) {
    console.error(`   ❌ Difficulté invalide: ${metadata.difficulty}`);
    console.error(`       Valeurs autorisées: ${validDifficulties.join(', ')}`);
    errors++;
  }

  // 6. Lire et analyser le contenu
  const content = fs.readFileSync(contentPath, 'utf8');
  
  // Vérifier que le titre dans le MD correspond
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    const mdTitle = titleMatch[1];
    if (mdTitle !== metadata.title) {
      console.warn(`   ⚠️  Titre différent: MD="${mdTitle}", META="${metadata.title}"`);
      warnings++;
    }
  } else {
    console.warn(`   ⚠️  Pas de titre H1 trouvé dans le fichier MD`);
    warnings++;
  }

  // 7. Vérifier la cohérence des métadonnées avec le contenu
  if (metadata.pages) {
    const estimatedPages = Math.max(1, Math.round(content.length / 1500));
    const diff = Math.abs(metadata.pages - estimatedPages);
    if (diff > 5) {
      console.warn(`   ⚠️  Pages estimées (${estimatedPages}) vs déclarées (${metadata.pages})`);
      warnings++;
    }
  }

  // 8. Vérifier le quiz si présent
  if (metadata.quiz) {
    const quizErrors = validateQuiz(metadata.quiz);
    if (quizErrors > 0) {
      console.error(`   ❌ ${quizErrors} erreurs dans le quiz`);
      errors += quizErrors;
    }
  }

  // 9. Résumé pour cet ebook
  if (errors === 0 && warnings === 0) {
    console.log(`   ✅ Valide`);
  } else if (errors === 0) {
    console.log(`   ✅ Valide (${warnings} avertissement(s))`);
  }

  return { errors, warnings };
}

function validateQuiz(quiz) {
  let errors = 0;

  if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
    return 1;
  }

  quiz.questions.forEach((q, index) => {
    if (!q.id || !q.question || !q.correctAnswer) {
      console.error(`     ❌ Question ${index + 1}: champs obligatoires manquants`);
      errors++;
    }
    
    if (q.options && !q.options.includes(q.correctAnswer)) {
      console.error(`     ❌ Question ${index + 1}: réponse correcte pas dans les options`);
      errors++;
    }
  });

  return errors;
}

// Exécution
if (require.main === module) {
  validateEbooks().catch(console.error);
}

module.exports = { validateEbooks };
