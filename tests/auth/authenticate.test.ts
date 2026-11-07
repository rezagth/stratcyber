// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { resetDb, tables } from '../helpers/fake-prisma';
import { hotp, base32Decode, generateTotpSecret, timeStep } from '@/lib/auth/totp';
import { seal } from '@/lib/auth/secret-box';
import { generateRecoveryCodes } from '@/lib/auth/recovery-codes';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});

const { authenticate, AUTH_ERRORS } = await import('@/lib/auth/authenticate');

const PASSWORD = 'un-mot-de-passe-long';
let passwordHash: string;

async function addUser(extra: Record<string, unknown> = {}) {
  tables.user.push({
    id: 'u1', email: 'rssi@exemple.fr', password: passwordHash, name: 'RSSI', role: 'admin',
    organizationId: null, mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: null, mfaLastStep: null, ...extra,
  });
}

beforeEach(async () => {
  resetDb();
  process.env.MFA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  passwordHash ??= await bcrypt.hash(PASSWORD, 4);
});

describe('authenticate — mot de passe et limitation', () => {
  it('connecte avec le bon mot de passe et ne renvoie ni hash ni secret', async () => {
    await addUser();
    const user = await authenticate({ email: 'RSSI@exemple.fr', password: PASSWORD }, '1.1.1.1');
    expect(user).toEqual({ id: 'u1', email: 'rssi@exemple.fr', name: 'RSSI', role: 'admin', organizationId: null });
  });

  it('même message pour un compte inexistant et un mauvais mot de passe', async () => {
    await addUser();
    await expect(authenticate({ email: 'rssi@exemple.fr', password: 'faux' }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.invalid);
    await expect(authenticate({ email: 'inconnu@exemple.fr', password: 'faux' }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.invalid);
  });

  it('bloque le compte après 5 échecs, même avec le bon mot de passe ensuite', async () => {
    await addUser();
    for (let i = 0; i < 5; i++) {
      await expect(authenticate({ email: 'rssi@exemple.fr', password: 'faux' }, `10.0.0.${i}`)).rejects.toThrow();
    }
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD }, '10.0.0.99')).rejects.toThrow(AUTH_ERRORS.locked);
  });

  it('bloque aussi un e-mail inexistant (pas de révélation d\'existence)', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(authenticate({ email: 'inconnu@exemple.fr', password: 'x' }, `10.0.1.${i}`)).rejects.toThrow(AUTH_ERRORS.invalid);
    }
    await expect(authenticate({ email: 'inconnu@exemple.fr', password: 'x' }, '10.0.1.99')).rejects.toThrow(AUTH_ERRORS.locked);
  });

  it('bloque une IP qui essaie beaucoup de comptes', async () => {
    for (let i = 0; i < 30; i++) {
      await expect(authenticate({ email: `c${i}@exemple.fr`, password: 'x' }, '6.6.6.6')).rejects.toThrow(AUTH_ERRORS.invalid);
    }
    await addUser();
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD }, '6.6.6.6')).rejects.toThrow(AUTH_ERRORS.locked);
  }, 30_000); // 30 comparaisons bcrypt (coût 12) pour des comptes inexistants

  it('un succès remet le compteur e-mail à zéro', async () => {
    await addUser();
    for (let i = 0; i < 4; i++) {
      await expect(authenticate({ email: 'rssi@exemple.fr', password: 'faux' }, '1.1.1.1')).rejects.toThrow();
    }
    await authenticate({ email: 'rssi@exemple.fr', password: PASSWORD }, '1.1.1.1');
    expect(tables.loginAttempt.find((r) => r.key === 'email:rssi@exemple.fr')).toBeUndefined();
  });
});

describe('authenticate — double authentification', () => {
  const secret = generateTotpSecret();
  const currentCode = () => hotp(base32Decode(secret), timeStep());

  it('demande le code sans compter d\'échec quand le mot de passe est bon', async () => {
    await addUser({ mfaEnabled: true, mfaSecret: seal(secret) });
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.mfaRequired);
    expect(tables.loginAttempt).toHaveLength(0);
  });

  it('ne demande jamais le code si le mot de passe est faux', async () => {
    await addUser({ mfaEnabled: true, mfaSecret: seal(secret) });
    await expect(authenticate({ email: 'rssi@exemple.fr', password: 'faux' }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.invalid);
  });

  it('accepte le bon code puis refuse son rejeu', async () => {
    await addUser({ mfaEnabled: true, mfaSecret: seal(secret) });
    const code = currentCode();
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD, totp: code }, '1.1.1.1')).resolves.toMatchObject({ id: 'u1' });
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD, totp: code }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.mfaInvalid);
  });

  it('refuse un mauvais code et le compte comme un échec', async () => {
    await addUser({ mfaEnabled: true, mfaSecret: seal(secret) });
    const wrong = currentCode() === '000000' ? '111111' : '000000';
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD, totp: wrong }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.mfaInvalid);
    expect(tables.loginAttempt.find((r) => r.key === 'email:rssi@exemple.fr')?.count).toBe(1);
  });

  it('accepte un code de secours une seule fois', async () => {
    const { codes, hashes } = generateRecoveryCodes();
    await addUser({ mfaEnabled: true, mfaSecret: seal(secret), mfaRecoveryCodes: JSON.stringify(hashes) });
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD, totp: codes[0] }, '1.1.1.1')).resolves.toMatchObject({ id: 'u1' });
    await expect(authenticate({ email: 'rssi@exemple.fr', password: PASSWORD, totp: codes[0] }, '1.1.1.1')).rejects.toThrow(AUTH_ERRORS.mfaInvalid);
    expect(JSON.parse(tables.user[0].mfaRecoveryCodes)).toHaveLength(9);
  });
});
