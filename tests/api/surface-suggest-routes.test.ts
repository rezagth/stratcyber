// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/surface/dns-check', async (orig) => {
  const real = await orig<typeof import('@/lib/surface/dns-check')>();
  const fake = {
    resolveTxt: async (name: string) => { if (name === 'exemple.fr') return [['v=spf1 +all']]; throw Object.assign(new Error('x'), { code: 'ENODATA' }); },
    resolveMx: async () => [],
  };
  return { ...real, checkDomain: (d: unknown) => real.checkDomain(d, fake) };
});

import { POST as SURFACE } from '@/app/api/organizations/[id]/surface-check/route';
import { POST as SUGGEST } from '@/app/api/organizations/[id]/security-answers/suggest/route';

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  delete process.env.ANTHROPIC_API_KEY; delete process.env.AI_MODEL;
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('contrôle de domaine', () => {
  it('refuse les non-administrateurs', async () => {
    loginAs(userA);
    expect((await SURFACE(req('/api/organizations/org-x/surface-check', json({ domain: 'exemple.fr' })), ctx({ id: 'org-x' }))).status).toBe(403);
  });
  it('refuse un domaine invalide (400) et un client inconnu (404)', async () => {
    loginAs(admin);
    expect((await SURFACE(req('/x', json({ domain: 'http://exemple.fr' })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await SURFACE(req('/x', json({ domain: 'exemple.fr' })), ctx({ id: 'nope' }))).status).toBe(404);
  });
  it('renvoie les constats triés et n\'ajoute rien au plan sans demande', async () => {
    loginAs(admin);
    const res = await SURFACE(req('/x', json({ domain: 'exemple.fr' })), ctx({ id: 'org-x' }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.findings[0].severity).toBe('Critique');
    expect(body.created).toBe(0);
    expect(tables.actionPlanItem).toHaveLength(0);
  });
  it('ajoute les points à corriger au plan du bon client, une seule fois', async () => {
    loginAs(admin);
    const first = await (await SURFACE(req('/x', json({ domain: 'exemple.fr', addToPlan: true })), ctx({ id: 'org-x' }))).json();
    expect(first.created).toBeGreaterThan(0);
    expect(tables.actionPlanItem.every((i) => i.organizationId === 'org-x')).toBe(true);
    const count = tables.actionPlanItem.length;
    const again = await (await SURFACE(req('/x', json({ domain: 'exemple.fr', addToPlan: true })), ctx({ id: 'org-x' }))).json();
    expect(again.created).toBe(0);
    expect(tables.actionPlanItem).toHaveLength(count);
  });
});

describe('aide à la réponse', () => {
  beforeEach(() => {
    tables.securityAnswer.push(
      { id: 's1', organizationId: 'org-x', question: 'Les sauvegardes sont-elles chiffrées ?', answer: 'Oui, chiffrées.', isNotApplicable: false, notApplicableReason: null, status: 'Validé', answeredAt: new Date('2026-02-01') },
      { id: 's2', organizationId: 'org-y', question: 'Les sauvegardes sont-elles chiffrées ?', answer: 'Réponse du client Y', isNotApplicable: false, notApplicableReason: null, status: 'Validé', answeredAt: new Date('2026-02-01') },
    );
  });
  it('refuse les non-administrateurs et valide la question', async () => {
    loginAs(userA);
    expect((await SUGGEST(req('/x', json({ question: 'sauvegardes chiffrées ?' })), ctx({ id: 'org-x' }))).status).toBe(403);
    loginAs(admin);
    expect((await SUGGEST(req('/x', json({ question: 'ab' })), ctx({ id: 'org-x' }))).status).toBe(400);
  });
  it('ne cherche que dans les réponses du client demandé', async () => {
    loginAs(admin);
    const body = await (await SUGGEST(req('/x', json({ question: 'Vos sauvegardes sont-elles chiffrées ?' })), ctx({ id: 'org-x' }))).json();
    expect(body.matches.map((m: { id: string }) => m.id)).toEqual(['s1']);
    expect(JSON.stringify(body)).not.toContain('client Y');
  });
  it('ne produit pas de brouillon IA sans demande explicite ni configuration', async () => {
    loginAs(admin);
    const a = await (await SUGGEST(req('/x', json({ question: 'Vos sauvegardes sont-elles chiffrées ?' })), ctx({ id: 'org-x' }))).json();
    const b = await (await SUGGEST(req('/x', json({ question: 'Vos sauvegardes sont-elles chiffrées ?', useAi: true })), ctx({ id: 'org-x' }))).json();
    expect(a.draft).toBeNull();
    expect(b.draft).toBeNull();
    expect(b.aiAvailable).toBe(false);
  });
});
