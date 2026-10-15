import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parsePolicyTemplateFields, TEMPLATE_SELECT } from '@/lib/api/policy-fields';
import { extractVariables } from '@/lib/policy/template-engine';

/** Met à jour un modèle de politique : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.policyTemplate.findFirst({ where: { id }, select: { id: true } });
    if (!existing) return jsonError('Modèle non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parsePolicyTemplateFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const template = await prisma.policyTemplate.update({ where: { id }, data: parsed.data, select: TEMPLATE_SELECT });
    await logActivity(user, { action: 'policy-template.update', targetType: 'policy-template', targetId: id });
    return NextResponse.json({ ...template, variables: extractVariables(template.content) });
  },
  { roles: ['admin'] }
);

/** Supprime un modèle de politique : administrateur uniquement. Les documents déjà générés ne sont pas affectés (templateId passe à null). */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.policyTemplate.findFirst({ where: { id }, select: { id: true } });
    if (!existing) return jsonError('Modèle non trouvé', 404);

    await prisma.policyTemplate.deleteMany({ where: { id } });
    await logActivity(user, { action: 'policy-template.delete', targetType: 'policy-template', targetId: id });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
