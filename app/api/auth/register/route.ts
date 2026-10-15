import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Création d'un compte : réservée à l'administrateur (inscription publique fermée).
 * Les comptes clients (avec organizationId) sont créés ici, jamais en libre-service.
 * Aucune donnée personnelle ni mot de passe n'est écrit dans les logs.
 */
export const POST = withApiAuth(
  async (request, { user: actor }) => {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    const organizationId =
      typeof body?.organizationId === 'string' && body.organizationId ? body.organizationId : null;
    const name = typeof body?.name === 'string' && body.name.trim() ? body.name.trim() : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError('Email invalide', 400);
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return jsonError(`Mot de passe trop court (${MIN_PASSWORD_LENGTH} caractères minimum)`, 400);
    }

    // Compte client : rattaché à une organisation qui doit exister.
    if (organizationId) {
      const organization = await prisma.organization.findFirst({
        where: { id: organizationId },
        select: { id: true },
      });
      if (!organization) return jsonError('Client non trouvé', 404);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError('Cet email est déjà utilisé', 400);
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 12),
        name,
        role: organizationId ? 'client' : 'user',
        organizationId,
      },
      select: { id: true, email: true, name: true, role: true, organizationId: true, createdAt: true },
    });

    await logActivity(actor, { action: 'user.create', targetType: 'user', targetId: user.id, organizationId: user.organizationId, metadata: { role: user.role } });
    return NextResponse.json({ user }, { status: 201 });
  },
  { roles: ['admin'] }
);
