import { CompanyProfile, CompanySector, CompanySize, RegulationScope } from '../../types/audit';

/**
 * Détermine les réglementations applicables selon le profil de l'entreprise
 */
export function getApplicableRegulations(profile: CompanyProfile): RegulationScope[] {
  const regulations: RegulationScope[] = [];

  // RGPD - Obligatoire pour toutes les entreprises traitant des données personnelles
  if (profile.hasPersonalData) {
    regulations.push('RGPD');
  }

  // NIS2 - Secteurs essentiels et importants
  if (isNIS2Applicable(profile)) {
    regulations.push('NIS2');
  }

  // DORA - Secteur financier
  if (profile.isFinancial || profile.sector === 'Finance') {
    regulations.push('DORA');
  }

  // LPM - Opérateurs d'Importance Vitale
  if (profile.isOIV) {
    regulations.push('LPM');
  }

  // CRA - Produits numériques avec éléments numériques
  if (profile.sector === 'Numérique' || profile.hasCriticalInfra) {
    regulations.push('CRA');
  }

  // HDS - Hébergement de données de santé
  if (profile.sector === 'Santé') {
    regulations.push('HDS');
  }

  // PCI DSS - Traitement de cartes de paiement
  if (profile.sector === 'Finance' || profile.sector === 'Commerce') {
    regulations.push('PCI_DSS');
  }

  // ISO 27001 - Recommandé pour toutes les grandes entreprises
  if (profile.size === 'ETI' || profile.size === 'GE') {
    regulations.push('ISO27001');
  }

  return regulations;
}

/**
 * Vérifie si NIS2 s'applique selon le secteur et la taille
 */
function isNIS2Applicable(profile: CompanyProfile): boolean {
  const nis2EssentialSectors: CompanySector[] = ['Énergie', 'Transport', 'Santé', 'Finance'];
  const nis2ImportantSectors: CompanySector[] = ['Numérique', 'Administration'];

  // Secteurs essentiels - seuils plus bas
  if (nis2EssentialSectors.includes(profile.sector)) {
    return profile.size === 'PME' || profile.size === 'ETI' || profile.size === 'GE';
  }

  // Secteurs importants - seuils plus élevés
  if (nis2ImportantSectors.includes(profile.sector)) {
    return profile.size === 'ETI' || profile.size === 'GE';
  }

  return false;
}

/**
 * Calcule le score de risque juridique selon le profil
 */
export function calculateLegalRiskScore(profile: CompanyProfile): number {
  let riskScore = 0;

  // Facteurs de risque
  const riskFactors = {
    isOIV: 30,
    isOSE: 20,
    isFinancial: 25,
    hasPersonalData: 15,
    hasCriticalInfra: 20,
    sectorRisk: getSectorRiskScore(profile.sector),
    sizeRisk: getSizeRiskScore(profile.size)
  };

  // Calcul du score
  if (profile.isOIV) riskScore += riskFactors.isOIV;
  if (profile.isOSE) riskScore += riskFactors.isOSE;
  if (profile.isFinancial) riskScore += riskFactors.isFinancial;
  if (profile.hasPersonalData) riskScore += riskFactors.hasPersonalData;
  if (profile.hasCriticalInfra) riskScore += riskFactors.hasCriticalInfra;
  
  riskScore += riskFactors.sectorRisk;
  riskScore += riskFactors.sizeRisk;

  return Math.min(100, riskScore);
}

function getSectorRiskScore(sector: CompanySector): number {
  const sectorRisks: Record<CompanySector, number> = {
    'Finance': 25,
    'Santé': 20,
    'Énergie': 25,
    'Transport': 20,
    'Administration': 15,
    'Numérique': 15,
    'Industrie': 10,
    'Commerce': 10,
    'Autre': 5
  };
  return sectorRisks[sector] || 5;
}

function getSizeRiskScore(size: CompanySize): number {
  const sizeRisks: Record<CompanySize, number> = {
    'TPE': 5,
    'PME': 10,
    'ETI': 15,
    'GE': 20
  };
  return sizeRisks[size];
}

/**
 * Génère un profil d'entreprise par défaut
 */
export function createDefaultProfile(): CompanyProfile {
  return {
    sector: 'Autre',
    size: 'PME',
    isOIV: false,
    isOSE: false,
    isFinancial: false,
    hasPersonalData: true, // La plupart des entreprises traitent des données personnelles
    hasCriticalInfra: false,
    applicableRegulations: ['RGPD']
  };
}

/**
 * Met à jour le profil avec les réglementations applicables
 */
export function updateProfileRegulations(profile: CompanyProfile): CompanyProfile {
  return {
    ...profile,
    applicableRegulations: getApplicableRegulations(profile)
  };
}
