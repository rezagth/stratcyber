import { AuditCategory } from './audit';

export type Priority = 'Critique' | 'Haute' | 'Moyenne' | 'Basse';
export type ActionStatus = 'Non commencé' | 'En cours' | 'En retard' | 'Terminé' | 'Bloqué';
export type RiskLevel = 'Très élevé' | 'Élevé' | 'Moyen' | 'Faible';

export interface SubTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: ActionStatus;
  assignee?: string;
  dueDate: Date;
  completedDate?: Date;
  dependencies: string[]; // IDs of other subtasks
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  category: AuditCategory;
  priority: Priority;
  riskLevel: RiskLevel;
  
  // Timing
  startDate: Date;
  dueDate: Date;
  estimatedDuration: number; // en jours
  
  // Assignment
  owner: string;
  assignees: string[];
  
  // Progress tracking
  status: ActionStatus;
  progress: number; // 0-100%
  
  // Subtasks
  subTasks: SubTask[];
  
  // Business impact
  businessImpact: string;
  technicalComplexity: 'Faible' | 'Moyenne' | 'Élevée';
  budget?: number;
  
  // Dependencies
  dependencies: string[]; // IDs of other actions
  blockers: string[];
  
  // Documentation
  resources: string[];
  notes: string;
  
  // Metrics
  kpis: string[];
  successCriteria: string[];
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  category: AuditCategory;
  actions: string[]; // Action IDs
  status: 'À venir' | 'En cours' | 'Terminé' | 'En retard';
  progress: number;
}

export interface RoadmapQuarter {
  quarter: string; // "Q1 2024"
  year: number;
  startDate: Date;
  endDate: Date;
  milestones: Milestone[];
  budget: number;
  focusAreas: AuditCategory[];
}

export interface ActionPlanSummary {
  totalActions: number;
  completedActions: number;
  overallProgress: number;
  criticalActions: number;
  overdueActions: number;
  upcomingDeadlines: ActionPlanItem[];
  budgetTotal: number;
  budgetSpent: number;
  averageCompletionTime: number;
  riskDistribution: Record<RiskLevel, number>;
  categoryProgress: Record<AuditCategory, number>;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  department: string;
  skills: string[];
  workload: number; // 0-100%
  assignedActions: string[];
}

export interface RoadmapConfig {
  startDate: Date;
  endDate: Date;
  quarters: RoadmapQuarter[];
  teamMembers: TeamMember[];
  budgetTotal: number;
  companySize: 'PME' | 'ETI' | 'GE';
  sector: string;
}
