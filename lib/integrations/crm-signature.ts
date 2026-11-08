import { createHmac, timingSafeEqual } from 'crypto';

export const MAX_SKEW_SECONDS = 300;

/** Signature attendue : HMAC-SHA256 (hex) de « <horodatage>.<corps brut> » avec le secret partagé. */
export function signCrmPayload(secret: string, timestamp: string, rawBody: string): string {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

export function verifyCrmSignature(
  secret: string,
  timestamp: string | null,
  signature: string | null,
  rawBody: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!timestamp || !signature || !/^\d{9,12}$/.test(timestamp)) return false;
  if (Math.abs(nowSeconds - Number(timestamp)) > MAX_SKEW_SECONDS) return false;
  const expected = Buffer.from(signCrmPayload(secret, timestamp, rawBody));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
