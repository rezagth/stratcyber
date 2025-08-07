'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Map, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Shield,
  CheckCircle,
  Calendar,
  Target,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  BarChart3,
  Settings,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Grip
} from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import InteractiveRoadmap from '@/components/roadmap/InteractiveRoadmap';
import AdvancedAnalytics from '@/components/analytics/AdvancedAnalytics';
import { ActionPlanItem, Milestone, RoadmapQuarter } from '@/types/actionPlan';

interface RoadmapData {
  actions: ActionPlanItem[];
  milestones: Milestone[];
  quarters: RoadmapQuarter[];
  score: number;
  lastAuditDate: string;
  statistics: {
    totalActions: number;
    completedActions: number;
    criticalActions: number;
    overdueActions: number;
    avgProgress: number;
  };
  analyticsData: {
    summary: any;
    trends: any;
    benchmarks: any;
  };
}

export default function RoadmapDashboard() {
  const { data: session } = useSession();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [draggedAction, setDraggedAction] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState({ todo: 1, inprogress: 1, done: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchRoadmapData();
  }, [session]);

  // Protection contre la navigation pendant le drag & drop
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDragging) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isDragging) {
        e.preventDefault();
        console.log('Navigation bloquée pendant le drag & drop');
        window.history.pushState(null, '', window.location.href);
        return false;
      }
    };

    if (isDragging) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isDragging]);

  const fetchRoadmapData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await fetch('/api/roadmap/data');
      if (response.ok) {
        const data = await response.json();
        setRoadmapData(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const updateActionStatus = async (actionId: string, status: string, progress: number) => {
    try {
      console.log('Mise à jour de l\'action:', { actionId, status, progress });
      
      // Mise à jour optimiste de l'état local
      if (roadmapData) {
        const updatedActions = roadmapData.actions.map(action => 
          action.id === actionId 
            ? { ...action, status, progress }
            : action
        );
        
        setRoadmapData({ ...roadmapData, actions: updatedActions });
      }
      
      const response = await fetch('/api/roadmap/actions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actionId, status, progress }),
      });

      console.log('Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Résultat de la mise à jour:', result);
        // Récupérer les données mises à jour sans afficher le loading
        await fetchRoadmapData(true); // Silent refresh
      } else {
        const errorData = await response.json();
        console.error('Erreur de l\'API:', errorData);
        // Reverter la mise à jour optimiste en cas d'erreur
        await fetchRoadmapData(true);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      // Reverter la mise à jour optimiste en cas d'erreur
      if (roadmapData) {
        await fetchRoadmapData(true);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, actionId: string) => {
    e.preventDefault = () => {}; // Override preventDefault
    e.stopPropagation();
    console.log('Début du glissement pour l\'action:', actionId);
    setDraggedAction(actionId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', actionId);
    e.dataTransfer.setData('application/json', JSON.stringify({ actionId }));
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    console.log('Fin du glissement');
    setDraggedAction(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('HandleDrop appelé avec le statut:', newStatus);
    console.log('Action glissée:', draggedAction);
    
    // Récupérer l'ID depuis dataTransfer comme backup
    const transferredData = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/json');
    let actionId = draggedAction;
    
    if (!actionId && transferredData) {
      try {
        const parsed = JSON.parse(transferredData);
        actionId = parsed.actionId || transferredData;
      } catch {
        actionId = transferredData;
      }
    }
    
    if (actionId) {
      console.log('Déplacement de l\'action:', actionId, 'vers le statut:', newStatus);
      
      const progressMap = {
        'Non démarré': 0,
        'En cours': 50,
        'Terminé': 100
      };
      
      try {
        // Empêcher toute navigation pendant la mise à jour
        const currentUrl = window.location.href;
        await updateActionStatus(actionId, newStatus, progressMap[newStatus as keyof typeof progressMap] || 0);
        
        // Vérifier si on a été redirigé
        if (window.location.href !== currentUrl) {
          console.warn('Redirection détectée, retour à la page précédente');
          window.history.pushState(null, '', currentUrl);
        }
      } catch (error) {
        console.error('Erreur lors du déplacement:', error);
      }
    } else {
      console.error('Aucune action à déplacer trouvée');
    }
    
    setDraggedAction(null);
    setIsDragging(false);
  };

  const getFilteredActions = (status: string) => {
    const allActions = roadmapData?.actions || [];
    const filtered = allActions.filter(a => {
      const statusMatch = a.status === status;
      const priorityMatch = filterPriority === 'all' || a.priority === filterPriority;
      return statusMatch && priorityMatch;
    });
    return filtered;
  };

  const getPaginatedActions = (status: string) => {
    const filtered = getFilteredActions(status);
    const pageKey = status === 'Non démarré' ? 'todo' : 
                   status === 'En cours' ? 'inprogress' : 'done';
    const currentPageNum = currentPage[pageKey as keyof typeof currentPage];
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      actions: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: currentPageNum,
      totalItems: filtered.length
    };
  };

  const changePage = (status: string, direction: 'prev' | 'next') => {
    const pageKey = status === 'Non démarré' ? 'todo' : 
                   status === 'En cours' ? 'inprogress' : 'done';
    const { totalPages } = getPaginatedActions(status);
    const current = currentPage[pageKey as keyof typeof currentPage];
    
    if (direction === 'prev' && current > 1) {
      setCurrentPage(prev => ({ ...prev, [pageKey]: current - 1 }));
    } else if (direction === 'next' && current < totalPages) {
      setCurrentPage(prev => ({ ...prev, [pageKey]: current + 1 }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critique': return 'destructive';
      case 'Haute': return 'secondary';
      case 'Moyenne': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-500';
      case 'En cours': return 'bg-blue-500';
      case 'En retard': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Activity className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
            <p>Chargement de votre roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmapData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Map className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-600 mb-4">Veuillez d'abord compléter un audit pour générer votre roadmap.</p>
            <Link href="/audit/dynamic">
              <Button>
                Commencer un audit
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { actions, milestones, score, lastAuditDate, statistics } = roadmapData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Map className="h-8 w-8 text-blue-600" />
            Roadmap Cybersécurité
          </h1>
          <p className="text-gray-600 mt-1">
            Plan d'action complet basé sur votre audit du {new Date(lastAuditDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            Score: {score}%
          </Badge>
          <Link href="/audit/dynamic">
            <Button variant="outline" size="sm">
              Nouvel audit
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Actions totales</p>
                <p className="text-2xl font-bold">{statistics.totalActions}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminées</p>
                <p className="text-2xl font-bold text-green-600">{statistics.completedActions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">{statistics.criticalActions}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.overdueActions}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progression</p>
                <p className="text-2xl font-bold">{Math.round(statistics.avgProgress)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="interactive">Roadmap Interactive</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Avancés</TabsTrigger>
          <TabsTrigger value="actions">Actions Détaillées</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions Prioritaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {actions.filter(a => a.priority === 'Critique').slice(0, 3).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.category}</p>
                      </div>
                      <Badge variant="destructive">Critique</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progression par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    actions.reduce((acc, action) => {
                      acc[action.category] = acc[action.category] || { total: 0, progress: 0 };
                      acc[action.category].total++;
                      acc[action.category].progress += action.progress;
                      return acc;
                    }, {} as Record<string, { total: number; progress: number }>)
                  ).slice(0, 4).map(([category, data]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{category}</span>
                        <span>{Math.round(data.progress / data.total)}%</span>
                      </div>
                      <Progress value={data.progress / data.total} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interactive" className="space-y-4">
          <InteractiveRoadmap 
            quarters={roadmapData.quarters || []}
            actions={actions}
            milestones={milestones}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          {/* Header avec filtres */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Gestion des Tâches</h3>
              <p className="text-sm text-gray-600">Glissez-déposez vos actions pour changer leur statut</p>
            </div>
            <div className="flex gap-2">
              <select 
                className="px-3 py-1 text-sm border rounded-md"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">Toutes les priorités</option>
                <option value="Critique">Critique</option>
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Faible">Faible</option>
              </select>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          {/* Colonnes Kanban avec Drag & Drop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* À FAIRE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700">À Faire</h4>
                <Badge variant="secondary">
                  {getPaginatedActions('Non démarré').totalItems}
                </Badge>
              </div>
              
              <div 
                className="space-y-3 min-h-[500px] p-2 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/30"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'Non démarré')}
              >
                {(() => {
                  const { actions: paginatedActions, totalPages, currentPage: current } = getPaginatedActions('Non démarré');
                  return (
                    <>
                      {paginatedActions.map((action) => (
                        <Card 
                          key={action.id} 
                          className={`hover:shadow-md transition-all cursor-move border-l-4 border-l-gray-400 ${
                            draggedAction === action.id ? 'opacity-50 scale-95' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, action.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header avec drag handle */}
                              <div className="flex items-start gap-2">
                                <Grip className="h-4 w-4 text-gray-400 mt-0.5 cursor-move" />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm mb-1">{action.title}</h5>
                                  <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
                                </div>
                                <Badge variant={getPriorityColor(action.priority)} className="ml-2">
                                  {action.priority}
                                </Badge>
                              </div>
                              
                              {/* Métadonnées */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {action.estimatedHours}h
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActionStatus(action.id, 'En cours', 10);
                                  }}
                                >
                                  Commencer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedAction(selectedAction === action.id ? null : action.id);
                                  }}
                                >
                                  <Settings className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('Non démarré', 'prev')}
                            disabled={current <= 1}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500">
                            {current} / {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('Non démarré', 'next')}
                            disabled={current >= totalPages}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* EN COURS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-700">En Cours</h4>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  {getPaginatedActions('En cours').totalItems}
                </Badge>
              </div>
              
              <div 
                className="space-y-3 min-h-[500px] p-2 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'En cours')}
              >
                {(() => {
                  const { actions: paginatedActions, totalPages, currentPage: current } = getPaginatedActions('En cours');
                  return (
                    <>
                      {paginatedActions.map((action) => (
                        <Card 
                          key={action.id} 
                          className={`hover:shadow-md transition-all cursor-move border-l-4 border-l-blue-500 ${
                            draggedAction === action.id ? 'opacity-50 scale-95' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, action.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header avec drag handle */}
                              <div className="flex items-start gap-2">
                                <Grip className="h-4 w-4 text-blue-400 mt-0.5 cursor-move" />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm mb-1">{action.title}</h5>
                                  <p className="text-xs text-gray-600 line-clamp-2">{action.description}</p>
                                </div>
                                <Badge variant={getPriorityColor(action.priority)} className="ml-2">
                                  {action.priority}
                                </Badge>
                              </div>
                              
                              {/* Progression */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Progression</span>
                                  <span>{action.progress}%</span>
                                </div>
                                <Progress value={action.progress} className="h-1" />
                              </div>

                              {/* Métadonnées */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {action.owner}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(action.dueDate).toLocaleDateString('fr-FR')}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActionStatus(action.id, 'Non démarré', 0);
                                  }}
                                >
                                  Retour
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActionStatus(action.id, 'Terminé', 100);
                                  }}
                                >
                                  Terminer
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('En cours', 'prev')}
                            disabled={current <= 1}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-blue-500">
                            {current} / {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('En cours', 'next')}
                            disabled={current >= totalPages}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* TERMINÉ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-700">Terminé</h4>
                <Badge variant="outline" className="border-green-200 text-green-700">
                  {getPaginatedActions('Terminé').totalItems}
                </Badge>
              </div>
              
              <div 
                className="space-y-3 min-h-[500px] p-2 border-2 border-dashed border-green-200 rounded-lg bg-green-50/30"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'Terminé')}
              >
                {(() => {
                  const { actions: paginatedActions, totalPages, currentPage: current } = getPaginatedActions('Terminé');
                  return (
                    <>
                      {paginatedActions.map((action) => (
                        <Card 
                          key={action.id} 
                          className={`hover:shadow-md transition-all cursor-move border-l-4 border-l-green-500 bg-green-50/30 ${
                            draggedAction === action.id ? 'opacity-50 scale-95' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, action.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Header avec drag handle */}
                              <div className="flex items-start gap-2">
                                <Grip className="h-4 w-4 text-green-400 mt-0.5 cursor-move" />
                                <div className="flex-1">
                                  <h5 className="font-semibold text-sm mb-1 text-green-800">{action.title}</h5>
                                  <p className="text-xs text-green-600 line-clamp-2">{action.description}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <Badge variant={getPriorityColor(action.priority)} className="ml-1">
                                    {action.priority}
                                  </Badge>
                                </div>
                              </div>
                              
                              {/* Progression complète */}
                              <div className="space-y-1">
                                <Progress value={100} className="h-1 bg-green-200" />
                                <div className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Tâche terminée
                                </div>
                              </div>

                              {/* Impact business */}
                              {action.businessImpact && (
                                <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                                  <strong>Impact:</strong> {action.businessImpact}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex-1 text-xs border-green-300 text-green-700 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateActionStatus(action.id, 'En cours', 80);
                                  }}
                                >
                                  Rouvrir
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('Terminé', 'prev')}
                            disabled={current <= 1}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-green-500">
                            {current} / {totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changePage('Terminé', 'next')}
                            disabled={current >= totalPages}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Détails étendus */}
          {selectedAction && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Détails de la tâche</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const action = actions.find(a => a.id === selectedAction);
                  if (!action) return null;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Description complète</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Impact Business</h4>
                          <p className="text-sm text-gray-600">{action.businessImpact}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm">Échéance</h5>
                            <p className="text-sm text-gray-600">{new Date(action.dueDate).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">Responsable</h5>
                            <p className="text-sm text-gray-600">{action.owner}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">Temps estimé</h5>
                            <p className="text-sm text-gray-600">{action.estimatedHours}h</p>
                          </div>
                          {action.budget && (
                            <div>
                              <h5 className="font-medium text-sm">Budget</h5>
                              <p className="text-sm text-gray-600">{action.budget.toLocaleString()}€</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
