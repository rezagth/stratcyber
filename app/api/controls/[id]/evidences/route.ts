import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseEvidenceFields, EVIDENCE_SELECT } from '@/lib/api/evidence-fields';

/** Ajoute une preuve à un contrôle : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: controlId } = await params;
    const control = await prisma.control.findFirst({ where: { id: controlId }, select: { id: true, organizationId: true } });
    if (!control) return jsonError('Contrôle non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseEvidenceFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const evidence = await prisma.evidence.create({
      // `isCreate: true` garantit que `parsed.data.label` et `.evidenceDate` sont présents.
      data: { ...parsed.data, controlId, organizationId: control.organizationId } as Prisma.EvidenceUncheckedCreateInput,
      select: EVIDENCE_SELECT,
    });
    await logActivity(user, { action: 'evidence.create', targetType: 'evidence', targetId: evidence.id, organizationId: control.organizationId });
    return NextResponse.json(evidence, { status: 201 });
  },
  { roles: ['admin'] }
);
