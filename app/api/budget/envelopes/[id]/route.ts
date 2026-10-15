import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseBudgetEnvelopeFields, BUDGET_ENVELOPE_SELECT } from '@/lib/api/budget-envelope-fields';

/** Met à jour une enveloppe budgétaire : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.budgetEnvelope.findFirst({ where: { id }, select: { id: true, organizationId: true, fiscalYear: true } });
    if (!existing) return jsonError('Enveloppe budgétaire non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseBudgetEnvelopeFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const fiscalYear = (parsed.data.fiscalYear as number | undefined) ?? existing.fiscalYear;
    if (fiscalYear !== existing.fiscalYear) {
      const duplicate = await prisma.budgetEnvelope.findFirst({ where: { organizationId: existing.organizationId, fiscalYear }, select: { id: true } });
      if (duplicate) return jsonError(`Une enveloppe budgétaire existe déjà pour l'exercice ${fiscalYear}`, 409);
    }

    const envelope = await prisma.budgetEnvelope.update({ where: { id }, data: parsed.data, select: BUDGET_ENVELOPE_SELECT });
    await logActivity(user, { action: 'budget-envelope.update', targetType: 'budget-envelope', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(envelope);
  },
  { roles: ['admin'] }
);

/** Supprime une enveloppe budgétaire : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.budgetEnvelope.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Enveloppe budgétaire non trouvée', 404);

    await prisma.budgetEnvelope.deleteMany({ where: { id } });
    await logActivity(user, { action: 'budget-envelope.delete', targetType: 'budget-envelope', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
