import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';

const VALID_STATUSES = ['Non démarré', 'En cours', 'Terminé', 'En retard'];

/** Met à jour (et enregistre en base) le statut d'une action de la feuille de route. */
export const PATCH = withApiAuth(async (request, { user }) => {
  const body = await request.json().catch(() => null);
  const actionId = typeof body?.actionId === 'string' ? body.actionId.trim() : '';
  const status = body?.status;
  const progress = body?.progress;

  if (!actionId || actionId.length > 200 || typeof status !== 'string' || typeof progress !== 'number') {
    return jsonError('Paramètres manquants ou invalides', 400);
  }
  if (!VALID_STATUSES.includes(status)) return jsonError('Statut invalide', 400);
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    return jsonError('Progrès doit être entre 0 et 100', 400);
  }

  const rounded = Math.round(progress);
  await prisma.actionStatus.upsert({
    where: { userId_actionId: { userId: user.id, actionId } },
    update: { status, progress: rounded },
    create: { userId: user.id, actionId, status, progress: rounded },
  });

  return NextResponse.json({ success: true, data: { actionId, status, progress: rounded } });
});

/** Statuts enregistrés par l'utilisateur connecté (un seul, ou tous). */
export const GET = withApiAuth(async (request, { user }) => {
  const actionId = new URL(request.url).searchParams.get('actionId');
  if (actionId) {
    const row = await prisma.actionStatus.findFirst({ where: { userId: user.id, actionId } });
    return NextResponse.json(row);
  }
  const rows = await prisma.actionStatus.findMany({ where: { userId: user.id } });
  return NextResponse.json(rows);
});
