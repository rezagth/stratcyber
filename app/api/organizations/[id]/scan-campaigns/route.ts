import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { CAMPAIGN_SELECT, parseCampaignFields } from '@/lib/api/scan-fields';

/** Campagnes de scan d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const campaigns = await prisma.scanCampaign.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: CAMPAIGN_SELECT,
    });
    const withCounts = await Promise.all(
      campaigns.map(async (c) => ({
        ...c,
        targetCount: await prisma.scanTarget.count({ where: { campaignId: c.id } }),
        findingCount: await prisma.scanFinding.count({ where: { campaignId: c.id } }),
      }))
    );
    return NextResponse.json(withCounts);
  },
  { roles: ['admin'] }
);

/** Crée une campagne en « Brouillon » : elle ne peut rien contrôler tant que l'autorisation écrite n'est pas confirmée. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseCampaignFields({ name: body?.name, notes: body?.notes }, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const campaign = await prisma.scanCampaign.create({
      data: { ...parsed.data, organizationId, status: 'Brouillon' } as never,
      select: CAMPAIGN_SELECT,
    });
    await logActivity(user, { action: 'scan.campaign.create', targetType: 'scan-campaign', targetId: campaign.id, organizationId });
    return NextResponse.json(campaign, { status: 201 });
  },
  { roles: ['admin'] }
);
