import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseContactFields, CONTACT_SELECT } from '@/lib/api/contact-fields';

/** Met à jour un contact : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.contact.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Contact non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseContactFields(body, { requireName: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    if (parsed.data.isPrimary === true) {
      await prisma.contact.updateMany({
        where: { organizationId: existing.organizationId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const contact = await prisma.contact.update({ where: { id }, data: parsed.data, select: CONTACT_SELECT });
    await logActivity(user, { action: 'contact.update', targetType: 'contact', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(contact);
  },
  { roles: ['admin'] }
);

/** Supprime un contact : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.contact.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Contact non trouvé', 404);

    await prisma.contact.deleteMany({ where: { id } });
    await logActivity(user, { action: 'contact.delete', targetType: 'contact', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
