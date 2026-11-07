import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { open } from './secret-box';
import { verifyTotp } from './totp';
import { consumeRecoveryCode } from './recovery-codes';
import {
  LOCKED_MESSAGE,
  MAX_FAILURES_PER_EMAIL,
  MAX_FAILURES_PER_IP,
  clearFailures,
  emailKey,
  ipKey,
  isLocked,
  recordFailure,
} from './login-guard';

let dummyHashPromise: Promise<string> | null = null;
function dummyHash() {
  dummyHashPromise ??= bcrypt.hash('aucun-compte-ne-porte-ce-mot-de-passe', 12);
  return dummyHashPromise;
}

/** Messages renvoyés à la page de connexion (NextAuth les transmet dans result.error). */
export const AUTH_ERRORS = {
  missing: 'Identifiants requis',
  invalid: 'Identifiants invalides',
  mfaRequired: 'MFA_REQUIRED',
  mfaInvalid: 'Code de vérification invalide',
  locked: LOCKED_MESSAGE,
} as const;

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  organizationId: string | null;
};

/**
 * Vérifie e-mail + mot de passe, puis le second facteur si la MFA est activée.
 * Le second facteur est un code TOTP à 6 chiffres ou un code de secours (XXXXX-XXXXX).
 * Lève une Error dont le message est l'une des valeurs de AUTH_ERRORS.
 */
export async function authenticate(
  input: { email?: string; password?: string; totp?: string },
  ip: string
): Promise<AuthenticatedUser> {
  const rawEmail = input.email?.trim() ?? '';
  const email = rawEmail.toLowerCase();
  const password = input.password ?? '';
  if (!rawEmail || !password) throw new Error(AUTH_ERRORS.missing);

  const keys = [emailKey(email), ipKey(ip)];
  if (await isLocked(keys)) throw new Error(AUTH_ERRORS.locked);

  const fail = async (message: string): Promise<never> => {
    await recordFailure(emailKey(email), MAX_FAILURES_PER_EMAIL);
    await recordFailure(ipKey(ip), MAX_FAILURES_PER_IP);
    throw new Error(message);
  };

  // Les comptes récents sont en minuscules ; un ancien compte peut avoir été créé avec des majuscules.
  const user =
    (await prisma.user.findUnique({ where: { email } })) ??
    (rawEmail !== email ? await prisma.user.findUnique({ where: { email: rawEmail } }) : null);
  // Comparaison effectuée même sans compte, pour ne pas révéler son existence par le temps de réponse.
  const hash = user?.password ?? (await dummyHash());
  const passwordOk = await bcrypt.compare(password, hash);
  if (!user || !passwordOk) return fail(AUTH_ERRORS.invalid);

  if (user.mfaEnabled) {
    const code = input.totp?.trim() ?? '';
    // Pas de code : on demande le second facteur sans compter d'échec (le mot de passe était juste).
    if (!code) throw new Error(AUTH_ERRORS.mfaRequired);
    if (!user.mfaSecret) return fail(AUTH_ERRORS.mfaInvalid);

    const step = verifyTotp(open(user.mfaSecret), code, { lastUsedStep: user.mfaLastStep });
    if (step !== null) {
      await prisma.user.update({ where: { id: user.id }, data: { mfaLastStep: step } });
    } else {
      const remaining = consumeRecoveryCode(user.mfaRecoveryCodes, code);
      if (!remaining) return fail(AUTH_ERRORS.mfaInvalid);
      await prisma.user.update({ where: { id: user.id }, data: { mfaRecoveryCodes: JSON.stringify(remaining) } });
    }
  }

  await clearFailures(emailKey(email));
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    organizationId: user.organizationId ?? null,
  };
}
