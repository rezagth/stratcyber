import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { checklistFor } from '@/lib/incidents/checklist-template';

const ITEM_SELECT = { id: true, incidentId: true, templateKey: true, phase: true, label: true, position: true, done: true, doneAt: true };

/**
 * Checklist de réponse à incident. Créée à la première lecture depuis le modèle (idempotent : on
 * n'ajoute que les éléments manquants, par `templateKey`). Si des données personnelles sont
 * déclarées plus tard, les éléments RGPD apparaissent à la lecture suivante.
 */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const incident = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true, organizationId: true, personalDataInvolved: true } });
    if (!incident) return jsonError('Incident non trouvé', 404);

    const existing = await prisma.incidentChecklistItem.findMany({ where: { incidentId: id }, select: { templateKey: true } });
    const have = new Set(existing.map((item: { templateKey: string }) => item.templateKey));
    const wanted = checklistFor(incident.personalDataInvolved);
    const missing = wanted.map((item, index) => ({ item, index })).filter(({ item }) => !have.has(item.key));
    if (missing.length > 0) {
      await prisma.incidentChecklistItem.createMany({
        data: missing.map(({ item, index }) => ({
          incidentId: id, organizationId: incident.organizationId,
          templateKey: item.key, phase: item.phase, label: item.label, position: index, done: false,
        })),
        skipDuplicates: true,
      });
    }

    const items = await prisma.incidentChecklistItem.findMany({ where: { incidentId: id }, orderBy: { position: 'asc' }, select: ITEM_SELECT });
    return NextResponse.json(items);
  },
  { roles: ['admin'] }
);

/** Coche ou décoche un élément ; la coche est tracée dans le journal de crise. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const incident = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!incident) return jsonError('Incident non trouvé', 404);

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (typeof body?.itemId !== 'string' || typeof body?.done !== 'boolean') return jsonError('itemId et done (booléen) requis', 400);

    // Filtré sur l'incident : un élément d'un autre incident n'est jamais modifiable ici.
    const item = await prisma.incidentChecklistItem.findFirst({ where: { id: body.itemId, incidentId: id }, select: { id: true, label: true, done: true } });
    if (!item) return jsonError('Élément non trouvé', 404);

    const now = new Date();
    const updated = await prisma.incidentChecklistItem.update({
      where: { id: item.id },
      data: { done: body.done, doneAt: body.done ? now : null, doneById: body.done ? user.id : null },
      select: ITEM_SELECT,
    });
    if (Boolean(item.done) !== body.done) {
      await prisma.incidentLogEntry.create({
        data: {
          incidentId: id, organizationId: incident.organizationId, kind: 'action',
          message: `${body.done ? 'Fait' : 'Remis en attente'} : ${item.label}`,
          authorId: user.id, authorName: user.name ?? user.email, occurredAt: now,
        },
      });
    }
    await logActivity(user, { action: 'incident.checklist', targetType: 'incident', targetId: id, organizationId: incident.organizationId, metadata: { done: body.done } });
    return NextResponse.json(updated);
  },
  { roles: ['admin'] }
);
