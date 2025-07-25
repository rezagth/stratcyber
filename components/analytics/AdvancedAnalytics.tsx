'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';
import { ActionPlanSummary, ActionPlanItem } from '../../types/actionPlan';
import { AuditResult } from '../../types/audit';

interface AnalyticsData {
  summary: ActionPlanSummary;
  actions: ActionPlanItem[];
  auditHistory: AuditResult[];
  trends: {
    scoreEvolution: Array<{ date: string; score: number; category: string }>;
    budgetUtilization: Array<{ month: string; planned: number; actual: number }>;
    actionCompletion: Array<{ week: string; completed: number; total: number }>;
  };
  benchmarks: {
    industryAverage: number;
    bestPractice: number;
    companySize: 'PME' | 'ETI' | 'GE';
    sector: string;
  };
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  subtitle 
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end">
          <Icon className="h-8 w-8 text-muted-foreground" />
          {change && (
            <div className={`flex items-center text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
              {change}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const TrendChart = ({ 
  data, 
  title, 
  height = 300 
}: { 
  data: any[]; 
  title: string; 
  height?: number; 
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div 
        className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed border-blue-200"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-blue-400" />
          <p className="font-medium">Graphique Interactif</p>
          <p className="text-sm">{title}</p>
          <p className="text-xs mt-2">Intégration Chart.js/D3.js en cours</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const RiskHeatmap = ({ riskData }: { riskData: any }) => (
  <Card>
    <CardHeader>
      <CardTitle>Matrice des Risques</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-4 gap-2">
        {['Très élevé', 'Élevé', 'Moyen', 'Faible'].map((risk, index) => (
          <div 
            key={risk}
            className={`p-4 rounded-lg text-center ${
              index === 0 ? 'bg-red-100 text-red-800' :
              index === 1 ? 'bg-orange-100 text-orange-800' :
              index === 2 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}
          >
            <div className="text-2xl font-bold">
              {riskData?.[risk] || 0}
            </div>
            <div className="text-xs">{risk}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const BenchmarkComparison = ({ benchmarks, currentScore }: { benchmarks: any; currentScore: number }) => (
  <Card>
    <CardHeader>
      <CardTitle>Comparaison Sectorielle</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span>Votre Score</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${currentScore}%` }}
              ></div>
            </div>
            <span className="font-bold">{currentScore}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Moyenne Sectorielle</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-orange-500 h-2 rounded-full" 
                style={{ width: `${benchmarks?.industryAverage || 65}%` }}
              ></div>
            </div>
            <span className="font-bold">{benchmarks?.industryAverage || 65}%</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Meilleures Pratiques</span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${benchmarks?.bestPractice || 85}%` }}
              ></div>
            </div>
            <span className="font-bold">{benchmarks?.bestPractice || 85}%</span>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-sm text-muted-foreground">
            Secteur: <span className="font-medium">{benchmarks?.sector || 'Services'}</span> | 
            Taille: <span className="font-medium">{benchmarks?.companySize || 'PME'}</span>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PredictiveInsights = ({ data }: { data: AnalyticsData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Insights Prédictifs</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="font-medium text-blue-900">Projection de Maturité</h4>
          </div>
          <p className="text-sm text-blue-800">
            Avec le plan d'action actuel, votre score devrait atteindre <strong>78%</strong> dans 12 mois.
          </p>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
            <h4 className="font-medium text-amber-900">Risques Identifiés</h4>
          </div>
          <p className="text-sm text-amber-800">
            {data.summary.overdueActions} actions en retard risquent d'impacter les objectifs Q2.
          </p>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center mb-2">
            <Target className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="font-medium text-green-900">Opportunités</h4>
          </div>
          <p className="text-sm text-green-800">
            L'automatisation de 3 processus pourrait réduire les coûts de 15%.
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Simuler le chargement des données analytics
    setTimeout(() => {
      setData({
        summary: {
          totalActions: 15,
          completedActions: 3,
          overallProgress: 20,
          criticalActions: 4,
          overdueActions: 1,
          upcomingDeadlines: [],
          budgetTotal: 365000,
          budgetSpent: 45000,
          averageCompletionTime: 45,
          riskDistribution: {
            'Très élevé': 2,
            'Élevé': 4,
            'Moyen': 6,
            'Faible': 3
          },
          categoryProgress: {
            Gouvernance: 25,
            Technique: 15,
            Organisationnel: 30,
            GRC: 10,
            Sensibilisation: 20,
            RGPD: 35
          }
        },
        actions: [],
        auditHistory: [],
        trends: {
          scoreEvolution: [],
          budgetUtilization: [],
          actionCompletion: []
        },
        benchmarks: {
          industryAverage: 65,
          bestPractice: 85,
          companySize: 'PME',
          sector: 'Services Financiers'
        }
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Contrôles temporels */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Avancés</h2>
        <div className="flex space-x-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 jours' :
               range === '30d' ? '30 jours' :
               range === '90d' ? '3 mois' : '1 an'}
            </Button>
          ))}
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Score de Maturité"
          value="67%"
          change="+5%"
          trend="up"
          icon={Target}
          subtitle="vs mois dernier"
        />
        <MetricCard
          title="Actions Terminées"
          value={`${data.summary.completedActions}/${data.summary.totalActions}`}
          change="+2"
          trend="up"
          icon={CheckCircle}
          subtitle="cette semaine"
        />
        <MetricCard
          title="Budget Utilisé"
          value={`${Math.round((data.summary.budgetSpent / data.summary.budgetTotal) * 100)}%`}
          change="+12%"
          trend="up"
          icon={DollarSign}
          subtitle={`${data.summary.budgetSpent.toLocaleString()}€`}
        />
        <MetricCard
          title="Temps Moyen"
          value={`${data.summary.averageCompletionTime}j`}
          change="-3j"
          trend="down"
          icon={Clock}
          subtitle="par action"
        />
      </div>

      {/* Onglets analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="risks">Risques</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmark</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart 
              data={data.trends.scoreEvolution} 
              title="Évolution du Score Global"
            />
            <RiskHeatmap riskData={data.summary.riskDistribution} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendChart 
              data={data.trends.actionCompletion} 
              title="Progression des Actions"
            />
            <TrendChart 
              data={data.trends.budgetUtilization} 
              title="Utilisation Budgétaire"
            />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <TrendChart 
              data={data.trends.scoreEvolution} 
              title="Évolution par Domaine"
              height={400}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart 
                data={data.trends.budgetUtilization} 
                title="Tendance Budgétaire"
              />
              <TrendChart 
                data={data.trends.actionCompletion} 
                title="Vélocité d'Exécution"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmap riskData={data.summary.riskDistribution} />
            <Card>
              <CardHeader>
                <CardTitle>Actions à Risque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: "Déploiement EDR", risk: "Haute", reason: "Retard fournisseur" },
                    { title: "Formation RGPD", risk: "Moyenne", reason: "Disponibilité équipes" },
                    { title: "Audit ISO 27001", risk: "Faible", reason: "Planning serré" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.reason}</p>
                      </div>
                      <Badge variant={
                        item.risk === 'Haute' ? 'destructive' :
                        item.risk === 'Moyenne' ? 'secondary' : 'outline'
                      }>
                        {item.risk}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmark" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BenchmarkComparison benchmarks={data.benchmarks} currentScore={67} />
            <Card>
              <CardHeader>
                <CardTitle>Positionnement Concurrentiel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">Top 25%</div>
                    <p className="text-blue-800">de votre secteur</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold">12</div>
                      <p className="text-sm text-muted-foreground">Rang national</p>
                    </div>
                    <div>
                      <div className="text-xl font-bold">3</div>
                      <p className="text-sm text-muted-foreground">Rang régional</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PredictiveInsights data={data} />
            <TrendChart 
              data={[]} 
              title="Projection 12 Mois"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
