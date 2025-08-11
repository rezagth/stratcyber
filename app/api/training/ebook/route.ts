import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const ebooks = await prisma.ebook.findMany({
      where: {
        isPublished: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse JSON fields with error handling
    const processedEbooks = ebooks.map(ebook => {
      let parsedTags = [];
      let parsedContent = null;
      
      // Safely parse tags
      if (ebook.tags) {
        try {
          parsedTags = JSON.parse(ebook.tags);
        } catch (error) {
          console.error(`Failed to parse tags for ebook ${ebook.id}:`, error);
          // Try to handle common cases
          if (typeof ebook.tags === 'string' && ebook.tags.includes(',')) {
            // If it's a comma-separated string, convert to array
            parsedTags = ebook.tags.split(',').map(tag => tag.trim());
          }
        }
      }
      
      // Safely parse content
      if (ebook.content) {
        try {
          parsedContent = JSON.parse(ebook.content);
        } catch (error) {
          console.error(`Failed to parse content for ebook ${ebook.id}:`, error);
          // If content is not valid JSON, treat it as plain text
          parsedContent = ebook.content;
        }
      }
      
      return {
        ...ebook,
        tags: parsedTags,
        content: parsedContent
      };
    });

    return NextResponse.json(processedEbooks, { status: 200 });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json({ message: 'Error fetching ebooks', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      title, 
      author, 
      description,
      content, 
      url, 
      category, 
      difficulty, 
      duration,
      pages,
      tags,
      thumbnailUrl,
      isPublished = true
    } = body;

    // Validation des champs requis
    if (!title || !author || !category || !difficulty) {
      return NextResponse.json(
        { message: 'Les champs title, author, category et difficulty sont requis' }, 
        { status: 400 }
      );
    }

    const newEbook = await prisma.ebook.create({
      data: { 
        title, 
        author, 
        description,
        content: content ? JSON.stringify(content) : null,
        url,
        category,
        difficulty,
        duration,
        pages: pages ? parseInt(pages) : null,
        rating: 0,
        downloads: 0,
        tags: tags ? JSON.stringify(tags) : null,
        thumbnailUrl,
        isPublished
      },
    });

    // Parse JSON fields for response with error handling
    let parsedTags = [];
    let parsedContent = null;
    
    if (newEbook.tags) {
      try {
        parsedTags = JSON.parse(newEbook.tags);
      } catch (error) {
        console.error(`Failed to parse tags for new ebook:`, error);
        if (typeof newEbook.tags === 'string' && newEbook.tags.includes(',')) {
          parsedTags = newEbook.tags.split(',').map(tag => tag.trim());
        }
      }
    }
    
    if (newEbook.content) {
      try {
        parsedContent = JSON.parse(newEbook.content);
      } catch (error) {
        console.error(`Failed to parse content for new ebook:`, error);
        parsedContent = newEbook.content;
      }
    }
    
    const processedEbook = {
      ...newEbook,
      tags: parsedTags,
      content: parsedContent
    };

    return NextResponse.json(processedEbook, { status: 201 });
  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json({ 
      message: 'Error creating ebook', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 400 });
  }
}
