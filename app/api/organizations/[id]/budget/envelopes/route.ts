import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseBudgetEnvelopeFields, BUDGET_ENVELOPE_SELECT } from '@/lib/api/budget-envelope-fields';

/** Enveloppes budgétaires d'un client (une par exercice) : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const envelopes = await prisma.budgetEnvelope.findMany({
      where: { organizationId },
      orderBy: { fiscalYear: 'desc' },
      select: BUDGET_ENVELOPE_SELECT,
    });
    return NextResponse.json(envelopes);
  },
  { roles: ['admin'] }
);

/** Crée l'enveloppe budgétaire d'un exercice pour un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseBudgetEnvelopeFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const fiscalYear = parsed.data.fiscalYear as number;
    const existing = await prisma.budgetEnvelope.findFirst({ where: { organizationId, fiscalYear }, select: { id: true } });
    if (existing) return jsonError(`Une enveloppe budgétaire existe déjà pour l'exercice ${fiscalYear} — modifiez-la plutôt que d'en créer une nouvelle`, 409);

    const envelope = await prisma.budgetEnvelope.create({
      // `isCreate: true` garantit que `parsed.data.fiscalYear` et `.allocatedAmount` sont présents.
      data: { ...parsed.data, organizationId } as Prisma.BudgetEnvelopeUncheckedCreateInput,
      select: BUDGET_ENVELOPE_SELECT,
    });
    await logActivity(user, { action: 'budget-envelope.create', targetType: 'budget-envelope', targetId: envelope.id, organizationId, metadata: { fiscalYear } });
    return NextResponse.json(envelope, { status: 201 });
  },
  { roles: ['admin'] }
);
