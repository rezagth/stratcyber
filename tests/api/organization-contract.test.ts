// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { buildContract, contractToHtml, TODO } from '@/lib/contract/template';
import { getProviderIdentity } from '@/lib/contract/provider';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));
vi.mock('@/lib/email/send', () => ({ sendEmailOnce: vi.fn(async () => ({ status: 'sent', simulated: false })) }));

import { POST } from '@/app/api/organizations/[id]/contract/route';
import { sendEmailOnce } from '@/lib/email/send';

const login = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const call = (body: unknown) =>
  POST(req('/api/organizations/org-1/contract', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }), ctx({ id: 'org-1' }));

const FULL_ENV = {
  INFRACYB_LEGAL_NAME: 'InfraCyb', INFRACYB_REPRESENTATIVE: 'Jean Test', INFRACYB_SIRET: '12345678900012',
  INFRACYB_ADDRESS: '1 rue Test, 75000 Paris', INFRACYB_CONTACT_EMAIL: 'contact@infracyb.test', INFRACYB_INSURER: 'Assureur Test',
};
const FULL = {
  action: 'send', confirm: true, priceHT: 690, durationDays: 5, startDate: '2026-12-01', scope: 'Audit organisationnel',
  clientSignatoryName: 'Marie Dupont', clientSignatoryRole: 'Gérante', clientSiret: '98765432100010', clientAddress: '2 rue Client',
};

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  vi.mocked(sendEmailOnce).mockClear();
  Object.assign(process.env, FULL_ENV);
  tables.organization.push({ id: 'org-1', name: 'Client Test', missionScope: null });
  tables.contact.push({ id: 'c1', organizationId: 'org-1', name: 'Marie', email: 'marie@client.test', isPrimary: true });
});

describe('modèle de contrat', () => {
  it('contient les mentions de l’article 28, la non-qualification ANSSI et marque les champs manquants', () => {
    const doc = buildContract({
      clientName: 'X', clientSignatoryName: null, clientSignatoryRole: null, clientSiret: null, clientAddress: null,
      priceHT: null, durationDays: null, startDate: null, scope: null, provider: getProviderIdentity({} as NodeJS.ProcessEnv),
    });
    const html = contractToHtml(doc);
    expect(html).toContain('article 28 du RGPD');
    expect(html).toContain('instruction documentée');
    expect(html).toContain('pas une prestation qualifiée par l');
    expect(html).toContain(TODO);
    expect(doc.missing).toEqual(expect.arrayContaining(['Prix de la mission', 'SIRET du client']));
  });
  it('échappe le contenu du client', () => {
    const doc = buildContract({
      clientName: '<script>x</script>', clientSignatoryName: 'A', clientSignatoryRole: 'B', clientSiret: '1', clientAddress: 'a',
      priceHT: 1, durationDays: 1, startDate: '2026-01-01', scope: '<img onerror=1>', provider: getProviderIdentity(FULL_ENV as unknown as NodeJS.ProcessEnv),
    });
    const html = contractToHtml(doc);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
  });
});

describe('POST /api/organizations/[id]/contract', () => {
  it('refuse sans session et pour un non-admin', async () => {
    login(null);
    expect((await call(FULL)).status).toBe(401);
    login(userA);
    expect((await call(FULL)).status).toBe(403);
    expect(sendEmailOnce).not.toHaveBeenCalled();
  });
  it('prévisualise sans rien envoyer', async () => {
    login(admin);
    const res = await call({ action: 'preview', priceHT: 690 });
    expect(res.status).toBe(200);
    expect((await res.json()).doc.articles.length).toBeGreaterThan(5);
    expect(sendEmailOnce).not.toHaveBeenCalled();
  });
  it('n’envoie pas sans confirmation explicite', async () => {
    login(admin);
    expect((await call({ ...FULL, confirm: false })).status).toBe(400);
    expect(sendEmailOnce).not.toHaveBeenCalled();
  });
  it('refuse un contrat incomplet', async () => {
    login(admin);
    const res = await call({ ...FULL, priceHT: undefined });
    expect(res.status).toBe(409);
    expect((await res.json()).missing).toContain('Prix de la mission');
    expect(sendEmailOnce).not.toHaveBeenCalled();
  });
  it('refuse un client sans contact e-mail', async () => {
    login(admin);
    tables.contact.length = 0;
    expect((await call(FULL)).status).toBe(409);
    expect(sendEmailOnce).not.toHaveBeenCalled();
  });
  it('envoie au contact principal après confirmation et trace la décision', async () => {
    login(admin);
    const res = await call(FULL);
    expect(res.status).toBe(200);
    expect(sendEmailOnce).toHaveBeenCalledTimes(1);
    expect(vi.mocked(sendEmailOnce).mock.calls[0][0].to).toBe('marie@client.test');
    expect(tables.decisionLogEntry.some((d) => d.title === 'Contrat envoyé')).toBe(true);
  });
  it('valide les entrées', async () => {
    login(admin);
    expect((await call({ ...FULL, priceHT: -5 })).status).toBe(400);
    expect((await call({ ...FULL, durationDays: 0 })).status).toBe(400);
    expect((await call({ ...FULL, startDate: 'demain' })).status).toBe(400);
  });
});
