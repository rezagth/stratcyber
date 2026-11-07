import { prisma } from '@/lib/db';

/**
 * Limitation des tentatives de connexion, stockée en base (fonctionne sur Vercel, où la mémoire
 * n'est pas partagée entre instances).
 *  - par adresse e-mail : 5 échecs en 15 min → blocage 15 min ;
 *  - par adresse IP : 30 échecs en 15 min → blocage 15 min.
 * La clé e-mail est suivie que le compte existe ou non : le message de blocage ne révèle
 * donc pas l'existence d'un compte.
 */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
export const MAX_FAILURES_PER_EMAIL = 5;
export const MAX_FAILURES_PER_IP = 30;

export const LOCKED_MESSAGE = 'Trop de tentatives. Réessayez dans 15 minutes.';

export function emailKey(email: string) {
  return `email:${email.trim().toLowerCase()}`;
}
export function ipKey(ip: string) {
  return `ip:${ip}`;
}

export async function isLocked(keys: string[], now = new Date()): Promise<boolean> {
  const rows = await prisma.loginAttempt.findMany({ where: { key: { in: keys } } });
  return rows.some((r) => r.lockedUntil && r.lockedUntil > now);
}

export async function recordFailure(key: string, max: number, now = new Date()): Promise<void> {
  const existing = await prisma.loginAttempt.findUnique({ where: { key } });
  const windowExpired = !existing || now.getTime() - existing.windowStart.getTime() > LOGIN_WINDOW_MS;
  const count = windowExpired ? 1 : existing.count + 1;
  const lockedUntil = count >= max ? new Date(now.getTime() + LOCK_DURATION_MS) : existing?.lockedUntil ?? null;
  await prisma.loginAttempt.upsert({
    where: { key },
    create: { key, count, windowStart: now, lockedUntil },
    update: { count, windowStart: windowExpired ? now : existing.windowStart, lockedUntil },
  });
}

export async function clearFailures(key: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { key } });
}

/** Adresse IP du client : première valeur de x-forwarded-for (posée par Vercel), sinon x-real-ip. */
export function clientIp(headers: Record<string, string | string[] | undefined> | undefined): string {
  const forwarded = headers?.['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  const real = headers?.['x-real-ip'];
  return first || (Array.isArray(real) ? real[0] : real) || 'inconnue';
}
