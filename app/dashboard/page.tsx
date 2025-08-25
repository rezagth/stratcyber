'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Shield, FileText, Eye, Activity, TrendingUp, Zap, Target, BarChart3, PieChart, Calendar, Users, Bell, Settings, Clock } from 'lucide-react';
import { generateActionPlan, calculateCrazyScore, computeAuditResult, ActionPlanItem, inferComplianceFromCategory } from '../../lib/audit/scoring';
import { Audit } from '@prisma/client';
import RadarChart from '../../components/charts/RadarChart';
import BarChart from '../../components/charts/BarChart';
import { DonutChart } from '../../components/charts/DonutChart';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { LineChartComponent } from '../../components/charts/LineChart';
import { PieChartComponent } from '../../components/charts/PieChart';
import { RiskHeatmap } from '../../components/charts/RiskHeatmap';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { AuditCategory } from '../../types/audit';
import { ChartData, TimeSeriesData, HeatmapData } from '../../types/dashboard';

// Extend the Prisma Audit type to include responses
interface AuditWithResponses extends Audit {
  responses: {
    question: string;
    answer: string;
    score: number | null;
    category: string;
  }[];
  legalRiskScore?: number;
}

// Compliance regulation data
const REGULATIONS = {
  RGPD: { name: 'RGPD', color: 'bg-blue-500', deadline: '2025-05-25' },
  NIS2: { name: 'NIS2', color: 'bg-purple-500', deadline: '2024-10-17' },
  DORA: { name: 'DORA', color: 'bg-orange-500', deadline: '2025-01-17' },
  CRA: { name: 'CRA', color: 'bg-green-500', deadline: '2025-08-01' },
  LPM: { name: 'LPM', color: 'bg-red-500', deadline: '2024-12-31' },
  ISO27001: { name: 'ISO 27001', color: 'bg-teal-600', deadline: '2025-06-01' },
  EBIOS: { name: 'EBIOS', color: 'bg-cyan-600', deadline: '2025-09-30' }
};

// Mapping de secours entre réglementations et catégories internes
const REGULATION_CATEGORY_MAP: Record<string, AuditCategory[]> = {
  NIS2: ['Technique', 'Gouvernance', 'Organisationnel', 'Incidents', 'SupplyChain'],
  DORA: ['Technique', 'Incidents', 'Cloud', 'Gouvernance'],
  LPM: ['Gouvernance', 'Organisationnel', 'GRC'],
  ISO27001: ['Gouvernance', 'Technique', 'Organisationnel', 'GRC', 'Cloud'],
  EBIOS: ['GRC', 'Gouvernance']
};

// Calculate compliance scores
const calculateComplianceScores = (lastAudit: AuditWithResponses | null, categoryScores: Record<string, number>) => {
  if (!lastAudit?.responses) return {} as Record<string, number>;
  const complianceScores: Record<string, number> = {};
  Object.keys(REGULATIONS).forEach(reg => {
    const relevantResponses = lastAudit.responses.filter((r: { category: string; score: number | null }) => {
      switch (reg) {
        case 'RGPD': return r.category === 'RGPD';
        case 'NIS2': return r.category === 'NIS2';
        case 'DORA': return r.category === 'DORA';
        case 'CRA': return r.category === 'CRA';
        case 'LPM': return r.category === 'LPM';
        default: return false;
      }
    });
    let avgScoreRaw: number;
    if (relevantResponses.length > 0) {
      avgScoreRaw = relevantResponses.reduce((sum: number, r: { score: number | null }) => sum + (r.score || 0), 0) / relevantResponses.length;
    } else if (REGULATION_CATEGORY_MAP[reg]) {
      const catPercents = REGULATION_CATEGORY_MAP[reg].map(c=>categoryScores[c] ?? 0);
      const avgCatPercent = catPercents.length ? catPercents.reduce((a,b)=>a+b,0)/catPercents.length : 0;
      avgScoreRaw = avgCatPercent / 20;
    } else {
      avgScoreRaw = (categoryScores[reg] ?? 0) / 20;
    }
    complianceScores[reg] = relevantResponses.length > 0 ? Math.round((avgScoreRaw / 5) * 100) : Math.round(avgScoreRaw);
  });
  return complianceScores;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [audits, setAudits] = useState<AuditWithResponses[]>([]);
  const [lastAudit, setLastAudit] = useState<AuditWithResponses | null>(null);
  const [showAllActions, setShowAllActions] = useState(false);
  const [actionFilter, setActionFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'DEADLINE'>('PRIORITY');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [complianceFilter, setComplianceFilter] = useState<'ALL' | 'CRITICAL' | 'LOW_SCORE'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          // Fetch audit data
          const auditResponse = await fetch(`/api/audits?userId=${session.user.id}`);
          const auditData = await auditResponse.json();
          setAudits(auditData);
          setLastAudit(auditData[0] as AuditWithResponses || null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
          console.error('Erreur lors de la récupération des données:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [session]);

  const auditResult = lastAudit ? computeAuditResult(
    lastAudit.responses.map(r => ({
      questionId: r.question,
      answer: r.answer,
      score: r.score ?? 0,
    }))
  ) : null;

  const scores = auditResult ? auditResult.scoresByCategory : {} as Record<AuditCategory, number>;

  let applicableRegs: string[] = Object.keys(REGULATIONS);
  if (lastAudit?.companyProfile) {
    try {
      const profile = JSON.parse(lastAudit.companyProfile) as { applicableRegulations?: string[] };
      if (profile?.applicableRegulations?.length) {
        applicableRegs = profile.applicableRegulations;
      }
    } catch (e) {
      console.warn('Impossible de parser companyProfile', e);
    }
  }

  const complianceScores = calculateComplianceScores(lastAudit, scores as Record<string, number>);
  const visibleRegs = applicableRegs.filter(
    reg => complianceScores[reg] > 0
  );
  if (!visibleRegs.length && complianceScores['RGPD'] !== undefined) visibleRegs.push('RGPD');

  const totalRisk = visibleRegs.reduce((sum, reg)=> sum + (100 - complianceScores[reg]), 0);
  const legalRisk = Math.round(totalRisk / (visibleRegs.length || 1));
  const legalRiskLevel = legalRisk >= 80 ? 'Critique' : legalRisk >= 60 ? 'Élevé' : legalRisk >= 40 ? 'Moyen' : 'Faible';
  const legalRiskColor = legalRisk >= 80 ? 'bg-destructive' : legalRisk >= 60 ? 'bg-amber-500' : legalRisk >= 40 ? 'bg-yellow-400' : 'bg-green-500';

  const handleExport = () => {
    const csvHeader = ['Action','Catégorie','Priorité','Échéance','Responsable'];
    const rows = sortedActions.map(a=>[a.action,a.category,a.priority,a.deadline,a.owner]);
    const csv = [csvHeader, ...rows].map(r=>r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download','plan_action.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePdfReport = async (auditId: string) => {
    try {
      setGeneratingPdf(auditId);
      const response = await fetch(`/api/audit/${auditId}/export/comprehensive-pdf`);
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }
      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-audit-${auditId}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleViewPdfReport = async (auditId: string) => {
    try {
      const url = `/api/audit/${auditId}/export/comprehensive-pdf`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur ouverture rapport:', error);
      alert('Erreur lors de l\'ouverture du rapport.');
    }
  };

  const crazyScore = auditResult ? calculateCrazyScore(auditResult) : null;
  const answers = lastAudit?.responses.map(response => ({
    questionId: response.question,
    answer: response.answer,
    score: response.score !== null ? response.score : undefined
  })) || [];
  const actionPlan = auditResult ? generateActionPlan(auditResult, answers) : [];

  const filterActionsByCompliance = (actions: ActionPlanItem[], context: AuditWithResponses | null) => {
    if (!context) return actions;
    return actions.filter(action => {
      const complianceCategories = inferComplianceFromCategory(action.category);
      return complianceCategories.some(cc => context.responses.some(r => r.category === cc && (r.score ?? 0) > 2));
    });
  };
  const filteredActionPlan = filterActionsByCompliance(actionPlan, lastAudit);

  const priorityFiltered = actionPlan.filter(a => {
    if (actionFilter === 'ALL') return true;
    if (actionFilter === 'HIGH') return a.priority === 'Haute';
    if (actionFilter === 'MEDIUM') return a.priority === 'Moyenne';
    if (actionFilter === 'LOW') return a.priority === 'Basse';
    return true;
  });

  const searchFiltered = priorityFiltered.filter(a =>
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.owner?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedActions = [...searchFiltered].sort((a,b)=>{
    if(sortBy==='PRIORITY'){
      const order = { 'Haute':0,'Moyenne':1,'Basse':2 } as Record<string,number>;
      return order[a.priority]-order[b.priority];
    }
    const da = new Date(a.deadline);
    const db = new Date(b.deadline);
    return da.getTime()-db.getTime();
  });

  const totalPages = Math.ceil(sortedActions.length / itemsPerPage);
  const paginated = sortedActions.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Tableau de bord StratCyber</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Surveillance continue de votre conformité cybersécurité et plan d'action personnalisé</p>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Chargement des données...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Tableau de bord StratCyber</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Surveillance continue de votre conformité cybersécurité et plan d'action personnalisé</p>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Erreur lors de la récupération des données</h2>
          <p className="text-lg text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const prepareChartData = () => {
    const categoryData: ChartData[] = Object.entries(scores).map(([name, value]) => ({
      name,
      value: Number(value),
      color: name === 'Technique' ? '#3b82f6' : name === 'Gouvernance' ? '#10b981' : name === 'Organisationnel' ? '#f59e0b' : name === 'GRC' ? '#ef4444' : name === 'Sensibilisation' ? '#8b5cf6' : name === 'RGPD' ? '#06b6d4' : name === 'Incidents' ? '#f97316' : name === 'SupplyChain' ? '#84cc16' : '#ec4899'
    }));

    const complianceData: ChartData[] = visibleRegs.map(regKey => ({
      name: REGULATIONS[regKey as keyof typeof REGULATIONS].name,
      value: complianceScores[regKey] || 0,
      color: regKey === 'RGPD' ? '#3b82f6' : regKey === 'NIS2' ? '#8b5cf6' : regKey === 'DORA' ? '#f59e0b' : regKey === 'CRA' ? '#10b981' : regKey === 'LPM' ? '#ef4444' : regKey === 'ISO27001' ? '#06b6d4' : '#84cc16'
    }));

    const trendData: TimeSeriesData[] = [
      { date: '2024-01-01', score: Math.max(0, (auditResult?.globalScore || 50) - 20) },
      { date: '2024-02-01', score: Math.max(0, (auditResult?.globalScore || 50) - 15) },
      { date: '2024-03-01', score: Math.max(0, (auditResult?.globalScore || 50) - 10) },
      { date: '2024-04-01', score: Math.max(0, (auditResult?.globalScore || 50) - 5) },
      { date: '2024-05-01', score: auditResult?.globalScore || 50 }
    ];

    const riskData: HeatmapData[] = [
      { impact: 4, probability: 3, risk: 'Attaque par ransomware', level: 'Élevé' },
      { impact: 3, probability: 4, risk: 'Violation de données RGPD', level: 'Élevé' },
      { impact: 5, probability: 2, risk: 'Défaillance système critique', level: 'Moyen' },
      { impact: 2, probability: 5, risk: 'Phishing des employés', level: 'Moyen' },
      { impact: 4, probability: 4, risk: 'Intrusion réseau', level: 'Critique' },
      { impact: 1, probability: 3, risk: 'Vol de matériel', level: 'Faible' }
    ];

    return { categoryData, complianceData, trendData, riskData };
  };

  const { categoryData, complianceData, trendData, riskData } = prepareChartData();

  const calculateAdvancedMetrics = () => {
    const totalQuestions = lastAudit?.responses?.length || 0;
    const criticalDomains = Object.values(scores).filter(s => Number(s) < 40).length;
    const averageScore = Object.values(scores).length > 0 ? Object.values(scores).reduce((a, b) => Number(a) + Number(b), 0) / Object.values(scores).length : 0;
    const improvementPotential = 100 - averageScore;
    const actionsCompleted = Math.floor(actionPlan.length * 0.3); // Simulé
    const actionsInProgress = Math.floor(actionPlan.length * 0.4); // Simulé
    const actionsPending = actionPlan.length - actionsCompleted - actionsInProgress;

    return { totalQuestions, criticalDomains, averageScore, improvementPotential, actionsCompleted, actionsInProgress, actionsPending };
  };

  const metrics = calculateAdvancedMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header futuriste */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
          <div className="relative text-center py-12 px-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                StratCyber Analytics
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Centre de commande cybersécurité • Intelligence artificielle • Surveillance temps réel • Conformité réglementaire
            </p>
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">Système opérationnel</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>

        {audits.length === 0 ? (
          <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
            <CardContent className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Bienvenue dans StratCyber</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Commencez par réaliser votre premier audit de cybersécurité pour débloquer toutes les fonctionnalités du dashboard.
              </p>
              <Link href="/audit">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Target className="h-5 w-5 mr-2" />
                  Lancer un audit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Métriques principales - Hero section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Crazy Score"
                value={crazyScore?.score || 0}
                unit=""
                subtitle={crazyScore?.label || 'N/A'}
                icon={<span className="text-2xl">{crazyScore?.emoji}</span>}
                status="info"
                variant="gradient"
                size="large"
                trend={{ direction: 'up', value: 12, period: 'ce mois', isGood: true }}
              />
              <MetricCard
                title="Score Global"
                value={Math.round(auditResult?.globalScore || 0)}
                unit="%"
                subtitle={auditResult?.maturity || 'Non évalué'}
                icon={<Shield className="h-6 w-6" />}
                status={auditResult?.globalScore && auditResult.globalScore >= 70 ? 'success' : auditResult?.globalScore && auditResult.globalScore >= 50 ? 'warning' : 'danger'}
                variant="gradient"
                size="large"
                progress={auditResult?.globalScore || 0}
                target={{ value: 85, label: 'Objectif' }}
              />
              <MetricCard
                title="Risque Légal"
                value={legalRisk}
                unit="/100"
                subtitle={legalRiskLevel}
                icon={<AlertCircle className="h-6 w-6" />}
                status={legalRisk >= 80 ? 'danger' : legalRisk >= 60 ? 'warning' : 'success'}
                variant="gradient"
                size="large"
                alerts={legalRisk >= 80 ? [{ type: 'danger', message: 'Action immédiate requise' }] : []}
              />
              <MetricCard
                title="Actions Actives"
                value={actionPlan.length}
                unit=""
                subtitle={`${metrics.actionsCompleted} terminées • ${metrics.actionsInProgress} en cours`}
                icon={<Target className="h-6 w-6" />}
                status="info"
                variant="gradient"
                size="large"
                progress={(metrics.actionsCompleted / actionPlan.length) * 100}
              />
            </div>

            {/* Métriques secondaires */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Questions traitées</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-amber-600">{metrics.criticalDomains}</div>
                  <div className="text-sm text-muted-foreground">Domaines critiques</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{visibleRegs.length}</div>
                  <div className="text-sm text-muted-foreground">Réglementations</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.improvementPotential)}</div>
                  <div className="text-sm text-muted-foreground">Potentiel %</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-cyan-600">24h</div>
                  <div className="text-sm text-muted-foreground">Surveillance</div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/60 border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">AI</div>
                  <div className="text-sm text-muted-foreground">Assisté</div>
                </CardContent>
              </Card>
            </div>

            {/* Section graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Score Global - Vue d'ensemble
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GaugeChart
                    value={auditResult?.globalScore || 0}
                    title="Maturité Cybersécurité"
                    size="large"
                    thresholds={{ low: 40, medium: 70, high: 85 }}
                  />
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    Répartition par Domaine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <DonutChart 
                      data={categoryData}
                      showLegend={false}
                      centerText={{
                        value: `${Math.round(metrics.averageScore)}%`,
                        label: 'Moyenne'
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Évolution Temporelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '300px' }}>
                    <LineChartComponent 
                      data={trendData}
                      showArea={true}
                      color="#3b82f6"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section graphiques secondaires */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Conformité Réglementaire
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    État de conformité par réglementation applicable
                  </p>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '350px' }}>
                    <PieChartComponent data={complianceData} showLegend={true} />
                  </div>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Matrice des Risques
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Cartographie Impact vs Probabilité
                  </p>
                </CardHeader>
                <CardContent>
                  <div style={{ height: '350px' }}>
                    <RiskHeatmap data={riskData} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Section détaillée des domaines */}
            <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Analyse Détaillée par Domaine
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Vue d'ensemble de la maturité par catégorie avec recommandations
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(scores).map(([category, score]) => {
                    const numScore = Number(score);
                    const status = numScore >= 70 ? 'success' : numScore >= 50 ? 'warning' : 'danger';
                    const recommendations = numScore < 50 ? 'Critique - Action immédiate' 
                      : numScore < 70 ? 'À améliorer - Planifier actions' 
                      : 'Satisfaisant - Maintenir niveau';

                    return (
                      <div key={category} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg blur group-hover:blur-none transition-all duration-300"></div>
                        <Card className="relative backdrop-blur-sm bg-white/60 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-bold text-lg">{category}</h3>
                              <Badge variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                                {numScore >= 70 ? 'Conforme' : numScore >= 50 ? 'Moyen' : 'Critique'}
                              </Badge>
                            </div>
                            <div className="mb-4">
                              <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold">{numScore}</span>
                                <span className="text-lg text-muted-foreground">/100</span>
                              </div>
                              <Progress value={numScore} className="h-2" />
                            </div>
                            <div className="space-y-2 text-sm">
                              <p className="font-medium text-muted-foreground">{recommendations}</p>
                              <div className="flex items-center gap-2">
                                {numScore >= 70 ? (
                                  <Target className="h-4 w-4 text-green-600" />
                                ) : numScore >= 50 ? (
                                  <TrendingUp className="h-4 w-4 text-amber-600" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                )}
                                <span className="text-xs">
                                  {actionPlan.filter(a => a.category === category).length} actions recommandées
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Section avancée - Prévisions et Tendances */}
            <div className="mb-8">
              <div className="relative overflow-hidden mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-blue-600/10 rounded-xl blur-xl"></div>
                <div className="relative p-4 text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                    <Activity className="h-6 w-6 text-indigo-600" />
                    Centre d'Intelligence Cybersécurité
                  </h2>
                  <p className="text-muted-foreground">Analyse avancée, prévisions et tendances basées sur intelligence artificielle</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-indigo-600" />
                      Prévisions Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: "250px" }}>
                      <LineChartComponent 
                        data={[
                          ...trendData,
                          { date: '2024-06-01', score: Math.min(100, Math.round((auditResult?.globalScore || 50) + 5)) },
                          { date: '2024-07-01', score: Math.min(100, Math.round((auditResult?.globalScore || 50) + 10)) },
                          { date: '2024-08-01', score: Math.min(100, Math.round((auditResult?.globalScore || 50) + 15)) },
                        ]}
                        showArea={true}
                        color="#8b5cf6"
                      />
                    </div>
                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-indigo-900">Prévision IA</p>
                          <p className="text-xs text-indigo-700">À ce rythme, vous atteindrez un score de {Math.min(100, Math.round((auditResult?.globalScore || 50) + 15))}% d'ici 3 mois.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Répartition des vulnérabilités */}
                <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      Répartition des Vulnérabilités
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: "250px" }}>
                      <PieChartComponent 
                        data={[
                          { name: 'Critique', value: Math.round(metrics.criticalDomains * 1.5), color: '#ef4444' },
                          { name: 'Haute', value: Math.round(metrics.criticalDomains * 2), color: '#f97316' },
                          { name: 'Moyenne', value: Math.round(metrics.criticalDomains * 3), color: '#f59e0b' },
                          { name: 'Faible', value: Math.round(metrics.criticalDomains * 2.5), color: '#84cc16' }
                        ]} 
                        innerRadius={30}
                        outerRadius={100}
                      />
                    </div>
                    <div className="mt-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-900">Focus de Remédiation</p>
                          <p className="text-xs text-red-700">Prioritisez les {Math.round(metrics.criticalDomains * 1.5)} vulnérabilités critiques identifiées.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Conformité par domaine */}
                <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Conformité par Domaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div style={{ height: "250px" }}>
                      <RadarChart scores={scores || {}} />
                    </div>
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Target className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-green-900">Analyse d'Équilibre</p>
                          <p className="text-xs text-green-700">
                            {Object.entries(scores).sort((a, b) => Number(a[1]) - Number(b[1]))[0]?.[0] || 'Technique'} est votre domaine le plus faible à améliorer en priorité.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Indicateurs avancés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                  title="Temps Moyen de Remédiation"
                  value="14,3"
                  unit="jours"
                  subtitle="Pour les vulnérabilités critiques"
                  icon={<Clock className="h-5 w-5" />}
                  status="warning"
                  trend={{ direction: 'down', value: 2.5, period: 'vs trimestre préc.', isGood: true }}
                />
                <MetricCard
                  title="Taux de Détection des Menaces"
                  value="93"
                  unit="%"
                  subtitle="Basé sur tests de simulation"
                  icon={<Shield className="h-5 w-5" />}
                  status="success"
                  progress={93}
                  target={{ value: 95, label: "Objectif" }}
                />
                <MetricCard
                  title="Couverture des Contrôles"
                  value={`${Object.keys(scores).length}/9`}
                  subtitle="Domaines de sécurité couverts"
                  icon={<BarChart3 className="h-5 w-5" />}
                  status="info"
                  progress={(Object.keys(scores).length / 9) * 100}
                />
                <MetricCard
                  title="Score de Résilience"
                  value={Math.round((auditResult?.globalScore || 50) * 0.85)}
                  unit="/100"
                  subtitle="Capacité à maintenir les opérations"
                  icon={<Zap className="h-5 w-5" />}
                  status={(auditResult?.globalScore || 50) * 0.85 >= 70 ? 'success' : (auditResult?.globalScore || 50) * 0.85 >= 50 ? 'warning' : 'danger'}
                  alerts={(auditResult?.globalScore || 50) * 0.85 < 50 ? [{ type: 'warning', message: 'Amélioration recommandée' }] : []}
                />
              </div>
            </div>
            {/* Historique des audits */}
            <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Historique des Audits
                  </div>
                  <Link href="/dashboard/audits">
                    <Button variant="outline" size="sm">
                      Voir tout l'historique →
                    </Button>
                  </Link>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Consultez vos audits précédents et générez des rapports détaillés
                </p>
              </CardHeader>
              <CardContent>
                {audits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>Aucun audit disponible</p>
                    <p className="text-sm">Commencez par réaliser votre premier audit de cybersécurité</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {audits.map((audit) => {
                      const auditDate = new Date(audit.createdAt);
                      const isGenerating = generatingPdf === audit.id;
                      return (
                        <div key={audit.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-lg font-semibold">
                                Audit du {auditDate.toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                              <Badge variant={audit.score && audit.score >= 70 ? 'default' : audit.score && audit.score >= 50 ? 'secondary' : 'destructive'}>
                                {audit.maturity || 'En cours'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Score: {audit.score?.toFixed(0) || 'N/A'}%
                              </span>
                              <span>
                                {audit.responses?.length || 0} réponses
                              </span>
                              <span>
                                Créé à {auditDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewPdfReport(audit.id)}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              Aperçu
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGeneratePdfReport(audit.id)}
                              disabled={isGenerating}
                              className="flex items-center gap-2"
                            >
                              {isGenerating ? (
                                <>
                                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Génération...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Rapport PDF
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {audits.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">À propos des rapports PDF</h4>
                        <p className="text-sm text-blue-700">
                          Les rapports générés incluent une analyse complète de votre audit avec :
                        </p>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• Analyse détaillée des résultats par domaine</li>
                          <li>• Plan d'action personnalisé avec budgets et échéances</li>
                          <li>• Feuille de route stratégique sur 24 mois</li>
                          <li>• Analyse de conformité réglementaire (RGPD, NIS2, ISO 27001...)</li>
                          <li>• Recommandations priorisées et KPIs de suivi</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
