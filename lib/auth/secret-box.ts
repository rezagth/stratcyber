import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Chiffrement au repos des secrets MFA (AES-256-GCM).
 * Clé : variable d'environnement MFA_ENCRYPTION_KEY, 32 octets encodés en base64
 * (générer avec : `openssl rand -base64 32`). Jamais dans le dépôt ni dans Notion.
 * Sans clé valide, l'activation de la MFA est refusée plutôt que de stocker le secret en clair.
 */

const VERSION = 'v1';

export class MissingEncryptionKeyError extends Error {
  constructor() {
    super('MFA_ENCRYPTION_KEY absente ou invalide (32 octets en base64 attendus)');
  }
}

function getKey(): Buffer {
  const raw = process.env.MFA_ENCRYPTION_KEY;
  if (!raw) throw new MissingEncryptionKeyError();
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new MissingEncryptionKeyError();
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    getKey();
    return true;
  } catch {
    return false;
  }
}

export function seal(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join(':');
}

export function open(sealed: string): string {
  const [version, iv, tag, ciphertext] = sealed.split(':');
  if (version !== VERSION || !iv || !tag || !ciphertext) throw new Error('Secret chiffré illisible');
  const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}
