// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor, userA, userB } from '../helpers/api-test-utils';
import { GET as LIST, POST as CREATE } from '@/app/api/training/ebook/route';
import { GET as DETAIL } from '@/app/api/training/ebook/[id]/route';
import { GET as QUIZ } from '@/app/api/training/quiz/[id]/route';
import { POST as GENERATE } from '@/app/api/training/generate-ebooks/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const loginAs = (user: Parameters<typeof sessionFor>[0]) =>
  vi.mocked(getServerSession).mockResolvedValue(sessionFor(user));

const baseEbook = {
  author: 'InfraCyb',
  category: 'Fondamentaux',
  difficulty: 'Débutant',
  isPublished: true,
  ownerId: null,
  tags: null,
  content: null,
};

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();

  tables.ebook.push(
    { ...baseEbook, id: 'catalogue', title: 'Catalogue commun' },
    { ...baseEbook, id: 'brouillon', title: 'Brouillon', isPublished: false },
    // Ebook personnalisé de A (contient des données issues de son audit)
    {
      ...baseEbook,
      id: 'perso-a',
      title: 'Plan A',
      author: 'Système - Alex',
      ownerId: userA.id,
      content: '{"secret":"donnees-audit-A"}',
    },
    // Ebook personnalisé historique, sans propriétaire (avant le correctif)
    { ...baseEbook, id: 'legacy', title: 'Ancien perso', author: 'Système - a@exemple.fr' }
  );
  tables.ebookQuiz.push(
    { id: 'quiz-catalogue', ebookId: 'catalogue', title: 'Quiz commun', questions: '[]', passingScore: 70 },
    { id: 'quiz-a', ebookId: 'perso-a', title: 'Quiz A', questions: '[{"q":"secret-quiz-A"}]', passingScore: 70 }
  );
  tables.readingSession.push(
    { id: 'rs-a', userId: userA.id, ebookId: 'catalogue', progress: 80, completed: false, timeSpent: 10 },
    { id: 'rs-b', userId: userB.id, ebookId: 'catalogue', progress: 5, completed: false, timeSpent: 1 }
  );
});

describe('GET /api/training/ebook', () => {
  it('401 sans session', async () => {
    loginAs(null);
    expect((await LIST(req('/api/training/ebook'), ctx({}))).status).toBe(401);
  });

  it("B voit le catalogue mais pas l'ebook personnalisé de A, ni l'ancien perso, ni les brouillons", async () => {
    loginAs(userB);
    const res = await LIST(req('/api/training/ebook'), ctx({}));
    expect(res.status).toBe(200);
    const ids = (await res.json()).map((e: { id: string }) => e.id);
    expect(ids).toEqual(['catalogue']);
  });

  it("B ne voit que ses propres sessions de lecture, pas celles de A", async () => {
    loginAs(userB);
    const [catalogue] = await (await LIST(req('/api/training/ebook'), ctx({}))).json();
    expect(catalogue.readingSessions.map((s: { id: string }) => s.id)).toEqual(['rs-b']);
  });

  it('A voit le catalogue et son ebook personnalisé', async () => {
    loginAs(userA);
    const ids = (await (await LIST(req('/api/training/ebook'), ctx({}))).json()).map(
      (e: { id: string }) => e.id
    );
    expect(ids.sort()).toEqual(['catalogue', 'perso-a']);
  });
});

describe('POST /api/training/ebook', () => {
  const body = { title: 'T', author: 'X', category: 'Réseau', difficulty: 'Avancé' };
  const post = () =>
    CREATE(req('/api/training/ebook', { method: 'POST', body: JSON.stringify(body) }), ctx({}));

  it('401 sans session, rien n’est créé', async () => {
    loginAs(null);
    expect((await post()).status).toBe(401);
    expect(tables.ebook).toHaveLength(4);
  });

  it('403 pour un utilisateur simple, rien n’est créé', async () => {
    loginAs(userB);
    expect((await post()).status).toBe(403);
    expect(tables.ebook).toHaveLength(4);
  });

  it("un admin crée un ebook du catalogue (ownerId null, même si le body tente d'en fixer un)", async () => {
    loginAs(admin);
    const res = await CREATE(
      req('/api/training/ebook', {
        method: 'POST',
        body: JSON.stringify({ ...body, ownerId: userA.id }),
      }),
      ctx({})
    );
    expect(res.status).toBe(201);
    expect(tables.ebook).toHaveLength(5);
    expect(tables.ebook.at(-1)?.ownerId).toBeNull();
  });
});

describe('GET /api/training/ebook/[id]', () => {
  const get = (id: string) => DETAIL(req(`/api/training/ebook/${id}`), ctx({ id }));

  it('401 sans session', async () => {
    loginAs(null);
    expect((await get('catalogue')).status).toBe(401);
  });

  it("B ne peut pas lire l'ebook personnalisé de A (404, contenu non divulgué)", async () => {
    loginAs(userB);
    const res = await get('perso-a');
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('donnees-audit-A');
  });

  it('B ne peut pas lire un ebook personnalisé historique sans propriétaire, ni un brouillon', async () => {
    loginAs(userB);
    expect((await get('legacy')).status).toBe(404);
    expect((await get('brouillon')).status).toBe(404);
  });

  it('A lit son ebook ; B lit le catalogue', async () => {
    loginAs(userA);
    expect((await get('perso-a')).status).toBe(200);
    loginAs(userB);
    expect((await get('catalogue')).status).toBe(200);
  });
});

describe('GET /api/training/quiz/[id]', () => {
  const get = (id: string) => QUIZ(req(`/api/training/quiz/${id}`), ctx({ id }));

  it('401 sans session', async () => {
    loginAs(null);
    expect((await get('quiz-catalogue')).status).toBe(401);
  });

  it("B ne peut pas lire le quiz de l'ebook personnalisé de A", async () => {
    loginAs(userB);
    const res = await get('quiz-a');
    expect(res.status).toBe(404);
    expect(JSON.stringify(await res.json())).not.toContain('secret-quiz-A');
  });

  it('A lit son quiz ; B lit le quiz du catalogue', async () => {
    loginAs(userA);
    expect((await get('quiz-a')).status).toBe(200);
    loginAs(userB);
    expect((await get('quiz-catalogue')).status).toBe(200);
  });
});

describe('POST /api/training/generate-ebooks', () => {
  beforeEach(() => {
    // B a un audit avec un score faible dans une catégorie qui a un modèle d'ebook
    tables.audit.push({ id: 'audit-b', userId: userB.id, createdAt: new Date() });
    tables.auditResponse.push({
      id: 'rb1',
      auditId: 'audit-b',
      question: 'q',
      answer: 'non',
      score: 1,
      category: 'Sécurité des accès',
    });
  });

  it('401 sans session', async () => {
    loginAs(null);
    expect((await GENERATE(req('/api/training/generate-ebooks', { method: 'POST' }), ctx({}))).status).toBe(401);
  });

  it("la génération de B n'efface pas les ebooks de A, même si A et B ont le même nom", async () => {
    loginAs(userB); // userA.name === userB.name === 'Alex'
    const res = await GENERATE(req('/api/training/generate-ebooks', { method: 'POST' }), ctx({}));
    expect(res.status).toBe(200);
    expect(tables.ebook.some((e) => e.id === 'perso-a')).toBe(true);
    const generated = tables.ebook.filter((e) => e.ownerId === userB.id);
    expect(generated.length).toBeGreaterThan(0);
  });

  it("B ne génère jamais d'ebook à partir de l'audit de A", async () => {
    tables.audit.length = 0; // B n'a aucun audit, A en a un
    tables.auditResponse.length = 0;
    tables.audit.push({ id: 'audit-a', userId: userA.id, createdAt: new Date() });
    tables.auditResponse.push({
      id: 'ra1', auditId: 'audit-a', question: 'q', answer: 'non', score: 1, category: 'Sécurité des accès',
    });
    loginAs(userB);
    const res = await GENERATE(req('/api/training/generate-ebooks', { method: 'POST' }), ctx({}));
    expect(res.status).toBe(404);
    expect(tables.ebook.filter((e) => e.ownerId === userB.id)).toHaveLength(0);
  });
});
