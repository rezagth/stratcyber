'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Users,
  DollarSign,
  Target,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ActionPlanItem, Milestone, RoadmapQuarter } from '../../types/actionPlan';

interface InteractiveRoadmapProps {
  quarters: RoadmapQuarter[];
  actions: ActionPlanItem[];
  milestones: Milestone[];
}

const TimelineItem = ({ 
  action, 
  isExpanded, 
  onToggle 
}: { 
  action: ActionPlanItem;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-500';
      case 'En cours': return 'bg-blue-500';
      case 'En retard': return 'bg-red-500';
      case 'Bloqué': return 'bg-orange-500';
      default: return 'bg-gray-400';
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

  return (
    <div className="relative">
      {/* Ligne de connexion */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border"></div>
      
      <div className="flex items-start space-x-4 pb-6">
        {/* Indicateur de statut */}
        <div className={`w-8 h-8 rounded-full ${getStatusColor(action.status)} flex items-center justify-center z-10`}>
          {action.status === 'Terminé' ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <Clock className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Contenu de l'action */}
        <div className="flex-1 min-w-0">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="p-0 h-auto"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getPriorityColor(action.priority)}>
                    {action.priority}
                  </Badge>
                  <Badge variant="outline">{action.category}</Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground">{action.description}</p>
                
                {/* Métriques principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Échéance</p>
                      <p className="text-sm font-medium">
                        {action.dueDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Responsable</p>
                      <p className="text-sm font-medium">{action.owner}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-sm font-medium">
                        {action.budget ? `${action.budget.toLocaleString()}€` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Progression</p>
                      <p className="text-sm font-medium">{action.progress}%</p>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avancement</span>
                    <span>{action.progress}%</span>
                  </div>
                  <Progress value={action.progress} className="h-2" />
                </div>

                {/* Détails étendus */}
                {isExpanded && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Impact business */}
                    <div>
                      <h4 className="font-medium mb-2">Impact Business</h4>
                      <p className="text-sm text-muted-foreground">{action.businessImpact}</p>
                    </div>

                    {/* Sous-tâches */}
                    {action.subTasks.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Sous-tâches ({action.subTasks.length})</h4>
                        <div className="space-y-2">
                          {action.subTasks.slice(0, 3).map((subTask) => (
                            <div key={subTask.id} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(subTask.status)}`}></div>
                              <span className="text-sm flex-1">{subTask.title}</span>
                              <span className="text-xs text-muted-foreground">
                                {subTask.estimatedHours}h
                              </span>
                            </div>
                          ))}
                          {action.subTasks.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{action.subTasks.length - 3} autres sous-tâches
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* KPIs */}
                    {action.kpis.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Indicateurs de Succès</h4>
                        <div className="flex flex-wrap gap-1">
                          {action.kpis.map((kpi, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {kpi}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const QuarterView = ({ quarter }: { quarter: RoadmapQuarter }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{quarter.quarter}</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="font-medium">{quarter.budget.toLocaleString()}€</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jalons</p>
              <p className="font-medium">{quarter.milestones.length}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quarter.focusAreas.map((area) => (
            <Badge key={area} variant="secondary">{area}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quarter.milestones.map((milestone) => (
            <Card key={milestone.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{milestone.title}</h4>
                  <Badge variant={milestone.status === 'Terminé' ? 'default' : 'outline'}>
                    {milestone.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{milestone.progress}%</span>
                  </div>
                  <Progress value={milestone.progress} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Échéance: {milestone.dueDate.toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function InteractiveRoadmap({ quarters, actions, milestones }: InteractiveRoadmapProps) {
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'quarters'>('timeline');

  const toggleActionExpansion = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  // Trier les actions par date de début
  const sortedActions = [...actions].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div className="space-y-6">
      {/* Contrôles de vue */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Feuille de Route Interactive</h2>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            onClick={() => setViewMode('timeline')}
          >
            Vue Timeline
          </Button>
          <Button
            variant={viewMode === 'quarters' ? 'default' : 'outline'}
            onClick={() => setViewMode('quarters')}
          >
            Vue Trimestrielle
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Actions Totales</p>
                <p className="text-xl font-bold">{actions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-xl font-bold">
                  {actions.filter(a => a.status === 'Terminé').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Critiques</p>
                <p className="text-xl font-bold">
                  {actions.filter(a => a.priority === 'Critique').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Jalons</p>
                <p className="text-xl font-bold">{milestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      {viewMode === 'timeline' ? (
        <Card>
          <CardHeader>
            <CardTitle>Timeline des Actions</CardTitle>
            <p className="text-muted-foreground">
              Cliquez sur les actions pour voir les détails
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {sortedActions.map((action) => (
                <TimelineItem
                  key={action.id}
                  action={action}
                  isExpanded={expandedActions.has(action.id)}
                  onToggle={() => toggleActionExpansion(action.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          {quarters.map((quarter) => (
            <QuarterView key={quarter.quarter} quarter={quarter} />
          ))}
        </div>
      )}
    </div>
  );
}
