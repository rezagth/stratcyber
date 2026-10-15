import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseOrganizationProfile } from '@/lib/api/organization-profile';

/** Liste des clients (organisations) : administrateur uniquement. */
export const GET = withApiAuth(
  async () => {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, sector: true, size: true, createdAt: true },
    });
    return NextResponse.json(organizations);
  },
  { roles: ['admin'] }
);

/** Création d'un client (organisation) : administrateur uniquement. */
export const POST = withApiAuth(
  async (request, { user }) => {
    const body = await request.json().catch(() => null);
    const parsed = parseOrganizationProfile(body, { requireName: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const organization = await prisma.organization.create({
      // `requireName: true` garantit que `parsed.data.name` est présent (sinon `parseOrganizationProfile` renvoie `error`).
      data: parsed.data as Prisma.OrganizationUncheckedCreateInput,
      select: { id: true, name: true, sector: true, size: true, createdAt: true },
    });
    await logActivity(user, { action: 'organization.create', targetType: 'organization', targetId: organization.id, organizationId: organization.id });
    return NextResponse.json(organization, { status: 201 });
  },
  { roles: ['admin'] }
);
