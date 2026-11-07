import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * TOTP (RFC 6238, HMAC-SHA1, 6 chiffres, pas de 30 s) — compatible avec Google Authenticator,
 * Microsoft Authenticator, Bitwarden, 1Password, etc.
 * Implémentation volontairement courte et testée sur les vecteurs officiels de la RFC
 * (tests/auth/totp.test.ts) pour ne pas ajouter de dépendance.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export const TOTP_PERIOD_SECONDS = 30;
export const TOTP_DIGITS = 6;

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Secret base32 invalide');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** Secret de 160 bits (taille recommandée par la RFC 4226), encodé en base32. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Code HOTP pour un compteur donné (RFC 4226). */
export function hotp(secret: Buffer, counter: number, digits = TOTP_DIGITS): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function timeStep(nowMs: number = Date.now()): number {
  return Math.floor(nowMs / 1000 / TOTP_PERIOD_SECONDS);
}

/**
 * Vérifie un code saisi. Tolère un pas avant/après (dérive d'horloge de ±30 s).
 * Renvoie le pas utilisé (à mémoriser pour refuser le rejeu du même code), ou null.
 */
export function verifyTotp(
  secretBase32: string,
  code: string,
  options: { nowMs?: number; window?: number; lastUsedStep?: number | null } = {}
): number | null {
  const normalized = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(normalized)) return null;
  const secret = base32Decode(secretBase32);
  const current = timeStep(options.nowMs);
  const window = options.window ?? 1;
  for (let delta = -window; delta <= window; delta++) {
    const step = current + delta;
    if (options.lastUsedStep != null && step <= options.lastUsedStep) continue; // rejeu refusé
    const expected = Buffer.from(hotp(secret, step));
    const given = Buffer.from(normalized);
    if (expected.length === given.length && timingSafeEqual(expected, given)) return step;
  }
  return null;
}

/** URI à scanner (ou à copier) dans l'application d'authentification. */
export function otpauthUri(secretBase32: string, accountEmail: string, issuer = 'InfraCyb'): string {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
