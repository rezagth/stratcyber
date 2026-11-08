/**
 * Crée le PREMIER compte administrateur sur la base de production (à lancer une seule fois, depuis ton poste).
 *
 * Sécurité :
 *  - refuse de tourner s'il existe déjà un administrateur (ce n'est ni un reset, ni un contournement de connexion) ;
 *  - le mot de passe est lu dans la variable d'environnement, jamais écrit dans un fichier ni dans un chat ;
 *  - demande une confirmation explicite : CONFIRM_PRODUCTION=oui.
 *
 * Usage (le mot de passe est saisi sans écho, 12 caractères minimum) :
 *   read -s ADMIN_PASSWORD && export ADMIN_PASSWORD
 *   DATABASE_URL="<adresse Neon de production>" ADMIN_EMAIL="vous@exemple.fr" CONFIRM_PRODUCTION=oui node scripts/bootstrap-admin.js
 *   unset ADMIN_PASSWORD
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';

function fail(msg) {
  console.error('Erreur : ' + msg);
  process.exit(1);
}

if (!process.env.DATABASE_URL) fail('DATABASE_URL absente.');
if (process.env.CONFIRM_PRODUCTION !== 'oui') fail('ajoute CONFIRM_PRODUCTION=oui pour confirmer que tu vises la base de production.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('ADMIN_EMAIL invalide.');
if (password.length < 12) fail('ADMIN_PASSWORD : 12 caractères minimum.');

const prisma = new PrismaClient();

(async () => {
  const admins = await prisma.user.count({ where: { role: 'admin' } });
  if (admins > 0) {
    fail(`il existe déjà ${admins} administrateur(s) : rien n'a été modifié. Connecte-toi avec ce compte.`);
  }
  if (await prisma.user.findUnique({ where: { email } })) {
    fail('cet e-mail existe déjà avec un autre rôle : rien n\'a été modifié.');
  }
  await prisma.user.create({
    data: { email, password: await bcrypt.hash(password, 12), name: 'Administrateur', role: 'admin' },
  });
  console.log('Administrateur créé : ' + email + '. Connecte-toi, puis active la double authentification (Compte, Sécurité).');
})()
  .catch((e) => fail(e.message))
  .finally(() => prisma.$disconnect());
