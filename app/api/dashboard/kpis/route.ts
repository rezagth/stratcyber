import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDashboardKPIs } from '@/lib/dashboard/data';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: 'ID utilisateur non valide' },
        { status: 400 }
      );
    }

    const kpis = await getDashboardKPIs(userId);
    
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Erreur lors de la récupération des KPIs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des KPIs' },
      { status: 500 }
    );
  }
}
