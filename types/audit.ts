export type AuditCategory =
  | 'Gouvernance'
  | 'Technique'
  | 'Organisationnel'
  | 'GRC'
  | 'Sensibilisation'
  | 'RGPD'
  | 'NIS2'
  | 'DORA'
  | 'CRA'
  | 'LPM'
  | 'Incidents'
  | 'SupplyChain'
  | 'Cloud'
  | 'Secteur'
  | 'ISO27001'
  | 'EBIOS';

export type CompanySector =
  | 'Finance'
  | 'Santé'
  | 'Énergie'
  | 'Transport'
  | 'Numérique'
  | 'Administration'
  | 'Industrie'
  | 'Commerce'
  | 'Autre';

export type CompanySize =
  | 'TPE' // < 10 employés
  | 'PME' // 10-249 employés
  | 'ETI' // 250-4999 employés
  | 'GE';  // >= 5000 employés

export type RegulationScope =
  | 'RGPD'
  | 'NIS2'
  | 'DORA'
  | 'CRA'
  | 'LPM'
  | 'HDS'
  | 'PCI_DSS'
  | 'ISO27001'
  | 'EBIOS';;

export type CompanyProfile = {
  sector: CompanySector;
  size: CompanySize;
  isOIV: boolean; // Opérateur d'Importance Vitale
  isOSE: boolean; // Opérateur de Services Essentiels
  isFinancial: boolean;
  hasPersonalData: boolean;
  hasCriticalInfra: boolean;
  applicableRegulations: RegulationScope[];
};

export type AuditQuestionType = 'scale' | 'boolean' | 'choice';

export type AuditQuestion = {
  id: string;
  category: AuditCategory;
  question: string;
  description?: string;
  type: AuditQuestionType;
  options?: string[];
  weight?: number;
  actionRecommendations?: {
    negativeAnswer?: string[]; // Actions to take when answer is negative (e.g., 'non' for boolean)
    lowScore?: string[];        // Actions to take when score is low (e.g., 0-2 for scale)
  };
};

export type AuditAnswer = {
  questionId: string;
  answer: string;
  score?: number;
};

export type AuditFormData = {
  answers: AuditAnswer[];
};

export type ComplianceScore = {
  regulation: RegulationScope;
  score: number;
  mandatoryGaps: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedFine: number;
  deadline?: Date;
};

export type AuditResult = {
  globalScore: number;
  scoresByCategory: Record<AuditCategory, number>;
  complianceScores: ComplianceScore[];
  maturity: string;
  recommendations: string[];
  roadmap: string[];
  legalRiskScore: number;
  mandatoryActions: ActionItem[];
  optionalActions: ActionItem[];
};

export type ActionItem = {
  id: string;
  title: string;
  description: string;
  category: AuditCategory;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isMandatory: boolean;
  regulation?: RegulationScope;
  deadline?: Date;
  estimatedCost?: number;
  estimatedDuration?: string;
  owner: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
};