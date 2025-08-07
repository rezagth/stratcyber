import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const audits = await prisma.audit.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        responses: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    if (audits.length === 0) {
      return NextResponse.json({ actions: [], milestones: [], quarters: [] });
    }

    const latestAudit = audits[0];

    // TODO: Implement logic to generate actions, milestones, and quarters from audit responses.
    const actions = [];
    const milestones = [];
    const quarters = [];

    return NextResponse.json({ actions, milestones, quarters });

  } catch (error) {
    console.error('Erreur lors de la récupération de la roadmap:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la roadmap' },
      { status: 500 }
    );
  }
}

