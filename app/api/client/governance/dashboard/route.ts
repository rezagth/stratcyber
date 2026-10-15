import { NextResponse } from 'next/server';
import { jsonError, withApiAuth } from '@/lib/auth/api-auth';
import { organizationScopeWhere } from '@/lib/auth/access';
import { buildGovernanceDashboard } from '@/lib/governance/dashboard';

/** Tableau de bord de direction du client connecté. */
export const GET = withApiAuth(
  async (_request, { user }) => {
    const where = organizationScopeWhere(user);
    if (!where || !('organizationId' in where)) return jsonError('Accès interdit', 403);

    const dashboard = await buildGovernanceDashboard(where.organizationId);
    return NextResponse.json(dashboard);
  },
  { roles: ['client'] }
);
