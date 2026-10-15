import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { DOCUMENT_SELECT } from '@/lib/api/policy-fields';
import { fillTemplate } from '@/lib/policy/template-engine';

/**
 * Génère un document de politique pour un client à partir d'un modèle, en substituant
 * les variables fournies. Si des documents du même type existent déjà pour ce client,
 * la nouvelle version repart de "Brouillon" (jamais "Validé") sans toucher aux
 * versions précédentes, qui restent consultables dans l'historique.
 * Corps : { templateId: string, title?: string, values: Record<string, string> }
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const templateId = typeof body?.templateId === 'string' ? body.templateId : '';
    if (!templateId) return jsonError('Modèle requis', 400);

    const template = await prisma.policyTemplate.findFirst({ where: { id: templateId }, select: { id: true, type: true, name: true, content: true } });
    if (!template) return jsonError('Modèle non trouvé', 404);

    const values: Record<string, string> = {};
    if (body?.values && typeof body.values === 'object') {
      for (const [key, value] of Object.entries(body.values)) {
        if (typeof value === 'string') values[key] = value;
      }
    }

    const title = typeof body?.title === 'string' && body.title.trim() ? body.title.trim().slice(0, 200) : template.name;
    const content = fillTemplate(template.content, values);

    const previous = await prisma.clientPolicyDocument.findFirst({
      where: { organizationId, type: template.type },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (previous?.version ?? 0) + 1;

    const document = await prisma.clientPolicyDocument.create({
      data: { organizationId, templateId: template.id, type: template.type, title, content, version, status: 'Brouillon' },
      select: DOCUMENT_SELECT,
    });
    await logActivity(user, {
      action: 'policy-document.generate',
      targetType: 'policy-document',
      targetId: document.id,
      organizationId,
      metadata: { type: template.type, version },
    });
    return NextResponse.json(document, { status: 201 });
  },
  { roles: ['admin'] }
);
