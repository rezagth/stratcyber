import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { launchProblem } from '@/lib/scan/authorization';
import { runExternalScan } from '@/lib/scan/checks';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MIN_DELAY_MS = 60_000; // pas plus d'un contrôle par minute et par domaine : on ne martèle pas le serveur du client

/**
 * Lance les contrôles externes d'UN domaine du périmètre. Refusé (403) si l'autorisation écrite du client
 * n'est pas confirmée ou n'est pas valable à cet instant. Seuls les noms du périmètre peuvent être contrôlés :
 * l'API ne reçoit qu'un identifiant de domaine du périmètre, jamais un nom libre.
 */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const campaign = await prisma.scanCampaign.findFirst({ where: { id } });
    if (!campaign) return jsonError('Campagne non trouvée', 404);

    const problem = launchProblem(campaign);
    if (problem) return jsonError(problem, 403);

    const body = await request.json().catch(() => null);
    const targetId = typeof body?.targetId === 'string' ? body.targetId : '';
    const target = targetId ? await prisma.scanTarget.findFirst({ where: { id: targetId, campaignId: id } }) : null;
    if (!target) return jsonError('Domaine non trouvé dans le périmètre de cette campagne', 404);

    if (target.lastRunAt && Date.now() - new Date(target.lastRunAt).getTime() < MIN_DELAY_MS) {
      return jsonError('Un contrôle de ce domaine vient d\'être lancé : attends une minute.', 429);
    }

    const outcome = await runExternalScan(target.host, { checkDns: target.checkDns });
    if ('error' in outcome) return jsonError(outcome.error, 400);

    const runAt = new Date();
    const existing = await prisma.scanFinding.findMany({ where: { campaignId: id, targetHost: target.host, source: 'auto' } });
    const known = new Map(existing.map((f) => [f.checkId, f]));
    const seen = new Set<string>();
    for (const f of outcome.findings) {
      seen.add(f.id);
      const values = { severity: f.severity, title: f.title, detail: f.detail, evidence: f.evidence ?? null, runAt };
      const previous = known.get(f.id);
      if (previous) await prisma.scanFinding.update({ where: { id: previous.id }, data: values });
      else await prisma.scanFinding.create({ data: { campaignId: id, targetHost: target.host, checkId: f.id, source: 'auto', status: 'Nouveau', ...values } });
    }
    // Un constat « Nouveau » qui n'apparaît plus a été corrigé ou n'est plus pertinent ; les constats déjà traités restent.
    const gone = existing.filter((f) => !seen.has(f.checkId) && f.status === 'Nouveau').map((f) => f.id);
    if (gone.length > 0) await prisma.scanFinding.deleteMany({ where: { id: { in: gone } } });
    await prisma.scanTarget.update({ where: { id: target.id }, data: { lastRunAt: runAt } });

    // Journal : le domaine et les adresses réellement contactées, pour pouvoir prouver ce qui a été fait.
    await logActivity(user, {
      action: 'scan.run', targetType: 'scan-campaign', targetId: id, organizationId: campaign.organizationId,
      metadata: { host: target.host, ips: outcome.addresses.join(','), findings: outcome.findings.length },
    });
    return NextResponse.json({ host: target.host, count: outcome.findings.length, removed: gone.length });
  },
  { roles: ['admin'] }
);
