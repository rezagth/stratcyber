import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseVulnerabilityFields, VULNERABILITY_SELECT } from '@/lib/api/vulnerability-fields';

/** Met à jour une vulnérabilité : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.clientVulnerability.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Vulnérabilité non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseVulnerabilityFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    if (typeof parsed.data.actionPlanItemId === 'string') {
      const item = await prisma.actionPlanItem.findFirst({ where: { id: parsed.data.actionPlanItemId, organizationId: existing.organizationId }, select: { id: true } });
      if (!item) return jsonError('Action liée introuvable pour ce client', 400);
    }

    const vulnerability = await prisma.clientVulnerability.update({ where: { id }, data: parsed.data, select: VULNERABILITY_SELECT });
    await logActivity(user, { action: 'vulnerability.update', targetType: 'vulnerability', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(vulnerability);
  },
  { roles: ['admin'] }
);

/** Supprime une vulnérabilité : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.clientVulnerability.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Vulnérabilité non trouvée', 404);

    await prisma.clientVulnerability.deleteMany({ where: { id } });
    await logActivity(user, { action: 'vulnerability.delete', targetType: 'vulnerability', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
