import { describe, expect, it, vi } from 'vitest';
import { buildDeterministicSummary, buildSummary } from '@/lib/audit-report/synthesis';
import { generateText, isAiConfigured } from '@/lib/ai/provider';
import { buildAuditReportHtml } from '@/lib/audit-report/html';
import type { AuditReportData } from '@/lib/audit-report/data';

const input = {
  score: 41.6,
  maturity: 'Initial',
  categoryScores: [
    { category: 'Technique', percent: 20 }, { category: 'RGPD', percent: 35 }, { category: 'Gouvernance', percent: 50 },
    { category: 'Cloud', percent: 60 }, { category: 'Sensibilisation', percent: 80 },
  ],
  actions: [
    { title: 'Activer la double authentification', priority: 'Critique', dueDate: new Date('2026-12-08') },
    { title: 'Désigner un DPO', priority: 'Haute', dueDate: new Date('2027-01-08') },
    { title: 'Charte', priority: 'Moyenne', dueDate: null },
  ],
};

describe('synthèse déterministe', () => {
  it('cite le score, les domaines faibles et forts, le plan et les actions critiques', () => {
    const text = buildDeterministicSummary(input).join(' ');
    expect(text).toContain('42 %');
    expect(text).toContain('Technique (20 %)');
    expect(text).toContain('Sensibilisation (80 %)');
    expect(text).toContain('3 actions');
    expect(text).toContain('1 critique');
    expect(text).toContain('Activer la double authentification');
  });
  it('reste cohérente sans score ni action', () => {
    const text = buildDeterministicSummary({ score: null, maturity: null, categoryScores: [], actions: [] }).join(' ');
    expect(text).toContain("n'est pas disponible");
    expect(text).not.toContain('NaN');
  });
});

describe('buildSummary', () => {
  it('utilise le texte de l\'IA quand elle répond', async () => {
    const ai = vi.fn().mockResolvedValue('Premier paragraphe.\n\nSecond paragraphe.');
    const out = await buildSummary(input, ai as never);
    expect(out.source).toBe('ai');
    expect(out.paragraphs).toEqual(['Premier paragraphe.', 'Second paragraphe.']);
  });
  it('replie sur la synthèse déterministe quand l\'IA est absente ou échoue', async () => {
    const out = await buildSummary(input, (async () => null) as never);
    expect(out.source).toBe('deterministic');
    expect(out.paragraphs.length).toBeGreaterThan(1);
  });
  it('ne transmet à l\'IA aucun titre d\'action contenant un nom de client (faits agrégés seulement)', async () => {
    const ai = vi.fn().mockResolvedValue(null);
    await buildSummary(input, ai as never);
    const sent = JSON.stringify(ai.mock.calls[0][0]);
    expect(sent).not.toMatch(/@|client x/i);
  });
});

describe('fournisseur IA', () => {
  it('est désactivé sans clé ou sans modèle, et ne fait alors aucun appel réseau', async () => {
    const fetchImpl = vi.fn();
    expect(isAiConfigured({ ANTHROPIC_API_KEY: 'k' } as never)).toBe(false);
    expect(await generateText({ system: 's', user: 'u' }, { env: {} as never, fetchImpl: fetchImpl as never })).toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it('renvoie le texte de la réponse quand tout est configuré', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: [{ type: 'text', text: 'Bonjour' }] }) });
    const out = await generateText({ system: 's', user: 'u' }, { env: { ANTHROPIC_API_KEY: 'k', AI_MODEL: 'm' } as never, fetchImpl: fetchImpl as never });
    expect(out).toBe('Bonjour');
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).model).toBe('m');
  });
  it('renvoie null sur erreur HTTP ou exception', async () => {
    const env = { ANTHROPIC_API_KEY: 'k', AI_MODEL: 'm' } as never;
    expect(await generateText({ system: 's', user: 'u' }, { env, fetchImpl: (async () => ({ ok: false })) as never })).toBeNull();
    expect(await generateText({ system: 's', user: 'u' }, { env, fetchImpl: (async () => { throw new Error('x'); }) as never })).toBeNull();
  });
});

describe('rapport HTML', () => {
  it('affiche la synthèse échappée et le plan réel daté', () => {
    const data = {
      detail: 'full', audit: { id: 'a', createdAt: new Date('2026-11-08'), score: 40, maturity: 'Initial' },
      recommendations: [], plan: [], categoryScores: [], compliance: [], responses: [],
      actionItems: [{ title: 'Activer la MFA', priority: 'Critique', responsible: 'DSI', dueDate: new Date('2026-12-08') }],
    } as unknown as AuditReportData;
    const html = buildAuditReportHtml(data, ['Texte <b>piégé</b>']);
    expect(html).toContain('Texte &lt;b&gt;piégé&lt;/b&gt;');
    expect(html).toContain('Activer la MFA');
    expect(html).toContain('Échéance');
  });
});
