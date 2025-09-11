import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { computeAuditResult, generateActionPlan } from '@/lib/audit/scoring';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Await params first (Next.js 15 requirement)
    const { id } = await params;
    console.log('🔍 API Actions - Audit ID:', id);

    // Récupérer l'audit avec les réponses
    const audit = await prisma.audit.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        responses: true
      }
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit non trouvé' },
        { status: 404 }
      );
    }

    console.log('🔍 API Actions - Nombre de réponses:', audit.responses.length);

    // Recalculer le résultat de l'audit à partir des réponses stockées
    const auditResult = computeAuditResult(
      audit.responses.map(r => ({
        questionId: r.question,
        answer: r.answer,
        score: r.score ?? 0,
      }))
    );

    // Générer le plan d'action avec la même logique que la page d'audit
    const answers = audit.responses.map(response => ({
      questionId: response.question,
      answer: response.answer,
      score: response.score !== null ? response.score : undefined
    }));
    
    const actionPlan = generateActionPlan(auditResult, answers);
    console.log('🔍 API Actions - Nombre d\'actions générées:', actionPlan.length);

    // Calculer les statistiques
    const criticalActions = actionPlan.filter(a => a.priority === 'Haute').length;
    const totalBudget = actionPlan.reduce((sum, a) => sum + (a.cost || 0), 0);

    // Format compatible avec le PDF et la roadmap
    const response = {
      actions: actionPlan.map(action => ({
        id: `action-${Math.random().toString(36).substr(2, 9)}`,
        title: action.action,
        action: action.action,
        description: `Action recommandée pour améliorer ${action.category}`,
        category: action.category,
        priority: action.priority,
        status: 'Non démarré',
        progress: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
        owner: action.owner,
        estimatedHours: 20,
        businessImpact: `Amélioration de la sécurité dans ${action.category}`,
        budget: action.cost || 5000,
        technicalComplexity: action.priority === 'Haute' ? 'Élevée' : 'Moyenne',
        riskLevel: action.priority === 'Haute' ? 'Très élevé' : 'Moyen',
        estimatedDuration: Math.ceil((action.cost || 5000) / 500), // Estimation en jours
        subTasks: [],
        kpis: ['Amélioration du score de sécurité', 'Réduction des risques']
      })),
      milestones: [],
      quarters: [],
      score: audit.score || Math.round(auditResult.overallScore),
      lastAuditDate: audit.createdAt.toISOString(),
      statistics: {
        totalActions: actionPlan.length,
        completedActions: 0,
        criticalActions: criticalActions,
        overdueActions: 0,
        avgProgress: 0
      },
      analyticsData: {
        summary: {
          totalActions: actionPlan.length,
          completedActions: 0,
          criticalActions: criticalActions,
          budgetTotal: totalBudget,
          riskDistribution: {
            'Très élevé': actionPlan.filter(a => a.priority === 'Haute').length,
            'Élevé': actionPlan.filter(a => a.priority === 'Moyenne').length,
            'Moyen': actionPlan.filter(a => a.priority === 'Basse').length,
            'Faible': 0
          }
        }
      }
    };

    console.log('🔍 API Actions - Réponse finale:', {
      totalActions: response.actions.length,
      criticalActions: response.statistics.criticalActions,
      budgetTotal: response.analyticsData.summary.budgetTotal
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des actions' },
      { status: 500 }
    );
  }
}
