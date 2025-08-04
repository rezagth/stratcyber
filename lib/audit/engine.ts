import { CompanyProfile, AuditQuestion, RegulationScope } from '../../types/audit';
import { computeAuditResult, generateActionPlan } from './scoring';
import { getQuestionsForProfile } from './questions-extended';

/**
 * Détermine les réglementations applicables en fonction du profil de l'entreprise
 */
export function getRegulationScopes(profile: CompanyProfile): RegulationScope[] {
  // Return empty array if profile is null or undefined
  if (!profile) {
    return [];
  }
  
  const scopes: RegulationScope[] = [];
  
  // RGPD toujours applicable si données personnelles
  if (profile.hasPersonalData) {
    scopes.push('RGPD');
  }
  
  // NIS2 pour les opérateurs de services essentiels et OIV
  if (profile.isOSE || profile.isOIV) {
    scopes.push('NIS2');
  }
  
  // DORA pour le secteur financier
  if (profile.isFinancial) {
    scopes.push('DORA');
  }
  
  // CRA pour tous les secteurs
  scopes.push('CRA');
  
  // LPM pour les opérateurs d'importance vitale
  if (profile.isOIV) {
    scopes.push('LPM');
  }
  
  return scopes;
}

/**
 * Génère les questions d'audit en fonction du profil de l'entreprise
 */
export function generateQuestionsForProfile(profile: CompanyProfile): AuditQuestion[] {
  // Return empty array if profile is null or undefined
  if (!profile) {
    return [];
  }
  
  // Déterminer les réglementations applicables
  const regulations = getRegulationScopes(profile);
  
  // Obtenir les questions selon les réglementations et le secteur
  return getQuestionsForProfile(regulations, profile.sector);
}

// Exporter les fonctions existantes pour compatibilité
export { computeAuditResult, generateActionPlan };
