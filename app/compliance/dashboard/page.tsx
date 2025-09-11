'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  FileText,
  Shield,
  Calendar,
  Activity,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  Zap
} from 'lucide-react';

const DashboardPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Données simulées pour les KPIs
  const kpis = {
    global: {
      conformityScore: 78,
      trend: +5.2,
      activeActions: 23,
      completedActions: 156,
      criticalIssues: 3,
      upcomingDeadlines: 8
    },
    regulations: [
      {
        id: 'rgpd',
        name: 'RGPD',
        score: 85,
        trend: +3.1,
        color: 'blue',
        status: 'En cours',
        lastAudit: '2024-01-15',
        nextDeadline: '2024-03-30',
        actions: {
          total: 45,
          completed: 38,
          inProgress: 5,
          pending: 2
        },
        criticalPoints: [
          'Mise à jour registre des traitements',
          'Formation équipes marketing',
          'Révision politique confidentialité'
        ]
      },
      {
        id: 'nis2',
        name: 'NIS2',
        score: 72,
        trend: +8.4,
        color: 'orange',
        status: 'En cours',
        lastAudit: '2023-12-10',
        nextDeadline: '2024-04-15',
        actions: {
          total: 38,
          completed: 25,
          inProgress: 8,
          pending: 5
        },
        criticalPoints: [
          'Notification incidents ANSSI',
          'Tests de résilience',
          'Cartographie fournisseurs'
        ]
      },
      {
        id: 'dora',
        name: 'DORA',
        score: 65,
        trend: +12.7,
        color: 'green',
        status: 'Démarrage',
        lastAudit: '2024-01-08',
        nextDeadline: '2024-05-20',
        actions: {
          total: 52,
          completed: 18,
          inProgress: 12,
          pending: 22
        },
        criticalPoints: [
          'Framework gestion risques TIC',
          'Identification tiers critiques',
          'Procédures tests TLPT'
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        score: 82,
        trend: +1.8,
        color: 'indigo',
        status: 'Maintien',
        lastAudit: '2023-11-22',
        nextDeadline: '2024-06-10',
        actions: {
          total: 28,
          completed: 24,
          inProgress: 3,
          pending: 1
        },
        criticalPoints: [
          'Audit interne annuel',
          'Mise à jour analyse risques',
          'Formation sensibilisation'
        ]
      }
    ]
  };

  const recentActivities = [
    {
      id: 1,
      type: 'completion',
      regulation: 'RGPD',
      title: 'Formation DPO complétée',
      date: '2024-01-12T10:30:00',
      priority: 'high',
      impact: 'positive'
    },
    {
      id: 2,
      type: 'alert',
      regulation: 'NIS2',
      title: 'Échéance notification proche',
      date: '2024-01-11T15:45:00',
      priority: 'critical',
      impact: 'warning'
    },
    {
      id: 3,
      type: 'update',
      regulation: 'DORA',
      title: 'Nouveau guide EBA publié',
      date: '2024-01-10T09:15:00',
      priority: 'medium',
      impact: 'neutral'
    },
    {
      id: 4,
      type: 'completion',
      regulation: 'ISO27001',
      title: 'Audit interne Q1 terminé',
      date: '2024-01-09T14:20:00',
      priority: 'high',
      impact: 'positive'
    },
    {
      id: 5,
      type: 'issue',
      regulation: 'RGPD',
      title: 'Violation données détectée',
      date: '2024-01-08T11:00:00',
      priority: 'critical',
      impact: 'negative'
    }
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      regulation: 'RGPD',
      title: 'Révision politique cookies',
      date: '2024-02-15',
      daysLeft: 18,
      priority: 'high'
    },
    {
      id: 2,
      regulation: 'NIS2',
      title: 'Rapport incident Q4',
      date: '2024-02-28',
      daysLeft: 31,
      priority: 'critical'
    },
    {
      id: 3,
      regulation: 'DORA',
      title: 'Cartographie tiers TIC',
      date: '2024-03-10',
      daysLeft: 42,
      priority: 'medium'
    },
    {
      id: 4,
      regulation: 'ISO27001',
      title: 'Renouvellement certificat',
      date: '2024-04-22',
      daysLeft: 85,
      priority: 'high'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <div className="h-4 w-4" />;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'issue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'update':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compliance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Conformité</h1>
              <p className="text-lg text-gray-600">Suivi en temps réel de votre posture de conformité</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {['week', 'month', 'quarter'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Trimestre'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Global</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${getScoreColor(kpis.global.conformityScore)}`}>
                    {kpis.global.conformityScore}%
                  </p>
                  <div className="flex items-center">
                    {getTrendIcon(kpis.global.trend)}
                    <span className="text-xs text-green-600">+{kpis.global.trend}%</span>
                  </div>
                </div>
              </div>
              <div className={`p-3 rounded-full ${getScoreBg(kpis.global.conformityScore)}`}>
                <Target className={`h-6 w-6 ${getScoreColor(kpis.global.conformityScore)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions Actives</p>
                <p className="text-2xl font-bold text-blue-600">{kpis.global.activeActions}</p>
                <p className="text-xs text-gray-500">{kpis.global.completedActions} complétées</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Points Critiques</p>
                <p className="text-2xl font-bold text-red-600">{kpis.global.criticalIssues}</p>
                <p className="text-xs text-red-500">Nécessitent attention</p>
              </div>
              <div className="p-3 rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Échéances</p>
                <p className="text-2xl font-bold text-orange-600">{kpis.global.upcomingDeadlines}</p>
                <p className="text-xs text-orange-500">30 prochains jours</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="regulations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="regulations">Réglementations</TabsTrigger>
          <TabsTrigger value="activities">Activités Récentes</TabsTrigger>
          <TabsTrigger value="deadlines">Échéances</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        {/* Réglementations */}
        <TabsContent value="regulations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {kpis.regulations.map((reg) => (
              <Card key={reg.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${reg.color}-500`}></div>
                      {reg.name}
                    </CardTitle>
                    <Badge variant={reg.status === 'Maintien' ? 'secondary' : 'outline'}>
                      {reg.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Score de conformité</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${getScoreColor(reg.score)}`}>
                          {reg.score}%
                        </span>
                        <div className="flex items-center">
                          {getTrendIcon(reg.trend)}
                          <span className="text-xs text-green-600">+{reg.trend}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progression</p>
                      <Progress value={reg.score} className="w-20 h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Dernier audit</p>
                      <p className="text-sm font-medium">
                        {new Date(reg.lastAudit).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prochaine échéance</p>
                      <p className="text-sm font-medium">
                        {new Date(reg.nextDeadline).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Actions en cours</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{reg.actions.completed}</div>
                        <div className="text-green-600">Complétées</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{reg.actions.inProgress}</div>
                        <div className="text-blue-600">En cours</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{reg.actions.pending}</div>
                        <div className="text-orange-600">En attente</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900">{reg.actions.total}</div>
                        <div className="text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Points critiques</p>
                    <ul className="space-y-1">
                      {reg.criticalPoints.map((point, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activités récentes */}
        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-600">{activity.regulation}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getPriorityBadge(activity.priority)}>
                            {activity.priority}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(activity.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Échéances */}
        <TabsContent value="deadlines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Prochaines Échéances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        deadline.daysLeft <= 7 ? 'bg-red-500' : 
                        deadline.daysLeft <= 30 ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-sm text-gray-600">{deadline.regulation}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {new Date(deadline.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p className={`text-sm ${
                        deadline.daysLeft <= 7 ? 'text-red-600' :
                        deadline.daysLeft <= 30 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {deadline.daysLeft} jours restants
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytiques */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">Évolution sur 6 mois</div>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">
                      Graphique des tendances
                      <br />
                      <small>(Intégration Chart.js à venir)</small>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">Par réglementation</div>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">
                      Graphique en secteurs
                      <br />
                      <small>(Intégration Chart.js à venir)</small>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions rapides */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button asChild className="h-auto p-4">
            <Link href="/compliance/action-plan" className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <span>Gérer les Actions</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href="/compliance/bibliotheque" className="flex flex-col items-center gap-2">
              <FileText className="h-6 w-6" />
              <span>Consulter Docs</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href="/compliance/faq" className="flex flex-col items-center gap-2">
              <Zap className="h-6 w-6" />
              <span>Aide Rapide</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4">
            <Link href="/compliance" className="flex flex-col items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Vue d'Ensemble</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
