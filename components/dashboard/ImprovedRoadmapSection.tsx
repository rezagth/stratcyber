'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Map, 
  ArrowRight, 
  Clock, 
  AlertCircle, 
  Shield,
  CheckCircle,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { Priority } from '@/types/actionPlan';

// Interface harmonisée
interface ImprovedActionPlanItem {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  dueDate: Date;
  owner: string;
  status: string;
  progress: number;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
}

interface ImprovedRoadmapSectionProps {
  actionPlan: ImprovedActionPlanItem[];
  auditScore: number;
  lastAuditDate?: string;
}

export default function ImprovedRoadmapSection({ 
  actionPlan, 
  auditScore,
  lastAuditDate 
}: ImprovedRoadmapSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  // Calculer l'urgence basée sur la date d'échéance
  const calculateUrgency = (dueDate: Date): 'low' | 'medium' | 'high' | 'critical' => {
    const now = new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return 'critical'; // En retard
    if (daysLeft <= 7) return 'high';    // Dans la semaine
    if (daysLeft <= 30) return 'medium'; // Dans le mois
    return 'low';                        // Plus loin
  };

  // Enrichir les actions avec urgence
  const enrichedActions = actionPlan.map(action => ({
    ...action,
    urgency: calculateUrgency(action.dueDate)
  }));

  // Filtrer et trier
  const filteredActions = enrichedActions
    .filter(action => filterPriority === 'all' || action.priority === filterPriority)
    .sort((a, b) => {
      // Tri par urgence puis priorité
      const urgencyOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
      const priorityOrder = { 'Critique': 0, 'Haute': 1, 'Moyenne': 2, 'Basse': 3 };
      
      if (a.urgency !== b.urgency) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const visibleActions = showAll ? filteredActions : filteredActions.slice(0, 6);
  
  const totalActions = actionPlan.length;
  const highPriorityActions = actionPlan.filter(a => a.priority === 'Haute' || a.priority === 'Critique').length;
  const overdueActions = actionPlan.filter(a => calculateUrgency(a.dueDate) === 'critical').length;
  const completedActions = actionPlan.filter(a => a.status === 'Terminé').length;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  const getUrgencyBadge = (urgency: string, dueDate: Date) => {
    const now = new Date();
    const daysLeft = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <Badge variant="destructive" className="text-xs">En retard ({Math.abs(daysLeft)}j)</Badge>;
    }
    if (daysLeft <= 7) {
      return <Badge variant="destructive" className="text-xs">{daysLeft}j restant{daysLeft > 1 ? 's' : ''}</Badge>;
    }
    if (daysLeft <= 30) {
      return <Badge variant="secondary" className="text-xs">{daysLeft}j restant{daysLeft > 1 ? 's' : ''}</Badge>;
    }
    return <Badge variant="outline" className="text-xs">{daysLeft}j restant{daysLeft > 1 ? 's' : ''}</Badge>;
  };

  if (totalActions === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Map className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-xl">Feuille de route stratégique</CardTitle>
            </div>
            <Link href="/dashboard/roadmap">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Voir la roadmap complète
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Plan d'actions prioritaires basé sur votre audit de cybersécurité
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-12 text-muted-foreground">
            <Map className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune action à afficher. Complétez un audit pour générer votre roadmap.</p>
            <Link href="/audit/dynamic">
              <Button className="mt-4">
                Commencer un audit
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl">Feuille de route stratégique</CardTitle>
          </div>
          <Link href="/dashboard/roadmap">
            <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-blue-100">
              <Map className="h-4 w-4" />
              Voir la roadmap complète
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">
            Plan d'actions prioritaires basé sur votre audit de cybersécurité
          </p>
          {lastAuditDate && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Audit du {lastAuditDate}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Statistiques améliorées */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Actions totales</p>
                  <p className="text-2xl font-bold text-blue-700">{totalActions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 rounded-full p-2">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-red-600 font-medium">En retard</p>
                  <p className="text-2xl font-bold text-red-700">{overdueActions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 rounded-full p-2">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">Priorité haute</p>
                  <p className="text-2xl font-bold text-orange-700">{highPriorityActions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-full p-2">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Terminées</p>
                  <p className="text-2xl font-bold text-green-700">{completedActions}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filtres */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex gap-2">
                {(['all', 'Critique', 'Haute', 'Moyenne'] as const).map((priority) => (
                  <Button
                    key={priority}
                    variant={filterPriority === priority ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterPriority(priority)}
                    className="text-xs"
                  >
                    {priority === 'all' ? 'Toutes' : priority}
                    {priority !== 'all' && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {actionPlan.filter(a => a.priority === priority).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} affichée{filteredActions.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Liste des actions améliorée */}
          <div className="space-y-3">
            {visibleActions.map((action) => (
              <Card 
                key={action.id}
                className={`border-l-4 transition-all hover:shadow-md ${getUrgencyColor(action.urgency!)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-base line-clamp-1">{action.title}</h4>
                        <Badge 
                          variant={action.priority === 'Critique' || action.priority === 'Haute' ? 'destructive' : 'secondary'}
                          className="text-xs shrink-0"
                        >
                          {action.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="inline-flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {action.category}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {action.owner}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {action.dueDate.toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Barre de progression */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progression</span>
                          <span>{action.progress}%</span>
                        </div>
                        <Progress value={action.progress} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      {getUrgencyBadge(action.urgency!, action.dueDate)}
                      <Badge 
                        variant={action.status === 'Terminé' ? 'default' : 'outline'}
                        className="text-xs block"
                      >
                        {action.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bouton voir plus/moins */}
          {filteredActions.length > 6 && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Voir moins
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Voir {filteredActions.length - 6} actions supplémentaires
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Accès roadmap complète */}
          <div className="text-center pt-6 border-t border-gray-200">
            <Link href="/dashboard/roadmap">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Map className="h-4 w-4 mr-2" />
                Accéder à la roadmap interactive
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
