// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb, tables } from '../helpers/fake-prisma';
import { setEmailProviderForTests } from '@/lib/email/get-provider';
import { SimulationProvider } from '@/lib/email/simulation-provider';
import { ResendProvider } from '@/lib/email/resend-provider';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});

import { runReminderJob } from '@/lib/reminders/job';
import { GET } from '@/app/api/cron/reminders/route';
import { NextRequest } from 'next/server';

const now = new Date('2026-11-08T08:00:00Z');
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);
let provider: SimulationProvider;

beforeEach(() => {
  resetDb();
  provider = new SimulationProvider();
  setEmailProviderForTests(provider);
  vi.spyOn(console, 'info').mockImplementation(() => {});
  tables.organization.push({ id: 'org-x', name: 'Client X' });
  tables.user.push(
    { id: 'adm', email: 'admin@cabinet.fr', role: 'admin' },
    { id: 'cli', email: 'dsi@client.fr', role: 'client', organizationId: 'org-x' },
  );
});

describe('tâche de relances', () => {
  it("n'envoie rien quand il n'y a rien à signaler", async () => {
    const res = await runReminderJob(now);
    expect(provider.outbox).toHaveLength(0);
    expect(res.overdueActions).toBe(0);
  });

  it('envoie un résumé à l\'administrateur pour une action en retard et un délai dépassé', async () => {
    tables.actionPlanItem.push({ id: 'a1', organizationId: 'org-x', title: 'Activer la MFA', priority: 'Critique', status: 'Non commencé', dueDate: hoursAgo(48) });
    tables.actionPlanItem.push({ id: 'a2', organizationId: 'org-x', title: 'Déjà fait', priority: 'Haute', status: 'Terminé', dueDate: hoursAgo(48) });
    tables.incidentCase.push({ id: 'i1', organizationId: 'org-x', title: 'Rançongiciel', status: 'Ouvert', detectedAt: hoursAgo(30), personalDataInvolved: false });
    const res = await runReminderJob(now);
    expect(res.overdueActions).toBe(1);
    expect(res.urgentDeadlines).toBeGreaterThan(0);
    expect(res.adminDigests.sent).toBe(1);
    expect(provider.outbox).toHaveLength(1);
    const mail = provider.outbox[0];
    expect(mail.to).toBe('admin@cabinet.fr');
    expect(mail.text).toContain('Activer la MFA');
    expect(mail.text).toContain('Client X');
    expect(mail.text).toContain('Alerte précoce');
    expect(mail.text).not.toContain('Déjà fait');
  });

  it('ignore un incident clos et est idempotente le même jour', async () => {
    tables.incidentCase.push({ id: 'i2', organizationId: 'org-x', title: 'Clos', status: 'Clos', detectedAt: hoursAgo(30), personalDataInvolved: false });
    tables.actionPlanItem.push({ id: 'a1', organizationId: 'org-x', title: 'En retard', priority: 'Haute', status: 'En cours', dueDate: hoursAgo(24) });
    const first = await runReminderJob(now);
    expect(first.urgentDeadlines).toBe(0);
    const second = await runReminderJob(now);
    expect(first.adminDigests.sent).toBe(1);
    expect(second.adminDigests).toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(provider.outbox).toHaveLength(1);
  });

  it('n\'envoie aux clients que les relances approuvées, une seule fois', async () => {
    tables.actionPlanItem.push({ id: 'a1', organizationId: 'org-x', title: 'Sauvegardes', priority: 'Haute', status: 'Non commencé', dueDate: null });
    tables.actionReminder.push(
      { id: 'r1', actionPlanItemId: 'a1', organizationId: 'org-x', message: 'Merci de planifier les sauvegardes.', status: 'approved' },
      { id: 'r2', actionPlanItemId: 'a1', organizationId: 'org-x', message: 'Brouillon à ne pas envoyer', status: 'draft' },
    );
    const first = await runReminderJob(now);
    expect(first.clientReminders.sent).toBe(1);
    expect(provider.outbox.map((m) => m.to)).toEqual(['dsi@client.fr']);
    expect(provider.outbox[0].text).toContain('planifier les sauvegardes');
    const again = await runReminderJob(now);
    expect(again.clientReminders).toEqual({ sent: 0, skipped: 1, failed: 0 });
    expect(provider.outbox).toHaveLength(1);
  });
});

describe('route planifiée', () => {
  const call = (auth?: string) => GET(new NextRequest('http://localhost/api/cron/reminders', { headers: auth ? { authorization: auth } : {} }));
  beforeEach(() => { delete process.env.CRON_SECRET; });

  it('reste fermée (503) tant que CRON_SECRET n\'est pas défini', async () => {
    expect((await call('Bearer x')).status).toBe(503);
  });
  it('refuse un secret absent ou erroné (401) et accepte le bon', async () => {
    process.env.CRON_SECRET = 'secret-de-test-123';
    expect((await call()).status).toBe(401);
    expect((await call('Bearer faux')).status).toBe(401);
    const ok = await call('Bearer secret-de-test-123');
    expect(ok.status).toBe(200);
    expect(await ok.json()).toHaveProperty('adminDigests');
  });
});

describe('fournisseur Resend', () => {
  it('envoie avec la clé en en-tête et renvoie l\'identifiant, sans jamais journaliser le contenu', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: 'abc' }) });
    const p = new ResendProvider('cle-test', 'StratCyber <noreply@exemple.fr>', fetchImpl as never);
    const out = await p.send({ to: 'x@y.fr', subject: 'S', text: 'T' });
    expect(out.id).toBe('abc');
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer cle-test');
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).to).toEqual(['x@y.fr']);
  });
  it('lève une erreur sans exposer la clé quand le fournisseur refuse', async () => {
    const p = new ResendProvider('cle-secrete', 'a@b.fr', (async () => ({ ok: false, status: 403 })) as never);
    await expect(p.send({ to: 'x@y.fr', subject: 'S', text: 'T' })).rejects.toThrow('HTTP 403');
    await expect(p.send({ to: 'x@y.fr', subject: 'S', text: 'T' })).rejects.not.toThrow(/cle-secrete/);
  });
});
