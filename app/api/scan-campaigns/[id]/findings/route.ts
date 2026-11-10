import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseManualFinding } from '@/lib/api/scan-fields';
import { CLOSED_STATUSES } from '@/lib/scan/authorization';

/**
 * Ajoute un constat saisi à la main : résultat d'un outil lancé par l'administrateur hors de StratCyber
 * (nmap, testssl.sh, Nuclei...). Cet appel ne contacte aucun serveur ; le domaine doit toutefois être au périmètre.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const campaign = await prisma.scanCampaign.findFirst({ where: { id }, select: { id: true, status: true, organizationId: true } });
    if (!campaign) return jsonError('Campagne non trouvée', 404);
    if (CLOSED_STATUSES.includes(campaign.status)) return jsonError('Campagne clôturée : on ne peut plus ajouter de constat.', 400);

    const body = await request.json().catch(() => null);
    const parsed = parseManualFinding(body);
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const target = await prisma.scanTarget.findFirst({ where: { campaignId: id, host: parsed.data.targetHost }, select: { id: true } });
    if (!target) return jsonError('Ce domaine ne fait pas partie du périmètre de la campagne.', 400);

    const finding = await prisma.scanFinding.create({
      data: { campaignId: id, source: 'manuel', status: 'Nouveau', runAt: new Date(), checkId: `manuel-${randomUUID()}`, ...parsed.data },
    });
    await logActivity(user, { action: 'scan.finding.manual', targetType: 'scan-campaign', targetId: id, organizationId: campaign.organizationId, metadata: { host: parsed.data.targetHost } });
    return NextResponse.json(finding, { status: 201 });
  },
  { roles: ['admin'] }
);
