import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getMonthlyPerformanceScore } from '@/lib/dashboard/data';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const monthlyPerformance = await getMonthlyPerformanceScore(session.user.id);
    
    return NextResponse.json(monthlyPerformance);
  } catch (error) {
    console.error('Erreur lors de la récupération de la performance mensuelle:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la performance mensuelle' },
      { status: 500 }
    );
  }
}
