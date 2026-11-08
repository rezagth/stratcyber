import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCrmSignature } from '@/lib/integrations/crm-signature';

const MAX_BODY = 10_000;
const CRM_ID = /^[\w-]{1,64}$/;
const STATUSES = ['a_jour', 'en_retard', 'resilie'] as const;
type Status = (typeof STATUSES)[number];

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/**
 * Entrée du CRM InfraCyb (facturation) : création du client et statut de paiement.
 * Fermée tant que CRM_WEBHOOK_SECRET n'est pas défini ; chaque appel doit être signé (HMAC) et récent.
 * Elle ne crée jamais de compte utilisateur, ne lit rien et ne coupe aucun accès :
 * le statut reçu est une information affichée à l'administrateur.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRM_WEBHOOK_SECRET;
  if (!secret) return bad('Intégration CRM non configurée', 503);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return bad('Requête trop volumineuse', 413);
  const ok = verifyCrmSignature(secret, request.headers.get('x-infracyb-timestamp'), request.headers.get('x-infracyb-signature'), raw);
  if (!ok) return bad('Signature invalide', 401);

  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return bad('Corps invalide');
    body = parsed as Record<string, unknown>;
  } catch {
    return bad('Corps invalide');
  }

  const crmId = typeof body.crmId === 'string' ? body.crmId : '';
  if (!CRM_ID.test(crmId)) return bad('crmId invalide');

  if (body.event === 'client.upsert') {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 200) return bad('Nom invalide');
    const existing = await prisma.organization.findFirst({ where: { crmId }, select: { id: true } });
    if (existing) {
      await prisma.organization.update({ where: { id: existing.id }, data: { name } });
      return NextResponse.json({ id: existing.id, created: false });
    }
    const sector = typeof body.sector === 'string' && body.sector.trim() ? body.sector.trim().slice(0, 100) : undefined;
    const created = await prisma.organization.create({
      data: { name, sector, crmId, commercialStatus: 'a_jour', commercialStatusAt: new Date() },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id, created: true }, { status: 201 });
  }

  if (body.event === 'payment.status') {
    const status = body.status as Status;
    if (!STATUSES.includes(status)) return bad('Statut invalide');
    const days = typeof body.overdueDays === 'number' && Number.isInteger(body.overdueDays) && body.overdueDays >= 0 && body.overdueDays < 10000 ? body.overdueDays : null;
    const existing = await prisma.organization.findFirst({ where: { crmId }, select: { id: true } });
    if (!existing) return bad('Client inconnu', 404);
    await prisma.organization.update({
      where: { id: existing.id },
      data: { commercialStatus: status, commercialOverdueDays: status === 'en_retard' ? days : null, commercialStatusAt: new Date() },
    });
    return NextResponse.json({ id: existing.id, status });
  }

  return bad('Événement inconnu');
}
