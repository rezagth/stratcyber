import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { base32Encode } from './totp';

/**
 * Codes de secours MFA : 10 codes à usage unique, affichés une seule fois.
 * Seule leur empreinte SHA-256 est stockée (les codes ont 50 bits d'aléa : un sel est inutile).
 */
export const RECOVERY_CODE_COUNT = 10;

function normalize(code: string): string {
  return code.toUpperCase().replace(/[^A-Z2-7]/g, '');
}

function hash(code: string): string {
  return createHash('sha256').update(normalize(code)).digest('hex');
}

export function generateRecoveryCodes(): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const raw = base32Encode(randomBytes(7)).slice(0, 10);
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
  return { codes, hashes: codes.map(hash) };
}

/** Renvoie la liste d'empreintes restante si le code est valide (le code utilisé en est retiré), sinon null. */
export function consumeRecoveryCode(storedJson: string | null | undefined, code: string): string[] | null {
  if (!storedJson || normalize(code).length !== 10) return null;
  let hashes: unknown;
  try {
    hashes = JSON.parse(storedJson);
  } catch {
    return null;
  }
  if (!Array.isArray(hashes)) return null;
  const candidate = Buffer.from(hash(code), 'hex');
  const index = hashes.findIndex(
    (h) => typeof h === 'string' && h.length === 64 && timingSafeEqual(Buffer.from(h, 'hex'), candidate)
  );
  if (index === -1) return null;
  return hashes.filter((_, i) => i !== index) as string[];
}
