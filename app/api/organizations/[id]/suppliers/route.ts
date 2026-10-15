import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSupplierFields, SUPPLIER_SELECT } from '@/lib/api/supplier-fields';
import { SUPPLIER_EVIDENCE_SELECT } from '@/lib/api/supplier-evidence-fields';

/** Registre des fournisseurs d'un client : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params }) => {
    const { id: organizationId } = await params;
    const suppliers = await prisma.supplier.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: { ...SUPPLIER_SELECT, evidences: { orderBy: { evidenceDate: 'desc' }, select: SUPPLIER_EVIDENCE_SELECT } },
    });
    return NextResponse.json(suppliers);
  },
  { roles: ['admin'] }
);

/** Ajoute un fournisseur au registre d'un client : administrateur uniquement. */
export const POST = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id: organizationId } = await params;
    const organization = await prisma.organization.findFirst({ where: { id: organizationId }, select: { id: true } });
    if (!organization) return jsonError('Client non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSupplierFields(body, { isCreate: true });
    if ('error' in parsed) return jsonError(parsed.error, 400);

    const supplier = await prisma.supplier.create({
      // `isCreate: true` garantit que `parsed.data.name` est présent.
      data: { ...parsed.data, organizationId } as Prisma.SupplierUncheckedCreateInput,
      select: SUPPLIER_SELECT,
    });
    await logActivity(user, { action: 'supplier.create', targetType: 'supplier', targetId: supplier.id, organizationId });
    return NextResponse.json(supplier, { status: 201 });
  },
  { roles: ['admin'] }
);
