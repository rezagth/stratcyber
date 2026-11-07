// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { base32Decode, base32Encode, hotp, otpauthUri, verifyTotp } from '@/lib/auth/totp';
import { consumeRecoveryCode, generateRecoveryCodes } from '@/lib/auth/recovery-codes';

// Secret de référence des RFC 4226 / 6238 : ASCII « 12345678901234567890 »
const RFC_SECRET = Buffer.from('12345678901234567890');
const RFC_SECRET_B32 = base32Encode(RFC_SECRET);

describe('TOTP (RFC 6238)', () => {
  it('base32 aller-retour', () => {
    expect(RFC_SECRET_B32).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(base32Decode(RFC_SECRET_B32).equals(RFC_SECRET)).toBe(true);
  });

  it('vecteurs HOTP de la RFC 4226 (annexe D)', () => {
    const expected = ['755224', '287082', '359152', '969429', '338314', '254676', '287922', '162583', '399871', '520489'];
    expected.forEach((code, counter) => expect(hotp(RFC_SECRET, counter)).toBe(code));
  });

  it('vecteurs TOTP de la RFC 6238 (SHA-1, 8 chiffres)', () => {
    expect(hotp(RFC_SECRET, Math.floor(59 / 30), 8)).toBe('94287082');
    expect(hotp(RFC_SECRET, Math.floor(1111111109 / 30), 8)).toBe('07081804');
    expect(hotp(RFC_SECRET, Math.floor(2000000000 / 30), 8)).toBe('69279037');
  });

  it('accepte le code courant et ±1 pas, refuse au-delà', () => {
    const now = 1_700_000_000_000;
    const step = Math.floor(now / 30000);
    expect(verifyTotp(RFC_SECRET_B32, hotp(RFC_SECRET, step), { nowMs: now })).toBe(step);
    expect(verifyTotp(RFC_SECRET_B32, hotp(RFC_SECRET, step - 1), { nowMs: now })).toBe(step - 1);
    expect(verifyTotp(RFC_SECRET_B32, hotp(RFC_SECRET, step + 2), { nowMs: now })).toBeNull();
  });

  it('refuse le rejeu d\'un code déjà utilisé', () => {
    const now = 1_700_000_000_000;
    const step = Math.floor(now / 30000);
    expect(verifyTotp(RFC_SECRET_B32, hotp(RFC_SECRET, step), { nowMs: now, lastUsedStep: step })).toBeNull();
  });

  it('refuse les formats invalides', () => {
    expect(verifyTotp(RFC_SECRET_B32, 'abcdef')).toBeNull();
    expect(verifyTotp(RFC_SECRET_B32, '12345')).toBeNull();
  });

  it('URI otpauth avec émetteur InfraCyb', () => {
    const uri = otpauthUri('ABC', 'a@exemple.fr');
    expect(uri.startsWith('otpauth://totp/InfraCyb%3Aa%40exemple.fr?')).toBe(true);
    expect(uri).toContain('secret=ABC');
  });
});

describe('codes de secours', () => {
  it('10 codes uniques, chacun utilisable une seule fois', () => {
    const { codes, hashes } = generateRecoveryCodes();
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    const remaining = consumeRecoveryCode(JSON.stringify(hashes), codes[3].toLowerCase());
    expect(remaining).toHaveLength(9);
    expect(consumeRecoveryCode(JSON.stringify(remaining), codes[3])).toBeNull();
  });

  it('aucune empreinte stockée ne contient le code en clair', () => {
    const { codes, hashes } = generateRecoveryCodes();
    expect(hashes.join('')).not.toContain(codes[0].replace('-', ''));
  });
});
