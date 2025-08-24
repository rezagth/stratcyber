'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertCircle, 
  Download, 
  Shield, 
  FileText, 
  TrendingUp,
  Users,
  AlertTriangle,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  RefreshCw
} from 'lucide-react';

// Import des nouveaux composants dashboard
import { KPIBox } from '@/components/dashboard/KPIBox';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { ActionsTable } from '@/components/dashboard/ActionsTable';
import { RisksTable } from '@/components/dashboard/RisksTable';
import { Timeline } from '@/components/dashboard/Timeline';

// Import des composants de graphiques
import { PieChartComponent } from '@/components/charts/PieChart';
import { LineChartComponent } from '@/components/charts/LineChart';
import { RiskHeatmap } from '@/components/charts/RiskHeatmap';

// Import des types
import { 
  DashboardKPIs, 
  DashboardAction, 
  DashboardRisk, 
  DashboardMilestone,
  DashboardAlert,
  DashboardIncident,
  ChartData,
  TimeSeriesData,
  HeatmapData
} from '@/types/dashboard';

export default function CyberSecurityDashboard() {
  const { data: session } = useSession();
  
  // États pour les données du dashboard
  const [kpis, setKpis] = useState<DashboardKPIs>({
    globalMaturityScore: 72,
    actionProgressPercentage: 45,
    completedActions: 8,
    inProgressActions: 12,
    overdueActions: 3,
    complianceScores: {
      'RGPD': 85,
      'NIS2': 67,
      'ISO27001': 78,
      'DORA': 62
    },
    legalRiskScore: 25,
    criticalVulnerabilities: 4,
    openIncidents: 2,
    securityAlerts: 7
  });

  const [actions, setActions] = useState<DashboardAction[]>([
    {
      id: '1',
      title: 'Mettre en place une politique de sauvegarde',
      description: 'Définir et implémenter une stratégie de sauvegarde robuste',
      category: 'Technique',
      priority: 'Haute',
      status: 'En cours',
      progress: 65,
      dueDate: new Date('2024-12-15'),
      owner: 'Jean Dupont',
      assignees: ['jean.dupont@example.com'],
      dependencies: [],
      kpis: ['backup_success_rate']
    },
    {
      id: '2',
      title: 'Formation RGPD pour les équipes',
      description: 'Organiser des sessions de formation sur la protection des données',
      category: 'Organisationnel',
      priority: 'Moyenne',
      status: 'Non commencé',
      progress: 0,
      dueDate: new Date('2024-11-30'),
      owner: 'Marie Martin',
      assignees: ['marie.martin@example.com'],
      dependencies: [],
      kpis: ['training_completion_rate']
    }
  ]);

  const [risks, setRisks] = useState<DashboardRisk[]>([
    {
      id: '1',
      title: 'Attaque par ransomware',
      description: 'Risque d\'infection par un logiciel malveillant de type ransomware',
      category: 'Cyber',
      impact: 5,
      probability: 3,
      riskLevel: 'Élevé',
      mitigationPlan: 'Mise en place de sauvegardes et formation des utilisateurs',
      status: 'Ouvert',
      owner: 'Équipe Sécurité'
    },
    {
      id: '2',
      title: 'Fuite de données personnelles',
      description: 'Exposition non autorisée de données personnelles clients',
      category: 'Conformité',
      impact: 4,
      probability: 2,
      riskLevel: 'Moyen',
      mitigationPlan: 'Chiffrement des données et contrôles d\'accès renforcés',
      status: 'En cours',
      owner: 'DPO'
    }
  ]);

  const [milestones, setMilestones] = useState<DashboardMilestone[]>([
    {
      id: '1',
      title: 'Certification ISO 27001',
      description: 'Obtention de la certification ISO 27001',
      category: 'Conformité',
      dueDate: new Date('2025-06-01'),
      status: 'En cours',
      progress: 40,
      actions: ['1', '2']
    }
  ]);

  // États de l'interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Données pour les graphiques
  const actionStatusData: ChartData[] = [
    { name: 'Terminé', value: kpis.completedActions, color: '#10b981' },
    { name: 'En cours', value: kpis.inProgressActions, color: '#3b82f6' },
    { name: 'En retard', value: kpis.overdueActions, color: '#ef4444' },
    { name: 'Non commencé', value: 5, color: '#94a3b8' }
  ];

  const domainProgressData: ChartData[] = [
    { name: 'Technique', value: 75 },
    { name: 'Organisationnel', value: 68 },
    { name: 'Gouvernance', value: 82 },
    { name: 'Conformité', value: 71 }
  ];

  const maturityTimeSeriesData: TimeSeriesData[] = [
    { date: '2024-08-01', score: 65 },
    { date: '2024-09-01', score: 68 },
    { date: '2024-10-01', score: 70 },
    { date: '2024-11-01', score: 72 }
  ];

  const riskHeatmapData: HeatmapData[] = risks.map(risk => ({
    impact: risk.impact,
    probability: risk.probability,
    risk: risk.title,
    level: risk.riskLevel
  }));

  // Fonctions de gestion
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simuler un refresh des données
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleExportPDF = () => {
    console.log('Export PDF demandé');
  };

  const handleActionClick = (action: DashboardAction) => {
    console.log('Action cliquée:', action.title);
  };

  const handleRiskClick = (risk: DashboardRisk) => {
    console.log('Risque cliqué:', risk.title);
  };

  const handleKPIClick = (kpiName: string) => {
    console.log('KPI cliqué:', kpiName);
    // Naviguer vers la vue détaillée correspondante
    setActiveTab(kpiName === 'actions' ? 'actions' : kpiName === 'risks' ? 'risks' : 'overview');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-4">Chargement du dashboard...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-4">Erreur lors du chargement</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* En-tête du dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Cybersécurité
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Vue d'ensemble de votre posture de sécurité et conformité
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risques
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TimelineIcon className="h-4 w-4" />
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Onglet Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPIBox
              title="Score de Maturité Global"
              value={kpis.globalMaturityScore}
              unit="%"
              subtitle="Niveau de maturité cybersécurité"
              status={kpis.globalMaturityScore >= 80 ? 'success' : kpis.globalMaturityScore >= 60 ? 'warning' : 'danger'}
              icon={<Shield className="h-5 w-5" />}
              trend={{
                direction: 'up',
                value: 5,
                period: 'mois dernier'
              }}
              onClick={() => handleKPIClick('maturity')}
            />

            <KPIBox
              title="Progression Actions"
              value={kpis.actionProgressPercentage}
              unit="%"
              subtitle={`${kpis.completedActions} terminées, ${kpis.inProgressActions} en cours`}
              status={kpis.actionProgressPercentage >= 80 ? 'success' : 'warning'}
              icon={<Activity className="h-5 w-5" />}
              progress={kpis.actionProgressPercentage}
              onClick={() => handleKPIClick('actions')}
            />

            <KPIBox
              title="Risque Légal"
              value={kpis.legalRiskScore}
              unit="/100"
              subtitle="Score de risque de non-conformité"
              status={kpis.legalRiskScore <= 30 ? 'success' : kpis.legalRiskScore <= 60 ? 'warning' : 'danger'}
              icon={<AlertTriangle className="h-5 w-5" />}
              trend={{
                direction: 'down',
                value: 3,
                period: 'trimestre'
              }}
              onClick={() => handleKPIClick('compliance')}
            />

            <KPIBox
              title="Incidents Ouverts"
              value={kpis.openIncidents}
              subtitle={`${kpis.criticalVulnerabilities} vulnérabilités critiques`}
              status={kpis.openIncidents === 0 ? 'success' : kpis.openIncidents <= 3 ? 'warning' : 'danger'}
              icon={<AlertCircle className="h-5 w-5" />}
              onClick={() => handleKPIClick('incidents')}
            />
          </div>

          {/* Graphiques principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer
              title="Répartition des Actions"
              subtitle="Distribution par statut"
              expandable
              onExport={(format) => console.log('Export chart:', format)}
            >
              <PieChartComponent data={actionStatusData} />
            </ChartContainer>

            <ChartContainer
              title="Évolution du Score de Maturité"
              subtitle="Progression dans le temps"
              expandable
            >
              <LineChartComponent 
                data={maturityTimeSeriesData}
                showArea
                color="#3b82f6"
              />
            </ChartContainer>
          </div>

          {/* Heatmap des risques */}
          <ChartContainer
            title="Matrice des Risques"
            subtitle="Impact vs Probabilité"
            size="full"
            expandable
          >
            <RiskHeatmap data={riskHeatmapData} />
          </ChartContainer>

          {/* Scores de conformité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Conformité Réglementaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(kpis.complianceScores).map(([regulation, score]) => (
                  <div key={regulation} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold mb-2">{score}%</div>
                    <div className="text-sm font-medium mb-2">{regulation}</div>
                    <Badge 
                      variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {score >= 80 ? 'Conforme' : score >= 60 ? 'À améliorer' : 'Critique'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Actions */}
        <TabsContent value="actions">
          <ActionsTable
            actions={actions}
            onRowClick={handleActionClick}
            onExport={(format) => console.log('Export actions:', format)}
          />
        </TabsContent>

        {/* Onglet Risques */}
        <TabsContent value="risks">
          <RisksTable
            risks={risks}
            onRowClick={handleRiskClick}
            onExport={(format) => console.log('Export risks:', format)}
          />
        </TabsContent>

        {/* Onglet Timeline */}
        <TabsContent value="timeline">
          <Timeline
            actions={actions}
            milestones={milestones}
            onActionClick={handleActionClick}
            onMilestoneClick={(milestone) => console.log('Milestone clicked:', milestone.title)}
            timeRange="next90"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
