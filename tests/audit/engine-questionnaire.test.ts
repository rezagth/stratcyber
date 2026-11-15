import { describe, it, expect } from 'vitest';
import { generateQuestionsForProfile, getRegulationScopes } from '@/lib/audit/engine';
import { isQuestionSourced, isConsultantQuestion, CONSULTANT_QUESTION_IDS } from '@/lib/audit/sources';
import type { CompanyProfile } from '@/types/audit';

const pme: CompanyProfile = {
  sector: 'Autre', size: 'PME', isOIV: false, isOSE: false, isFinancial: false,
  hasPersonalData: true, hasCriticalInfra: false, applicableRegulations: [],
};

describe('questionnaire selon le profil', () => {
  it('pose toujours les questions de base sourcées (mots de passe, MFA, sauvegardes, mises à jour, antivirus…)', () => {
    const ids = generateQuestionsForProfile(pme).map((q) => q.id);
    expect(ids).toEqual(expect.arrayContaining(['h1', 'h2', 'h3', 't1', 't2', 't3', 't4', 'g3', 'h7', 'h9', 'h10', 'h11', 'o1', 'gc1', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9']));
  });
  it('ne pose que des questions sourcées ou « à valider par le consultant » (hors score)', () => {
    const ids = generateQuestionsForProfile({ ...pme, isProductManufacturer: true, isOSE: true, isFinancial: true }).map((q) => q.id);
    for (const id of ids) expect(isQuestionSourced(id) || isConsultantQuestion(id), id).toBe(true);
    // Points à valider par le consultant : posés pour couvrir le sujet, mais jamais notés.
    expect(ids).toEqual(expect.arrayContaining([...CONSULTANT_QUESTION_IDS]));
    for (const id of CONSULTANT_QUESTION_IDS) expect(isQuestionSourced(id), id).toBe(false);
    expect(ids.some((id) => id.startsWith('nis2_') || id.startsWith('dora_') || id.startsWith('iso_') || id.startsWith('ebios_'))).toBe(false);
  });
  it('pose les questions RGPD sourcées quand l’organisation traite des données personnelles', () => {
    const ids = generateQuestionsForProfile(pme).map((q) => q.id);
    expect(ids).toEqual(expect.arrayContaining(['rgpd1', 'rgpd2', 'rgpd3', 'rgpd4', 'rgpd6', 'rgpd10']));
    const sans = generateQuestionsForProfile({ ...pme, hasPersonalData: false }).map((q) => q.id);
    expect(sans.some((id) => id.startsWith('rgpd'))).toBe(false);
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
