import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseVulnerabilityFields, VULNERABILITY_SELECT } from '@/lib/api/vulnerability-fields';

/** Vulnérabilités d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const vulnerabilities = await prisma.clientVulnerability.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: VULNERABILITY_SELECT,
    });
    return NextResponse.json(vulnerabilities);
  },
  { roles: ['admin'] }
);

/** Déclare une vulnérabilité pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseVulnerabilityFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    if (typeof parsed.data.actionPlanItemId === 'string') {
      const item = await prisma.actionPlanItem.findFirst({ where: { id: parsed.data.actionPlanItemId, organizationId }, select: { id: true } });
      if (!item) return jsonError('Action liée introuvable pour ce client', 400);
    }

    const vulnerability = await prisma.clientVulnerability.create({
      data: { ...parsed.data, organizationId } as Prisma.ClientVulnerabilityUncheckedCreateInput,
      select: VULNERABILITY_SELECT,
    });
    await logActivity(user, { action: 'vulnerability.create', targetType: 'vulnerability', targetId: vulnerability.id, organizationId });
    return NextResponse.json(vulnerability, { status: 201 });
  },
  { roles: ['admin'] }
);
