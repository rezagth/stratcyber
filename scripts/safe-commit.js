#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🛡️ Commit sécurisé - Vérification des fichiers...\n');

// Fichiers à ne JAMAIS committer automatiquement
const forbiddenFiles = [
  'prisma/schema.prisma',
  'prisma/dev.db',
  '.env',
  'dev.db',
  'dev-test.db'
];

try {
  // Obtenir la liste des fichiers modifiés
  const modifiedFiles = execSync('git diff --name-only --cached', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(file => file.length > 0);

  if (modifiedFiles.length === 0) {
    console.log('❌ Aucun fichier ajouté pour le commit');
    console.log('Utilisez: git add <fichier> avant de committer');
    process.exit(1);
  }

  console.log('📋 Fichiers à committer:');
  modifiedFiles.forEach(file => console.log(`   📄 ${file}`));

  // Vérifier s'il y a des fichiers interdits
  const dangerousFiles = modifiedFiles.filter(file => 
    forbiddenFiles.some(forbidden => file.includes(forbidden))
  );

  if (dangerousFiles.length > 0) {
    console.log('\n⚠️ ATTENTION! Fichiers potentiellement dangereux détectés:');
    dangerousFiles.forEach(file => console.log(`   🚨 ${file}`));
    
    console.log('\n❌ Ces fichiers sont modifiés automatiquement par nos scripts.');
    console.log('❌ Les committer pourrait casser la production!');
    console.log('\nPour les retirer:');
    dangerousFiles.forEach(file => {
      console.log(`   git reset HEAD "${file}"`);
    });
    
    process.exit(1);
  }

  console.log('\n✅ Tous les fichiers sont sécurisés!');
  console.log('🎯 Vous pouvez continuer votre commit normalement.');

} catch (error) {
  console.error('❌ Erreur lors de la vérification:', error.message);
  process.exit(1);
}
