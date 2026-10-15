import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseControlFields, CONTROL_SELECT, withParsedFrameworks } from '@/lib/api/control-fields';
import { EVIDENCE_SELECT } from '@/lib/api/evidence-fields';

/** Contrôles d'un client (coffre de preuves) : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const controls = await prisma.control.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: { ...CONTROL_SELECT, evidences: { orderBy: { evidenceDate: 'desc' }, select: EVIDENCE_SELECT } },
    });
    return NextResponse.json(controls.map(withParsedFrameworks));
  },
  { roles: ['admin'] }
);

/** Crée un contrôle pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseControlFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const control = await prisma.control.create({
      // `isCreate: true` garantit que `parsed.data.title` et `.frameworks` sont présents.
      data: { ...parsed.data, organizationId } as Prisma.ControlUncheckedCreateInput,
      select: CONTROL_SELECT,
    });
    await logActivity(user, { action: 'control.create', targetType: 'control', targetId: control.id, organizationId });
    return NextResponse.json(withParsedFrameworks(control), { status: 201 });
  },
  { roles: ['admin'] }
);
