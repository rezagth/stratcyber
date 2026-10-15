import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

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
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 120) {
      return jsonError('Nom du client invalide (2 à 120 caractères)', 400);
    }
    const clean = (v: unknown) =>
      typeof v === 'string' && v.trim() ? v.trim().slice(0, 120) : null;

    const organization = await prisma.organization.create({
      data: { name, sector: clean(body?.sector), size: clean(body?.size) },
      select: { id: true, name: true, sector: true, size: true, createdAt: true },
    });
    await logActivity(user, { action: 'organization.create', targetType: 'organization', targetId: organization.id, organizationId: organization.id });
    return NextResponse.json(organization, { status: 201 });
  },
  { roles: ['admin'] }
);
