// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { POST as GENERATE } from '@/app/api/audits/[id]/action-plan/generate/route';
import { GET as ORG_LIST } from '@/app/api/organizations/[id]/action-plan/route';
import { GET as CLIENT_LIST } from '@/app/api/client/action-plan/route';
import { PATCH as UPDATE_ITEM } from '@/app/api/action-plan/[id]/route';
import { PATCH as CLIENT_UPDATE_ITEM } from '@/app/api/client/action-plan/[id]/route';
import { POST as DRAFT_REMINDER } from '@/app/api/action-plan/[id]/reminders/route';
import { PATCH as REVIEW_REMINDER } from '@/app/api/action-plan/reminders/[id]/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id,
  email: `${id}@exemple.fr`,
  name: 'Client',
  role: 'client',
  organizationId,
});
const clientX = clientOf('org-x');
const clientY = clientOf('org-y');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const patch = (body: unknown) => ({
  method: 'PATCH',
  body: JSON.stringify(body),
  headers: { 'content-type': 'application/json' },
});
const post = (body: unknown) => ({
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'content-type': 'application/json' },
});

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe("génération du plan d'action depuis un audit", () => {
  it('refuse de générer un plan pour un audit sans client (400)', async () => {
    tables.audit.push({ id: 'a-no-org', userId: admin.id, organizationId: null, createdAt: new Date() });
    loginAs(admin);
    const res = await GENERATE(req('/api/audits/a-no-org/action-plan/generate', post({})), ctx({ id: 'a-no-org' }));
    expect(res.status).toBe(400);
    expect(tables.actionPlanItem).toHaveLength(0);
  });

  it("génère des actions pour les réponses faibles et respecte l'organisation de l'audit", async () => {
    tables.audit.push({ id: 'a-x', userId: admin.id, organizationId: 'org-x', createdAt: new Date('2026-01-01') });
    tables.auditResponse.push(
      { id: 'r1', auditId: 'a-x', question: 'g1', category: 'Gouvernance', answer: '1', score: 1 },
      // rgpd1 : question booléenne avec recommandations définies pour une réponse négative
      { id: 'r2', auditId: 'a-x', question: 'rgpd1', category: 'RGPD', answer: 'non', score: 0 }
    );
    loginAs(admin);
    const res = await GENERATE(req('/api/audits/a-x/action-plan/generate', post({})), ctx({ id: 'a-x' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.created).toBeGreaterThan(0);
    expect(tables.actionPlanItem.every((item) => item.organizationId === 'org-x')).toBe(true);
    expect(tables.actionPlanItem.every((item) => item.status === 'Non commencé')).toBe(true);
  });

  it('ne duplique pas les actions déjà générées (idempotent)', async () => {
    tables.audit.push({ id: 'a-x', userId: admin.id, organizationId: 'org-x', createdAt: new Date('2026-01-01') });
    tables.auditResponse.push({ id: 'r1', auditId: 'a-x', question: 'rgpd1', category: 'RGPD', answer: 'non', score: 0 });
    loginAs(admin);
    const first = await GENERATE(req('/api/audits/a-x/action-plan/generate', post({})), ctx({ id: 'a-x' }));
    const firstCount = tables.actionPlanItem.length;
    expect((await first.json()).created).toBe(firstCount);

    const second = await GENERATE(req('/api/audits/a-x/action-plan/generate', post({})), ctx({ id: 'a-x' }));
    const secondBody = await second.json();
    expect(secondBody.created).toBe(0);
    expect(secondBody.skipped).toBe(firstCount);
    expect(tables.actionPlanItem).toHaveLength(firstCount);
  });

  it('un non-admin ne peut pas générer de plan (403)', async () => {
    tables.audit.push({ id: 'a-x', userId: admin.id, organizationId: 'org-x', createdAt: new Date() });
    loginAs(clientX);
    const res = await GENERATE(req('/api/audits/a-x/action-plan/generate', post({})), ctx({ id: 'a-x' }));
    expect(res.status).toBe(403);
  });
});

describe('cloisonnement par organisation (lecture)', () => {
  beforeEach(() => {
    tables.actionPlanItem.push(
      { id: 'item-x', organizationId: 'org-x', title: 'Action X', category: 'Technique', priority: 'Haute', status: 'Non commencé', createdAt: new Date(), updatedAt: new Date() },
      { id: 'item-y', organizationId: 'org-y', title: 'Action Y', category: 'Technique', priority: 'Haute', status: 'Non commencé', createdAt: new Date(), updatedAt: new Date() }
    );
  });

  it("l'admin voit le plan complet d'un client via /api/organizations/[id]/action-plan", async () => {
    loginAs(admin);
    const res = await ORG_LIST(req('/api/organizations/org-x/action-plan'), ctx({ id: 'org-x' }));
    expect(res.status).toBe(200);
    const items = await res.json();
    expect(items.map((i: { id: string }) => i.id)).toEqual(['item-x']);
  });

  it('le client X ne voit que les actions de son organisation', async () => {
    loginAs(clientX);
    const res = await CLIENT_LIST(req('/api/client/action-plan'), ctx({}));
    const items = await res.json();
    expect(items.map((i: { id: string }) => i.id)).toEqual(['item-x']);
    expect(JSON.stringify(items)).not.toMatch(/Action Y/);
  });

  it('le client Y ne voit jamais les actions de X', async () => {
    loginAs(clientY);
    const res = await CLIENT_LIST(req('/api/client/action-plan'), ctx({}));
    const items = await res.json();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('item-y');
  });

  it('un client sans organisation reçoit 403, pas la liste complète', async () => {
    loginAs(clientOf(null, 'orphan'));
    const res = await CLIENT_LIST(req('/api/client/action-plan'), ctx({}));
    expect(res.status).toBe(403);
  });
});

describe("mise à jour d'une action (droits différenciés admin/client)", () => {
  beforeEach(() => {
    tables.actionPlanItem.push({
      id: 'item-x', organizationId: 'org-x', title: 'Titre initial', category: 'Technique',
      priority: 'Moyenne', responsible: null, dueDate: null, estimatedCost: null,
      status: 'Non commencé', proofOfCompletion: null, proofDate: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
  });

  it("l'admin peut modifier la définition de l'action", async () => {
    loginAs(admin);
    const res = await UPDATE_ITEM(
      req('/api/action-plan/item-x', patch({ title: 'Nouveau titre', estimatedCost: 1500, responsible: 'DSI', priority: 'Critique' })),
      ctx({ id: 'item-x' })
    );
    expect(res.status).toBe(200);
    const updated = tables.actionPlanItem.find((i) => i.id === 'item-x');
    expect(updated?.title).toBe('Nouveau titre');
    expect(updated?.estimatedCost).toBe(1500);
    expect(updated?.priority).toBe('Critique');
  });

  it('une priorité invalide est rejetée (400)', async () => {
    loginAs(admin);
    const res = await UPDATE_ITEM(req('/api/action-plan/item-x', patch({ priority: 'Urgentissime' })), ctx({ id: 'item-x' }));
    expect(res.status).toBe(400);
  });

  it("le client peut mettre à jour son avancement via sa propre route (statut, preuve)", async () => {
    loginAs(clientX);
    const res = await CLIENT_UPDATE_ITEM(
      req('/api/client/action-plan/item-x', patch({ status: 'Terminé', proofOfCompletion: 'https://exemple.fr/preuve.pdf' })),
      ctx({ id: 'item-x' })
    );
    expect(res.status).toBe(200);
    const updated = tables.actionPlanItem.find((i) => i.id === 'item-x');
    expect(updated?.status).toBe('Terminé');
    expect(updated?.proofOfCompletion).toBe('https://exemple.fr/preuve.pdf');
  });

  it("le client ne peut PAS modifier la définition de l'action (titre, coût, responsable ignorés)", async () => {
    loginAs(clientX);
    const res = await CLIENT_UPDATE_ITEM(
      req('/api/client/action-plan/item-x', patch({ title: 'Piraté', estimatedCost: 999999, status: 'En cours' })),
      ctx({ id: 'item-x' })
    );
    expect(res.status).toBe(200);
    const updated = tables.actionPlanItem.find((i) => i.id === 'item-x');
    expect(updated?.title).toBe('Titre initial');
    expect(updated?.estimatedCost).toBeNull();
    expect(updated?.status).toBe('En cours');
  });

  it("le client Y ne peut pas toucher une action de l'organisation X (404)", async () => {
    loginAs(clientY);
    const res = await CLIENT_UPDATE_ITEM(req('/api/client/action-plan/item-x', patch({ status: 'Terminé' })), ctx({ id: 'item-x' }));
    expect(res.status).toBe(404);
    expect(tables.actionPlanItem.find((i) => i.id === 'item-x')?.status).toBe('Non commencé');
  });

  it("le client n'utilise pas la route admin (403), l'admin n'utilise pas la route client (403)", async () => {
    loginAs(clientX);
    expect((await UPDATE_ITEM(req('/api/action-plan/item-x', patch({ status: 'Terminé' })), ctx({ id: 'item-x' }))).status).toBe(403);
    loginAs(admin);
    expect((await CLIENT_UPDATE_ITEM(req('/api/client/action-plan/item-x', patch({ status: 'Terminé' })), ctx({ id: 'item-x' }))).status).toBe(403);
  });

  it('401 sans session (route admin et route client)', async () => {
    loginAs(null);
    expect((await UPDATE_ITEM(req('/api/action-plan/item-x', patch({ status: 'Terminé' })), ctx({ id: 'item-x' }))).status).toBe(401);
    expect((await CLIENT_UPDATE_ITEM(req('/api/client/action-plan/item-x', patch({ status: 'Terminé' })), ctx({ id: 'item-x' }))).status).toBe(401);
  });
});

describe('relances (brouillon → approbation admin, jamais automatique)', () => {
  beforeEach(() => {
    tables.actionPlanItem.push({
      id: 'item-x', organizationId: 'org-x', title: 'Action en retard', category: 'Technique',
      priority: 'Haute', status: 'Non commencé', dueDate: new Date('2026-01-01'),
      createdAt: new Date(), updatedAt: new Date(),
    });
  });

  it('admin prépare une relance : reste en brouillon', async () => {
    loginAs(admin);
    const res = await DRAFT_REMINDER(req('/api/action-plan/item-x/reminders', post({})), ctx({ id: 'item-x' }));
    expect(res.status).toBe(201);
    const reminder = await res.json();
    expect(reminder.status).toBe('draft');
    expect(reminder.message).toMatch(/Action en retard/);
  });

  it("l'admin approuve une relance en brouillon", async () => {
    loginAs(admin);
    const draft = await (await DRAFT_REMINDER(req('/api/action-plan/item-x/reminders', post({})), ctx({ id: 'item-x' }))).json();
    const res = await REVIEW_REMINDER(
      req(`/api/action-plan/reminders/${draft.id}`, patch({ status: 'approved' })),
      ctx({ id: draft.id })
    );
    expect(res.status).toBe(200);
    const updated = await res.json();
    expect(updated.status).toBe('approved');
    expect(updated.approvedBy).toBe(admin.email);
  });

  it('impossible de ré-approuver une relance déjà traitée (409)', async () => {
    loginAs(admin);
    const draft = await (await DRAFT_REMINDER(req('/api/action-plan/item-x/reminders', post({})), ctx({ id: 'item-x' }))).json();
    await REVIEW_REMINDER(req(`/api/action-plan/reminders/${draft.id}`, patch({ status: 'approved' })), ctx({ id: draft.id }));
    const res = await REVIEW_REMINDER(req(`/api/action-plan/reminders/${draft.id}`, patch({ status: 'approved' })), ctx({ id: draft.id }));
    expect(res.status).toBe(409);
  });

  it('un client ne peut ni préparer ni approuver de relance (403)', async () => {
    loginAs(clientX);
    expect((await DRAFT_REMINDER(req('/api/action-plan/item-x/reminders', post({})), ctx({ id: 'item-x' }))).status).toBe(403);
    expect((await REVIEW_REMINDER(req('/api/action-plan/reminders/whatever', patch({ status: 'approved' })), ctx({ id: 'whatever' }))).status).toBe(403);
  });
});
