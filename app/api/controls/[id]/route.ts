import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseControlFields, CONTROL_SELECT, withParsedFrameworks } from '@/lib/api/control-fields';

/** Met à jour un contrôle : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.control.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Contrôle non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseControlFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const control = await prisma.control.update({ where: { id }, data: parsed.data, select: CONTROL_SELECT });
    await logActivity(user, { action: 'control.update', targetType: 'control', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(withParsedFrameworks(control));
  },
  { roles: ['admin'] }
);

/** Supprime un contrôle (et ses preuves, en cascade) : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.control.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Contrôle non trouvé', 404);

    await prisma.evidence.deleteMany({ where: { controlId: id } });
    await prisma.control.deleteMany({ where: { id } });
    await logActivity(user, { action: 'control.delete', targetType: 'control', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
