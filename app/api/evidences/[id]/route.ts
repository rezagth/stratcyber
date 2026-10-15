import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseEvidenceFields, EVIDENCE_SELECT } from '@/lib/api/evidence-fields';

/** Met à jour une preuve : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.evidence.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Preuve non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseEvidenceFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const evidence = await prisma.evidence.update({ where: { id }, data: parsed.data, select: EVIDENCE_SELECT });
    await logActivity(user, { action: 'evidence.update', targetType: 'evidence', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(evidence);
  },
  { roles: ['admin'] }
);

/** Supprime une preuve : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.evidence.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Preuve non trouvée', 404);

    await prisma.evidence.deleteMany({ where: { id } });
    await logActivity(user, { action: 'evidence.delete', targetType: 'evidence', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
