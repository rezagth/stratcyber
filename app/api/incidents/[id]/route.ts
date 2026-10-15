import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseIncidentFields, INCIDENT_SELECT } from '@/lib/api/incident-fields';

/** Met à jour un incident (statut, échéances de notification réellement envoyées...) : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Incident non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseIncidentFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const incident = await prisma.incidentCase.update({ where: { id }, data: parsed.data, select: INCIDENT_SELECT });
    await logActivity(user, { action: 'incident.update', targetType: 'incident', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(incident);
  },
  { roles: ['admin'] }
);

/** Supprime un incident : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.incidentCase.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Incident non trouvé', 404);

    await prisma.incidentCase.deleteMany({ where: { id } });
    await logActivity(user, { action: 'incident.delete', targetType: 'incident', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
