import { withApiAuth } from '@/lib/auth/api-auth';
import { updateActionPlanItem } from '@/lib/api/action-plan-update';

/**
 * Met à jour l'avancement d'une action du plan (module D) : client connecté uniquement.
 * Route dédiée (plutôt que /api/action-plan/[id]) parce que le middleware confine les
 * comptes client à /client et /api/client/* — la logique réelle est partagée avec la
 * route admin via lib/api/action-plan-update.ts.
 */
export const PATCH = withApiAuth<{ id: string }>(
  async (request, { params, user }) => {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    return updateActionPlanItem(user, id, body);
  },
  { roles: ['client'] }
);
