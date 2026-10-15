import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo, parseEbookContent, parseEbookTags } from '@/lib/training/ebooks';

/** Catalogue d'ebooks visible par le client connecté (lecture seule, même visibilité que le catalogue existant). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const ebooks = await prisma.ebook.findMany({
      where: ebookVisibleTo(user),
      include: {
        readingSessions: { where: { userId: user.id }, select: { id: true, progress: true, completed: true, timeSpent: true } },
        quizzes: { select: { id: true, title: true, passingScore: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ebooks.map((e) => ({ ...e, tags: parseEbookTags(e.tags), content: parseEbookContent(e.content) })));
  },
  { roles: ['client'] }
);
