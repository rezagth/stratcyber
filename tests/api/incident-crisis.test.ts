// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { GET as GET_LOG, POST as POST_LOG } from '@/app/api/incidents/[id]/log/route';
import { GET as GET_CHECKLIST, PATCH as PATCH_CHECKLIST } from '@/app/api/incidents/[id]/checklist/route';
import { PATCH as PATCH_INCIDENT } from '@/app/api/incidents/[id]/route';
import { checklistFor } from '@/lib/incidents/checklist-template';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const client = { id: 'client-x', email: 'c@x.fr', name: 'Client', role: 'client', organizationId: 'org-x' };
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const addIncident = (id: string, organizationId: string, personalDataInvolved = false) =>
  tables.incidentCase.push({ id, organizationId, title: `Incident ${id}`, severity: 'Haute', status: 'Ouvert', detectedAt: new Date(), personalDataInvolved });

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  addIncident('inc-x', 'org-x');
  addIncident('inc-y', 'org-y');
});

describe('journal de crise', () => {
  it('refuse sans session (401) et aux non-administrateurs (403)', async () => {
    expect((await GET_LOG(req('/api/incidents/inc-x/log'), ctx({ id: 'inc-x' }))).status).toBe(401);
    for (const u of [userA, client]) {
      loginAs(u);
      expect((await GET_LOG(req('/api/incidents/inc-x/log'), ctx({ id: 'inc-x' }))).status).toBe(403);
      expect((await POST_LOG(req('/api/incidents/inc-x/log', json('POST', { message: 'x' })), ctx({ id: 'inc-x' }))).status).toBe(403);
    }
    expect(tables.incidentLogEntry).toHaveLength(0);
  });

  it('ajoute une entrée avec son auteur et la renvoie dans l\'ordre chronologique', async () => {
    loginAs(admin);
    const second = await POST_LOG(req('/api/incidents/inc-x/log', json('POST', { kind: 'decision', message: 'Isoler le serveur', occurredAt: hoursAgo(2) })), ctx({ id: 'inc-x' }));
    expect(second.status).toBe(201);
    await POST_LOG(req('/api/incidents/inc-x/log', json('POST', { kind: 'note', message: 'Premier constat', occurredAt: hoursAgo(3) })), ctx({ id: 'inc-x' }));
    const list = await (await GET_LOG(req('/api/incidents/inc-x/log'), ctx({ id: 'inc-x' }))).json();
    expect(list.map((e: { message: string }) => e.message)).toEqual(['Premier constat', 'Isoler le serveur']);
    expect(list[0].authorName).toBe('Admin');
    expect(tables.incidentLogEntry[0].organizationId).toBe('org-x');
  });

  it('valide le message, le type et la date', async () => {
    loginAs(admin);
    const post = (body: unknown) => POST_LOG(req('/api/incidents/inc-x/log', json('POST', body)), ctx({ id: 'inc-x' }));
    expect((await post({ message: '   ' })).status).toBe(400);
    expect((await post({ message: 'x'.repeat(2001) })).status).toBe(400);
    expect((await post({ message: 'ok', kind: 'pirate' })).status).toBe(400);
    expect((await post({ message: 'ok', occurredAt: 'pas-une-date' })).status).toBe(400);
    expect((await post({ message: 'ok', occurredAt: new Date(Date.now() + 3600_000).toISOString() })).status).toBe(400);
    expect(tables.incidentLogEntry).toHaveLength(0);
  });

  it('renvoie 404 pour un incident inconnu', async () => {
    loginAs(admin);
    expect((await POST_LOG(req('/api/incidents/nope/log', json('POST', { message: 'x' })), ctx({ id: 'nope' }))).status).toBe(404);
  });

  it("n'expose aucune route de modification ou de suppression (journal append-only)", async () => {
    const mod = await import('@/app/api/incidents/[id]/log/route');
    expect(Object.keys(mod).filter((k) => ['PATCH', 'PUT', 'DELETE'].includes(k))).toEqual([]);
  });

  it("ne mélange pas les journaux de deux incidents", async () => {
    loginAs(admin);
    await POST_LOG(req('/api/incidents/inc-x/log', json('POST', { message: 'pour X' })), ctx({ id: 'inc-x' }));
    await POST_LOG(req('/api/incidents/inc-y/log', json('POST', { message: 'pour Y' })), ctx({ id: 'inc-y' }));
    const list = await (await GET_LOG(req('/api/incidents/inc-x/log'), ctx({ id: 'inc-x' }))).json();
    expect(list).toHaveLength(1);
    expect(list[0].message).toBe('pour X');
  });
});

describe('checklist de réponse', () => {
  it('crée la checklist à la première lecture, sans doublon aux suivantes', async () => {
    loginAs(admin);
    const first = await (await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }))).json();
    expect(first).toHaveLength(checklistFor(false).length);
    await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }));
    expect(tables.incidentChecklistItem.filter((i) => i.incidentId === 'inc-x')).toHaveLength(checklistFor(false).length);
    expect(first.every((i: { done: boolean }) => i.done === false)).toBe(true);
  });

  it('ajoute les éléments RGPD quand les données personnelles sont déclarées ensuite', async () => {
    loginAs(admin);
    await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }));
    await PATCH_INCIDENT(req('/api/incidents/inc-x', json('PATCH', { personalDataInvolved: true })), ctx({ id: 'inc-x' }));
    const list = await (await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }))).json();
    expect(list).toHaveLength(checklistFor(true).length);
    expect(list.some((i: { templateKey: string }) => i.templateKey === 'notif-cnil')).toBe(true);
  });

  it('coche un élément et trace la coche dans le journal', async () => {
    loginAs(admin);
    const list = await (await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }))).json();
    const res = await PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: list[0].id, done: true })), ctx({ id: 'inc-x' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBe(true);
    expect(body.doneAt).toBeTruthy();
    expect(tables.incidentLogEntry).toHaveLength(1);
    expect(tables.incidentLogEntry[0].message).toContain(list[0].label);
  });

  it("ne trace rien dans le journal si l'état ne change pas", async () => {
    loginAs(admin);
    const list = await (await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }))).json();
    await PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: list[0].id, done: false })), ctx({ id: 'inc-x' }));
    expect(tables.incidentLogEntry).toHaveLength(0);
  });

  it("refuse de cocher l'élément d'un AUTRE incident (404) et valide le corps (400)", async () => {
    loginAs(admin);
    await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }));
    await GET_CHECKLIST(req('/api/incidents/inc-y/checklist'), ctx({ id: 'inc-y' }));
    const itemOfY = tables.incidentChecklistItem.find((i) => i.incidentId === 'inc-y')!;
    const cross = await PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: itemOfY.id, done: true })), ctx({ id: 'inc-x' }));
    expect(cross.status).toBe(404);
    expect(itemOfY.done).toBe(false);
    expect((await PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: 1, done: 'oui' })), ctx({ id: 'inc-x' }))).status).toBe(400);
  });

  it('refuse aux non-administrateurs', async () => {
    loginAs(client);
    expect((await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), ctx({ id: 'inc-x' }))).status).toBe(403);
    expect(tables.incidentChecklistItem).toHaveLength(0);
  });
});

describe('notification CNIL', () => {
  it("accepte cnilNotifiedAt sur la mise à jour d'un incident et rejette une date invalide", async () => {
    loginAs(admin);
    const ok = await PATCH_INCIDENT(req('/api/incidents/inc-x', json('PATCH', { cnilNotifiedAt: '2026-11-09T08:00:00Z' })), ctx({ id: 'inc-x' }));
    expect(ok.status).toBe(200);
    expect((await ok.json()).cnilNotifiedAt).toBeTruthy();
    const bad = await PATCH_INCIDENT(req('/api/incidents/inc-x', json('PATCH', { cnilNotifiedAt: 'nimporte quoi' })), ctx({ id: 'inc-x' }));
    expect(bad.status).toBe(400);
  });
});
