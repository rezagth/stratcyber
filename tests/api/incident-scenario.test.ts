// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { GET as GET_LOG, POST as POST_LOG } from '@/app/api/incidents/[id]/log/route';
import { GET as GET_CHECKLIST, PATCH as PATCH_CHECKLIST } from '@/app/api/incidents/[id]/checklist/route';
import { PATCH as PATCH_INCIDENT } from '@/app/api/incidents/[id]/route';
import { computeCrisisDeadlines } from '@/lib/incidents/deadlines';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const c = (id: string) => ctx({ id });
const noneSent = { earlyWarningSentAt: null, notificationSentAt: null, finalReportSentAt: null, cnilNotifiedAt: null };

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset().mockResolvedValue(sessionFor(admin as never));
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  tables.incidentCase.push(
    { id: 'inc-x', organizationId: 'org-x', title: 'Rançongiciel', severity: 'Critique', status: 'Ouvert', detectedAt: hoursAgo(30), personalDataInvolved: true },
    { id: 'inc-y', organizationId: 'org-y', title: 'Autre', severity: 'Haute', status: 'Ouvert', detectedAt: hoursAgo(1), personalDataInvolved: false },
  );
});

describe('scénario : une crise du début à la fin', () => {
  it('suit les échéances, la checklist et le journal, sans fuite vers un autre client', async () => {
    // 1. Ouverture de la page : la checklist est semée, avec les points « données personnelles ».
    const items = await (await GET_CHECKLIST(req('/api/incidents/inc-x/checklist'), c('inc-x'))).json();
    expect(items.length).toBeGreaterThan(0);
    const itemsY = await (await GET_CHECKLIST(req('/api/incidents/inc-y/checklist'), c('inc-y'))).json();
    expect(items.length).toBeGreaterThan(itemsY.length);

    // 2. À 30 h : l'alerte précoce (24 h) est dépassée, la notification (72 h) ne l'est pas.
    const before = computeCrisisDeadlines({ detectedAt: hoursAgo(30), personalDataInvolved: true, ...noneSent }, new Date());
    expect(before.find((d) => d.key === 'earlyWarning')?.state).toBe('overdue');
    expect(before.find((d) => d.key === 'notification')?.state).not.toBe('overdue');

    // 3. L'alerte a été envoyée il y a 5 h (heure réelle) : « fait en retard », journalisé.
    const sent = hoursAgo(5).toISOString();
    expect((await PATCH_INCIDENT(req('/api/incidents/inc-x', json('PATCH', { earlyWarningSentAt: sent })), c('inc-x'))).status).toBe(200);
    expect((await POST_LOG(req('/api/incidents/inc-x/log', json('POST', { kind: 'communication', message: 'Alerte précoce : envoyée', occurredAt: sent })), c('inc-x'))).status).toBe(201);
    const after = computeCrisisDeadlines({ detectedAt: hoursAgo(30), personalDataInvolved: true, ...noneSent, earlyWarningSentAt: new Date(sent) }, new Date());
    expect(after.find((d) => d.key === 'earlyWarning')?.state).toBe('doneLate');

    // 4. Cocher puis décocher un point écrit au journal ; recocher deux fois de suite n'en écrit pas de doublon.
    const target = items[0];
    const toggle = (done: boolean) => PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: target.id, done })), c('inc-x'));
    expect((await toggle(true)).status).toBe(200);
    expect((await toggle(true)).status).toBe(200);
    expect((await toggle(false)).status).toBe(200);
    const log = await (await GET_LOG(req('/api/incidents/inc-x/log'), c('inc-x'))).json();
    expect(log.filter((e: { message: string }) => e.message.includes(target.label))).toHaveLength(2);

    // 5. Un point de la checklist d'un autre incident ne peut pas être modifié par cette route.
    const foreign = itemsY[0];
    const res = await PATCH_CHECKLIST(req('/api/incidents/inc-x/checklist', json('PATCH', { itemId: foreign.id, done: true })), c('inc-x'));
    expect(res.status).toBe(404);
    expect(tables.incidentChecklistItem.find((i) => i.id === foreign.id)?.done).toBe(false);

    // 6. Clôture : le statut change et le journal du client Y reste vide.
    expect((await PATCH_INCIDENT(req('/api/incidents/inc-x', json('PATCH', { status: 'Clos' })), c('inc-x'))).status).toBe(200);
    expect(tables.incidentCase.find((i) => i.id === 'inc-x')?.status).toBe('Clos');
    const logY = await (await GET_LOG(req('/api/incidents/inc-y/log'), c('inc-y'))).json();
    expect(logY).toHaveLength(0);
  });
});
