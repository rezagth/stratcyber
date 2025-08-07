'use client';

import React from 'react';
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
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface ActionPlanItem {
  action: string;
  category: string;
  priority: string;
  deadline: string;
  owner: string;
  status?: string;
  progress?: number;
  compliance?: string[];
}

interface EnhancedRoadmapSectionProps {
  actionPlan: ActionPlanItem[];
  auditScore: number;
  lastAuditDate?: string;
}

export default function EnhancedRoadmapSection({ 
  actionPlan, 
  auditScore,
  lastAuditDate 
}: EnhancedRoadmapSectionProps) {
  
  // Calculer les statistiques
  const totalActions = actionPlan.length;
  const highPriorityActions = actionPlan.filter(a => a.priority === 'Haute').length;
  const uniqueCategories = new Set(actionPlan.map(a => a.category)).size;
  
  // Actions à afficher (les 4 premières par priorité)
  const prioritizedActions = [...actionPlan]
    .sort((a, b) => {
      const priorityOrder = { 'Haute': 0, 'Moyenne': 1, 'Basse': 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 999) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 999);
    })
    .slice(0, 4);

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
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-2">
                  <Clock className="h-4 w-4 text-white" />
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
                  <p className="text-sm text-red-600 font-medium">Priorité haute</p>
                  <p className="text-2xl font-bold text-red-700">{highPriorityActions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 rounded-full p-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">Domaines couverts</p>
                  <p className="text-2xl font-bold text-green-700">{uniqueCategories}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline des actions prioritaires */}
          <div className="relative">
            {/* Ligne de connexion horizontale */}
            <div className="absolute top-6 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {prioritizedActions.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Cercle numéroté */}
                  <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                    item.priority === 'Haute' ? 'bg-red-500' : 
                    item.priority === 'Moyenne' ? 'bg-amber-500' : 'bg-green-500'
                  }`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  
                  {/* Contenu de l'action */}
                  <div className="mt-4 text-center px-2">
                    <Badge 
                      variant={item.priority === 'Haute' ? 'destructive' : item.priority === 'Moyenne' ? 'secondary' : 'default'}
                      className="mb-2 text-xs"
                    >
                      {item.priority}
                    </Badge>
                    <h4 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                      {item.action}
                    </h4>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs">
                          {item.category}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {item.deadline}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">{item.owner}</p>
                    </div>
                    
                    {/* Indicateur de progression si disponible */}
                    {item.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Progression</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions supplémentaires et bouton d'accès */}
          {totalActions > 4 && (
            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-sm text-muted-foreground mb-4">
                Et {totalActions - 4} autres actions dans votre plan complet
              </p>
              <Link href="/dashboard/roadmap">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Map className="h-4 w-4 mr-2" />
                  Accéder à la roadmap interactive
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
          
          {/* Indicateur de score global */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm mb-1">Score de cybersécurité actuel</h4>
                <p className="text-xs text-muted-foreground">Basé sur votre dernier audit</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{auditScore}%</div>
                <Badge variant={auditScore < 40 ? 'destructive' : auditScore < 70 ? 'secondary' : 'default'}>
                  {auditScore < 40 ? 'Critique' : auditScore < 70 ? 'À améliorer' : 'Bon niveau'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
