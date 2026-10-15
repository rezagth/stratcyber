import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth } from '@/lib/auth/api-auth';

/** Comptes client d'une organisation (module L) : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const users = await prisma.user.findMany({
      where: { organizationId, role: 'client' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    return NextResponse.json(users);
  },
  { roles: ['admin'] }
);
