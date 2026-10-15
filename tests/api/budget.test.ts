// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { buildBudgetDashboard } from '@/lib/budget/dashboard';
import { GET as LIST_ENVELOPES, POST as CREATE_ENVELOPE } from '@/app/api/organizations/[id]/budget/envelopes/route';
import { PATCH as UPDATE_ENVELOPE, DELETE as DELETE_ENVELOPE } from '@/app/api/budget/envelopes/[id]/route';
import { GET as CLIENT_ENVELOPES } from '@/app/api/client/budget/envelopes/route';
import { GET as LIST_EXPENSES, POST as CREATE_EXPENSE } from '@/app/api/organizations/[id]/budget/expenses/route';
import { PATCH as UPDATE_EXPENSE, DELETE as DELETE_EXPENSE } from '@/app/api/budget/expenses/[id]/route';
import { GET as CLIENT_EXPENSES } from '@/app/api/client/budget/expenses/route';
import { GET as ADMIN_DASHBOARD } from '@/app/api/organizations/[id]/budget/dashboard/route';
import { GET as CLIENT_DASHBOARD } from '@/app/api/client/budget/dashboard/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Client', role: 'client', organizationId,
});
const clientX = clientOf('org-x');
const clientY = clientOf('org-y');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const patch = (body: unknown) => ({ method: 'PATCH', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('enveloppes budgétaires (module I)', () => {
  it('crée une enveloppe pour un exercice', async () => {
    loginAs(admin);
    const res = await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({
      fiscalYear: 2026, allocatedAmount: 50000, note: 'Enveloppe validée en comité',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.fiscalYear).toBe(2026);
    expect(body.allocatedAmount).toBe(50000);
  });

  it('rejette un exercice ou un montant invalide', async () => {
    loginAs(admin);
    expect((await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 1999, allocatedAmount: 1000 })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: -1 })), ctx({ id: 'org-x' }))).status).toBe(400);
  });

  it('refuse une seconde enveloppe pour le même exercice (409)', async () => {
    loginAs(admin);
    await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: 10000 })), ctx({ id: 'org-x' }));
    const res = await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: 20000 })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(409);
  });

  it("l'admin met à jour et supprime une enveloppe", async () => {
    loginAs(admin);
    const created = await (await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: 10000 })), ctx({ id: 'org-x' }))).json();
    const updated = await UPDATE_ENVELOPE(req(`/api/budget/envelopes/${created.id}`, patch({ allocatedAmount: 15000 })), ctx({ id: created.id }));
    expect((await updated.json()).allocatedAmount).toBe(15000);
    expect((await DELETE_ENVELOPE(req(`/api/budget/envelopes/${created.id}`, { method: 'DELETE' }), ctx({ id: created.id }))).status).toBe(200);
  });

  it('refuse de déplacer une enveloppe vers un exercice déjà utilisé (409)', async () => {
    loginAs(admin);
    await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: 10000 })), ctx({ id: 'org-x' }));
    const other = await (await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2027, allocatedAmount: 10000 })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_ENVELOPE(req(`/api/budget/envelopes/${other.id}`, patch({ fiscalYear: 2026 })), ctx({ id: other.id }));
    expect(res.status).toBe(409);
  });

  it('un client ne peut ni créer, ni modifier, ni supprimer d\'enveloppe (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_ENVELOPE(req('/api/organizations/org-x/budget/envelopes', post({ fiscalYear: 2026, allocatedAmount: 1000 })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.budgetEnvelope.push({ id: 'e-x', organizationId: 'org-x', fiscalYear: 2026, allocatedAmount: 1000, note: null, createdAt: new Date(), updatedAt: new Date() });
    expect((await UPDATE_ENVELOPE(req('/api/budget/envelopes/e-x', patch({ allocatedAmount: 2000 })), ctx({ id: 'e-x' }))).status).toBe(403);
    expect((await DELETE_ENVELOPE(req('/api/budget/envelopes/e-x', { method: 'DELETE' }), ctx({ id: 'e-x' }))).status).toBe(403);
  });

  it('cloisonnement par client sur les enveloppes', async () => {
    tables.budgetEnvelope.push(
      { id: 'e-x', organizationId: 'org-x', fiscalYear: 2026, allocatedAmount: 1000, note: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'e-y', organizationId: 'org-y', fiscalYear: 2026, allocatedAmount: 2000, note: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_ENVELOPES(req('/api/client/budget/envelopes'), ctx({}))).json();
    expect(list.map((e: { id: string }) => e.id)).toEqual(['e-x']);
  });
});

describe('dépenses budgétaires (module I)', () => {
  it('enregistre une dépense catégorisée', async () => {
    loginAs(admin);
    const res = await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({
      fiscalYear: 2026, category: 'Outils et licences', label: 'Licence EDR', amount: 3000, expenseDate: '2026-03-01',
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.amount).toBe(3000);
    expect(body.category).toBe('Outils et licences');
  });

  it('rejette une dépense sans libellé, sans date ou avec une catégorie inconnue', async () => {
    loginAs(admin);
    expect((await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({ fiscalYear: 2026, amount: 100, expenseDate: '2026-01-01' })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({ fiscalYear: 2026, label: 'x', amount: 100 })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({ fiscalYear: 2026, label: 'x', amount: 100, expenseDate: '2026-01-01', category: 'Marketing' })), ctx({ id: 'org-x' }))).status).toBe(400);
  });

  it("l'admin met à jour et supprime une dépense", async () => {
    loginAs(admin);
    const created = await (await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({
      fiscalYear: 2026, label: 'Audit annuel', amount: 8000, expenseDate: '2026-05-01',
    })), ctx({ id: 'org-x' }))).json();
    const updated = await UPDATE_EXPENSE(req(`/api/budget/expenses/${created.id}`, patch({ amount: 8500 })), ctx({ id: created.id }));
    expect((await updated.json()).amount).toBe(8500);
    expect((await DELETE_EXPENSE(req(`/api/budget/expenses/${created.id}`, { method: 'DELETE' }), ctx({ id: created.id }))).status).toBe(200);
  });

  it('un client ne peut ni ajouter, ni modifier, ni supprimer de dépense (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_EXPENSE(req('/api/organizations/org-x/budget/expenses', post({ fiscalYear: 2026, label: 'x', amount: 100, expenseDate: '2026-01-01' })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.budgetExpense.push({ id: 'x-1', organizationId: 'org-x', fiscalYear: 2026, category: null, label: 'x', amount: 100, expenseDate: new Date(), note: null, createdAt: new Date(), updatedAt: new Date() });
    expect((await UPDATE_EXPENSE(req('/api/budget/expenses/x-1', patch({ amount: 200 })), ctx({ id: 'x-1' }))).status).toBe(403);
    expect((await DELETE_EXPENSE(req('/api/budget/expenses/x-1', { method: 'DELETE' }), ctx({ id: 'x-1' }))).status).toBe(403);
  });

  it('cloisonnement par client sur les dépenses', async () => {
    tables.budgetExpense.push(
      { id: 'x-x', organizationId: 'org-x', fiscalYear: 2026, category: null, label: 'Dépense X', amount: 100, expenseDate: new Date(), note: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'x-y', organizationId: 'org-y', fiscalYear: 2026, category: null, label: 'Dépense Y', amount: 200, expenseDate: new Date(), note: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_EXPENSES(req('/api/client/budget/expenses'), ctx({}))).json();
    expect(list.map((e: { id: string }) => e.id)).toEqual(['x-x']);
  });
});

describe('tableau de bord budgétaire (agrégation, module I)', () => {
  beforeEach(() => {
    tables.budgetEnvelope.push({ id: 'e-x', organizationId: 'org-x', fiscalYear: 2026, allocatedAmount: 50000, note: null, createdAt: new Date(), updatedAt: new Date() });
    tables.budgetExpense.push(
      { id: 'x1', organizationId: 'org-x', fiscalYear: 2026, category: 'Outils et licences', label: 'EDR', amount: 3000, expenseDate: new Date('2026-03-01'), note: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'x2', organizationId: 'org-x', fiscalYear: 2026, category: 'Formation', label: 'Sensibilisation', amount: 2000, expenseDate: new Date('2026-04-01'), note: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'x3', organizationId: 'org-x', fiscalYear: 2025, category: 'Audit et conseil', label: 'Audit 2025', amount: 9000, expenseDate: new Date('2025-06-01'), note: null, createdAt: new Date(), updatedAt: new Date() }
    );
    tables.actionPlanItem.push(
      { id: 'a1', organizationId: 'org-x', title: 'Déployer MFA', status: 'Non commencé', priority: 'Haute', estimatedCost: 4000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a2', organizationId: 'org-x', title: 'Sans coût estimé', status: 'Non commencé', priority: 'Moyenne', estimatedCost: null, createdAt: new Date(), updatedAt: new Date() }
    );
  });

  it('agrège allocation, coût prévisionnel et dépenses réelles pour un exercice, sans mélanger les exercices', async () => {
    const dashboard = await buildBudgetDashboard('org-x', 2026);
    expect(dashboard.allocated).toBe(50000);
    expect(dashboard.plannedCost).toBe(4000);
    expect(dashboard.actualSpent).toBe(5000);
    expect(dashboard.remaining).toBe(45000);
    expect(dashboard.byCategory['Outils et licences']).toBe(3000);
    expect(dashboard.byCategory['Formation']).toBe(2000);
    expect(dashboard.byCategory['Audit et conseil']).toBeUndefined();
  });

  it('un exercice sans enveloppe renvoie une allocation nulle, jamais une erreur', async () => {
    const dashboard = await buildBudgetDashboard('org-x', 2099);
    expect(dashboard.allocated).toBe(0);
    expect(dashboard.actualSpent).toBe(0);
  });

  it('le tableau de bord est cloisonné par client (admin et client)', async () => {
    loginAs(admin);
    const adminRes = await (await ADMIN_DASHBOARD(req('/api/organizations/org-x/budget/dashboard?year=2026'), ctx({ id: 'org-x' }))).json();
    expect(adminRes.allocated).toBe(50000);

    loginAs(clientY);
    const clientRes = await (await CLIENT_DASHBOARD(req('/api/client/budget/dashboard?year=2026'), ctx({}))).json();
    expect(clientRes.allocated).toBe(0);
    expect(clientRes.actualSpent).toBe(0);
  });
});
