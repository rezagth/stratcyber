import { prisma } from '@/lib/db';

/**
 * Formation des employés d'un client (module J) : agrège la progression de lecture
 * et les tentatives de quiz des comptes `client` de cette organisation, à partir du
 * catalogue d'ebooks commun existant. Purement une lecture agrégée, recalculée à la
 * demande — ne duplique aucune donnée du catalogue.
 */
export async function buildTrainingDashboard(organizationId: string) {
  const [employees, catalogSize] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId, role: 'client' },
      select: {
        id: true,
        name: true,
        email: true,
        readingSessions: {
          select: { ebookId: true, progress: true, completed: true, timeSpent: true, lastReadAt: true, ebook: { select: { title: true } } },
        },
        ebookQuizAttempts: {
          select: { quizId: true, score: true, passed: true, completedAt: true, quiz: { select: { title: true, ebook: { select: { title: true } } } } },
        },
      },
    }),
    prisma.ebook.count({ where: { ownerId: null, isPublished: true } }),
  ]);

  return {
    catalogSize,
    employees: employees.map((e) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      ebooksCompleted: e.readingSessions.filter((r) => r.completed).length,
      ebooksInProgress: e.readingSessions.filter((r) => !r.completed && r.progress > 0).length,
      quizzesPassed: e.ebookQuizAttempts.filter((a) => a.passed).length,
      readingSessions: e.readingSessions,
      quizAttempts: e.ebookQuizAttempts,
    })),
  };
}
