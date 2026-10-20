import { prisma } from '@/lib/db';
import { getEmailProvider } from '@/lib/email/get-provider';
import type { EmailMessage } from '@/lib/email/provider';

/** Un envoi 'pending' plus vieux que ça est considéré comme planté : il est rejoué. */
export const PENDING_TIMEOUT_MS = 60 * 60 * 1000;
/** Au-delà, un envoi qui échoue toujours est abandonné (reste 'failed', plus rejoué). */
export const MAX_ATTEMPTS = 5;

export type SendOnceInput = EmailMessage & {
  /** Clé d'idempotence : un seul envoi réussi par clé (voir lib/email/keys.ts). */
  key: string;
  kind: string;
  organizationId?: string | null;
};

export type SendOnceResult =
  | { status: 'sent'; simulated: boolean }
  | { status: 'skipped'; reason: 'already_sent' | 'in_progress' | 'max_attempts' }
  | { status: 'failed' };

type Claim = { claimed: true; id: string } | { claimed: false; reason: 'already_sent' | 'in_progress' | 'max_attempts' };

/**
 * Réserve l'envoi. Le verrou consultatif de transaction (pg_advisory_xact_lock) sérialise les
 * exécutions concurrentes sur une même clé ; il est relâché au COMMIT/ROLLBACK, donc compatible avec
 * un pooler en mode transaction. L'unicité de `key` est le second filet : si deux transactions passaient
 * quand même, la seconde insertion échouerait au lieu de produire un doublon.
 * La transaction est courte : l'envoi lui-même se fait APRÈS le commit.
 */
async function claim(input: SendOnceInput, simulated: boolean, now: Date): Promise<Claim> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${input.key}, 0))`;
    const existing = await tx.emailLog.findUnique({ where: { key: input.key } });

    if (!existing) {
      const created = await tx.emailLog.create({
        data: {
          key: input.key,
          kind: input.kind,
          organizationId: input.organizationId ?? null,
          recipient: input.to,
          subject: input.subject,
          status: 'pending',
          simulated,
          attempts: 1,
        },
      });
      return { claimed: true, id: created.id } as const;
    }

    if (existing.status === 'sent') return { claimed: false, reason: 'already_sent' } as const;
    if (existing.status === 'pending' && now.getTime() - existing.updatedAt.getTime() < PENDING_TIMEOUT_MS) {
      return { claimed: false, reason: 'in_progress' } as const;
    }
    if (existing.attempts >= MAX_ATTEMPTS) return { claimed: false, reason: 'max_attempts' } as const;

    // 'failed', ou 'pending' resté trop longtemps (plantage) : on rejoue.
    await tx.emailLog.update({
      where: { id: existing.id },
      data: { status: 'pending', attempts: existing.attempts + 1, error: null, recipient: input.to, subject: input.subject, simulated },
    });
    return { claimed: true, id: existing.id } as const;
  });
}

/** Envoie un e-mail au plus une fois par clé, et trace chaque tentative dans EmailLog. Ne lève pas pour un échec d'envoi. */
export async function sendEmailOnce(input: SendOnceInput, now: Date = new Date()): Promise<SendOnceResult> {
  const provider = getEmailProvider();
  const claimed = await claim(input, provider.simulated, now);
  if (!claimed.claimed) return { status: 'skipped', reason: claimed.reason };

  try {
    const result = await provider.send({ to: input.to, subject: input.subject, text: input.text, html: input.html });
    await prisma.emailLog.update({
      where: { id: claimed.id },
      data: { status: 'sent', sentAt: new Date(), providerId: result.id ?? null, error: null },
    });
    return { status: 'sent', simulated: provider.simulated };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'erreur inconnue';
    await prisma.emailLog.update({
      where: { id: claimed.id },
      data: { status: 'failed', error: message.slice(0, 300) },
    });
    return { status: 'failed' };
  }
}
