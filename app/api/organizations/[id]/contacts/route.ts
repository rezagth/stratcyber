import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseContactFields, CONTACT_SELECT } from '@/lib/api/contact-fields';

/** Contacts d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const contacts = await prisma.contact.findMany({
      where: { organizationId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: CONTACT_SELECT,
    });
    return NextResponse.json(contacts);
  },
  { roles: ['admin'] }
);

/** Crée un contact pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseContactFields(body, { requireName: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    if (parsed.data.isPrimary === true) {
      await prisma.contact.updateMany({ where: { organizationId, isPrimary: true }, data: { isPrimary: false } });
    }

    const contact = await prisma.contact.create({
      // `requireName: true` garantit que `parsed.data.name` est présent.
      data: { ...parsed.data, organizationId } as Prisma.ContactUncheckedCreateInput,
      select: CONTACT_SELECT,
    });
    await logActivity(user, { action: 'contact.create', targetType: 'contact', targetId: contact.id, organizationId });
    return NextResponse.json(contact, { status: 201 });
  },
  { roles: ['admin'] }
);
