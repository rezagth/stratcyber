/**
 * Crée (ou réinitialise) un compte administrateur — DÉVELOPPEMENT LOCAL UNIQUEMENT.
 *
 * Usage (le mot de passe ne s'écrit jamais dans un fichier ni dans un chat) :
 *   ADMIN_EMAIL="vous@exemple.fr" ADMIN_PASSWORD="..." node scripts/create-admin.js
 *   ajouter RESET=1 pour changer le mot de passe d'un compte existant.
 *
 * Refuse de tourner si la base ressemble à de la production (Neon, Vercel, NODE_ENV=production).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL || '';
const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const reset = process.env.RESET === '1';

function fail(msg) {
  console.error('Erreur : ' + msg);
  process.exit(1);
}

if (!url) fail('DATABASE_URL absente.');
if (process.env.NODE_ENV === 'production' || /neon\.tech|vercel|amazonaws|supabase/i.test(url)) {
  fail('la base ciblée ressemble à de la production. Script réservé au dev local.');
}
if (!/@(localhost|127\.0\.0\.1)(:|\/)/.test(url)) {
  fail('la base n\'est pas locale (localhost/127.0.0.1 attendu).');
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('ADMIN_EMAIL invalide.');
if (password.length < 12) fail('ADMIN_PASSWORD : 12 caractères minimum.');

const prisma = new PrismaClient();

(async () => {
  const existing = await prisma.user.findUnique({ where: { email } });
  const hash = await bcrypt.hash(password, 12);
  if (existing) {
    if (!reset) fail('ce compte existe déjà. Relancez avec RESET=1 pour changer son mot de passe.');
    await prisma.user.update({
      where: { email },
      data: { password: hash, role: 'admin', mfaEnabled: false, mfaSecret: null, mfaPendingSecret: null, mfaRecoveryCodes: null },
    });
    console.log('Mot de passe réinitialisé et rôle admin confirmé pour ' + email + ' (MFA désactivée).');
  } else {
    await prisma.user.create({ data: { email, password: hash, name: 'Admin', role: 'admin' } });
    console.log('Admin créé : ' + email);
  }
})()
  .catch((e) => fail(e.message))
  .finally(() => prisma.$disconnect());
