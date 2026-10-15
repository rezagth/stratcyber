// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { toCsv } from '@/lib/security-answers/csv';
import { GET as LIST_ANSWERS, POST as CREATE_ANSWER } from '@/app/api/organizations/[id]/security-answers/route';
import { GET as EXPORT_ANSWERS } from '@/app/api/organizations/[id]/security-answers/export/route';
import { PATCH as UPDATE_ANSWER, DELETE as DELETE_ANSWER } from '@/app/api/security-answers/[id]/route';
import { GET as CLIENT_ANSWERS } from '@/app/api/client/security-answers/route';
import { GET as CLIENT_EXPORT } from '@/app/api/client/security-answers/export/route';
import { PATCH as CLIENT_VALIDATE } from '@/app/api/client/security-answers/[id]/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Direction Client', role: 'client', organizationId,
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

describe('export CSV (lib/security-answers/csv)', () => {
  it('échappe les virgules et guillemets, marque les N/A', () => {
    const csv = toCsv([{
      question: 'Chiffrez-vous les données "sensibles", au repos ?', answer: null,
      isNotApplicable: true, notApplicableReason: 'Aucune donnée sensible stockée',
      category: 'Technique', answeredAt: new Date('2026-01-15'), status: 'Validé',
      validatedByName: 'Jean Dupont', validatedAt: new Date('2026-01-20'),
    }]);
    expect(csv).toContain('"Chiffrez-vous les données ""sensibles"", au repos ?"');
    expect(csv).toContain('Oui,Aucune donnée sensible stockée');
    expect(csv).toContain('Jean Dupont');
  });
});

describe('bibliothèque de réponses (module F)', () => {
  it('rejette un "non applicable" sans motif', async () => {
    loginAs(admin);
    const res = await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({
      question: 'Avez-vous un SOC ?', isNotApplicable: true,
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('rejette une réponse normale sans contenu', async () => {
    loginAs(admin);
    const res = await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'x' })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(400);
  });

  it('crée une réponse honnête et une réponse "non applicable" motivée', async () => {
    loginAs(admin);
    const r1 = await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({
      question: 'Disposez-vous d\'un plan de réponse aux incidents ?', answer: 'Oui, testé en mars 2026.', category: 'Gouvernance',
    })), ctx({ id: 'org-x' }));
    expect(r1.status).toBe(201);
    expect((await r1.json()).status).toBe('Brouillon');

    const r2 = await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({
      question: 'Disposez-vous d\'un SOC externalisé ?', isNotApplicable: true, notApplicableReason: 'Pas de SOC, surveillance interne.',
    })), ctx({ id: 'org-x' }));
    expect(r2.status).toBe(201);
  });

  it('cloisonnement par client', async () => {
    loginAs(admin);
    await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'Q1', answer: 'A1' })), ctx({ id: 'org-x' }));
    const listY = await (await LIST_ANSWERS(req('/api/organizations/org-y/security-answers'), ctx({ id: 'org-y' }))).json();
    expect(listY).toHaveLength(0);
  });

  it("l'admin passe une réponse en \"À valider\"", async () => {
    loginAs(admin);
    const created = await (await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'Q1', answer: 'A1' })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_ANSWER(req(`/api/security-answers/${created.id}`, patch({ status: 'À valider' })), ctx({ id: created.id }));
    expect((await res.json()).status).toBe('À valider');
  });

  it("l'admin ne peut pas poser le statut \"Validé\" directement", async () => {
    loginAs(admin);
    const created = await (await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'Q1', answer: 'A1' })), ctx({ id: 'org-x' }))).json();
    const res = await UPDATE_ANSWER(req(`/api/security-answers/${created.id}`, patch({ status: 'Validé' })), ctx({ id: created.id }));
    expect(res.status).toBe(400);
  });

  it("modifier le contenu d'une réponse validée la repasse automatiquement en Brouillon", async () => {
    tables.securityAnswer.push({
      id: 'a-x', organizationId: 'org-x', question: 'Q1', answer: 'Ancienne réponse', isNotApplicable: false,
      notApplicableReason: null, category: null, answeredAt: new Date(), status: 'Validé',
      validatedByName: 'Direction Client', validatedAt: new Date(), createdAt: new Date(), updatedAt: new Date(),
    });
    loginAs(admin);
    const res = await UPDATE_ANSWER(req('/api/security-answers/a-x', patch({ answer: 'Nouvelle réponse' })), ctx({ id: 'a-x' }));
    const body = await res.json();
    expect(body.status).toBe('Brouillon');
    expect(body.validatedByName).toBeNull();
    expect(body.validatedAt).toBeNull();
  });

  it('le client valide une réponse "À valider" : nom et date fixés par le serveur', async () => {
    tables.securityAnswer.push({
      id: 'a-x', organizationId: 'org-x', question: 'Q1', answer: 'A1', isNotApplicable: false,
      notApplicableReason: null, category: null, answeredAt: new Date(), status: 'À valider',
      validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    loginAs(clientX);
    const res = await CLIENT_VALIDATE(req('/api/client/security-answers/a-x', patch({ validatedByName: 'Quelqu\'un d\'autre' })), ctx({ id: 'a-x' }));
    const body = await res.json();
    expect(body.status).toBe('Validé');
    expect(body.validatedByName).toBe('Direction Client');
  });

  it('le client ne peut pas valider un brouillon (409), ni la réponse d\'un autre client (404)', async () => {
    tables.securityAnswer.push(
      { id: 'a-x-draft', organizationId: 'org-x', question: 'Q1', answer: 'A1', isNotApplicable: false, notApplicableReason: null, category: null, answeredAt: new Date(), status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a-y', organizationId: 'org-y', question: 'Q2', answer: 'A2', isNotApplicable: false, notApplicableReason: null, category: null, answeredAt: new Date(), status: 'À valider', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    expect((await CLIENT_VALIDATE(req('/api/client/security-answers/a-x-draft', patch({})), ctx({ id: 'a-x-draft' }))).status).toBe(409);
    expect((await CLIENT_VALIDATE(req('/api/client/security-answers/a-y', patch({})), ctx({ id: 'a-y' }))).status).toBe(404);
  });

  it('un client ne peut ni créer, ni modifier, ni supprimer de réponse (403)', async () => {
    loginAs(clientX);
    expect((await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'x', answer: 'y' })), ctx({ id: 'org-x' }))).status).toBe(403);
    tables.securityAnswer.push({ id: 'a-x', organizationId: 'org-x', question: 'Q1', answer: 'A1', isNotApplicable: false, notApplicableReason: null, category: null, answeredAt: new Date(), status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() });
    expect((await UPDATE_ANSWER(req('/api/security-answers/a-x', patch({ answer: 'hack' })), ctx({ id: 'a-x' }))).status).toBe(403);
    expect((await DELETE_ANSWER(req('/api/security-answers/a-x', { method: 'DELETE' }), ctx({ id: 'a-x' }))).status).toBe(403);
  });

  it('le client X lit sa bibliothèque, jamais celle de Y', async () => {
    tables.securityAnswer.push(
      { id: 'a-x', organizationId: 'org-x', question: 'Q1', answer: 'A1', isNotApplicable: false, notApplicableReason: null, category: null, answeredAt: new Date(), status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 'a-y', organizationId: 'org-y', question: 'Q2', answer: 'A2', isNotApplicable: false, notApplicableReason: null, category: null, answeredAt: new Date(), status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date() }
    );
    loginAs(clientX);
    const list = await (await CLIENT_ANSWERS(req('/api/client/security-answers'), ctx({}))).json();
    expect(list.map((a: { id: string }) => a.id)).toEqual(['a-x']);
  });

  it('export CSV admin et client : bon type de contenu, pas de fuite inter-client', async () => {
    loginAs(admin);
    await CREATE_ANSWER(req('/api/organizations/org-x/security-answers', post({ question: 'Secret X', answer: 'Réponse X' })), ctx({ id: 'org-x' }));
    const adminExport = await EXPORT_ANSWERS(req('/api/organizations/org-x/security-answers/export'), ctx({ id: 'org-x' }));
    expect(adminExport.headers.get('content-type')).toContain('text/csv');
    expect(await adminExport.text()).toContain('Secret X');

    loginAs(clientY);
    const clientExport = await CLIENT_EXPORT(req('/api/client/security-answers/export'), ctx({}));
    const csvText = await clientExport.text();
    expect(csvText).not.toContain('Secret X');
  });
});
