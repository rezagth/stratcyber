import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { buildActionPlanFromAudit } from '@/lib/audit/action-plan-generator';

/**
 * Génère le plan d'action exécutable (module D) à partir des réponses d'un audit.
 * Réservé à l'administrateur. L'audit doit être rattaché à un client (organizationId) :
 * le plan d'action exécutable est un objet du cockpit client.
 * Idempotent : une action déjà générée (même titre + catégorie) pour ce client n'est
 * jamais recréée, pour ne pas écraser l'avancement déjà saisi par le client.
 */
export const POST = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;

    const audit = await prisma.audit.findFirst({
      where: { id },
      select: { id: true, organizationId: true, createdAt: true, responses: { select: { question: true, answer: true, score: true } } },
    });
    if (!audit) return jsonError('Audit non trouvé', 404);
    if (!audit.organizationId) {
      return jsonError("Cet audit n'est rattaché à aucun client : associez-le d'abord à un client (partage) avant de générer un plan d'action.", 400);
    }

    const candidates = buildActionPlanFromAudit(audit);
    if (candidates.length === 0) {
      return NextResponse.json({ created: 0, skipped: 0, total: 0 });
    }

    const existing = await prisma.actionPlanItem.findMany({
      where: { organizationId: audit.organizationId },
      select: { title: true, category: true },
    });
    const existingKeys = new Set(existing.map(e => `${e.category}::${e.title}`));
    const toCreate = candidates.filter(c => !existingKeys.has(`${c.category}::${c.title}`));

    if (toCreate.length > 0) {
      await prisma.actionPlanItem.createMany({ data: toCreate });
    }

    await logActivity(user, {
      action: 'action-plan.generate',
      targetType: 'audit',
      targetId: audit.id,
      organizationId: audit.organizationId,
      metadata: { created: toCreate.length, skipped: candidates.length - toCreate.length },
    });

    return NextResponse.json({
      created: toCreate.length,
      skipped: candidates.length - toCreate.length,
      total: candidates.length,
    });
  },
  { roles: ['admin'] }
);
