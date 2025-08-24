import { 
  Audit, 
  AuditResponse, 
  StrategicAction, 
  StrategicMilestone, 
  ComplianceScore, 
  LegalRiskAssessment,
  ActionPlan,
  ActionTask,
  RiskAssessment,
  ThreatScenario,
  Vulnerability,
  SecurityAlert,
  IncidentReport,
  User
} from '@prisma/client';

// Extended types avec relations
export interface AuditWithRelations extends Audit {
  responses: AuditResponse[];
  strategicActions: StrategicAction[];
  milestones: StrategicMilestone[];
  complianceScores: ComplianceScore[];
  legalRiskAssessment: LegalRiskAssessment | null;
  user: User;
}

export interface ActionPlanWithTasks extends ActionPlan {
  tasks: ActionTask[];
}

export interface RiskAssessmentWithDetails extends RiskAssessment {
  threats: ThreatScenario[];
  vulnerabilities: Vulnerability[];
}

// Types pour les KPIs du dashboard
export interface DashboardKPIs {
  globalMaturityScore: number;
  actionProgressPercentage: number;
  completedActions: number;
  inProgressActions: number;
  overdueActions: number;
  complianceScores: Record<string, number>;
  legalRiskScore: number;
  criticalVulnerabilities: number;
  openIncidents: number;
  securityAlerts: number;
  securityActions?: number;
  totalIncidents?: number;
  resolvedIncidents?: number;
  incidentResolutionRate?: number;
}

// Types pour les graphiques
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  score: number;
  category?: string;
}

export interface HeatmapData {
  impact: number;
  probability: number;
  risk: string;
  level: 'Faible' | 'Moyen' | 'Élevé' | 'Critique';
}

// Types pour les actions
export interface DashboardAction {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: 'Critique' | 'Haute' | 'Moyenne' | 'Basse';
  status: 'Non commencé' | 'En cours' | 'Terminé' | 'En retard';
  progress: number;
  dueDate: Date;
  owner?: string;
  assignees?: string[];
  dependencies?: string[];
  kpis?: string[];
}

// Types pour les risques
export interface DashboardRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: number;
  probability: number;
  riskLevel: 'Faible' | 'Moyen' | 'Élevé' | 'Critique';
  mitigationPlan?: string;
  status: 'Ouvert' | 'En cours' | 'Mitigé' | 'Fermé';
  owner?: string;
}

// Types pour les jalons
export interface DashboardMilestone {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: Date;
  status: 'Non commencé' | 'En cours' | 'Terminé';
  progress: number;
  actions: string[];
}

// Types pour les alertes sécurité
export interface DashboardAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'vulnerability' | 'threat' | 'incident';
  isResolved: boolean;
  createdAt: Date;
  affectedSystems?: string[];
}

// Types pour les incidents
export interface DashboardIncident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  detectedAt: Date;
  resolvedAt?: Date;
  affectedSystems?: string[];
  dataImpacted: boolean;
}

// Types pour les filtres
export interface DashboardFilters {
  timeRange: '7d' | '30d' | '90d' | '1y' | 'all';
  categories: string[];
  priorities: string[];
  statuses: string[];
  regulations: string[];
}

// Types pour les préférences utilisateur
export interface DashboardPreferences {
  layout: 'compact' | 'detailed';
  defaultFilters: DashboardFilters;
  favoriteWidgets: string[];
  refreshInterval: number;
}

// Types pour l'export
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  sections: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Types pour les widgets du dashboard
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'table' | 'timeline' | 'heatmap';
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data: any;
  config: any;
}

// Types pour la configuration du dashboard
export interface DashboardConfig {
  widgets: DashboardWidget[];
  layout: 'grid' | 'masonry';
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
}
