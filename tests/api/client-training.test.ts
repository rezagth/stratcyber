// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerSession } from 'next-auth';
import { resetDb, tables } from '../helpers/fake-prisma';
import { admin, ctx, req, sessionFor } from '../helpers/api-test-utils';
import { buildTrainingDashboard } from '@/lib/training/dashboard';
import { GET as CLIENT_EBOOKS } from '@/app/api/client/training/ebooks/route';
import { GET as CLIENT_EBOOK_DETAIL } from '@/app/api/client/training/ebooks/[id]/route';
import { PATCH as CLIENT_PROGRESS } from '@/app/api/client/training/ebooks/[id]/progress/route';
import { GET as CLIENT_QUIZ } from '@/app/api/client/training/quizzes/[id]/route';
import { POST as CLIENT_ATTEMPT } from '@/app/api/client/training/quizzes/[id]/attempts/route';
import { GET as ADMIN_TRAINING } from '@/app/api/organizations/[id]/training/route';

vi.mock('@/lib/db', async () => {
  const { fakePrisma } = await import('../helpers/fake-prisma');
  return { prisma: fakePrisma };
});
vi.mock('next-auth', () => ({ getServerSession: vi.fn() }));
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));

const clientOf = (organizationId: string | null, id = `client-${organizationId}`) => ({
  id, email: `${id}@exemple.fr`, name: 'Client', role: 'client', organizationId,
});
const clientX = clientOf('org-x');
const clientX2 = clientOf('org-x', 'client-x-2');
const clientY = clientOf('org-y');
const loginAs = (u: unknown) => vi.mocked(getServerSession).mockResolvedValue(sessionFor(u as never));
const patch = (body: unknown) => ({ method: 'PATCH', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });
const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } });

const baseEbook = { author: 'InfraCyb', category: 'Fondamentaux', difficulty: 'Débutant', isPublished: true, ownerId: null, tags: null, content: null };

beforeEach(() => {
  resetDb();
  vi.mocked(getServerSession).mockReset();
  tables.organization.push({ id: 'org-x', name: 'Client X' }, { id: 'org-y', name: 'Client Y' });
  tables.ebook.push(
    { ...baseEbook, id: 'catalogue', title: 'Catalogue commun' },
    { ...baseEbook, id: 'brouillon', title: 'Brouillon', isPublished: false }
  );
  tables.ebookQuiz.push(
    { id: 'quiz-catalogue', ebookId: 'catalogue', title: 'Quiz commun', questions: '[{"id":"q1","question":"2+2?","options":["3","4"],"correctAnswer":"4","explanation":"x"}]', passingScore: 70 }
  );
});

describe('catalogue de formation côté client (module J)', () => {
  it('le client voit le catalogue publié mais pas les brouillons', async () => {
    loginAs(clientX);
    const res = await CLIENT_EBOOKS(req('/api/client/training/ebooks'), ctx({}));
    const ids = (await res.json()).map((e: { id: string }) => e.id);
    expect(ids).toEqual(['catalogue']);
  });

  it("le client ne voit que ses propres sessions de lecture, pas celles d'un autre client", async () => {
    tables.readingSession.push(
      { id: 'rs-x', userId: clientX.id, ebookId: 'catalogue', currentPage: 3, progress: 40, completed: false, timeSpent: 100, lastReadAt: new Date() },
      { id: 'rs-x2', userId: clientX2.id, ebookId: 'catalogue', currentPage: 1, progress: 5, completed: false, timeSpent: 1, lastReadAt: new Date() }
    );
    loginAs(clientX);
    const [catalogue] = await (await CLIENT_EBOOKS(req('/api/client/training/ebooks'), ctx({}))).json();
    expect(catalogue.readingSessions.map((s: { id: string }) => s.id)).toEqual(['rs-x']);
  });

  it("un admin ne peut pas utiliser la route client (403)", async () => {
    loginAs(admin);
    expect((await CLIENT_EBOOKS(req('/api/client/training/ebooks'), ctx({}))).status).toBe(403);
  });

  it("404 pour un ebook non publié, contenu non divulgué", async () => {
    loginAs(clientX);
    const res = await CLIENT_EBOOK_DETAIL(req('/api/client/training/ebooks/brouillon'), ctx({ id: 'brouillon' }));
    expect(res.status).toBe(404);
  });
});

describe('progression de lecture (module J)', () => {
  it('crée une session de lecture au premier enregistrement de progression', async () => {
    loginAs(clientX);
    const res = await CLIENT_PROGRESS(req('/api/client/training/ebooks/catalogue/progress', patch({ currentPage: 2, progress: 50, timeSpent: 120 })), ctx({ id: 'catalogue' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.progress).toBe(50);
    expect(body.completed).toBe(false);
  });

  it('marque la lecture terminée quand la progression atteint 100, jamais accepté directement du corps', async () => {
    loginAs(clientX);
    const res = await CLIENT_PROGRESS(req('/api/client/training/ebooks/catalogue/progress', patch({ progress: 100, completed: false })), ctx({ id: 'catalogue' }));
    const body = await res.json();
    expect(body.completed).toBe(true);
  });

  it('met à jour (et non duplique) la session existante', async () => {
    loginAs(clientX);
    await CLIENT_PROGRESS(req('/api/client/training/ebooks/catalogue/progress', patch({ progress: 20 })), ctx({ id: 'catalogue' }));
    await CLIENT_PROGRESS(req('/api/client/training/ebooks/catalogue/progress', patch({ progress: 60 })), ctx({ id: 'catalogue' }));
    expect(tables.readingSession.filter((r) => r.userId === clientX.id && r.ebookId === 'catalogue')).toHaveLength(1);
    expect(tables.readingSession.find((r) => r.userId === clientX.id)?.progress).toBe(60);
  });

  it('rejette une progression hors bornes et un ebook non visible (404)', async () => {
    loginAs(clientX);
    expect((await CLIENT_PROGRESS(req('/api/client/training/ebooks/catalogue/progress', patch({ progress: 150 })), ctx({ id: 'catalogue' }))).status).toBe(400);
    expect((await CLIENT_PROGRESS(req('/api/client/training/ebooks/brouillon/progress', patch({ progress: 50 })), ctx({ id: 'brouillon' }))).status).toBe(404);
  });
});

describe('quiz et tentatives (module J)', () => {
  it('le client lit le quiz de son catalogue', async () => {
    loginAs(clientX);
    const res = await CLIENT_QUIZ(req('/api/client/training/quizzes/quiz-catalogue'), ctx({ id: 'quiz-catalogue' }));
    expect(res.status).toBe(200);
    expect((await res.json()).passingScore).toBe(70);
  });

  it('enregistre une tentative réussie et dérive "passed" du score, jamais du corps', async () => {
    loginAs(clientX);
    const res = await CLIENT_ATTEMPT(req('/api/client/training/quizzes/quiz-catalogue/attempts', post({ answers: { q1: '4' }, score: 100, passed: false })), ctx({ id: 'quiz-catalogue' }));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.score).toBe(100);
    expect(body.passed).toBe(true);
  });

  it('un score sous le seuil est marqué non réussi', async () => {
    loginAs(clientX);
    const res = await CLIENT_ATTEMPT(req('/api/client/training/quizzes/quiz-catalogue/attempts', post({ answers: { q1: '3' }, score: 50 })), ctx({ id: 'quiz-catalogue' }));
    expect((await res.json()).passed).toBe(false);
  });

  it('rejette un score hors bornes ou des réponses invalides', async () => {
    loginAs(clientX);
    expect((await CLIENT_ATTEMPT(req('/api/client/training/quizzes/quiz-catalogue/attempts', post({ answers: {}, score: 150 })), ctx({ id: 'quiz-catalogue' }))).status).toBe(400);
    expect((await CLIENT_ATTEMPT(req('/api/client/training/quizzes/quiz-catalogue/attempts', post({ answers: 'x', score: 50 })), ctx({ id: 'quiz-catalogue' }))).status).toBe(400);
  });
});

describe('agrégation formation (admin, module J)', () => {
  beforeEach(() => {
    tables.user.push(
      { id: clientX.id, email: clientX.email, name: 'Client X', role: 'client', organizationId: 'org-x', password: 'x' },
      { id: clientX2.id, email: clientX2.email, name: 'Client X2', role: 'client', organizationId: 'org-x', password: 'x' },
      { id: clientY.id, email: clientY.email, name: 'Client Y', role: 'client', organizationId: 'org-y', password: 'x' }
    );
    tables.readingSession.push(
      { id: 'rs-x', userId: clientX.id, ebookId: 'catalogue', currentPage: 10, progress: 100, completed: true, timeSpent: 500, lastReadAt: new Date() },
      { id: 'rs-x2', userId: clientX2.id, ebookId: 'catalogue', currentPage: 2, progress: 20, completed: false, timeSpent: 50, lastReadAt: new Date() },
      { id: 'rs-y', userId: clientY.id, ebookId: 'catalogue', currentPage: 1, progress: 10, completed: false, timeSpent: 5, lastReadAt: new Date() }
    );
    tables.ebookQuizAttempt.push(
      { id: 'att-x', userId: clientX.id, quizId: 'quiz-catalogue', answers: '{}', score: 100, passed: true, completedAt: new Date() },
      { id: 'att-x2', userId: clientX2.id, quizId: 'quiz-catalogue', answers: '{}', score: 40, passed: false, completedAt: new Date() }
    );
  });

  it("agrège la progression des employés d'un client, jamais ceux d'un autre", async () => {
    const dashboard = await buildTrainingDashboard('org-x');
    expect(dashboard.catalogSize).toBe(1);
    expect(dashboard.employees).toHaveLength(2);
    const x = dashboard.employees.find((e) => e.id === clientX.id)!;
    expect(x.ebooksCompleted).toBe(1);
    expect(x.quizzesPassed).toBe(1);
    const x2 = dashboard.employees.find((e) => e.id === clientX2.id)!;
    expect(x2.ebooksInProgress).toBe(1);
    expect(x2.quizzesPassed).toBe(0);
  });

  it("le tableau de bord admin est cloisonné par client, et interdit au rôle client (403)", async () => {
    loginAs(admin);
    const res = await ADMIN_TRAINING(req('/api/organizations/org-x/training'), ctx({ id: 'org-x' }));
    const body = await res.json();
    expect(body.employees.map((e: { id: string }) => e.id).sort()).toEqual([clientX.id, clientX2.id].sort());

    loginAs(clientX);
    expect((await ADMIN_TRAINING(req('/api/organizations/org-x/training'), ctx({ id: 'org-x' }))).status).toBe(403);
  });
});
