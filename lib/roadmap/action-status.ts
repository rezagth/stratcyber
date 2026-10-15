import { prisma } from '@/lib/db';

/** Statuts enregistrés par un utilisateur, indexés par identifiant d'action. */
export async function getActionStatuses(
  userId: string
): Promise<Record<string, { status: string; progress: number }>> {
  const rows = await prisma.actionStatus.findMany({ where: { userId } });
  const out: Record<string, { status: string; progress: number }> = {};
  for (const row of rows) out[row.actionId] = { status: row.status, progress: row.progress };
  return out;
}
