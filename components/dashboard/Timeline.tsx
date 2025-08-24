import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Target,
  User,
  ChevronRight
} from 'lucide-react';
import { DashboardAction, DashboardMilestone } from '@/types/dashboard';

interface TimelineProps {
  actions: DashboardAction[];
  milestones: DashboardMilestone[];
  onActionClick?: (action: DashboardAction) => void;
  onMilestoneClick?: (milestone: DashboardMilestone) => void;
  timeRange?: 'next30' | 'next90' | 'next180' | 'all';
}

interface TimelineItem {
  id: string;
  type: 'action' | 'milestone';
  title: string;
  description?: string;
  date: Date;
  status: string;
  priority?: string;
  progress?: number;
  category: string;
  owner?: string;
  data: DashboardAction | DashboardMilestone;
}

export function Timeline({ 
  actions, 
  milestones, 
  onActionClick, 
  onMilestoneClick,
  timeRange = 'next90'
}: TimelineProps) {
  // Combiner actions et jalons dans une timeline unifiée
  const timelineItems: TimelineItem[] = [
    ...actions.map(action => ({
      id: action.id,
      type: 'action' as const,
      title: action.title,
      description: action.description,
      date: action.dueDate,
      status: action.status,
      priority: action.priority,
      progress: action.progress,
      category: action.category,
      owner: action.owner,
      data: action
    })),
    ...milestones.map(milestone => ({
      id: milestone.id,
      type: 'milestone' as const,
      title: milestone.title,
      description: milestone.description,
      date: milestone.dueDate,
      status: milestone.status,
      progress: milestone.progress,
      category: milestone.category,
      data: milestone
    }))
  ];

  // Filtrer selon la plage de temps
  const now = new Date();
  const filteredItems = timelineItems.filter(item => {
    switch (timeRange) {
      case 'next30':
        return item.date <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'next90':
        return item.date <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
      case 'next180':
        return item.date <= new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  // Grouper par mois
  const groupedByMonth = filteredItems.reduce((groups, item) => {
    const monthKey = item.date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(item);
    return groups;
  }, {} as Record<string, TimelineItem[]>);

  const getStatusColor = (status: string, type: 'action' | 'milestone') => {
    switch (status) {
      case 'Terminé':
        return 'bg-green-500';
      case 'En cours':
        return 'bg-blue-500';
      case 'En retard':
        return 'bg-red-500';
      default:
        return type === 'milestone' ? 'bg-purple-500' : 'bg-gray-400';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'Critique':
        return 'destructive';
      case 'Haute':
        return 'destructive';
      case 'Moyenne':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isOverdue = (date: Date, status: string) => {
    return date < now && status !== 'Terminé';
  };

  const handleItemClick = (item: TimelineItem) => {
    if (item.type === 'action' && onActionClick) {
      onActionClick(item.data as DashboardAction);
    } else if (item.type === 'milestone' && onMilestoneClick) {
      onMilestoneClick(item.data as DashboardMilestone);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Timeline des Actions & Jalons
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {filteredItems.filter(i => i.type === 'action').length} actions
          </Badge>
          <Badge variant="outline" className="text-xs">
            {filteredItems.filter(i => i.type === 'milestone').length} jalons
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {Object.keys(groupedByMonth).length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun élément planifié pour la période sélectionnée</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMonth).map(([month, items]) => (
              <div key={month}>
                <h3 className="text-lg font-semibold mb-4 capitalize">
                  {month}
                </h3>
                
                <div className="relative">
                  {/* Ligne verticale de la timeline */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>
                  
                  <div className="space-y-6">
                    {items.map((item, index) => (
                      <div 
                        key={item.id}
                        className="relative flex items-start gap-4 group cursor-pointer hover:bg-muted/50 rounded-lg p-3 -mx-3 transition-colors"
                        onClick={() => handleItemClick(item)}
                      >
                        {/* Point sur la timeline */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${getStatusColor(item.status, item.type)} flex items-center justify-center`}>
                          {item.type === 'milestone' ? (
                            <Target className="h-4 w-4 text-white" />
                          ) : item.status === 'Terminé' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : isOverdue(item.date, item.status) ? (
                            <AlertTriangle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* En-tête */}
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={item.type === 'milestone' ? 'default' : 'outline'} 
                                  className="text-xs"
                                >
                                  {item.type === 'milestone' ? 'Jalon' : 'Action'}
                                </Badge>
                                
                                {item.priority && (
                                  <Badge variant={getPriorityVariant(item.priority)} className="text-xs">
                                    {item.priority}
                                  </Badge>
                                )}
                                
                                <Badge variant="secondary" className="text-xs">
                                  {item.category}
                                </Badge>

                                {isOverdue(item.date, item.status) && (
                                  <Badge variant="destructive" className="text-xs">
                                    En retard
                                  </Badge>
                                )}
                              </div>

                              {/* Titre et description */}
                              <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {item.description}
                                </p>
                              )}

                              {/* Progression */}
                              {item.progress !== undefined && (
                                <div className="mb-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Progress value={item.progress} className="h-1.5 flex-1" />
                                    <span className="text-xs text-muted-foreground">
                                      {item.progress}%
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Métadonnées */}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span className={isOverdue(item.date, item.status) ? 'text-red-600 font-medium' : ''}>
                                    {item.date.toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                
                                {item.owner && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{item.owner}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Flèche de navigation */}
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
