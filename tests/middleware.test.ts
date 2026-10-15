// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { config, middleware } from '@/middleware';

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));

const call = (path: string) => middleware(new NextRequest(`http://localhost${path}`));

beforeEach(() => vi.mocked(getToken).mockReset());

describe('middleware', () => {
  it('le matcher couvre /api et les pages protégées', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining(['/api/:path*', '/dashboard/:path*', '/strategie/:path*', '/audit/:path*'])
    );
  });

  it.each([
    '/api/audits/abc',
    '/api/audits/abc/duplicate',
    '/api/training/ebook',
    '/api/training/ebook/abc',
    '/api/training/quiz/abc',
    '/api/training/generate-ebooks',
  ])('401 JSON sur %s sans session', async (path) => {
    vi.mocked(getToken).mockResolvedValue(null);
    const res = await call(path);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Non autorisé' });
  });

  it('laisse passer /api/auth/* sans session (login, inscription)', async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    for (const path of ['/api/auth/session', '/api/auth/register', '/api/auth/callback/credentials']) {
      const res = await call(path);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    }
  });

  it('laisse passer une requête /api avec session valide', async () => {
    vi.mocked(getToken).mockResolvedValue({ id: 'user-a', role: 'user' } as never);
    const res = await call('/api/audits/abc');
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it("403 sur /api/dashboard/* pour un non-admin, passage pour l'admin", async () => {
    vi.mocked(getToken).mockResolvedValue({ id: 'user-a', role: 'user' } as never);
    const denied = await call('/api/dashboard/alerts');
    expect(denied.status).toBe(403);
    vi.mocked(getToken).mockResolvedValue({ id: 'admin', role: 'admin' } as never);
    const ok = await call('/api/dashboard/alerts');
    expect(ok.headers.get('x-middleware-next')).toBe('1');
  });

  it("confine un compte client à /client et /api/client", async () => {
    vi.mocked(getToken).mockResolvedValue({ id: 'c1', role: 'client', organizationId: 'org-1' } as never);
    for (const path of ['/client', '/client/audits/abc', '/api/client/audits']) {
      expect((await call(path)).headers.get('x-middleware-next')).toBe('1');
    }
    for (const path of ['/api/audits/abc', '/api/dashboard/kpis', '/api/training/ebook', '/api/organizations', '/api/roadmap/data']) {
      expect((await call(path)).status).toBe(403);
    }
    for (const path of ['/dashboard', '/strategie', '/audit/dynamic']) {
      const res = await call(path);
      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toContain('/client');
    }
  });

  it('redirige une page protégée vers la connexion sans session', async () => {
    vi.mocked(getToken).mockResolvedValue(null);
    const res = await call('/dashboard');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login?callbackUrl=%2Fdashboard');
  });
});
