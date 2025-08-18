import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/audits/[id] - Récupérer un audit spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const auditId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    if (!auditId) {
      return NextResponse.json(
        { error: 'ID audit requis' },
        { status: 400 }
      );
    }

    // Récupérer l'audit avec ses réponses
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: userId,
      },
      include: {
        responses: {
          select: {
            question: true,
            answer: true,
            score: true,
            category: true,
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'audit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/audits/[id] - Supprimer un audit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }

    if (!auditId) {
      return NextResponse.json(
        { error: 'ID audit requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'audit existe et appartient à l'utilisateur
    const audit = await prisma.audit.findFirst({
      where: {
        id: auditId,
        userId: userId,
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit non trouvé ou accès non autorisé' },
        { status: 404 }
      );
    }

    // Supprimer les réponses d'abord (clés étrangères)
    await prisma.auditResponse.deleteMany({
      where: {
        auditId: auditId,
      },
    });

    // Puis supprimer l'audit
    await prisma.audit.delete({
      where: {
        id: auditId,
      },
    });

    return NextResponse.json({ message: 'Audit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'audit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
