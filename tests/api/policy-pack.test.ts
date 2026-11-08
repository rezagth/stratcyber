// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA } from '../helpers/api-test-utils';
import { GET as GET_LIBRARY } from '@/app/api/policy-library/route';
import { POST as GENERATE_PACK } from '@/app/api/organizations/[id]/policies/generate-pack/route';
import { POLICY_LIBRARY } from '@/lib/policy/library';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const client = { id: 'client-x', email: 'c@x.fr', name: 'Direction', role: 'client', organizationId: 'org-x' };
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const pack = (orgId: string, body: unknown) => GENERATE_PACK(req(`/api/organizations/${orgId}/policies/generate-pack`, post(body)), ctx({ id: orgId }));

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
});

describe('bibliothèque (API)', () => {
  it('refuse sans session (401) et aux non-administrateurs (403)', async () => {
    expect((await GET_LIBRARY(req('/api/policy-library'), ctx({}))).status).toBe(401);
    for (const u of [userA, client]) {
      loginAs(u);
      expect((await GET_LIBRARY(req('/api/policy-library'), ctx({}))).status).toBe(403);
    }
  });
  it('liste les documents et les questions utiles, sans le texte des modèles', async () => {
    loginAs(admin);
    const body = await (await GET_LIBRARY(req('/api/policy-library'), ctx({}))).json();
    expect(body.documents).toHaveLength(POLICY_LIBRARY.length);
    expect(body.documents[0]).not.toHaveProperty('content');
    expect(body.variables.entreprise.label).toBeTruthy();
  });
});

describe('génération du dossier', () => {
  it('refuse sans session (401) et aux non-administrateurs (403), sans rien créer', async () => {
    expect((await pack('org-x', { documentIds: ['pssi'] })).status).toBe(401);
    for (const u of [userA, client]) {
      loginAs(u);
      expect((await pack('org-x', { documentIds: ['pssi'] })).status).toBe(403);
    }
    expect(tables.clientPolicyDocument).toHaveLength(0);
  });

  it('valide la demande : client inconnu 404, liste vide, identifiant inconnu ou non textuel 400', async () => {
    loginAs(admin);
    expect((await pack('nope', { documentIds: ['pssi'] })).status).toBe(404);
    expect((await pack('org-x', { documentIds: [] })).status).toBe(400);
    expect((await pack('org-x', {})).status).toBe(400);
    expect((await pack('org-x', { documentIds: ['pssi', 'inexistant'] })).status).toBe(400);
    expect((await pack('org-x', { documentIds: [42] })).status).toBe(400);
    expect((await pack('org-x', { documentIds: Array(25).fill('pssi') })).status).toBe(400);
    expect(tables.clientPolicyDocument).toHaveLength(0);
  });

  it('crée un brouillon par document, jamais « Validé », rattaché au bon client et sans modèle en base', async () => {
    loginAs(admin);
    const res = await pack('org-x', { documentIds: ['pssi', 'charte-informatique', 'pssi'], values: { entreprise: 'Client X', dirigeant: 'Marie Dupont' } });
    expect(res.status).toBe(201);
    const { documents } = await res.json();
    expect(documents).toHaveLength(2); // doublon d'identifiant ignoré
    for (const d of documents) {
      expect(d.status).toBe('Brouillon');
      expect(d.version).toBe(1);
      expect(d.organizationId).toBe('org-x');
      expect(d.templateId).toBeNull();
      expect(d.validatedByName ?? null).toBeNull();
    }
    expect(documents[0].content).toContain('Client X');
    expect(documents[0].content).toContain('Marie Dupont');
    expect(tables.clientPolicyDocument.every((d) => d.organizationId === 'org-x')).toBe(true);
  });

  it('liste les variables non renseignées et les laisse visibles dans le texte', async () => {
    loginAs(admin);
    const { documents } = await (await pack('org-x', { documentIds: ['pssi'], values: { entreprise: 'Client X' } })).json();
    expect(documents[0].unresolved).toContain('dirigeant');
    expect(documents[0].unresolved).not.toContain('entreprise');
    expect(documents[0].content).toContain('{{dirigeant}}');
  });

  it('crée une nouvelle version sans toucher à l’ancienne, même validée', async () => {
    tables.clientPolicyDocument.push({ id: 'old', organizationId: 'org-x', type: 'PSSI', title: 'Ancienne', content: 'v1', version: 1, status: 'Validé', validatedByName: 'Direction' });
    loginAs(admin);
    const { documents } = await (await pack('org-x', { documentIds: ['pssi'], values: {} })).json();
    expect(documents[0].version).toBe(2);
    expect(documents[0].status).toBe('Brouillon');
    const old = tables.clientPolicyDocument.find((d) => d.id === 'old')!;
    expect(old.status).toBe('Validé');
    expect(old.content).toBe('v1');
  });

  it('ne génère rien pour un autre client et ne mélange pas les versions entre clients', async () => {
    tables.clientPolicyDocument.push({ id: 'y1', organizationId: 'org-y', type: 'PSSI', title: 'Y', content: 'y', version: 7, status: 'Brouillon' });
    loginAs(admin);
    const { documents } = await (await pack('org-x', { documentIds: ['pssi'] })).json();
    expect(documents[0].version).toBe(1);
    expect(tables.clientPolicyDocument.filter((d) => d.organizationId === 'org-y')).toHaveLength(1);
  });

  it('ignore les variables inconnues, bride les valeurs trop longues et ne ré-interprète pas une valeur', async () => {
    loginAs(admin);
    const { documents } = await (await pack('org-x', {
      documentIds: ['pssi'],
      values: { entreprise: '{{dirigeant}}', dirigeant: 'D', evil: 'x', ville: 'v'.repeat(5000) },
    })).json();
    const content: string = documents[0].content;
    expect(content).toContain('{{dirigeant}} - applicable'); // la valeur de « entreprise » reste du texte littéral
    expect(content).not.toContain('evil');
    expect(content).not.toContain('v'.repeat(301));
  });
});
