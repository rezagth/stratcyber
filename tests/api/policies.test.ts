// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { extractVariables, fillTemplate } from '@/lib/policy/template-engine';
import { GET as LIST_TEMPLATES, POST as CREATE_TEMPLATE } from '@/app/api/policy-templates/route';
import { GET as LIST_POLICIES } from '@/app/api/organizations/[id]/policies/route';
import { POST as GENERATE } from '@/app/api/organizations/[id]/policies/generate/route';
import { PATCH as UPDATE_POLICY, DELETE as DELETE_POLICY } from '@/app/api/policies/[id]/route';
import { GET as CLIENT_POLICIES } from '@/app/api/client/policies/route';
import { PATCH as CLIENT_VALIDATE } from '@/app/api/client/policies/[id]/route';

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

describe('moteur de variables (lib/policy/template-engine)', () => {
  it('extrait les variables uniques dans leur ordre d\'apparition', () => {
    expect(extractVariables('Bonjour {{nom}}, le {{date}}. Signé {{nom}}.')).toEqual(['nom', 'date']);
  });

  it('substitue les variables connues, laisse les inconnues telles quelles', () => {
    const result = fillTemplate('Politique de {{entreprise}}, RSSI : {{rssi}}.', { entreprise: 'Client X' });
    expect(result).toBe('Politique de Client X, RSSI : {{rssi}}.');
  });

  it('ignore une valeur vide (laisse la variable visible plutôt que de vider)', () => {
    expect(fillTemplate('{{nom}}', { nom: '  ' })).toBe('{{nom}}');
  });
});

describe('catalogue de modèles (module E)', () => {
  it('crée un modèle et expose ses variables extraites', async () => {
    loginAs(admin);
    const res = await CREATE_TEMPLATE(req('/api/policy-templates', post({
      type: 'PSSI', name: 'PSSI standard', content: 'PSSI de {{entreprise}}, validée par {{rssi}}.',
    })), ctx({}));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.variables).toEqual(['entreprise', 'rssi']);
  });

  it('rejette un type de modèle inconnu', async () => {
    loginAs(admin);
    const res = await CREATE_TEMPLATE(req('/api/policy-templates', post({ type: 'RGPD', name: 'x', content: 'x' })), ctx({}));
    expect(res.status).toBe(400);
  });

  it('un client ne peut pas accéder au catalogue de modèles (403)', async () => {
    loginAs(clientX);
    expect((await LIST_TEMPLATES(req('/api/policy-templates'), ctx({}))).status).toBe(403);
    expect((await CREATE_TEMPLATE(req('/api/policy-templates', post({ type: 'PSSI', name: 'x', content: 'x' })), ctx({}))).status).toBe(403);
  });
});

describe('génération de documents par client (module E)', () => {
  beforeEach(() => {
    tables.policyTemplate.push({ id: 'tpl-pssi', type: 'PSSI', name: 'PSSI standard', content: 'PSSI de {{entreprise}}.', createdAt: new Date(), updatedAt: new Date() });
  });

  it('génère un document en version 1, statut Brouillon', async () => {
    loginAs(admin);
    const res = await GENERATE(req('/api/organizations/org-x/policies/generate', post({
      templateId: 'tpl-pssi', values: { entreprise: 'Client X SARL' },
    })), ctx({ id: 'org-x' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.content).toBe('PSSI de Client X SARL.');
    expect(body.version).toBe(1);
    expect(body.status).toBe('Brouillon');
  });

  it('une seconde génération pour le même type crée la version 2, sans toucher à la version 1', async () => {
    loginAs(admin);
    const first = await (await GENERATE(req('/api/organizations/org-x/policies/generate', post({ templateId: 'tpl-pssi', values: {} })), ctx({ id: 'org-x' }))).json();
    const second = await (await GENERATE(req('/api/organizations/org-x/policies/generate', post({ templateId: 'tpl-pssi', values: {} })), ctx({ id: 'org-x' }))).json();
    expect(first.version).toBe(1);
    expect(second.version).toBe(2);
    const all = await (await LIST_POLICIES(req('/api/organizations/org-x/policies'), ctx({ id: 'org-x' }))).json();
    expect(all).toHaveLength(2);
  });

  it('rejette un templateId manquant ou inconnu', async () => {
    loginAs(admin);
    expect((await GENERATE(req('/api/organizations/org-x/policies/generate', post({ values: {} })), ctx({ id: 'org-x' }))).status).toBe(400);
    expect((await GENERATE(req('/api/organizations/org-x/policies/generate', post({ templateId: 'inconnu', values: {} })), ctx({ id: 'org-x' }))).status).toBe(404);
  });

  it('cloisonnement par client sur la liste des documents générés', async () => {
    loginAs(admin);
    await GENERATE(req('/api/organizations/org-x/policies/generate', post({ templateId: 'tpl-pssi', values: {} })), ctx({ id: 'org-x' }));
    const listY = await (await LIST_POLICIES(req('/api/organizations/org-y/policies'), ctx({ id: 'org-y' }))).json();
    expect(listY).toHaveLength(0);
  });
});

describe('cycle de vie et validation tracée (module E)', () => {
  beforeEach(() => {
    tables.clientPolicyDocument.push({
      id: 'doc-x', organizationId: 'org-x', templateId: null, type: 'PSSI', title: 'PSSI', content: 'contenu',
      version: 1, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
  });

  it("l'admin passe un brouillon en \"À valider\"", async () => {
    loginAs(admin);
    const res = await UPDATE_POLICY(req('/api/policies/doc-x', patch({ status: 'À valider' })), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe('À valider');
  });

  it("l'admin ne peut pas poser le statut \"Validé\" directement", async () => {
    loginAs(admin);
    const res = await UPDATE_POLICY(req('/api/policies/doc-x', patch({ status: 'Validé' })), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(400);
  });

  it("le client valide un document \"À valider\" : nom et date fixés par le serveur, pas par la requête", async () => {
    tables.clientPolicyDocument.find((d) => d.id === 'doc-x')!.status = 'À valider';
    loginAs(clientX);
    const res = await CLIENT_VALIDATE(req('/api/client/policies/doc-x', patch({
      status: 'Validé', validatedByName: 'Quelqu\'un d\'autre', validatedAt: '2020-01-01',
    })), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('Validé');
    expect(body.validatedByName).toBe('Direction Client'); // nom du compte connecté, pas celui fourni dans le corps
    expect(new Date(body.validatedAt).getFullYear()).toBe(new Date().getFullYear());
  });

  it('le client ne peut pas valider un document encore en Brouillon (409)', async () => {
    loginAs(clientX);
    const res = await CLIENT_VALIDATE(req('/api/client/policies/doc-x', patch({})), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(409);
  });

  it("le client Y ne peut pas valider un document de l'organisation X (404)", async () => {
    tables.clientPolicyDocument.find((d) => d.id === 'doc-x')!.status = 'À valider';
    loginAs(clientY);
    const res = await CLIENT_VALIDATE(req('/api/client/policies/doc-x', patch({})), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(404);
  });

  it("un document déjà validé ne peut plus être modifié par l'admin (409) — il faut une nouvelle version", async () => {
    tables.clientPolicyDocument.find((d) => d.id === 'doc-x')!.status = 'Validé';
    loginAs(admin);
    const res = await UPDATE_POLICY(req('/api/policies/doc-x', patch({ content: 'modifié' })), ctx({ id: 'doc-x' }));
    expect(res.status).toBe(409);
  });

  it('le client ne peut pas supprimer de document (403)', async () => {
    loginAs(clientX);
    expect((await DELETE_POLICY(req('/api/policies/doc-x', { method: 'DELETE' }), ctx({ id: 'doc-x' }))).status).toBe(403);
  });

  it('le client lit uniquement la dernière version de chaque type', async () => {
    tables.clientPolicyDocument.push({
      id: 'doc-x-v2', organizationId: 'org-x', templateId: null, type: 'PSSI', title: 'PSSI', content: 'v2',
      version: 2, status: 'Brouillon', validatedByName: null, validatedAt: null, createdAt: new Date(), updatedAt: new Date(),
    });
    loginAs(clientX);
    const res = await CLIENT_POLICIES(req('/api/client/policies'), ctx({}));
    const docs = await res.json();
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('doc-x-v2');
  });
});
