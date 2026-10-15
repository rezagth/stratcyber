import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSecurityAnswerFields, validateNotApplicableConsistency, ANSWER_SELECT } from '@/lib/api/security-answer-fields';

/** Bibliothèque de réponses aux questionnaires de sécurité d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const answers = await prisma.securityAnswer.findMany({
      where: { organizationId },
      orderBy: [{ category: 'asc' }, { createdAt: 'desc' }],
      select: ANSWER_SELECT,
    });
    return NextResponse.json(answers);
  },
  { roles: ['admin'] }
);

/** Ajoute une réponse à la bibliothèque : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSecurityAnswerFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const consistencyError = validateNotApplicableConsistency({
      isNotApplicable: Boolean(parsed.data.isNotApplicable),
      answer: (parsed.data.answer as string | null) ?? null,
      notApplicableReason: (parsed.data.notApplicableReason as string | null) ?? null,
    });
    if (consistencyError) return jsonError(consistencyError, 400);

    const answer = await prisma.securityAnswer.create({
      data: { ...parsed.data, organizationId } as Prisma.SecurityAnswerUncheckedCreateInput,
      select: ANSWER_SELECT,
    });
    await logActivity(user, { action: 'security-answer.create', targetType: 'security-answer', targetId: answer.id, organizationId });
    return NextResponse.json(answer, { status: 201 });
  },
  { roles: ['admin'] }
);
