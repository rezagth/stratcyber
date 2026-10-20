/**
 * Vérifie que pg_advisory_xact_lock sérialise bien deux transactions Prisma avec la connexion
 * actuelle (DATABASE_URL). À lancer avec l'URL POOLÉE de Neon pour valider le pooler :
 *   DATABASE_URL="<url -pooler>" node scripts/check-advisory-lock.js
 * N'écrit aucune donnée : seuls des verrous de transaction sont pris.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const KEY = 'check-advisory-lock:' + Date.now();
const HOLD_MS = 1500;

async function run(name, log) {
  return prisma.$transaction(async (tx) => {
    log.push(`${name}:demande`);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${KEY}, 0))`;
    log.push(`${name}:obtenu`);
    await new Promise((r) => setTimeout(r, HOLD_MS));
    log.push(`${name}:commit`);
  }, { timeout: 20000, maxWait: 20000 });
}

(async () => {
  const log = [];
  const t0 = Date.now();
  const a = run('A', log);
  await new Promise((r) => setTimeout(r, 300)); // A prend le verrou en premier
  const b = run('B', log);
  await Promise.all([a, b]);
  const elapsed = Date.now() - t0;
  const order = log.join(' > ');
  // Sérialisé : le second à obtenir le verrou ne l'obtient qu'APRÈS le commit du premier
  // (l'ordre A/B n'est pas garanti : la première transaction peut mettre plus de temps à démarrer).
  const obtained = log.filter((e) => e.endsWith(':obtenu')).map((e) => e[0]);
  const [first, second] = obtained;
  const serialized = log.indexOf(`${first}:commit`) < log.indexOf(`${second}:obtenu`) && elapsed >= HOLD_MS * 2 - 100;
  console.log(order);
  console.log(`durée totale : ${elapsed} ms (attendu ≥ ${HOLD_MS * 2} ms si sérialisé)`);
  console.log(serialized ? 'OK : le verrou consultatif sérialise les transactions.' : 'ÉCHEC : les transactions ne sont PAS sérialisées.');
  await prisma.$disconnect();
  process.exit(serialized ? 0 : 1);
})().catch(async (e) => { console.error('Erreur :', e.message); await prisma.$disconnect(); process.exit(2); });
