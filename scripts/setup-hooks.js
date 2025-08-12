#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Installation des Git hooks...');

const hooksDir = path.join(process.cwd(), '.git', 'hooks');
const postCheckoutSource = path.join(process.cwd(), 'scripts', 'post-checkout');
const postCheckoutDest = path.join(hooksDir, 'post-checkout');

// Vérifier que nous sommes dans un repo Git
if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
  console.error('❌ Ce répertoire n\'est pas un dépôt Git');
  process.exit(1);
}

// Créer le répertoire hooks s'il n'existe pas
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

try {
  // Copier le hook post-checkout
  fs.copyFileSync(postCheckoutSource, postCheckoutDest);
  
  // Rendre le fichier exécutable (Unix/Linux/Mac)
  if (process.platform !== 'win32') {
    fs.chmodSync(postCheckoutDest, 0o755);
  }
  
  console.log('✅ Git hook post-checkout installé');
  console.log('🎯 La configuration se fera automatiquement lors des changements de branche');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'installation des hooks:', error.message);
  process.exit(1);
}
