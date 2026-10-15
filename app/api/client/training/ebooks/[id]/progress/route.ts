import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { ebookVisibleTo } from '@/lib/training/ebooks';
import { parseReadingProgressFields } from '@/lib/api/training-progress-fields';

const PROGRESS_SELECT = { id: true, ebookId: true, currentPage: true, progress: true, timeSpent: true, completed: true, lastReadAt: true };

/** Met à jour la progression de lecture du client connecté sur un ebook. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: ebookId } = await params;
    const ebook = await prisma.ebook.findFirst({ where: { AND: [{ id: ebookId }, ebookVisibleTo(user)] }, select: { id: true } });
    if (!ebook) return jsonError('Ebook non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseReadingProgressFields(body);
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const session = await prisma.readingSession.upsert({
      where: { userId_ebookId: { userId: user.id, ebookId } },
      create: {
        userId: user.id,
        ebookId,
        // Valeurs explicites plutôt que de compter sur les défauts du schéma Prisma.
        currentPage: parsed.data.currentPage ?? 1,
        progress: parsed.data.progress ?? 0,
        timeSpent: parsed.data.timeSpent ?? 0,
        completed: parsed.data.completed ?? false,
        lastReadAt: new Date(),
      } as Prisma.ReadingSessionUncheckedCreateInput,
      update: { ...parsed.data, lastReadAt: new Date() },
      select: PROGRESS_SELECT,
    });
    return NextResponse.json(session);
  },
  { roles: ['client'] }
);
