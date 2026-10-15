import { withApiAuth } from '@/lib/auth/api-auth';
import { updateActionPlanItem } from '@/lib/api/action-plan-update';

/** Met à jour une action du plan (module D) : administrateur. Voir lib/api/action-plan-update.ts. */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    return updateActionPlanItem(user, id, body);
  },
  { roles: ['admin'] }
);
