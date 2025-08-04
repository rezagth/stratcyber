# StratCyber

Plateforme de stratégie cybersécurité professionnelle.

## Stack technique
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Prisma ORM (SQLite)
- React Hook Form + Zod
- pdf-lib, Chart.js/Mermaid.js
- (à venir) BetterAuth, Supabase Storage, OpenAI API

## Installation

```bash
pnpm install
npx prisma migrate dev --name init
```

Crée un fichier `.env` à partir de `.env.example`.

## Structure recommandée

```
app/                # Pages Next.js (App Router)
components/         # UI réutilisables
lib/                # Logique métier, utils
prisma/             # Schéma Prisma, seed
public/             # Statics, images
styles/             # CSS/Tailwind
types/              # Types globaux
```

## Lancement

```bash
pnpm dev
```

---

## Modules principaux
- Dashboard
- Stratégie cybersécurité (audit, scoring, roadmap, PDF)
- Conformité RGPD
- GRC (ISO 27001, EBIOS)
- (à venir) Sensibilisation (vidéos, ebooks, quiz)
- Auth, IA, stockage 