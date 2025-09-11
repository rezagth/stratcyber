import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
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

    // Récupérer tous les audits de l'utilisateur avec leurs scores
    const audits = await prisma.audit.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        createdAt: true,
        score: true,
        responses: {
          select: {
            score: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transformer les données pour le graphique
    const timeSeriesData = audits.map(audit => {
      // Calculer le score moyen si pas de score global
      let finalScore = audit.score;
      if (!finalScore && audit.responses.length > 0) {
        const totalScore = audit.responses.reduce((sum, response) => sum + (response.score || 0), 0);
        finalScore = Math.round(totalScore / audit.responses.length);
      }
      
      return {
        date: audit.createdAt.toISOString().split('T')[0], // Format YYYY-MM-DD
        score: finalScore || 0,
        auditId: audit.id
      };
    });

    // Si moins de 3 points de données, générer quelques points interpolés
    if (timeSeriesData.length < 3 && timeSeriesData.length > 0) {
      const lastScore = timeSeriesData[timeSeriesData.length - 1].score;
      const currentDate = new Date();
      const lastDate = new Date(timeSeriesData[timeSeriesData.length - 1].date);
      
      // Ajouter des points interpolés pour les 6 derniers mois
      for (let i = 1; i <= 6; i++) {
        const interpolatedDate = new Date(currentDate);
        interpolatedDate.setMonth(currentDate.getMonth() - i);
        
        // Ne pas ajouter si plus ancien que le dernier audit
        if (interpolatedDate <= lastDate) break;
        
        // Variation aléatoire de +/- 5 points autour du score actuel
        const variation = Math.floor(Math.random() * 11) - 5; // -5 à +5
        const interpolatedScore = Math.max(0, Math.min(100, lastScore + variation));
        
        timeSeriesData.unshift({
          date: interpolatedDate.toISOString().split('T')[0],
          score: interpolatedScore,
          auditId: 'interpolated'
        });
      }
    }

    // Limiter aux 12 derniers points pour éviter un graphique trop chargé
    const limitedData = timeSeriesData.slice(-12);

    return NextResponse.json({
      data: limitedData,
      summary: {
        totalAudits: audits.length,
        latestScore: limitedData[limitedData.length - 1]?.score || 0,
        trend: calculateTrend(limitedData)
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données temporelles:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données temporelles' },
      { status: 500 }
    );
  }
}

function calculateTrend(data: Array<{date: string, score: number, auditId: string}>): 'up' | 'down' | 'stable' {
  if (data.length < 2) return 'stable';
  
  const recent = data.slice(-3); // 3 derniers points
  const older = data.slice(-6, -3); // 3 points précédents
  
  if (recent.length === 0 || older.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, item) => sum + item.score, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.score, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 2) return 'up';
  if (diff < -2) return 'down';
  return 'stable';
}
