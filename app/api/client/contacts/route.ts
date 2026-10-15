import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { CONTACT_SELECT } from '@/lib/api/contact-fields';

/** Contacts de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      select: CONTACT_SELECT,
    });
    return NextResponse.json(contacts);
  },
  { roles: ['client'] }
);
