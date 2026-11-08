// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetDb, tables } from '../helpers/fake-prisma';
import { POST } from '@/app/api/integrations/crm/route';
import { signCrmPayload, verifyCrmSignature } from '@/lib/integrations/crm-signature';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});

const SECRET = 'secret-de-test-assez-long';
const now = () => String(Math.floor(Date.now() / 1000));

function call(body: unknown, opts: { ts?: string; sig?: string | null; raw?: string } = {}) {
  const raw = opts.raw ?? JSON.stringify(body);
  const ts = opts.ts ?? now();
  const headers: Record<string, string> = { 'content-type': 'application/json', 'x-infracyb-timestamp': ts };
  const sig = opts.sig === undefined ? signCrmPayload(SECRET, ts, raw) : opts.sig;
  if (sig !== null) headers['x-infracyb-signature'] = sig;
  return POST(new NextRequest('http://localhost/api/integrations/crm', { method: 'POST', body: raw, headers }));
}

beforeEach(() => {
  resetDb();
  process.env.CRM_WEBHOOK_SECRET = SECRET;
});

describe('intégration CRM', () => {
  it('reste fermée sans secret configuré', async () => {
    delete process.env.CRM_WEBHOOK_SECRET;
    expect((await call({ event: 'client.upsert', crmId: 'c1', name: 'X' })).status).toBe(503);
  });

  it('refuse une signature absente, fausse ou périmée', async () => {
    const body = { event: 'client.upsert', crmId: 'c1', name: 'X' };
    expect((await call(body, { sig: null })).status).toBe(401);
    expect((await call(body, { sig: 'a'.repeat(64) })).status).toBe(401);
    const old = String(Math.floor(Date.now() / 1000) - 3600);
    expect((await call(body, { ts: old })).status).toBe(401);
    expect(tables.organization).toHaveLength(0);
  });

  it('refuse un corps modifié après signature', async () => {
    const raw = JSON.stringify({ event: 'client.upsert', crmId: 'c1', name: 'X' });
    const ts = now();
    const sig = signCrmPayload(SECRET, ts, raw);
    const tampered = raw.replace('"X"', '"Pirate"');
    expect((await call(null, { raw: tampered, ts, sig })).status).toBe(401);
  });

  it('crée le client une seule fois (idempotent) sans créer de compte', async () => {
    const r1 = await call({ event: 'client.upsert', crmId: 'c1', name: 'Cabinet Test', sector: 'Finance' });
    expect(r1.status).toBe(201);
    const r2 = await call({ event: 'client.upsert', crmId: 'c1', name: 'Cabinet Test SAS' });
    expect(r2.status).toBe(200);
    expect(tables.organization).toHaveLength(1);
    expect(tables.organization[0].name).toBe('Cabinet Test SAS');
    expect(tables.organization[0].commercialStatus).toBe('a_jour');
    expect(tables.user ?? []).toHaveLength(0);
  });

  it('enregistre un retard de paiement puis le retour à jour', async () => {
    await call({ event: 'client.upsert', crmId: 'c1', name: 'Cabinet Test' });
    const late = await call({ event: 'payment.status', crmId: 'c1', status: 'en_retard', overdueDays: 12 });
    expect(late.status).toBe(200);
    expect(tables.organization[0].commercialStatus).toBe('en_retard');
    expect(tables.organization[0].commercialOverdueDays).toBe(12);
    await call({ event: 'payment.status', crmId: 'c1', status: 'a_jour' });
    expect(tables.organization[0].commercialOverdueDays).toBeNull();
  });

  it('rejette client inconnu, statut inconnu et événement inconnu', async () => {
    expect((await call({ event: 'payment.status', crmId: 'zz', status: 'a_jour' })).status).toBe(404);
    await call({ event: 'client.upsert', crmId: 'c1', name: 'X' });
    expect((await call({ event: 'payment.status', crmId: 'c1', status: 'suspendu' })).status).toBe(400);
    expect((await call({ event: 'supprimer', crmId: 'c1' })).status).toBe(400);
  });

  it('verifyCrmSignature compare à temps constant et exige un horodatage valide', () => {
    const ts = now();
    const sig = signCrmPayload(SECRET, ts, 'x');
    expect(verifyCrmSignature(SECRET, ts, sig, 'x')).toBe(true);
    expect(verifyCrmSignature(SECRET, 'abc', sig, 'x')).toBe(false);
    expect(verifyCrmSignature('autre', ts, sig, 'x')).toBe(false);
  });
});
