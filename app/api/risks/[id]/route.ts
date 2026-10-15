import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseRiskFields, RISK_SELECT } from '@/lib/api/risk-fields';

async function validateLinks(organizationId: string, data: Record<string, unknown>): Promise<string | null> {
  if (typeof data.actionPlanItemId === 'string') {
    const item = await prisma.actionPlanItem.findFirst({ where: { id: data.actionPlanItemId, organizationId }, select: { id: true } });
    if (!item) return 'Action liée introuvable pour ce client';
  }
  if (typeof data.controlId === 'string') {
    const control = await prisma.control.findFirst({ where: { id: data.controlId, organizationId }, select: { id: true } });
    if (!control) return 'Contrôle lié introuvable pour ce client';
  }
  return null;
}

/** Met à jour un risque : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.risk.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Risque non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseRiskFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const linkError = await validateLinks(existing.organizationId, parsed.data);
    if (linkError) return jsonError(linkError, 400);

    const risk = await prisma.risk.update({ where: { id }, data: parsed.data, select: RISK_SELECT });
    await logActivity(user, { action: 'risk.update', targetType: 'risk', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(risk);
  },
  { roles: ['admin'] }
);

/** Supprime un risque : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.risk.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Risque non trouvé', 404);

    await prisma.risk.deleteMany({ where: { id } });
    await logActivity(user, { action: 'risk.delete', targetType: 'risk', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
