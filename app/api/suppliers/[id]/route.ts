import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSupplierFields, SUPPLIER_SELECT } from '@/lib/api/supplier-fields';

/** Met à jour un fournisseur : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.supplier.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Fournisseur non trouvé', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSupplierFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const supplier = await prisma.supplier.update({ where: { id }, data: parsed.data, select: SUPPLIER_SELECT });
    await logActivity(user, { action: 'supplier.update', targetType: 'supplier', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(supplier);
  },
  { roles: ['admin'] }
);

/** Supprime un fournisseur (et ses preuves, en cascade) : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.supplier.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Fournisseur non trouvé', 404);

    await prisma.supplierEvidence.deleteMany({ where: { supplierId: id } });
    await prisma.supplier.deleteMany({ where: { id } });
    await logActivity(user, { action: 'supplier.delete', targetType: 'supplier', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
