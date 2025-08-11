import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ebook = await prisma.ebook.findUnique({
      where: {
        id: id
      },
      include: {
        readingSessions: {
          select: {
            id: true,
            progress: true,
            completed: true,
            timeSpent: true
          }
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            passingScore: true
          }
        }
      }
    });

    if (!ebook) {
      return NextResponse.json(
        { message: 'Ebook non trouvé' },
        { status: 404 }
      );
    }

    // Parse JSON fields with error handling
    let parsedTags = [];
    
    if (ebook.tags) {
      try {
        parsedTags = JSON.parse(ebook.tags);
      } catch (error) {
        console.error(`Failed to parse tags for ebook ${ebook.id}:`, error);
        if (typeof ebook.tags === 'string' && ebook.tags.includes(',')) {
          parsedTags = ebook.tags.split(',').map(tag => tag.trim());
        }
      }
    }
    
    const processedEbook = {
      ...ebook,
      tags: parsedTags,
      // On laisse le content en string pour le traiter côté client
    };

    return NextResponse.json(processedEbook, { status: 200 });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching ebook', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
