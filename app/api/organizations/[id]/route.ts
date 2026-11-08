import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseOrganizationProfile } from '@/lib/api/organization-profile';

const PROFILE_SELECT = {
  id: true, name: true, sector: true, size: true, headcount: true, annualRevenue: true,
  missionScope: true,
  nis2Applicability: true, nis2Note: true,
  rgpdApplicability: true, rgpdNote: true,
  iso27001Status: true, iso27001Note: true,
  applicabilityAssessedAt: true,
  createdAt: true, updatedAt: true,
};

/** Dossier client complet (profil) : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const organization = await prisma.organization.findFirst({ where: { id }, select: PROFILE_SELECT });
    if (!organization) return jsonError('Client non trouvé', 404);
    return NextResponse.json(organization);
  },
  { roles: ['admin'] }
);

/** Met à jour le profil d'un client (module A) : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.organization.findFirst({ where: { id }, select: { id: true } });
    if (!existing) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseOrganizationProfile(body, { requireName: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const organization = await prisma.organization.update({ where: { id }, data: parsed.data, select: PROFILE_SELECT });
    await logActivity(user, {
      action: 'organization.update',
      targetType: 'organization',
      targetId: id,
      organizationId: id,
      metadata: { fields: Object.keys(parsed.data).join(',') },
    });
    return NextResponse.json(organization);
  },
  { roles: ['admin'] }
);

/**
 * Supprime définitivement un client et toutes ses données (plan d'action, notes, risques, incidents,
 * contrôles, politiques, audits...). Administrateur uniquement. Irréversible : l'appelant doit renvoyer
 * le nom exact du client dans `confirmName`, pour éviter qu'une suppression parte par erreur.
 */
export const DELETE = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.organization.findFirst({ where: { id }, select: { id: true, name: true } });
    if (!existing) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    if (!body || typeof body.confirmName !== 'string' || body.confirmName !== existing.name) {
      return jsonError('Confirmation requise : renvoyez le nom exact du client dans « confirmName ».', 400);
    }

    // Les audits ne sont que détachés (SetNull) par la suppression du client : on les supprime avec lui.
    await prisma.$transaction([
      prisma.audit.deleteMany({ where: { organizationId: id } }),
      prisma.organization.delete({ where: { id } }),
    ]);
    await logActivity(user, {
      action: 'organization.delete',
      targetType: 'organization',
      targetId: id,
      organizationId: null,
    });
    return NextResponse.json({ deleted: true });
  },
  { roles: ['admin'] }
);
