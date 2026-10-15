import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseRiskFields, RISK_SELECT } from '@/lib/api/risk-fields';

/** Vérifie que l'action / le contrôle lié appartient bien à la même organisation (jamais une autre). */
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

/** Registre des risques d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const risks = await prisma.risk.findMany({
      where: { organizationId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: RISK_SELECT,
    });
    return NextResponse.json(risks);
  },
  { roles: ['admin'] }
);

/** Crée un risque pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseRiskFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const linkError = await validateLinks(organizationId, parsed.data);
    if (linkError) return jsonError(linkError, 400);

    const risk = await prisma.risk.create({
      data: { ...parsed.data, organizationId } as Prisma.RiskUncheckedCreateInput,
      select: RISK_SELECT,
    });
    await logActivity(user, { action: 'risk.create', targetType: 'risk', targetId: risk.id, organizationId });
    return NextResponse.json(risk, { status: 201 });
  },
  { roles: ['admin'] }
);
