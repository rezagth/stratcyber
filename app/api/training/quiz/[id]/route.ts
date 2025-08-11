import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quiz = await prisma.ebookQuiz.findUnique({
      where: {
        id: params.id
      },
      include: {
        ebook: {
          select: {
            id: true,
            title: true,
            author: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz non trouvé' },
        { status: 404 }
      );
    }

    // Parse les questions JSON
    const processedQuiz = {
      ...quiz,
      questions: quiz.questions ? JSON.parse(quiz.questions) : []
    };

    return NextResponse.json(processedQuiz, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching quiz', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
