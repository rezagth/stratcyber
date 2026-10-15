import { NextResponse } from 'next/server';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { parsePeriodParams } from '@/lib/api/monthly-report-period';
import { buildMonthlyReportData } from '@/lib/monthly-report/data';
import { renderMonthlyReportPdf } from '@/lib/monthly-report/render';

/** Rapport mensuel PDF de l'organisation du client connecté, pour le mois donné (mois courant par défaut). */
export const GET = withApiAuth(
  async (request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const period = parsePeriodParams(new URL(request.url));
    if ('error' in period) return jsonError(period.error, 400);

    const data = await buildMonthlyReportData(where.organizationId, period.month, period.year);
    if (!data) return jsonError('Client non trouvé', 404);

    const pdf = await renderMonthlyReportPdf(data);
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-mensuel-${period.year}-${String(period.month).padStart(2, '0')}.pdf"`,
      },
    });
  },
  { roles: ['client'] }
);
