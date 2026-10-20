import { NextResponse } from 'next/server';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { buildAuditReportData } from '@/lib/audit-report/data';
import { renderAuditReportPdf } from '@/lib/audit-report/render';
import { logActivity } from '@/lib/activity-log';

/**
 * Rapport PDF d'un audit. Le périmètre est calculé côté serveur à partir de la session :
 * propriétaire pour admin/user, audits partagés de son organisation pour un client.
 * Audit absent ou hors périmètre : même 404.
 */
export const GET = withApiAuth<{ id: string }>(
  async (_request, { params, user }) => {
    const { id } = await params;

    const data = await buildAuditReportData(user, id);
    if (!data) return jsonError('Audit non trouvé', 404);

    const pdf = await renderAuditReportPdf(data);
    await logActivity(user, {
      action: 'audit.report-pdf',
      targetType: 'audit',
      targetId: data.audit.id,
      organizationId: user.organizationId ?? null,
    });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-audit-${data.audit.id}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  },
  { roles: ['admin', 'user', 'client'] }
);
