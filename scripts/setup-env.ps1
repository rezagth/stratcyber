# Script de configuration automatique selon la branche Git
# Utilisation: .\scripts\setup-env.ps1

$currentBranch = git branch --show-current

Write-Host "🌿 Branche Git detectee: $currentBranch" -ForegroundColor Green

# Configuration selon la branche
switch ($currentBranch) {
    "dev" {
        Write-Host "📁 Configuration pour la branche DEV (SQLite locale)" -ForegroundColor Yellow
        
        # Copie du bon fichier .env
        Copy-Item ".env.development" ".env" -Force
        Write-Host "✅ Fichier .env.development copie vers .env"
        
        # Configuration du schema Prisma pour SQLite
        $schemaContent = Get-Content "prisma\schema.prisma" -Raw
        $newSchema = $schemaContent -replace 'provider = "postgresql"', 'provider = "sqlite"'
        $newSchema | Set-Content "prisma\schema.prisma" -NoNewline
        Write-Host "✅ Schema Prisma configure pour SQLite"
        
        Write-Host "🗃️  Base de donnees: SQLite locale (./dev.db)" -ForegroundColor Cyan
    }
    "master" {
        Write-Host "🚀 Configuration pour la branche MASTER (PostgreSQL Neon)" -ForegroundColor Red
        
        # Copie du bon fichier .env
        Copy-Item ".env.production" ".env" -Force
        Write-Host "✅ Fichier .env.production copie vers .env"
        
        # Configuration du schema Prisma pour PostgreSQL
        $schemaContent = Get-Content "prisma\schema.prisma" -Raw
        $newSchema = $schemaContent -replace 'provider = "sqlite"', 'provider = "postgresql"'
        $newSchema | Set-Content "prisma\schema.prisma" -NoNewline
        Write-Host "✅ Schema Prisma configure pour PostgreSQL"
        
        Write-Host "🐘 Base de donnees: PostgreSQL sur Neon" -ForegroundColor Cyan
    }
    default {
        Write-Host "⚠️  Branche non reconnue: $currentBranch" -ForegroundColor Red
        Write-Host "Branches supportees: 'dev' (SQLite) ou 'master' (PostgreSQL)"
        exit 1
    }
}

Write-Host "`n🔄 Generation du client Prisma..." -ForegroundColor Magenta
npx prisma generate

Write-Host "`n✨ Configuration terminee!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant lancer: npm run dev" -ForegroundColor White
