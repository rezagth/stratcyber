import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { FINDING_STATUSES } from '@/lib/api/scan-fields';
import { isActionable, toPlanPriority, toRegisterSeverity } from '@/lib/scan/severity';

const PLAN_CATEGORY = 'Technique';

/**
 * Traite un constat. « Retenu » le fait entrer dans le suivi du client : une vulnérabilité au registre ET une action
 * au plan d'action (liées entre elles), sans doublon. « Écarté » (faux positif, hors sujet) et « Nouveau » ne touchent
 * à rien d'autre. Rien n'est supprimé du registre en cas de retour en arrière : c'est à l'administrateur de le faire.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const finding = await prisma.scanFinding.findFirst({ where: { id } });
    if (!finding) return jsonError('Constat non trouvé', 404);
    const campaign = await prisma.scanCampaign.findFirst({ where: { id: finding.campaignId }, select: { id: true, organizationId: true } });
    if (!campaign) return jsonError('Campagne non trouvée', 404);

    const body = await request.json().catch(() => null);
    const status = body?.status;
    if (typeof status !== 'string' || !(FINDING_STATUSES as readonly string[]).includes(status)) {
      return jsonError(`Statut invalide (valeurs possibles : ${FINDING_STATUSES.join(', ')})`, 400);
    }

    let vulnerabilityId: string | null = finding.vulnerabilityId ?? null;
    if (status === 'Retenu') {
      if (!isActionable(finding.severity)) return jsonError('Un constat « OK » n\'a rien à corriger : il ne peut pas être retenu.', 400);
      const organizationId = campaign.organizationId;
      const alreadyThere = vulnerabilityId
        ? await prisma.clientVulnerability.findFirst({ where: { id: vulnerabilityId, organizationId }, select: { id: true } })
        : null;
      if (!alreadyThere) {
        const title = `${finding.title} (${finding.targetHost})`.slice(0, 300);
        const sameAction = await prisma.actionPlanItem.findFirst({ where: { organizationId, category: PLAN_CATEGORY, title }, select: { id: true } });
        const action = sameAction ?? await prisma.actionPlanItem.create({
          data: {
            organizationId, title, description: finding.detail, category: PLAN_CATEGORY,
            priority: toPlanPriority(finding.severity), responsible: 'DSI', status: 'Non commencé',
          },
          select: { id: true },
        });
        const vulnerability = await prisma.clientVulnerability.create({
          data: {
            organizationId, title, description: finding.detail.slice(0, 2000), severity: toRegisterSeverity(finding.severity),
            status: 'Ouverte', discoveredAt: finding.runAt ?? new Date(), actionPlanItemId: action.id,
          },
          select: { id: true },
        });
        vulnerabilityId = vulnerability.id;
      }
    }

    const updated = await prisma.scanFinding.update({ where: { id }, data: { status, vulnerabilityId } });
    await logActivity(user, { action: 'scan.finding.update', targetType: 'scan-finding', targetId: id, organizationId: campaign.organizationId, metadata: { status } });
    return NextResponse.json(updated);
  },
  { roles: ['admin'] }
);

/** Supprime un constat saisi à la main (les constats automatiques se renouvellent à chaque contrôle). */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const finding = await prisma.scanFinding.findFirst({ where: { id } });
    if (!finding) return jsonError('Constat non trouvé', 404);
    if (finding.source !== 'manuel') return jsonError('Seuls les constats saisis à la main peuvent être supprimés.', 400);
    const campaign = await prisma.scanCampaign.findFirst({ where: { id: finding.campaignId }, select: { organizationId: true } });
    await prisma.scanFinding.delete({ where: { id } });
    await logActivity(user, { action: 'scan.finding.delete', targetType: 'scan-finding', targetId: id, organizationId: campaign?.organizationId ?? null });
    return NextResponse.json({ ok: true });
  },
  { roles: ['admin'] }
);
