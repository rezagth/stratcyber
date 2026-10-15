import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import {
  ebookVisibleTo,
  parseEbookContent,
  parseEbookTags,
} from '@/lib/training/ebooks';

// GET /api/training/ebook - Ebooks visibles par l'utilisateur connecté
export const GET = withApiAuth(async (_request, { user }) => {
  const ebooks = await prisma.ebook.findMany({
    where: ebookVisibleTo(user),
    include: {
      // Uniquement les sessions de lecture de l'utilisateur connecté
      readingSessions: {
        where: { userId: user.id },
        select: {
          id: true,
          progress: true,
          completed: true,
          timeSpent: true,
        },
      },
      quizzes: {
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const processedEbooks = ebooks.map((ebook) => ({
    ...ebook,
    tags: parseEbookTags(ebook.tags),
    content: parseEbookContent(ebook.content),
  }));

  return NextResponse.json(processedEbooks, { status: 200 });
});

// POST /api/training/ebook - Créer un ebook du catalogue commun (admin uniquement)
export const POST = withApiAuth(
  async (request) => {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return jsonError('Corps de requête invalide', 400);
    }

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
      isPublished = true,
    } = body;

    if (!title || !author || !category || !difficulty) {
      return jsonError(
        'Les champs title, author, category et difficulty sont requis',
        400
      );
    }

    const pagesCount = pages ? Number.parseInt(pages, 10) : null;
    if (pagesCount !== null && Number.isNaN(pagesCount)) {
      return jsonError('Le champ pages doit être un nombre', 400);
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
        pages: pagesCount,
        rating: 0,
        downloads: 0,
        tags: tags ? JSON.stringify(tags) : null,
        thumbnailUrl,
        isPublished,
        ownerId: null, // catalogue commun : le propriétaire n'est jamais pris dans le body
      },
    });

    return NextResponse.json(
      {
        ...newEbook,
        tags: parseEbookTags(newEbook.tags),
        content: parseEbookContent(newEbook.content),
      },
      { status: 201 }
    );
  },
  { roles: ['admin'] }
);
