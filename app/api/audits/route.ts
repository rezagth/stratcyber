import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
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
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        responses: true,
        report: true
      }
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error('Erreur lors de la récupération des audits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des audits' },
      { status: 500 }
    );
  }
}