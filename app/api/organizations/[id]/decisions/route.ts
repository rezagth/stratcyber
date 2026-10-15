import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { toNullableDate, toNullableString } from '@/lib/api/validators';

/**
 * Historique des décisions prises avec/pour ce client (ex. "report de la MFA au Q3").
 * Administrateur uniquement pour l'instant : pas de vue client (voir le bilan du module A).
 */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const decisions = await prisma.decisionLogEntry.findMany({
      where: { organizationId },
      orderBy: { decidedAt: 'desc' },
    });
    return NextResponse.json(decisions);
  },
  { roles: ['admin'] }
);

export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 200) return jsonError('Titre invalide', 400);

    const description = toNullableString(body?.description, 4000);
    if (description === undefined) return jsonError('Description invalide', 400);

    let decidedAt = new Date();
    if (body?.decidedAt != null) {
      const v = toNullableDate(body.decidedAt);
      if (v === undefined || v === null) return jsonError('Date de décision invalide', 400);
      decidedAt = v;
    }

    const decision = await prisma.decisionLogEntry.create({
      data: { organizationId, title, description, decidedAt },
    });
    await logActivity(user, { action: 'decision.create', targetType: 'decision', targetId: decision.id, organizationId });
    return NextResponse.json(decision, { status: 201 });
  },
  { roles: ['admin'] }
);
