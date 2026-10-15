import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSupplierEvidenceFields, SUPPLIER_EVIDENCE_SELECT } from '@/lib/api/supplier-evidence-fields';

/** Ajoute une preuve annuelle à un fournisseur : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: supplierId } = await params;
    const supplier = await prisma.supplier.findFirst({ where: { id: supplierId }, select: { id: true, organizationId: true } });
    if (!supplier) return jsonError('Fournisseur non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSupplierEvidenceFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const evidence = await prisma.supplierEvidence.create({
      // `isCreate: true` garantit que `parsed.data.label` et `.evidenceDate` sont présents.
      data: { ...parsed.data, supplierId, organizationId: supplier.organizationId } as Prisma.SupplierEvidenceUncheckedCreateInput,
      select: SUPPLIER_EVIDENCE_SELECT,
    });
    await logActivity(user, { action: 'supplier-evidence.create', targetType: 'supplierEvidence', targetId: evidence.id, organizationId: supplier.organizationId });
    return NextResponse.json(evidence, { status: 201 });
  },
  { roles: ['admin'] }
);
