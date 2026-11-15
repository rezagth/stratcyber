import { describe, it, expect } from 'vitest';
import { generateQuestionsForProfile, getRegulationScopes } from '@/lib/audit/engine';
import { baseQuestions } from '@/lib/audit/questions';
import type { CompanyProfile } from '@/types/audit';

const pme: CompanyProfile = {
  sector: 'Autre', size: 'PME', isOIV: false, isOSE: false, isFinancial: false,
  hasPersonalData: true, hasCriticalInfra: false, applicableRegulations: [],
};

describe('questionnaire selon le profil', () => {
  it('pose toujours les questions de base (sauvegardes, MFA, antivirus, correctifs)', () => {
    const ids = generateQuestionsForProfile(pme).map((q) => q.id);
    for (const q of baseQuestions) expect(ids).toContain(q.id);
    expect(ids).toEqual(expect.arrayContaining(['t1', 't2', 't3', 't4']));
  });
  it('n’ajoute pas le CRA à une PME de services', () => {
    expect(getRegulationScopes(pme)).not.toContain('CRA');
    expect(generateQuestionsForProfile(pme).some((q) => q.category === 'CRA')).toBe(false);
  });
  it('ajoute le CRA pour un fabricant de produits numériques', () => {
    const p = { ...pme, isProductManufacturer: true };
    expect(getRegulationScopes(p)).toContain('CRA');
    expect(generateQuestionsForProfile(p).some((q) => q.category === 'CRA')).toBe(true);
  });
  it('n’a pas d’identifiant de question en double', () => {
    const ids = generateQuestionsForProfile({ ...pme, isProductManufacturer: true, isOSE: true, isFinancial: true }).map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
