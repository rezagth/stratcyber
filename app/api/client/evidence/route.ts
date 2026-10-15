import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';

/**
 * "Mes preuves" (module M) : vue consolidée des preuves du client connecté, qu'elles
 * viennent du coffre de preuves (module B, rattachées à un contrôle) ou du registre
 * fournisseurs (module H, preuves annuelles) — triées par urgence d'expiration.
 */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const [controlEvidence, supplierEvidence] = await Promise.all([
      prisma.evidence.findMany({
        where,
        select: { id: true, label: true, source: true, evidenceDate: true, expiresAt: true, link: true, control: { select: { title: true } } },
      }),
      prisma.supplierEvidence.findMany({
        where,
        select: { id: true, label: true, evidenceDate: true, expiresAt: true, link: true, supplier: { select: { name: true } } },
      }),
    ]);

    const items = [
      ...controlEvidence.map((e) => ({
        id: e.id, origin: 'control' as const, source: e.control.title, label: e.label,
        evidenceDate: e.evidenceDate, expiresAt: e.expiresAt, link: e.link,
      })),
      ...supplierEvidence.map((e) => ({
        id: e.id, origin: 'supplier' as const, source: e.supplier.name, label: e.label,
        evidenceDate: e.evidenceDate, expiresAt: e.expiresAt, link: e.link,
      })),
    ].sort((a, b) => {
      // Les preuves sans date d'expiration passent en dernier, le reste par urgence croissante.
      if (!a.expiresAt && !b.expiresAt) return 0;
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;
      return +new Date(a.expiresAt) - +new Date(b.expiresAt);
    });

    return NextResponse.json(items);
  },
  { roles: ['client'] }
);
