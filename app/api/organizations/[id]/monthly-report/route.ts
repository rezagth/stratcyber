import { NextResponse } from 'next/server';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { parsePeriodParams } from '@/lib/api/monthly-report-period';
import { buildMonthlyReportData } from '@/lib/monthly-report/data';
import { renderMonthlyReportPdf } from '@/lib/monthly-report/render';

/** Rapport mensuel PDF d'un client (module K), pour le mois donné (mois courant par défaut) : administrateur uniquement. */
export const GET = withApiAuth<{ id: string }>(
  async (request, { params }) => {
    const { id: organizationId } = await params;
    const period = parsePeriodParams(new URL(request.url));
    if ('error' in period) return jsonError(period.error, 400);

    const data = await buildMonthlyReportData(organizationId, period.month, period.year);
    if (!data) return jsonError('Client non trouvé', 404);

    const pdf = await renderMonthlyReportPdf(data);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-mensuel-${organizationId}-${period.year}-${String(period.month).padStart(2, '0')}.pdf"`,
      },
    });
  },
  { roles: ['admin'] }
);
