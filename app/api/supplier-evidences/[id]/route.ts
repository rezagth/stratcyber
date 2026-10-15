import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { logActivity } from '@/lib/activity-log';
import { parseSupplierEvidenceFields, SUPPLIER_EVIDENCE_SELECT } from '@/lib/api/supplier-evidence-fields';

/** Met à jour une preuve fournisseur : administrateur uniquement. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.supplierEvidence.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Preuve non trouvée', 404);

    const body = await request.json().catch(() => null);
    const parsed = parseSupplierEvidenceFields(body, { isCreate: false });
    if ('error' in parsed) return jsonError(parsed.error, 400);
    if (Object.keys(parsed.data).length === 0) return jsonError('Aucun champ valide à mettre à jour', 400);

    const evidence = await prisma.supplierEvidence.update({ where: { id }, data: parsed.data, select: SUPPLIER_EVIDENCE_SELECT });
    await logActivity(user, { action: 'supplier-evidence.update', targetType: 'supplierEvidence', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json(evidence);
  },
  { roles: ['admin'] }
);

/** Supprime une preuve fournisseur : administrateur uniquement. */
export const DELETE = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;
    const existing = await prisma.supplierEvidence.findFirst({ where: { id }, select: { id: true, organizationId: true } });
    if (!existing) return jsonError('Preuve non trouvée', 404);

    await prisma.supplierEvidence.deleteMany({ where: { id } });
    await logActivity(user, { action: 'supplier-evidence.delete', targetType: 'supplierEvidence', targetId: id, organizationId: existing.organizationId });
    return NextResponse.json({ id });
  },
  { roles: ['admin'] }
);
