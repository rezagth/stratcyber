// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb, tables } from '../helpers/fake-prisma';
import { isoWeek } from '@/lib/email/keys';
import type { EmailMessage, EmailProvider } from '@/lib/email/provider';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});

import { MAX_ATTEMPTS, PENDING_TIMEOUT_MS, sendEmailOnce } from '@/lib/email/send';
import { getEmailProvider, setEmailProviderForTests } from '@/lib/email/get-provider';
import { SimulationProvider } from '@/lib/email/simulation-provider';

const mail = (over: Record<string, unknown> = {}) => ({
  key: 'test:org-1:2026-W43', kind: 'test', organizationId: 'org-1',
  to: 'dsi@client.fr', subject: 'Sujet', text: 'Corps du message confidentiel', ...over,
});

function fakeProvider(sendImpl?: (m: EmailMessage) => Promise<{ id?: string }>) {
  const sent: EmailMessage[] = [];
  const provider: EmailProvider = {
    name: 'faux', simulated: false,
    send: vi.fn(async (m) => { sent.push(m); return sendImpl ? sendImpl(m) : { id: 'prov-1' }; }),
  };
  return { provider, sent };
}

beforeEach(() => {
  resetDb();
  setEmailProviderForTests(null);
  delete process.env.EMAIL_MODE;
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

describe('choix du fournisseur', () => {
  it('simulation par défaut, et un mode inconnu ou live échoue au lieu de simuler en silence', () => {
    expect(getEmailProvider().simulated).toBe(true);
    process.env.EMAIL_MODE = 'live';
    expect(() => getEmailProvider()).toThrow(/aucun fournisseur/);
  });
});

describe('envoi unique par clé', () => {
  it('simulation : journalise un envoi « simulé », sans corps de message, et rien ne part', async () => {
    const res = await sendEmailOnce(mail());
    expect(res).toEqual({ status: 'sent', simulated: true });
    expect(tables.emailLog).toHaveLength(1);
    const row = tables.emailLog[0];
    expect(row).toMatchObject({ status: 'sent', simulated: true, attempts: 1, recipient: 'dsi@client.fr', kind: 'test' });
    expect(row.sentAt).toBeInstanceOf(Date);
    expect(JSON.stringify(row)).not.toContain('confidentiel');
    const provider = getEmailProvider() as SimulationProvider;
    expect(provider.outbox).toHaveLength(1);
  });

  it('une seconde exécution avec la même clé envoie 0 e-mail', async () => {
    const { provider, sent } = fakeProvider();
    setEmailProviderForTests(provider);
    expect(await sendEmailOnce(mail())).toEqual({ status: 'sent', simulated: false });
    expect(await sendEmailOnce(mail())).toEqual({ status: 'skipped', reason: 'already_sent' });
    expect(sent).toHaveLength(1);
    expect(tables.emailLog).toHaveLength(1);
  });

  it('deux exécutions simultanées (cron en double) n\'envoient qu\'un seul e-mail', async () => {
    const { provider, sent } = fakeProvider(async () => { await new Promise((r) => setTimeout(r, 10)); return {}; });
    setEmailProviderForTests(provider);
    const results = await Promise.all([sendEmailOnce(mail()), sendEmailOnce(mail()), sendEmailOnce(mail())]);
    expect(sent).toHaveLength(1);
    expect(results.filter((r) => r.status === 'sent')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'skipped')).toHaveLength(2);
    expect(tables.emailLog).toHaveLength(1);
  });

  it('des clés différentes envoient chacune leur e-mail', async () => {
    const { provider, sent } = fakeProvider();
    setEmailProviderForTests(provider);
    await sendEmailOnce(mail({ key: 'a' }));
    await sendEmailOnce(mail({ key: 'b' }));
    expect(sent).toHaveLength(2);
  });

  it('échec du fournisseur : journalisé « failed », puis rejoué à l\'exécution suivante', async () => {
    let fail = true;
    const { provider, sent } = fakeProvider(async () => { if (fail) throw new Error('SMTP indisponible'); return {}; });
    setEmailProviderForTests(provider);
    expect(await sendEmailOnce(mail())).toEqual({ status: 'failed' });
    expect(tables.emailLog[0]).toMatchObject({ status: 'failed', error: 'SMTP indisponible', attempts: 1 });
    fail = false;
    expect(await sendEmailOnce(mail())).toEqual({ status: 'sent', simulated: false });
    expect(tables.emailLog[0]).toMatchObject({ status: 'sent', attempts: 2, error: null });
    expect(sent).toHaveLength(2);
    expect(tables.emailLog).toHaveLength(1);
  });

  it(`abandonne après ${MAX_ATTEMPTS} tentatives`, async () => {
    const { provider, sent } = fakeProvider(async () => { throw new Error('KO'); });
    setEmailProviderForTests(provider);
    for (let i = 0; i < MAX_ATTEMPTS; i++) expect((await sendEmailOnce(mail())).status).toBe('failed');
    expect(await sendEmailOnce(mail())).toEqual({ status: 'skipped', reason: 'max_attempts' });
    expect(sent).toHaveLength(MAX_ATTEMPTS);
  });

  it('un « pending » récent n\'est pas rejoué ; plus d\'une heure sans « sent » (plantage), il l\'est', async () => {
    const { provider, sent } = fakeProvider();
    setEmailProviderForTests(provider);
    const t0 = new Date('2026-10-20T10:00:00Z');
    tables.emailLog.push({ id: 'p', key: mail().key, kind: 'test', organizationId: 'org-1', recipient: 'dsi@client.fr', subject: 'Sujet',
      status: 'pending', simulated: false, attempts: 1, createdAt: t0, updatedAt: t0 });

    expect(await sendEmailOnce(mail(), new Date(t0.getTime() + PENDING_TIMEOUT_MS - 1000))).toEqual({ status: 'skipped', reason: 'in_progress' });
    expect(sent).toHaveLength(0);

    expect(await sendEmailOnce(mail(), new Date(t0.getTime() + PENDING_TIMEOUT_MS + 1000))).toEqual({ status: 'sent', simulated: false });
    expect(sent).toHaveLength(1);
    expect(tables.emailLog[0]).toMatchObject({ status: 'sent', attempts: 2 });
  });
});

describe('isoWeek', () => {
  it('donne la semaine ISO en UTC', () => {
    expect(isoWeek(new Date('2026-10-20T08:00:00Z'))).toBe('2026-W43');
    expect(isoWeek(new Date('2026-01-01T00:00:00Z'))).toBe('2026-W01');
    expect(isoWeek(new Date('2027-01-01T00:00:00Z'))).toBe('2026-W53');
  });
});
