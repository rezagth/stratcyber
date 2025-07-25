export type AuditCategory =
  | 'Gouvernance'
  | 'Technique'
  | 'Organisationnel'
  | 'GRC'
  | 'Sensibilisation'
  | 'RGPD';

export type AuditQuestionType = 'scale' | 'boolean' | 'choice';

export type AuditQuestion = {
  id: string;
  category: AuditCategory;
  question: string;
  description?: string;
  type: AuditQuestionType;
  options?: string[];
  weight?: number;
};

export type AuditAnswer = {
  questionId: string;
  answer: string;
  score?: number;
};

export type AuditFormData = {
  answers: AuditAnswer[];
};

export type AuditResult = {
  globalScore: number;
  scoresByCategory: Record<AuditCategory, number>;
  maturity: string;
  recommendations: string[];
  roadmap: string[];
}; 