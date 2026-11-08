import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { checkDomain, sortFindings, type Finding } from '@/lib/surface/dns-check';

const PLAN_CATEGORY = 'Technique';
const PLAN_SEVERITIES = new Set(['Critique', 'Haute', 'Moyenne']);
const toPriority = (s: string) => (s === 'Critique' ? 'Critique' : s === 'Haute' ? 'Haute' : 'Moyenne');

/**
 * Contrôle SPF/DMARC/MX d'un domaine du client (DNS seulement). Administrateur uniquement.
 * Avec addToPlan: true, les constats à corriger deviennent des actions du plan du client (sans doublon).
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const organization = await prisma.organization.findFirst({ where: { id }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const result = await checkDomain(body?.domain);
    if ('error' in result) return jsonError(result.error, 400);

    const findings = sortFindings(result.findings);
    let created = 0;
    if (body?.addToPlan === true) {
      const todo = findings.filter((f: Finding) => PLAN_SEVERITIES.has(f.severity));
      const existing = await prisma.actionPlanItem.findMany({ where: { organizationId: id, category: PLAN_CATEGORY }, select: { title: true } });
      const known = new Set(existing.map((e) => e.title));
      const data = todo
        .map((f) => ({ organizationId: id, title: `${f.title} (${result.domain})`, description: f.detail, category: PLAN_CATEGORY, priority: toPriority(f.severity), responsible: 'DSI', status: 'Non commencé' }))
        .filter((item) => !known.has(item.title));
      if (data.length > 0) await prisma.actionPlanItem.createMany({ data });
      created = data.length;
    }

    await logActivity(user, { action: 'surface.check', targetType: 'organization', targetId: id, organizationId: id, metadata: { created } });
    return NextResponse.json({ domain: result.domain, findings, created });
  },
  { roles: ['admin'] }
);
