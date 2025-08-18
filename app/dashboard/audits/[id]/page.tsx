'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  User, 
  BarChart3,
  TrendingUp,
  Target,
  Clock,
  DollarSign
} from 'lucide-react';
import { Audit } from '@prisma/client';
import { computeAuditResult, generateActionPlan, ActionPlanItem } from '../../../../lib/audit/scoring';
import RadarChart from '../../../../components/charts/RadarChart';
import BarChart from '../../../../components/charts/BarChart';

// Extend the Prisma Audit type to include responses
interface AuditWithResponses extends Audit {
  responses: {
    question: string;
    answer: string;
    score: number | null;
    category: string;
  }[];
}

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [audit, setAudit] = useState<AuditWithResponses | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const auditId = params.id as string;

  useEffect(() => {
    const fetchAudit = async () => {
      if (!auditId || !session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/audits/${auditId}?userId=${session.user.id}`);
        
        if (!response.ok) {
          throw new Error('Audit non trouvé ou accès non autorisé');
        }
        
        const data = await response.json();
        setAudit(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
        console.error('Erreur lors de la récupération de l\'audit:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudit();
  }, [auditId, session]);

  const handleGeneratePdfReport = async () => {
    if (!audit) return;

    try {
      setGeneratingPdf(true);
      
      const response = await fetch(`/api/audit/${audit.id}/export/comprehensive-pdf`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }
      
      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-audit-${audit.id}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleViewPdfReport = async () => {
    if (!audit) return;
    
    try {
      const url = `/api/audit/${audit.id}/export/comprehensive-pdf`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur ouverture rapport:', error);
      alert('Erreur lors de l\'ouverture du rapport.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Détail de l'audit</h1>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  if (error || !audit) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Détail de l'audit</h1>
          <p className="text-red-600">{error || 'Audit non trouvé'}</p>
          <Link href="/dashboard/audits" className="mt-4 inline-block">
            <Button variant="outline">← Retour à l'historique</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Recalculer le résultat de l'audit à partir des réponses stockées
  const auditResult = computeAuditResult(
    audit.responses.map(r => ({
      questionId: r.question,
      answer: r.answer,
      score: r.score ?? 0,
    }))
  );

  const scores = auditResult.scoresByCategory;
  
  // Générer le plan d'action
  const answers = audit.responses.map(response => ({
    questionId: response.question,
    answer: response.answer,
    score: response.score !== null ? response.score : undefined
  }));
  
  const actionPlan = generateActionPlan(auditResult, answers);

  const auditDate = new Date(audit.createdAt);

  // Statistiques des réponses par type
  const responseStats = audit.responses.reduce((acc, response) => {
    if (response.score === null) {
      acc.notScored++;
    } else if (response.score >= 4) {
      acc.positive++;
    } else if (response.score >= 2) {
      acc.neutral++;
    } else {
      acc.negative++;
    }
    return acc;
  }, { positive: 0, neutral: 0, negative: 0, notScored: 0 });

  // Grouper les réponses par catégorie
  const responsesByCategory = audit.responses.reduce((acc, response) => {
    if (!acc[response.category]) {
      acc[response.category] = [];
    }
    acc[response.category].push(response);
    return acc;
  }, {} as Record<string, typeof audit.responses>);

  // Fonctions utilitaires pour les badges
  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-gray-500';
    if (score >= 4) return 'bg-green-500';
    if (score >= 2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreIcon = (score: number | null) => {
    if (score === null) return <AlertCircle className="h-4 w-4" />;
    if (score >= 4) return <CheckCircle className="h-4 w-4" />;
    if (score >= 2) return <AlertCircle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getMaturityBadgeVariant = (maturity: string | null) => {
    if (!maturity) return 'secondary';
    if (maturity.includes('Initial') || maturity.includes('Ad hoc')) return 'destructive';
    if (maturity.includes('Défini') || maturity.includes('Intermédiaire')) return 'secondary';
    if (maturity.includes('Géré') || maturity.includes('Avancé')) return 'default';
    if (maturity.includes('Optimisé') || maturity.includes('Expert')) return 'default';
    return 'secondary';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/audits">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'historique
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Audit du {auditDate.toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant={getMaturityBadgeVariant(audit.maturity)}>
              {audit.maturity || 'En cours'}
            </Badge>
            <Badge variant={audit.score && audit.score >= 70 ? 'default' : audit.score && audit.score >= 50 ? 'secondary' : 'destructive'}>
              Score: {audit.score?.toFixed(0) || 'N/A'}%
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {auditDate.toLocaleDateString('fr-FR')} à {auditDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewPdfReport}>
            <FileText className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button onClick={handleGeneratePdfReport} disabled={generatingPdf}>
            {generatingPdf ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Génération...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Rapport PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Score Global
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audit.score?.toFixed(0) || 'N/A'}%</div>
            <Progress value={audit.score || 0} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Réponses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audit.responses.length}</div>
            <p className="text-sm text-muted-foreground">questions traitées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actionPlan.length}</div>
            <p className="text-sm text-muted-foreground">recommandations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Maturité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{audit.maturity || 'N/A'}</div>
            <p className="text-sm text-muted-foreground">niveau actuel</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques des réponses */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des réponses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{responseStats.positive}</div>
              <p className="text-sm text-muted-foreground">Positives</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(responseStats.positive / audit.responses.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{responseStats.neutral}</div>
              <p className="text-sm text-muted-foreground">Neutres</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(responseStats.neutral / audit.responses.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{responseStats.negative}</div>
              <p className="text-sm text-muted-foreground">Négatives</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{ width: `${(responseStats.negative / audit.responses.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{responseStats.notScored}</div>
              <p className="text-sm text-muted-foreground">Non scorées</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${(responseStats.notScored / audit.responses.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="responses">Réponses détaillées</TabsTrigger>
          <TabsTrigger value="action-plan">Plan d'action</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scores par catégorie */}
            <Card>
              <CardHeader>
                <CardTitle>Scores par domaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scores).map(([category, score]) => {
                  const numScore = Number(score);
                  const getColorClass = (score: number) => {
                    if (score < 40) return 'bg-red-500';
                    if (score < 70) return 'bg-yellow-500';
                    return 'bg-green-500';
                  };
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{category}</span>
                        <span className="text-sm font-bold">{numScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getColorClass(numScore)}`}
                          style={{ width: `${numScore}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Actions prioritaires */}
            <Card>
              <CardHeader>
                <CardTitle>Actions prioritaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actionPlan.slice(0, 5).map((action, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        action.priority === 'Haute' ? 'bg-red-500' :
                        action.priority === 'Moyenne' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {action.category}
                          </Badge>
                          <Badge variant={
                            action.priority === 'Haute' ? 'destructive' :
                            action.priority === 'Moyenne' ? 'secondary' : 'default'
                          } className="text-xs">
                            {action.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {action.deadline}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {actionPlan.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... et {actionPlan.length - 5} autres actions
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommandations */}
          {audit.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Recommandations générales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{audit.recommendations}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Réponses détaillées */}
        <TabsContent value="responses" className="space-y-4">
          {Object.entries(responsesByCategory).map(([category, responses]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline">
                    {responses.length} question{responses.length > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium mb-2">{response.question}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{response.answer}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${getScoreColor(response.score)} flex items-center justify-center text-white text-xs font-bold`}>
                            {getScoreIcon(response.score)}
                          </div>
                          <span className="text-sm font-medium">
                            {response.score !== null ? `${response.score}/5` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Plan d'action */}
        <TabsContent value="action-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Plan d'action complet ({actionPlan.length} actions)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionPlan.map((action, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-sm">#{index + 1}</span>
                          <Badge variant={
                            action.priority === 'Haute' ? 'destructive' :
                            action.priority === 'Moyenne' ? 'secondary' : 'default'
                          }>
                            {action.priority}
                          </Badge>
                          <Badge variant="outline">{action.category}</Badge>
                        </div>
                        <h4 className="font-medium mb-2">{action.action}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {action.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {action.deadline}
                          </span>
                          {action.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {action.cost}€
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Graphiques */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégorie (Radar)</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart scores={scores} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scores par domaine (Barres)</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart scores={scores} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
