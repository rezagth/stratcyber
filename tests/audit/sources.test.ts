import { describe, expect, it } from 'vitest';
import { QUESTION_SOURCES, isQuestionSourced, isConsultantQuestion, referencesForResponses, resolveQuestionId, NOT_COVERED_SCOPE } from '@/lib/audit/sources';
import { auditQuestions } from '@/lib/audit/questions';
import { rgpdQuestions, craQuestions } from '@/lib/audit/questions-extended';
import { generateQuestionsForProfile } from '@/lib/audit/engine';

const catalog = [...auditQuestions, ...rgpdQuestions, ...craQuestions];

describe('registre des sources vérifiées', () => {
  it('chaque question sourcée existe dans le catalogue', () => {
    const ids = new Set(catalog.map((q) => q.id));
    for (const id of Object.keys(QUESTION_SOURCES)) expect(ids.has(id), id).toBe(true);
  });

  it('chaque source a une URL https officielle, une date de vérification valide et au moins une source par question', () => {
    const allowed = /^https:\/\/(www\.cnil\.fr|www\.cybermalveillance\.gouv\.fr|digital-strategy\.ec\.europa\.eu|messervices\.cyber\.gouv\.fr|cyber\.gouv\.fr|github\.com\/betagouv\/mon-aide-cyber)\//;
    for (const [id, refs] of Object.entries(QUESTION_SOURCES)) {
      expect(refs.length, id).toBeGreaterThan(0);
      for (const ref of refs) {
        expect(ref.url, id).toMatch(allowed);
        expect(ref.verifiedOn, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(ref.label.length, id).toBeGreaterThan(10);
      }
    }
  });

  it('toute question posée à une PME est sourcée ou « à valider par le consultant »', () => {
    const pme = { sector: 'Autre', size: 'PME', isOIV: false, isOSE: false, isFinancial: false, hasPersonalData: true, hasCriticalInfra: false, applicableRegulations: [] } as const;
    for (const q of generateQuestionsForProfile(pme as never)) expect(isQuestionSourced(q.id) || isConsultantQuestion(q.id), q.id).toBe(true);
  });

  it('retrouve la question aussi bien par identifiant que par texte', () => {
    const q = auditQuestions.find((x) => x.id === 't3')!;
    expect(resolveQuestionId('t3')).toBe('t3');
    expect(resolveQuestionId(q.question)).toBe('t3');
    expect(resolveQuestionId('g2')).toBe('g2'); // question « à valider par le consultant »
    expect(resolveQuestionId('iso_1')).toBeNull();
  });

  it('référence les sources des questions posées et signale les réponses sans source', () => {
    const { sources, unsourcedCount, consultantResponses } = referencesForResponses([{ question: 't1' }, { question: 'rgpd2' }, { question: 'iso_1' }, { question: 'g2' }]);
    expect(sources.map((s) => s.url)).toEqual(expect.arrayContaining([
      expect.stringContaining('cybermalveillance.gouv.fr'),
      expect.stringContaining('cnil.fr'),
    ]));
    expect(new Set(sources.map((s) => s.url)).size).toBe(sources.length);
    expect(unsourcedCount).toBe(1);
    expect(consultantResponses.map((r) => r.question)).toEqual(['g2']);
  });

  it('annonce explicitement le périmètre non couvert', () => {
    expect(NOT_COVERED_SCOPE).toMatch(/DORA/);
    expect(NOT_COVERED_SCOPE).toMatch(/sans source officielle vérifiée/);
  });
});
