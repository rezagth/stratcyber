import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/audits/[id]/duplicate - Dupliquer un audit
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auditId = params.id;

    if (!auditId) {
      return NextResponse.json(
        { error: 'ID audit requis' },
        { status: 400 }
      );
    }

    // Récupérer l'audit original avec ses réponses
    const originalAudit = await prisma.audit.findUnique({
      where: {
        id: auditId,
      },
      include: {
        responses: true,
      },
    });

    if (!originalAudit) {
      return NextResponse.json(
        { error: 'Audit non trouvé' },
        { status: 404 }
      );
    }

    // Créer une copie de l'audit
    const duplicatedAudit = await prisma.audit.create({
      data: {
        userId: originalAudit.userId,
        score: originalAudit.score,
        maturity: originalAudit.maturity,
        recommendations: originalAudit.recommendations,
        companyProfile: originalAudit.companyProfile,
        createdAt: new Date(), // Nouvelle date de création
        updatedAt: new Date(),
        responses: {
          create: originalAudit.responses.map(response => ({
            question: response.question,
            answer: response.answer,
            score: response.score,
            category: response.category,
          })),
        },
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

    return NextResponse.json(duplicatedAudit);
  } catch (error) {
    console.error('Erreur lors de la duplication de l\'audit:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
