import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { runReminderJob } from '@/lib/reminders/job';

function authorized(request: NextRequest): boolean | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) return null; // non configuré : la route reste fermée
  const header = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Tâche planifiée (Vercel Cron envoie « Authorization: Bearer <CRON_SECRET> »).
 * Fermée tant que CRON_SECRET n'est pas défini. Ne renvoie que des compteurs, jamais d'adresse ni de contenu.
 */
export async function GET(request: NextRequest) {
  const ok = authorized(request);
  if (ok === null) return NextResponse.json({ error: 'Tâche planifiée non configurée' }, { status: 503 });
  if (!ok) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    return NextResponse.json(await runReminderJob());
  } catch (error) {
    console.error('[cron:reminders]', error instanceof Error ? error.message : 'erreur');
    return NextResponse.json({ error: "Échec de la tâche de relances" }, { status: 500 });
  }
}
