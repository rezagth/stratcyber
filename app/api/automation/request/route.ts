import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Store temporaire pour les demandes d'automatisation
// Dans une vraie app, utilisez une base de données
const automationRequests = new Map<string, {
  id: string;
  userId: string;
  actionId: string;
  actionTitle: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  clientMessage?: string;
  adminResponse?: string;
  estimatedSavings?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { actionId, actionTitle, clientMessage, estimatedSavings } = body;

    if (!actionId || !actionTitle) {
      return NextResponse.json(
        { error: 'ID et titre de l\'action requis' },
        { status: 400 }
      );
    }

    // Générer un ID unique pour la demande
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Créer la demande d'automatisation
    const request_data = {
      id: requestId,
      userId: session.user.id,
      actionId,
      actionTitle,
      requestedAt: new Date(),
      status: 'pending' as const,
      clientMessage: clientMessage || 'Demande d\'automatisation',
      estimatedSavings: estimatedSavings || 'Non spécifié'
    };

    automationRequests.set(requestId, request_data);

    console.log(`🤖 Nouvelle demande d'automatisation:`, {
      requestId,
      userId: session.user.id,
      actionTitle
    });

    // TODO: Ici vous pourriez envoyer une notification email à votre équipe StratCyber
    // sendNotificationToStratCyberTeam(request_data);

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Demande d\'automatisation envoyée à StratCyber',
      data: request_data
    });

  } catch (error) {
    console.error('Erreur lors de la demande d\'automatisation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer toutes les demandes de l'utilisateur
    const userRequests = Array.from(automationRequests.values())
      .filter(req => req.userId === session.user.id)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());

    return NextResponse.json({
      requests: userRequests,
      count: userRequests.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// Export pour utilisation dans d'autres API
export function getAutomationRequest(requestId: string) {
  return automationRequests.get(requestId);
}

export function updateAutomationRequestStatus(requestId: string, status: 'approved' | 'rejected', adminResponse?: string) {
  const request = automationRequests.get(requestId);
  if (request) {
    request.status = status;
    request.adminResponse = adminResponse;
    automationRequests.set(requestId, request);
    return request;
  }
  return null;
}
