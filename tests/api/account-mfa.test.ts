// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { base32Decode, hotp, timeStep } from '@/lib/auth/totp';
import { GET, POST } from '@/app/api/account/mfa/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/lib/auth/options', () => ({ authOptions: {} }));

const post = (body: unknown) =>
  POST(req('/api/account/mfa', { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }), ctx({}));
const PASSWORD = 'un-mot-de-passe-long';

beforeEach(async () => {
  resetDb();
  process.env.MFA_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString('base64');
  tables.user.push({ id: userA.id, email: userA.email, role: 'user', password: await bcrypt.hash(PASSWORD, 4), mfaEnabled: false });
  vi.mocked(getServerSession).mockResolvedValue(sessionFor(userA));
});

describe('/api/account/mfa', () => {
  it('401 sans session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);
    expect((await GET(req('/api/account/mfa'), ctx({}))).status).toBe(401);
  });

  it('503 si la clé de chiffrement manque (aucun secret stocké en clair)', async () => {
    delete process.env.MFA_ENCRYPTION_KEY;
    expect((await post({ action: 'setup' })).status).toBe(503);
    expect(tables.user[0].mfaPendingSecret).toBeUndefined();
  });

  it('enrôlement complet : setup → enable (codes de secours) → disable', async () => {
    const setup = await (await post({ action: 'setup' })).json();
    expect(setup.secret).toMatch(/^[A-Z2-7]{32}$/);
    expect(tables.user[0].mfaPendingSecret).not.toContain(setup.secret); // chiffré au repos

    expect((await post({ action: 'enable', code: '000000' })).status).toBe(400);
    const code = hotp(base32Decode(setup.secret), timeStep());
    const enabled = await (await post({ action: 'enable', code })).json();
    expect(enabled.recoveryCodes).toHaveLength(10);
    expect(tables.user[0].mfaEnabled).toBe(true);
    expect(tables.user[0].mfaPendingSecret).toBeNull();

    const status = await (await GET(req('/api/account/mfa'), ctx({}))).json();
    expect(status).toMatchObject({ enabled: true, recoveryCodesRemaining: 10 });

    // Désactivation : le code déjà utilisé (rejeu) et un mauvais mot de passe sont refusés
    expect((await post({ action: 'disable', password: PASSWORD, code })).status).toBe(400);
    const next = hotp(base32Decode(setup.secret), timeStep() + 1);
    expect((await post({ action: 'disable', password: 'faux', code: next })).status).toBe(400);
    expect((await post({ action: 'disable', password: PASSWORD, code: next })).status).toBe(200);
    expect(tables.user[0]).toMatchObject({ mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: null });
  });

  it('n\'agit que sur le compte de la session (un id dans le corps est ignoré)', async () => {
    tables.user.push({ id: 'autre', email: 'autre@exemple.fr', role: 'admin', password: 'x', mfaEnabled: false });
    await post({ action: 'setup', userId: 'autre' });
    expect(tables.user.find((u) => u.id === 'autre')?.mfaPendingSecret).toBeUndefined();
  });
});
