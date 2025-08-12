#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuration automatique selon la branche Git...\n');

// Obtenir la branche courante
let currentBranch;
try {
  currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`🌿 Branche Git détectée: ${currentBranch}`);
} catch (error) {
  console.error('❌ Impossible de détecter la branche Git');
  process.exit(1);
}

// Chemins des fichiers
const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
const envPath = path.join(process.cwd(), '.env');

// Configuration selon la branche
switch (currentBranch) {
  case 'dev':
    console.log('📁 Configuration pour la branche DEV (SQLite locale)');
    
    // Copie du fichier .env.development
    const devEnvPath = path.join(process.cwd(), '.env.development');
    if (fs.existsSync(devEnvPath)) {
      fs.copyFileSync(devEnvPath, envPath);
      console.log('✅ Fichier .env.development copié vers .env');
    } else {
      console.error('❌ Fichier .env.development non trouvé');
      process.exit(1);
    }
    
    // Configuration du schema Prisma pour SQLite
    if (fs.existsSync(schemaPath)) {
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');
      schemaContent = schemaContent.replace(/provider = "postgresql"/g, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, schemaContent);
      console.log('✅ Schema Prisma configuré pour SQLite');
    }
    
    console.log('🗃️  Base de données: SQLite locale (./dev.db)');
    break;
    
  case 'master':
    console.log('🚀 Configuration pour la branche MASTER (PostgreSQL Neon)');
    
    // Copie du fichier .env.production
    const prodEnvPath = path.join(process.cwd(), '.env.production');
    if (fs.existsSync(prodEnvPath)) {
      fs.copyFileSync(prodEnvPath, envPath);
      console.log('✅ Fichier .env.production copié vers .env');
    } else {
      console.error('❌ Fichier .env.production non trouvé');
      process.exit(1);
    }
    
    // Configuration du schema Prisma pour PostgreSQL
    if (fs.existsSync(schemaPath)) {
      let schemaContent = fs.readFileSync(schemaPath, 'utf8');
      schemaContent = schemaContent.replace(/provider = "sqlite"/g, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, schemaContent);
      console.log('✅ Schema Prisma configuré pour PostgreSQL');
    }
    
    console.log('🐘 Base de données: PostgreSQL sur Neon');
    break;
    
  default:
    console.error(`⚠️  Branche non reconnue: ${currentBranch}`);
    console.error('Branches supportées: "dev" (SQLite) ou "master" (PostgreSQL)');
    process.exit(1);
}

// Génération du client Prisma
console.log('\n🔄 Génération du client Prisma...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('\n✨ Configuration terminée!');
  console.log('Vous pouvez maintenant lancer: npm run dev');
} catch (error) {
  console.error('❌ Erreur lors de la génération du client Prisma');
  process.exit(1);
}
