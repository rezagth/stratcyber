import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parsePolicyTemplateFields, TEMPLATE_SELECT } from '@/lib/api/policy-fields';
import { extractVariables } from '@/lib/policy/template-engine';

/**
 * Catalogue des modèles de politiques (confidentialité, PSSI, sauvegarde, accès,
 * incident, PCA) : administrateur uniquement. Modèles partagés entre tous les
 * clients — "à adapter, à faire relire par un juriste", jamais du conseil juridique.
 */
export const GET = withApiAuth(
  async () => {
    const templates = await prisma.policyTemplate.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
      select: TEMPLATE_SELECT,
    });
    return NextResponse.json(templates.map((t) => ({ ...t, variables: extractVariables(t.content) })));
  },
  { roles: ['admin'] }
);

export const POST = withApiAuth(
  async (request, { user }) => {
    const body = await request.json().catch(() => null);
    const parsed = parsePolicyTemplateFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const template = await prisma.policyTemplate.create({
      data: parsed.data as Prisma.PolicyTemplateUncheckedCreateInput,
      select: TEMPLATE_SELECT,
    });
    await logActivity(user, { action: 'policy-template.create', targetType: 'policy-template', targetId: template.id });
    return NextResponse.json({ ...template, variables: extractVariables(template.content) }, { status: 201 });
  },
  { roles: ['admin'] }
);
