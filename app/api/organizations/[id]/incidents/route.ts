import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseIncidentFields, INCIDENT_SELECT } from '@/lib/api/incident-fields';

/** Registre d'incidents d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const incidents = await prisma.incidentCase.findMany({
      where: { organizationId },
      orderBy: { detectedAt: 'desc' },
      select: INCIDENT_SELECT,
    });
    return NextResponse.json(incidents);
  },
  { roles: ['admin'] }
);

/** Déclare un incident pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseIncidentFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const incident = await prisma.incidentCase.create({
      data: { ...parsed.data, organizationId } as Prisma.IncidentCaseUncheckedCreateInput,
      select: INCIDENT_SELECT,
    });
    await logActivity(user, { action: 'incident.create', targetType: 'incident', targetId: incident.id, organizationId });
    return NextResponse.json(incident, { status: 201 });
  },
  { roles: ['admin'] }
);
