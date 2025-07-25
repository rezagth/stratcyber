'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { ActionPlanItem, ActionPlanSummary, Milestone, RoadmapQuarter } from '../../../types/actionPlan';

// Composant pour les métriques principales
const MetricsGrid = ({ summary }: { summary: ActionPlanSummary }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Progression Globale</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{summary.overallProgress}%</div>
        <p className="text-xs text-muted-foreground">
          {summary.completedActions}/{summary.totalActions} actions terminées
        </p>
        <Progress value={summary.overallProgress} className="mt-2" />
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Actions Critiques</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-600">{summary.criticalActions}</div>
        <p className="text-xs text-muted-foreground">
          Nécessitent une attention immédiate
        </p>
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">En Retard</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-amber-600">{summary.overdueActions}</div>
        <p className="text-xs text-muted-foreground">
          Actions dépassées
        </p>
      </CardContent>
    </Card>

    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Budget</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{Math.round((summary.budgetSpent / summary.budgetTotal) * 100)}%</div>
        <p className="text-xs text-muted-foreground">
          {summary.budgetSpent.toLocaleString()}€ / {summary.budgetTotal.toLocaleString()}€
        </p>
        <Progress value={(summary.budgetSpent / summary.budgetTotal) * 100} className="mt-2" />
      </CardContent>
    </Card>
  </div>
);

// Composant pour la timeline des actions
const ActionTimeline = ({ actions }: { actions: ActionPlanItem[] }) => {
  const upcomingActions = actions
    .filter(a => a.status !== 'Terminé')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Prochaines Échéances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingActions.map((action, index) => {
            const daysUntilDue = Math.ceil((action.dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysUntilDue < 0;
            const isUrgent = daysUntilDue <= 7 && daysUntilDue >= 0;

            return (
              <div key={action.id} className="flex items-center space-x-4 p-3 rounded-lg border">
                <div className={`w-3 h-3 rounded-full ${
                  isOverdue ? 'bg-red-500' : 
                  isUrgent ? 'bg-amber-500' : 
                  'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{action.title}</h4>
                    <Badge variant={
                      action.priority === 'Critique' ? 'destructive' :
                      action.priority === 'Haute' ? 'secondary' : 'outline'
                    }>
                      {action.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{action.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">
                      {isOverdue ? 
                        `En retard de ${Math.abs(daysUntilDue)} jour(s)` :
                        `Dans ${daysUntilDue} jour(s)`
                      }
                    </span>
                    <Progress value={action.progress} className="flex-1 h-2" />
                    <span className="text-xs">{action.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Composant principal du dashboard avancé
export default function AdvancedDashboard() {
  const [actions, setActions] = useState<ActionPlanItem[]>([]);
  const [summary, setSummary] = useState<ActionPlanSummary | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quarters, setQuarters] = useState<RoadmapQuarter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    // En production, ceci ferait appel à l'API
    setTimeout(() => {
      setLoading(false);
      // Données de démonstration
      setSummary({
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
      });
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Chargement du dashboard avancé...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Cybersécurité Pro</h1>
          <p className="text-muted-foreground">Pilotage avancé de votre stratégie cybersécurité</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      {summary && <MetricsGrid summary={summary} />}

      {/* Onglets principaux */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="actions">Plan d'action</TabsTrigger>
          <TabsTrigger value="roadmap">Feuille de route</TabsTrigger>
          <TabsTrigger value="team">Équipe</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progression par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Progression par Domaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary && Object.entries(summary.categoryProgress).map(([category, progress]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Timeline des actions */}
            <ActionTimeline actions={actions} />
          </div>

          {/* Distribution des risques */}
          <Card>
            <CardHeader>
              <CardTitle>Distribution des Risques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {summary && Object.entries(summary.riskDistribution).map(([risk, count]) => (
                  <div key={risk} className="text-center p-4 rounded-lg border">
                    <div className={`text-2xl font-bold ${
                      risk === 'Très élevé' ? 'text-red-600' :
                      risk === 'Élevé' ? 'text-orange-600' :
                      risk === 'Moyen' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {count}
                    </div>
                    <p className="text-sm text-muted-foreground">{risk}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Plan d'Action Détaillé</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
                <Button variant="outline" size="sm">
                  Ajouter une action
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Plan d'action en cours de génération</h3>
                <p>Le plan d'action détaillé sera affiché ici avec toutes les actions, sous-tâches et échéances.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap">
          <Card>
            <CardHeader>
              <CardTitle>Feuille de Route Stratégique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Roadmap Interactive</h3>
                <p>La feuille de route visuelle avec timeline et jalons sera affichée ici.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Gestion d'Équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Équipe et Assignations</h3>
                <p>Vue d'ensemble de l'équipe, charge de travail et assignations des actions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avancés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analyses et Tendances</h3>
                <p>Graphiques avancés, tendances et analyses prédictives.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
