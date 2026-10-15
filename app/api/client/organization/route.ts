import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';

/**
 * Profil du client connecté (lecture seule) : secteur, effectif, CA, périmètre de
 * mission, test d'applicabilité réglementaire. N'inclut JAMAIS l'historique des
 * décisions ni les notes internes (voir lib/auth/access.ts et le schéma Prisma).
 *
 * Note : l'organisation elle-même est identifiée par `id`, pas par `organizationId`
 * (ce dernier champ existe sur les enregistrements qui APPARTIENNENT à une organisation,
 * pas sur l'organisation elle-même) — `organizationScopeWhere` ne s'applique donc pas ici.
 */
export const GET = withApiAuth(
  async (_request, { user }) => {
    if (user.role !== 'client' || !user.organizationId) return jsonError('Accès interdit', 403);

    const organization = await prisma.organization.findFirst({
      where: { id: user.organizationId },
      select: {
        id: true, name: true, sector: true, size: true, headcount: true, annualRevenue: true,
        missionScope: true,
        nis2Applicability: true, nis2Note: true,
        rgpdApplicability: true, rgpdNote: true,
        iso27001Status: true, iso27001Note: true,
        applicabilityAssessedAt: true,
      },
    });
    if (!organization) return jsonError('Client non trouvé', 404);
    return NextResponse.json(organization);
  },
  { roles: ['client'] }
);
