import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { AUTHORIZATION_KEYS, CAMPAIGN_SELECT, parseCampaignFields } from '@/lib/api/scan-fields';
import { authorizationDataProblem, authorizationMissing, CLOSED_STATUSES, launchProblem } from '@/lib/scan/authorization';
import { severityRank } from '@/lib/scan/severity';

/** Détail d'une campagne : autorisation, périmètre, constats, et raison éventuelle d'un lancement impossible. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id } = await params;
    const campaign = await prisma.scanCampaign.findFirst({ where: { id }, select: CAMPAIGN_SELECT });
    if (!campaign) return jsonError('Campagne non trouvée', 404);
    const [targets, findings] = await Promise.all([
      prisma.scanTarget.findMany({ where: { campaignId: id }, orderBy: { createdAt: 'asc' } }),
      prisma.scanFinding.findMany({ where: { campaignId: id } }),
    ]);
    findings.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
    return NextResponse.json({ ...campaign, targets, findings, launchProblem: launchProblem(campaign) });
  },
  { roles: ['admin'] }
);

/**
 * Met à jour une campagne. Règles de sécurité :
 *  - passer en « Autorisée » exige l'autorisation complète et au moins un domaine au périmètre ;
 *  - modifier l'autorisation d'une campagne « Autorisée » la remet en « Brouillon » (à reconfirmer) ;
 *  - une campagne terminée ou annulée n'accepte plus que des notes.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.scanCampaign.findFirst({ where: { id }, select: CAMPAIGN_SELECT });
    if (!existing) return jsonError('Campagne non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseCampaignFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    const data = parsed.data;

    if (CLOSED_STATUSES.includes(existing.status) && Object.keys(data).some((k) => k !== 'notes')) {
      return jsonError('Campagne clôturée : seules les notes peuvent être modifiées.', 400);
    }

    const merged = { ...existing, ...data } as typeof existing;
    const dataProblem = authorizationDataProblem(merged);
    if (dataProblem) return jsonError(dataProblem, 400);

    if (data.status === 'Autorisée') {
      const missing = authorizationMissing(merged);
      if (missing) return jsonError(missing, 400);
      const targets = await prisma.scanTarget.count({ where: { campaignId: id } });
      if (targets === 0) return jsonError('Ajoute au moins un domaine au périmètre avant de confirmer l\'autorisation.', 400);
    } else if (existing.status === 'Autorisée' && AUTHORIZATION_KEYS.some((k) => k in data)) {
      data.status = 'Brouillon';
    }

    const campaign = await prisma.scanCampaign.update({ where: { id }, data: data as never, select: CAMPAIGN_SELECT });
    await logActivity(user, {
      action: 'scan.campaign.update', targetType: 'scan-campaign', targetId: id, organizationId: existing.organizationId,
      metadata: { status: campaign.status },
    });
    return NextResponse.json(campaign);
  },
  { roles: ['admin'] }
);

export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.scanCampaign.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Campagne non trouvée', 404);
    // Pas de cascade dans le faux client de test, et on évite de laisser des constats orphelins.
    await prisma.scanFinding.deleteMany({ where: { campaignId: id } });
    await prisma.scanTarget.deleteMany({ where: { campaignId: id } });
    await prisma.scanCampaign.delete({ where: { id } });
    await logActivity(user, { action: 'scan.campaign.delete', targetType: 'scan-campaign', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ ok: true });
  },
  { roles: ['admin'] }
);
