import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo, parseEbookContent, parseEbookTags } from '@/lib/training/ebooks';

/** Un ebook visible par le client connecté. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const ebook = await prisma.ebook.findFirst({
      where: { AND: [{ id }, ebookVisibleTo(user)] },
      include: {
        readingSessions: { where: { userId: user.id }, select: { id: true, currentPage: true, progress: true, completed: true, timeSpent: true } },
        quizzes: { select: { id: true, title: true, passingScore: true } },
      },
    });
    if (!ebook) return jsonError('Ebook non trouvé', 404);

    return NextResponse.json({ ...ebook, tags: parseEbookTags(ebook.tags), content: parseEbookContent(ebook.content) });
  },
  { roles: ['client'] }
);
