import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { normalizeDomain } from '@/lib/surface/dns-check';
import { CLOSED_STATUSES, MAX_TARGETS } from '@/lib/scan/authorization';

/**
 * Ajoute un domaine au périmètre. Un ajout après confirmation de l'autorisation la retire (retour en « Brouillon ») :
 * le client doit avoir autorisé CE domaine, donc la lettre doit être refaite ou complétée.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const campaign = await prisma.scanCampaign.findFirst({ where: { id }, select: { id: true, status: true, organizationId: true } });
    if (!campaign) return jsonError('Campagne non trouvée', 404);
    if (CLOSED_STATUSES.includes(campaign.status)) return jsonError('Campagne clôturée : le périmètre ne peut plus changer.', 400);

    const body = await request.json().catch(() => null);
    const host = normalizeDomain(body?.host);
    if (!host) return jsonError('Domaine invalide : saisis un nom de domaine public (ex. exemple.fr), sans http:// ni adresse IP.', 400);
    const checkDns = typeof body?.checkDns === 'boolean' ? body.checkDns : true;

    const count = await prisma.scanTarget.count({ where: { campaignId: id } });
    if (count >= MAX_TARGETS) return jsonError(`Un périmètre ne peut pas dépasser ${MAX_TARGETS} domaines.`, 400);
    const duplicate = await prisma.scanTarget.findFirst({ where: { campaignId: id, host }, select: { id: true } });
    if (duplicate) return jsonError('Ce domaine est déjà dans le périmètre.', 409);

    const target = await prisma.scanTarget.create({ data: { campaignId: id, host, checkDns } });
    let reset = false;
    if (campaign.status === 'Autorisée') {
      await prisma.scanCampaign.update({ where: { id }, data: { status: 'Brouillon' } });
      reset = true;
    }
    await logActivity(user, { action: 'scan.target.add', targetType: 'scan-campaign', targetId: id, organizationId: campaign.organizationId, metadata: { host } });
    return NextResponse.json({ ...target, authorizationReset: reset }, { status: 201 });
  },
  { roles: ['admin'] }
);
