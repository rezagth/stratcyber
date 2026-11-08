import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

const LOG_KINDS = ['decision', 'action', 'communication', 'note'] as const;
const LOG_SELECT = { id: true, incidentId: true, kind: true, message: true, authorName: true, occurredAt: true, createdAt: true };

/** Journal de crise d'un incident, du plus ancien au plus récent : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const incident = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true } });
    if (!incident) return jsonError('Incident non trouvé', 404);
    const entries = await prisma.incidentLogEntry.findMany({
      where: { incidentId: id },
      orderBy: { occurredAt: 'asc' },
      select: LOG_SELECT,
    });
    return NextResponse.json(entries);
  },
  { roles: ['admin'] }
);

/**
 * Ajoute une ligne au journal. Le journal est append-only : il n'existe volontairement aucune route
 * pour modifier ou supprimer une ligne. `occurredAt` peut être antérieur à la saisie (événement
 * constaté après coup) mais jamais dans le futur ; la date de saisie réelle (`createdAt`) est conservée.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const incident = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!incident) return jsonError('Incident non trouvé', 404);

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 2000) return jsonError('Message invalide (1 à 2000 caractères)', 400);

    const kind = body?.kind === undefined ? 'note' : body.kind;
    if (typeof kind !== 'string' || !(LOG_KINDS as readonly string[]).includes(kind)) {
      return jsonError(`Type invalide (valeurs possibles : ${LOG_KINDS.join(', ')})`, 400);
    }

    let occurredAt = new Date();
    if (body?.occurredAt !== undefined && body.occurredAt !== null) {
      const parsed = new Date(String(body.occurredAt));
      if (Number.isNaN(parsed.getTime())) return jsonError('Date invalide', 400);
      if (parsed.getTime() > Date.now() + 60_000) return jsonError("La date d'un événement ne peut pas être dans le futur", 400);
      occurredAt = parsed;
    }

    const entry = await prisma.incidentLogEntry.create({
      data: {
        incidentId: id,
        organizationId: incident.organizationId,
        kind,
        message,
        authorId: user.id,
        authorName: user.name ?? user.email,
        occurredAt,
      },
      select: LOG_SELECT,
    });
    await logActivity(user, { action: 'incident.log', targetType: 'incident', targetId: id, organizationId: incident.organizationId, metadata: { kind } });
    return NextResponse.json(entry, { status: 201 });
  },
  { roles: ['admin'] }
);
