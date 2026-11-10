import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { CLOSED_STATUSES } from '@/lib/scan/authorization';

/** Retire un domaine du périmètre (réduire le périmètre ne demande pas de nouvelle autorisation). */
export const DELETE = withApiAuth<{ id: string; targetId: string }>(
  async (_request, { params, user }) => {
    const { id, targetId } = await params;
    const campaign = await prisma.scanCampaign.findFirst({ where: { id }, select: { id: true, status: true, organizationId: true } });
    if (!campaign) return jsonError('Campagne non trouvée', 404);
    if (CLOSED_STATUSES.includes(campaign.status)) return jsonError('Campagne clôturée : le périmètre ne peut plus changer.', 400);
    const target = await prisma.scanTarget.findFirst({ where: { id: targetId, campaignId: id } });
    if (!target) return jsonError('Domaine non trouvé dans cette campagne', 404);

    // Les constats non traités de ce domaine disparaissent avec lui ; ceux déjà retenus ou écartés restent au dossier.
    await prisma.scanFinding.deleteMany({ where: { campaignId: id, targetHost: target.host, status: 'Nouveau' } });
    await prisma.scanTarget.delete({ where: { id: targetId } });
    await logActivity(user, { action: 'scan.target.remove', targetType: 'scan-campaign', targetId: id, organizationId: campaign.organizationId, metadata: { host: target.host } });
    return NextResponse.json({ ok: true });
  },
  { roles: ['admin'] }
);
