import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { SUPPLIER_SELECT } from '@/lib/api/supplier-fields';
import { SUPPLIER_EVIDENCE_SELECT } from '@/lib/api/supplier-evidence-fields';

/** Registre des fournisseurs de l'organisation du client connecté (lecture seule). */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { ...SUPPLIER_SELECT, evidences: { orderBy: { evidenceDate: 'desc' }, select: SUPPLIER_EVIDENCE_SELECT } },
    });
    return NextResponse.json(suppliers);
  },
  { roles: ['client'] }
);
