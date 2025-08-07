import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

// Table pour stocker l'état des actions (extension du schéma)
// Pour l'instant, nous allons utiliser une table temporaire en mémoire
// Dans une vraie application, vous devriez ajouter une table ActionStatus à votre schéma Prisma

const actionStatusStore = new Map<string, {
  userId: string;
  actionId: string;
  status: string;
  progress: number;
  updatedAt: Date;
}>();

export async function PATCH(request: NextRequest) {
  try {
    console.log('PATCH /api/roadmap/actions - Début de la requête');
    
    const session = await getServerSession(authOptions);
    console.log('Session utilisateur:', session?.user?.id);

    if (!session?.user?.id) {
      console.log('Utilisateur non autorisé');
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Données reçues:', body);
    const { actionId, status, progress } = body;

    if (!actionId || !status || progress === undefined) {
      console.log('Paramètres manquants:', { actionId, status, progress });
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Valider le statut
    const validStatuses = ['Non démarré', 'En cours', 'Terminé', 'En retard'];
    if (!validStatuses.includes(status)) {
      console.log('Statut invalide:', status, 'Valides:', validStatuses);
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Valider le progrès
    if (progress < 0 || progress > 100) {
      console.log('Progrès invalide:', progress);
      return NextResponse.json(
        { error: 'Progrès doit être entre 0 et 100' },
        { status: 400 }
      );
    }

    // Stocker l'état de l'action
    const key = `${session.user.id}-${actionId}`;
    console.log('Clé de stockage:', key);
    
    actionStatusStore.set(key, {
      userId: session.user.id,
      actionId,
      status,
      progress,
      updatedAt: new Date()
    });
    
    console.log('Action mise à jour avec succès:', actionId, 'vers', status);
    console.log('Taille du store:', actionStatusStore.size);

    // Note: Dans une vraie application, vous stockeriez cela en base de données
    // await prisma.actionStatus.upsert({
    //   where: {
    //     userId_actionId: {
    //       userId: session.user.id,
    //       actionId
    //     }
    //   },
    //   update: {
    //     status,
    //     progress,
    //     updatedAt: new Date()
    //   },
    //   create: {
    //     userId: session.user.id,
    //     actionId,
    //     status,
    //     progress
    //   }
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Statut de l\'action mis à jour avec succès',
      data: { actionId, status, progress }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'action:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour', details: error instanceof Error ? error.message : 'Erreur inconnue' },
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

    const url = new URL(request.url);
    const actionId = url.searchParams.get('actionId');

    if (actionId) {
      // Récupérer le statut d'une action spécifique
      const key = `${session.user.id}-${actionId}`;
      const actionStatus = actionStatusStore.get(key);
      
      return NextResponse.json(actionStatus || null);
    } else {
      // Récupérer tous les statuts d'actions pour l'utilisateur
      const userActions = Array.from(actionStatusStore.entries())
        .filter(([key, value]) => value.userId === session.user.id)
        .map(([key, value]) => value);
      
      return NextResponse.json(userActions);
    }

  } catch (error) {
    console.error('Erreur lors de la récupération des statuts d\'actions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// Export de la fonction pour récupérer les statuts (à utiliser dans data/route.ts)
export function getActionStatuses(userId: string): Record<string, { status: string; progress: number }> {
  const statuses: Record<string, { status: string; progress: number }> = {};
  
  for (const [key, value] of actionStatusStore.entries()) {
    if (value.userId === userId) {
      statuses[value.actionId] = {
        status: value.status,
        progress: value.progress
      };
    }
  }
  
  return statuses;
}
