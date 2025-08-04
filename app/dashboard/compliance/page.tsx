'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  FileText,
  DollarSign
} from 'lucide-react';

interface ComplianceMetrics {
  rgpdScore: number;
  nis2Score: number;
  doraScore: number;
  overallCompliance: number;
  criticalGaps: number;
  upcomingDeadlines: number;
  estimatedFines: number;
  actionItems: number;
}

interface ComplianceFramework {
  name: string;
  score: number;
  status: string;
  color: string;
  nextDeadline: string;
  criticalActions: number;
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    rgpdScore: 0,
    nis2Score: 0,
    doraScore: 0,
    overallCompliance: 0,
    criticalGaps: 0,
    upcomingDeadlines: 0,
    estimatedFines: 0,
    actionItems: 0
  });
  
  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/compliance');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de conformité');
        }
        
        const data = await response.json();
        setMetrics(data.metrics);
        setComplianceFrameworks(data.frameworks);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
        console.error('Erreur lors de la récupération des données:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchComplianceData();
  }, []);
  
  if (loading) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Chargement des données...</h2>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Erreur lors de la récupération des données</h2>
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dashboard de Conformité</h1>
        <p className="text-lg text-gray-600">
          Vue d&apos;ensemble de votre conformité réglementaire
        </p>
      </div>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conformité Globale</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.overallCompliance}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Écarts Critiques</p>
                <p className="text-3xl font-bold text-red-600">{metrics.criticalGaps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Échéances Proches</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.upcomingDeadlines}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Risque d&apos;Amende</p>
                <p className="text-3xl font-bold text-purple-600">{(metrics.estimatedFines / 1000).toFixed(0)}K€</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Frameworks de conformité */}
      <Card>
        <CardHeader>
          <CardTitle>État de Conformité par Réglementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceFrameworks.map((framework) => (
              <div key={framework.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{framework.name}</h3>
                    <Badge 
                      variant={framework.color === 'green' ? 'default' : 'destructive'}
                      className={framework.color === 'orange' ? 'bg-orange-100 text-orange-800' : ''}
                    >
                      {framework.status}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{framework.score}%</div>
                    <div className="text-sm text-muted-foreground">
                      {framework.criticalActions} actions critiques
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <span>{framework.score}%</span>
                  </div>
                  <Progress value={framework.score} className="h-2" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Prochaine échéance: {framework.nextDeadline}</span>
                    <Button variant="outline" size="sm">
                      Voir le plan d&apos;action
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Onglets détaillés */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="actions">Plan d&apos;Actions</TabsTrigger>
          <TabsTrigger value="risks">Analyse des Risques</TabsTrigger>
          <TabsTrigger value="timeline">Feuille de Route</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Actions Prioritaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Mise à jour du registre RGPD",
                    regulation: "RGPD",
                    priority: "CRITICAL",
                    deadline: "2024-03-15",
                    owner: "DPO",
                    status: "En cours"
                  },
                  {
                    title: "Implémentation tests DORA",
                    regulation: "DORA",
                    priority: "HIGH",
                    deadline: "2024-06-30",
                    owner: "RSSI",
                    status: "À faire"
                  },
                  {
                    title: "Notification incidents NIS2",
                    regulation: "NIS2",
                    priority: "CRITICAL",
                    deadline: "2024-04-01",
                    owner: "Équipe Sécurité",
                    status: "En retard"
                  }
                ].map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{action.title}</h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <span>Réglementation: {action.regulation}</span>
                          <span>Responsable: {action.owner}</span>
                          <span>Échéance: {action.deadline}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={action.priority === 'CRITICAL' ? 'destructive' : 'default'}
                        >
                          {action.priority}
                        </Badge>
                        <Badge 
                          variant={action.status === 'En retard' ? 'destructive' : 'outline'}
                        >
                          {action.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="risks">
          <Card>
            <CardHeader>
              <CardTitle>Matrice des Risques de Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Risques Élevés</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Non-conformité RGPD (Amende: 4% CA)</li>
                    <li>• Retard NIS2 (Sanctions administratives)</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-medium text-orange-800 mb-2">Risques Moyens</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Tests DORA incomplets</li>
                    <li>• Formation cybersécurité</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Risques Faibles</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Documentation ISO 27001</li>
                    <li>• Procédures internes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Feuille de Route de Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    quarter: "Q1 2024",
                    title: "Mise en conformité RGPD",
                    progress: 75,
                    actions: ["Registre des traitements", "Procédures DPO", "Formation équipes"]
                  },
                  {
                    quarter: "Q2 2024",
                    title: "Préparation NIS2",
                    progress: 40,
                    actions: ["Analyse des risques", "Plan de continuité", "Notification incidents"]
                  },
                  {
                    quarter: "Q3 2024",
                    title: "Implémentation DORA",
                    progress: 20,
                    actions: ["Tests de résilience", "Gestion des tiers", "Reporting"]
                  }
                ].map((phase, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{phase.quarter} - {phase.title}</h4>
                        <div className="text-sm text-muted-foreground mt-1">
                          Progression: {phase.progress}%
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress value={phase.progress} className="w-32" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {phase.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="text-sm p-2 bg-gray-50 rounded">
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Conformité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Rapport RGPD Mensuel",
                    description: "État de conformité et actions en cours",
                    lastGenerated: "2024-02-01",
                    type: "PDF"
                  },
                  {
                    title: "Dashboard NIS2",
                    description: "Suivi des exigences NIS2",
                    lastGenerated: "2024-02-15",
                    type: "Interactif"
                  },
                  {
                    title: "Audit DORA",
                    description: "Évaluation de la résilience opérationnelle",
                    lastGenerated: "2024-01-30",
                    type: "PDF"
                  },
                  {
                    title: "Synthèse Direction",
                    description: "Vue exécutive de la conformité",
                    lastGenerated: "2024-02-10",
                    type: "PowerPoint"
                  }
                ].map((report, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{report.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Dernière génération: {report.lastGenerated}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}