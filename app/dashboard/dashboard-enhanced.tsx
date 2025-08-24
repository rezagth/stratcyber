'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, TrendingUp, Activity, Users, AlertTriangle, Target, 
  BarChart3, PieChart as PieChartIcon, Zap, Award, DollarSign,
  Clock, FileText, RefreshCw, Download, Eye, Settings,
  ChevronRight, Building2, Briefcase, Lock, Database,
  Cpu, Network, Globe, KeyRound, FileShield, AlertCircle
} from 'lucide-react';

// Nouveaux composants
import { DonutChart } from '@/components/charts/DonutChart';
import { AreaChart } from '@/components/charts/AreaChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { KPIBox } from '@/components/dashboard/KPIBox';

// Composants existants
import RadarChart from '@/components/charts/RadarChart';
import BarChart from '@/components/charts/BarChart';
import { PieChartComponent } from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { RiskHeatmap } from '@/components/charts/RiskHeatmap';

// Types
import { 
  DashboardKPIs, 
  ChartData, 
  TimeSeriesData,
  DashboardAction,
  DashboardRisk,
  HeatmapData 
} from '@/types/dashboard';

interface EnhancedDashboardData {
  kpis: DashboardKPIs;
  actions: DashboardAction[];
  risks: DashboardRisk[];
  charts: {
    actionStatus: ChartData[];
    domainProgress: ChartData[];
    maturityTimeSeries: TimeSeriesData[];
    riskHeatmap: HeatmapData[];
  };
}

export default function EnhancedDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<EnhancedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/dashboard/data');
      if (!response.ok) throw new Error('Erreur lors de la récupération des données');
      
      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-900">Chargement du dashboard...</h2>
            <p className="text-gray-600">Récupération des données de cybersécurité</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Erreur</h2>
            <p className="text-red-600">{error || 'Impossible de charger les données'}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { kpis, actions, risks, charts } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Dashboard StratCyber
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Surveillance continue et analyse stratégique de votre cybersécurité
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              Rapport complet
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-none lg:flex">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <FileShield className="h-4 w-4" />
              Conformité
            </TabsTrigger>
            <TabsTrigger value="risks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Risques
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Score de Maturité"
                value={kpis.globalMaturityScore}
                unit="%"
                subtitle="Score global de cybersécurité"
                status={kpis.globalMaturityScore >= 80 ? 'success' : 
                       kpis.globalMaturityScore >= 60 ? 'warning' : 'danger'}
                progress={kpis.globalMaturityScore}
                icon={<Award className="h-5 w-5" />}
                variant="gradient"
                trend={{
                  direction: 'up',
                  value: 5,
                  period: 'mois dernier',
                  isGood: true
                }}
                target={{
                  value: 85,
                  label: '%'
                }}
              />

              <MetricCard
                title="Actions Réalisées"
                value={kpis.completedActions}
                unit={`/${kpis.completedActions + kpis.inProgressActions + kpis.overdueActions}`}
                subtitle="Plan d'action"
                status="info"
                progress={kpis.actionProgressPercentage}
                icon={<Target className="h-5 w-5" />}
                variant="gradient"
              />

              <MetricCard
                title="Risque Légal"
                value={kpis.legalRiskScore}
                unit="/100"
                subtitle="Niveau de conformité"
                status={kpis.legalRiskScore <= 20 ? 'success' : 
                       kpis.legalRiskScore <= 50 ? 'warning' : 'danger'}
                icon={<FileShield className="h-5 w-5" />}
                variant="gradient"
                alerts={kpis.legalRiskScore > 70 ? [{
                  type: 'danger',
                  message: 'Risque critique'
                }] : []}
              />

              <MetricCard
                title="Alertes Actives"
                value={kpis.securityAlerts + kpis.openIncidents + kpis.criticalVulnerabilities}
                subtitle="Incidents et vulnérabilités"
                status={kpis.securityAlerts > 5 ? 'danger' : 
                       kpis.securityAlerts > 0 ? 'warning' : 'success'}
                icon={<AlertCircle className="h-5 w-5" />}
                variant="gradient"
              />
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gauge Score Global */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Score Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GaugeChart
                    value={kpis.globalMaturityScore}
                    title="Maturité Cybersécurité"
                    thresholds={{
                      low: 40,
                      medium: 70,
                      high: 85
                    }}
                    size="large"
                  />
                </CardContent>
              </Card>

              {/* Statut des Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Statut des Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <DonutChart
                    data={charts.actionStatus}
                    centerText={{
                      value: actions.length,
                      label: 'Actions'
                    }}
                    innerRadius={50}
                    outerRadius={90}
                  />
                </CardContent>
              </Card>

              {/* Progression par Domaine */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Progression Domaines
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <PieChartComponent
                    data={charts.domainProgress}
                    showLegend={true}
                    innerRadius={0}
                    outerRadius={80}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Évolution temporelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Évolution du Score de Maturité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AreaChart
                    data={charts.maturityTimeSeries}
                    dataKeys={['score']}
                    colors={['#3b82f6']}
                    showGrid={true}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPIBox
                title="Vulnérabilités Critiques"
                value={kpis.criticalVulnerabilities}
                subtitle="nécessitent une action immédiate"
                status={kpis.criticalVulnerabilities === 0 ? 'success' : 
                       kpis.criticalVulnerabilities <= 2 ? 'warning' : 'danger'}
                icon={<AlertTriangle className="h-5 w-5" />}
              />

              <KPIBox
                title="Incidents Ouverts"
                value={kpis.openIncidents}
                subtitle="en cours d'investigation"
                status={kpis.openIncidents === 0 ? 'success' : 
                       kpis.openIncidents <= 1 ? 'warning' : 'danger'}
                icon={<Activity className="h-5 w-5" />}
              />

              <KPIBox
                title="Alertes Sécurité"
                value={kpis.securityAlerts}
                subtitle="non résolues"
                status={kpis.securityAlerts === 0 ? 'success' : 
                       kpis.securityAlerts <= 3 ? 'warning' : 'danger'}
                icon={<AlertCircle className="h-5 w-5" />}
              />
            </div>

            {/* Heatmap des risques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Matrice des Risques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <RiskHeatmap data={charts.riskHeatmap} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conformité */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(kpis.complianceScores).map(([regulation, score]) => (
                <MetricCard
                  key={regulation}
                  title={regulation}
                  value={score}
                  unit="%"
                  subtitle="Conformité réglementaire"
                  status={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}
                  progress={score}
                  icon={<FileShield className="h-5 w-5" />}
                  variant="outlined"
                />
              ))}
            </div>

            {/* Graphique radar conformité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600" />
                  Vue Radar - Conformité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <RadarChart scores={kpis.complianceScores} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risques */}
          <TabsContent value="risks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top risques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Risques Critiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {risks.slice(0, 5).map((risk) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{risk.title}</h4>
                          <p className="text-sm text-muted-foreground">{risk.category}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            risk.riskLevel === 'Critique' ? 'destructive' :
                            risk.riskLevel === 'Élevé' ? 'secondary' : 'default'
                          }>
                            {risk.riskLevel}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            I: {risk.impact} | P: {risk.probability}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions prioritaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Actions Prioritaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {actions.filter(a => a.priority === 'Critique' || a.priority === 'Haute').slice(0, 5).map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{action.title}</h4>
                          <p className="text-sm text-muted-foreground">{action.category}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={action.priority === 'Critique' ? 'destructive' : 'secondary'}>
                            {action.priority}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {action.progress}% complété
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Évolution scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Évolution Temporelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart data={charts.maturityTimeSeries} />
                  </div>
                </CardContent>
              </Card>

              {/* Répartition par domaine */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance par Domaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart scores={charts.domainProgress.reduce((acc, item) => {
                      acc[item.name] = item.value;
                      return acc;
                    }, {} as Record<string, number>)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métriques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                title="Temps Moyen de Résolution"
                value="4.2"
                unit="jours"
                subtitle="incidents de sécurité"
                status="info"
                icon={<Clock className="h-4 w-4" />}
                size="compact"
              />
              
              <MetricCard
                title="Couverture Audit"
                value="87"
                unit="%"
                subtitle="domaines audités"
                status="success"
                icon={<FileText className="h-4 w-4" />}
                size="compact"
              />
              
              <MetricCard
                title="ROI Sécurité"
                value="3.2"
                unit="x"
                subtitle="retour sur investissement"
                status="success"
                icon={<DollarSign className="h-4 w-4" />}
                size="compact"
              />
              
              <MetricCard
                title="Formations"
                value={12}
                subtitle="utilisateurs formés ce mois"
                status="info"
                icon={<Users className="h-4 w-4" />}
                size="compact"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
