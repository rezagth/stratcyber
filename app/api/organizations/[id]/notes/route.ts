import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

/**
 * Notes internes sur un client : administrateur UNIQUEMENT. Ne jamais exposer ces notes
 * via une route /api/client/* — aucune route de ce type n'existe pour ce modèle, et
 * c'est volontaire (voir le schéma Prisma, modèle InternalNote).
 */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const notes = await prisma.internalNote.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(notes);
  },
  { roles: ['admin'] }
);

export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    if (!content || content.length > 4000) return jsonError('Note invalide', 400);

    const note = await prisma.internalNote.create({ data: { organizationId, content } });
    await logActivity(user, { action: 'internal-note.create', targetType: 'internal-note', targetId: note.id, organizationId });
    return NextResponse.json(note, { status: 201 });
  },
  { roles: ['admin'] }
);
