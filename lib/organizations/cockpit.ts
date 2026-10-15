import { prisma } from '@/lib/db';

const EXPIRY_HORIZON_DAYS = 30;

const countByOrg = (rows: { organizationId: string | null }[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (!r.organizationId) continue;
    map.set(r.organizationId, (map.get(r.organizationId) ?? 0) + 1);
  }
  return map;
};

/**
 * Cockpit admin (module L) : liste des clients enrichie du dernier score d'audit
 * partagé, du nombre d'actions en retard et du nombre de preuves (coffre de preuves,
 * fournisseurs) expirées ou qui expirent sous 30 jours. Purement une lecture agrégée,
 * recalculée à la demande — ne duplique aucune donnée des modules existants.
 *
 * Le score d'audit n'apparaît que pour un client dont un audit a été explicitement
 * partagé par l'admin (Audit.organizationId défini) : un audit encore personnel à un
 * compte `user` n'est jamais rattaché automatiquement à un client.
 */
export async function buildClientsCockpit() {
  const now = new Date();
  const soon = new Date(now.getTime() + EXPIRY_HORIZON_DAYS * 24 * 60 * 60 * 1000);

  const [organizations, audits, overdueActions, expiringEvidence, expiringSupplierEvidence] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, sector: true, size: true, createdAt: true },
    }),
    prisma.audit.findMany({
      where: { organizationId: { not: null }, sharedWithClient: true },
      orderBy: { createdAt: 'desc' },
      select: { organizationId: true, score: true, maturity: true },
    }),
    prisma.actionPlanItem.findMany({
      where: { status: { not: 'Terminé' }, dueDate: { lt: now } },
      select: { organizationId: true },
    }),
    prisma.evidence.findMany({ where: { expiresAt: { lt: soon } }, select: { organizationId: true } }),
    prisma.supplierEvidence.findMany({ where: { expiresAt: { lt: soon } }, select: { organizationId: true } }),
  ]);

  const latestAuditByOrg = new Map<string, { score: number | null; maturity: string | null }>();
  for (const a of audits) {
    if (a.organizationId && !latestAuditByOrg.has(a.organizationId)) {
      latestAuditByOrg.set(a.organizationId, { score: a.score, maturity: a.maturity });
    }
  }
  const overdueByOrg = countByOrg(overdueActions);
  const evidenceByOrg = countByOrg(expiringEvidence);
  const supplierEvidenceByOrg = countByOrg(expiringSupplierEvidence);

  return organizations.map((org) => ({
    ...org,
    score: latestAuditByOrg.get(org.id)?.score ?? null,
    maturity: latestAuditByOrg.get(org.id)?.maturity ?? null,
    overdueActions: overdueByOrg.get(org.id) ?? 0,
    expiringEvidence: (evidenceByOrg.get(org.id) ?? 0) + (supplierEvidenceByOrg.get(org.id) ?? 0),
  }));
}
