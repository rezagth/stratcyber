import { prisma } from '@/lib/db';
import type { AuthedUser } from '@/lib/auth/api-auth';

type LogInput = {
  action: string; // ex. 'organization.create', 'audit.share', 'client.audit.view'
  targetType?: string;
  targetId?: string;
  organizationId?: string | null;
  /** Données non sensibles uniquement (identifiants, indicateurs). Jamais de mot de passe, de contenu d'audit ni de secret. */
  metadata?: Record<string, string | number | boolean | null>;
};

/**
 * Écrit une ligne dans le journal des actions. N'interrompt JAMAIS la requête : si l'écriture échoue,
 * l'erreur est consignée (sans donnée sensible) et l'action métier continue.
 */
export async function logActivity(actor: Pick<AuthedUser, 'id' | 'role'> | null, input: LogInput) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: actor?.id ?? null,
        actorRole: actor?.role ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        organizationId: input.organizationId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (error) {
    console.error('[activity-log] écriture impossible :', error instanceof Error ? error.message : 'erreur inconnue');
  }
}
