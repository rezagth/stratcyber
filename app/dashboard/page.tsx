'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DashboardSkeleton } from '@/components/skeletons/dashboard-skeleton';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Shield, FileText, Eye } from 'lucide-react';
import { generateActionPlan, calculateCrazyScore, computeAuditResult, ActionPlanItem, inferComplianceFromCategory } from '../../lib/audit/scoring';
import { Audit } from '@prisma/client';
import RadarChart from '../../components/charts/RadarChart';
import { AdminCockpit } from '@/components/dashboard/AdminCockpit';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AuditCategory } from '../../types/audit';



// Extend the Prisma Audit type to include responses
interface AuditWithResponses extends Audit {
  responses: {
    question: string;
    answer: string;
    score: number | null;
    category: string;
  }[];
  legalRiskScore: number | null;
}

// Action affichée : soit générée localement depuis l'audit, soit renvoyée par /api/audits/[id]/actions
// (qui ajoute un id et une date d'échéance ISO).
type DashboardActionRow = ActionPlanItem & { id?: string; dueDate?: string };

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
    // Sélectionner les réponses pertinentes par réglementation
    const relevantResponses = lastAudit.responses.filter((r: { category: string; score: number | null }) => {
      switch (reg) {
        case 'RGPD':
          return r.category === 'RGPD';
        case 'NIS2':
          return r.category === 'NIS2';
        case 'DORA':
          return r.category === 'DORA';
        case 'CRA':
          return r.category === 'CRA';
        case 'LPM':
          return r.category === 'LPM';
        default:
          return false;
      }
    });
    
    let avgScoreRaw: number;
    if (relevantResponses.length > 0) {
      avgScoreRaw = relevantResponses.reduce((sum: number, r: { score: number | null }) => sum + (r.score || 0), 0) / relevantResponses.length;
    } else if (REGULATION_CATEGORY_MAP[reg]) {
      // utiliser la moyenne des catégories mappées
      const catPercents = REGULATION_CATEGORY_MAP[reg].map(c=>categoryScores[c] ?? 0);
      const avgCatPercent = catPercents.length ? catPercents.reduce((a,b)=>a+b,0)/catPercents.length : 0;
      avgScoreRaw = avgCatPercent / 20; // convertir % vers échelle 0-5 pour formule suivante
    } else {
      avgScoreRaw = (categoryScores[reg] ?? 0) / 20;
    }
    // Convertir la moyenne (0-5) en pourcentage
    // si avgScoreRaw déjà pourcentage (fallback) alors garder tel quel
    complianceScores[reg] = relevantResponses.length > 0 ? Math.round((avgScoreRaw / 5) * 100) : Math.round(avgScoreRaw);
  });
  
  return complianceScores;
};

function PersonalDashboard() {
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
  const [roadmapData, setRoadmapData] = useState<any>(null);

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
          
          // Fetch roadmap data for actions
          const roadmapResponse = await fetch('/api/roadmap/data');
          if (roadmapResponse.ok) {
            const roadmapResult = await roadmapResponse.json();
            setRoadmapData(roadmapResult);
          }
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

  // Recalculer le résultat de l'audit à partir des réponses stockées
  const auditResult = lastAudit ? computeAuditResult(
    lastAudit.responses.map(r => ({
      questionId: r.question,
      answer: r.answer,
      score: r.score ?? 0,
    }))
  ) : null;

  const scores = auditResult ? auditResult.scoresByCategory : {} as Record<AuditCategory, number>;

  // Déterminer les réglementations applicables provenant du profil de l'entreprise s'il existe
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

  // Calculer les scores de conformité
  const complianceScores = calculateComplianceScores(lastAudit, scores as Record<string, number>);

  // Filtrer les réglementations à afficher : celles applicables et sélectionnées
  // Celles qui ont un score > 0 seront affichées
  const visibleRegs = applicableRegs.filter(
    reg => complianceScores[reg] > 0
  );
  if (!visibleRegs.length && complianceScores['RGPD'] !== undefined) visibleRegs.push('RGPD');

  // Recalculer le risque légal sur ces réglementations visibles
  const totalRisk = visibleRegs.reduce((sum, reg)=> sum + (100 - complianceScores[reg]), 0);
  const legalRisk = Math.round(totalRisk / (visibleRegs.length || 1));
  const legalRiskLevel = legalRisk >= 80 ? 'Critique' : legalRisk >= 60 ? 'Élevé' : legalRisk >= 40 ? 'Moyen' : 'Faible';
  const legalRiskColor = legalRisk >= 80 ? 'bg-destructive' : legalRisk >= 60 ? 'bg-amber-500' : legalRisk >= 40 ? 'bg-yellow-400' : 'bg-green-500';

  // Calculer le Crazy Score
  // CSV export helper
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

  // PDF report generation
  const handleGeneratePdfReport = async (auditId: string) => {
    try {
      setGeneratingPdf(auditId);
      
      // Appel à l'API pour générer le rapport PDF
      const response = await fetch(`/api/audits/${auditId}/report-pdf`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }
      
      // Récupérer le contenu PDF en tant qu'ArrayBuffer
      const pdfBuffer = await response.arrayBuffer();
      
      // Créer un blob PDF et télécharger
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-audit-${auditId}.pdf`);
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

  // Ouvrir le rapport dans un nouvel onglet
  const handleViewPdfReport = async (auditId: string) => {
    try {
      const url = `/api/audits/${auditId}/report-pdf`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur ouverture rapport:', error);
      alert('Erreur lors de l\'ouverture du rapport.');
    }
  };

  const crazyScore = auditResult ? calculateCrazyScore(auditResult) : null;
  
  // Utiliser les actions de l'API roadmap si disponibles, sinon générer localement
  const answers = lastAudit?.responses.map(response => ({
    questionId: response.question,
    answer: response.answer,
    score: response.score !== null ? response.score : undefined
  })) || [];
  
  // Utiliser les actions de roadmap en priorité
  const actionPlan: DashboardActionRow[] = roadmapData?.actions || (auditResult ? generateActionPlan(auditResult, answers) : []);

// Filtrage contextuel des actions de conformité
const filterActionsByCompliance = (actions: DashboardActionRow[], context: AuditWithResponses | null) => {
  if (!context) return actions;
  return actions.filter(action => {
    const complianceCategories = inferComplianceFromCategory(action.category);
    return complianceCategories.some(cc => context.responses.some(r => r.category === cc && (r.score ?? 0) > 2));
  });
};

const filteredActionPlan = filterActionsByCompliance(actionPlan, lastAudit);

/* ancienne implémentation conservée pour référence
const actionPlan = lastAudit && auditResult ? generateActionPlan({
    globalScore: auditResult.globalScore || 0,
    scoresByCategory: scores,
    maturity: auditResult.maturity || '',
    recommendations: lastAudit.recommendations?.split('\n') || [],
    roadmap: auditResult.roadmap || [],
    complianceScores: auditResult.complianceScores || [],
    legalRiskScore: legalRisk,
    mandatoryActions: auditResult.mandatoryActions || [],
    optionalActions: auditResult.optionalActions || []
  } as AuditResult) : [];*/

const priorityFiltered = actionPlan.filter(a => {
  if (actionFilter === 'ALL') return true;
  if (actionFilter === 'HIGH') return a.priority === 'Haute';
  if (actionFilter === 'MEDIUM') return a.priority === 'Moyenne';
  if (actionFilter === 'LOW') return a.priority === 'Basse';
  return true;
});

  // Recherche
  const searchFiltered = priorityFiltered.filter(a =>
    a.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tri
  const sortedActions = [...searchFiltered].sort((a,b)=>{
    if(sortBy==='PRIORITY'){
      const order = { 'Haute':0,'Moyenne':1,'Basse':2 } as Record<string,number>;
      return order[a.priority]-order[b.priority];
    }
    const da = new Date(a.deadline);
    const db = new Date(b.deadline);
    return da.getTime()-db.getTime();
  });

  // Pagination helper
  const totalPages = Math.ceil(sortedActions.length / itemsPerPage);
  const paginated = sortedActions.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  if (loading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Erreur de chargement
              </h2>
              <p className="text-lg text-muted-foreground">
                Impossible de récupérer vos données
              </p>
              <p className="text-sm text-red-600 mt-4">{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conformité, risques et plan d&apos;action
            {lastAudit && <> · dernier audit le {new Date(lastAudit.createdAt).toLocaleDateString('fr-FR')}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link href="/dashboard/roadmap">Roadmap</Link></Button>
          <Button asChild><Link href="/strategie">Nouvel audit</Link></Button>
        </div>
      </div>
      {audits.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          Aucun audit réalisé pour l&apos;instant.
          <div className="mt-4"><Button asChild><Link href="/strategie">Démarrer un audit</Link></Button></div>
        </div>
      ) : (
        <>
          <DashboardOverview
            globalScore={Math.round(auditResult?.globalScore || 0)}
            maturity={auditResult?.maturity || ''}
            crazy={crazyScore ? { score: crazyScore.score, label: crazyScore.label, emoji: crazyScore.emoji } : null}
            legalRisk={legalRisk}
            legalRiskLevel={legalRiskLevel}
            regs={visibleRegs.map((k) => {
              const r = REGULATIONS[k as keyof typeof REGULATIONS];
              return { key: k, name: r.name, score: complianceScores[k] || 0, deadline: r.deadline, color: r.color };
            })}
            actionCounts={{
              critical: actionPlan.filter((a) => (a.priority as string) === 'Critique').length,
              high: actionPlan.filter((a) => a.priority === 'Haute').length,
              medium: actionPlan.filter((a) => a.priority === 'Moyenne').length,
              low: actionPlan.filter((a) => a.priority === 'Basse' || (a.priority as string) === 'Faible').length,
              total: roadmapData?.statistics?.totalActions || actionPlan.length,
            }}
            scores={(scores || {}) as Record<string, number>}
            history={[...audits]
              .sort((x, y) => new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime())
              .slice(-8)
              .map((x) => ({ date: new Date(x.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }), score: Math.round(x.score ?? 0) }))}
            answersCount={lastAudit?.responses?.length || 0}
            radar={<RadarChart scores={scores || {}} />}
          />

          {/* Synthèse par domaine */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Synthèse par domaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(scores).map(([cat, score]) => {
                  const numScore = Number(score);
                  const getColorClass = (score: number) => {
                    if (score < 40) return 'bg-destructive/20 border-destructive/30';
                    if (score < 70) return 'bg-amber-500/20 border-amber-500/30';
                    return 'bg-green-500/20 border-green-500/30';
                  };
                  
                  const getBarColorClass = (score: number) => {
                    if (score < 40) return 'bg-destructive';
                    if (score < 70) return 'bg-amber-500';
                    return 'bg-green-500';
                  };
                  
                  const getStatusText = (score: number) => {
                    if (score < 40) return 'Critique';
                    if (score < 70) return 'À améliorer';
                    return 'Conforme';
                  };
                  
                  const getStatusVariant = (score: number) => {
                    if (score < 40) return 'destructive';
                    if (score < 70) return 'secondary';
                    return 'default';
                  };
                  
                  return (
                    <div 
                      key={cat} 
                      className={`rounded-xl border p-4 transition-all hover:shadow-md ${getColorClass(numScore)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg">{cat}</h3>
                        <Badge variant={getStatusVariant(numScore) as "default" | "secondary" | "destructive" | null | undefined}>
                          {getStatusText(numScore)}
                        </Badge>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className="text-3xl font-bold">{numScore}<span className="text-lg font-normal text-muted-foreground">/100</span></div>
                        <div className="flex-1 min-w-0">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getBarColorClass(numScore)}`} 
                              style={{ width: `${numScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Feuille de route (timeline) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feuille de route priorisée</CardTitle>
                <Link href="/dashboard/roadmap">
                  <Button variant="outline" size="sm">
                    Voir la roadmap interactive →
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {actionPlan.length === 0 ? (
                <div className="text-center text-muted-foreground">Aucune action à afficher.</div>
              ) : (
                <ol className="relative border-l border-primary/30 ml-2">
                  {actionPlan.slice(0, 5).map((item, i) => (
                    <li key={item.id || i} className="mb-8 ml-4">
                      <div className={`absolute w-4 h-4 rounded-full -left-2 border-2 border-white ${item.priority === 'Haute' ? 'bg-orange-500' : item.priority === 'Moyenne' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Étape {i + 1}</span>
                          <Badge variant={item.priority === 'Haute' ? 'destructive' : item.priority === 'Moyenne' ? 'secondary' : 'default'}>
                            {item.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">• {item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : item.deadline}</span>
                        </div>
                        <p className="mb-1 text-base">{item.action}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Domaine: <Badge variant="secondary">{item.category}</Badge></span>
                          <span>Responsable: <Badge variant="outline">{item.owner}</Badge></span>
                        </div>
                      </div>
                    </li>
                  ))}
                  {actionPlan.length > 5 && (
                    <div className="text-center mt-4">
                      <Link href="/dashboard/roadmap" className="text-primary hover:underline">
                        Voir toutes les {actionPlan.length} actions dans la roadmap interactive
                      </Link>
                    </div>
                  )}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Plan d'action */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Plan d&apos;action personnalisé
                </span>
                <div className="flex gap-2">
                  <Link href="/dashboard/roadmap">
                    <Button variant="outline" size="sm">
                      Roadmap interactive
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter CSV
                  </Button>
                </div>
              </CardTitle>
              <p className="text-sm text-muted-foreground">Actions prioritaires pour améliorer votre posture de cybersécurité</p>
            </CardHeader>
            <CardContent>
              {actionPlan.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune action recommandée pour le moment.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filtres et recherche */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={actionFilter === 'ALL' ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1 text-base rounded-full"
                        onClick={() => setActionFilter('ALL')}
                      >
                        Toutes <span className="ml-1 text-xs">({actionPlan.length})</span>
                      </Badge>
                      <Badge
                        variant={actionFilter === 'HIGH' ? 'destructive' : 'outline'}
                        className="cursor-pointer px-3 py-1 text-base rounded-full"
                        onClick={() => setActionFilter('HIGH')}
                      >
                        Haute priorité <span className="ml-1 text-xs">({actionPlan.filter(a => a.priority === 'Haute').length})</span>
                      </Badge>
                      <Badge
                        variant={actionFilter === 'MEDIUM' ? 'secondary' : 'outline'}
                        className="cursor-pointer px-3 py-1 text-base rounded-full"
                        onClick={() => setActionFilter('MEDIUM')}
                      >
                        Moyenne priorité <span className="ml-1 text-xs">({actionPlan.filter(a => a.priority === 'Moyenne').length})</span>
                      </Badge>
                      <Badge
                        variant={actionFilter === 'LOW' ? 'default' : 'outline'}
                        className="cursor-pointer px-3 py-1 text-base rounded-full"
                        onClick={() => setActionFilter('LOW')}
                      >
                        Basse priorité <span className="ml-1 text-xs">({actionPlan.filter(a => a.priority === 'Basse').length})</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                      />
                      <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'PRIORITY' | 'DEADLINE')}>
                        <SelectTrigger className="w-[120px]">
                          <span>Trier par</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIORITY">Priorité</SelectItem>
                          <SelectItem value="DEADLINE">Échéance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Tableau des actions */}
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="p-4 font-semibold text-left">Action</th>
                          <th className="p-4 font-semibold text-left">Catégorie</th>
                          <th className="p-4 font-semibold text-left">Priorité</th>
                          <th className="p-4 font-semibold text-left">Échéance</th>
                          <th className="p-4 font-semibold text-left">Responsable</th>
                        </tr>
                      </thead>
                        <tbody>
{(showAllActions ? filteredActionPlan : filteredActionPlan.slice(0,5)).map((item, index) => (
                          <tr
                            key={`${item.category}-${index}`}
                            className={
                              `border-b border-muted/30 hover:bg-muted/30 transition-colors duration-150`
                            }
                          >
                            <td className="p-4 text-base font-medium max-w-md">
                              <div className="flex items-start gap-3">
                                <span className={
                                  item.priority === 'Haute' 
                                  ? 'bg-orange-500/20 text-orange-700 border-orange-500/30'
                                  : item.priority === 'Moyenne' 
                                  ? 'bg-amber-500/20 text-amber-700 border-amber-500/30' 
                                  : 'bg-green-500/20 text-green-700 border-green-500/30'
                                }></span>
                                <span>{item.action}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="rounded-full px-2 py-1 text-xs">
                                {item.category}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <Badge 
                                variant={item.priority === 'Haute' ? 'destructive' : item.priority === 'Moyenne' ? 'secondary' : 'default'}
                                className="rounded-full px-2 py-1 text-xs"
                              >
                                {item.priority}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="bg-muted px-2 py-1 rounded-full text-xs">
                                {item.dueDate ? new Date(item.dueDate).toLocaleDateString('fr-FR') : item.deadline}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-xs font-bold text-primary-foreground border border-primary/20">
                                  {item.owner?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                </div>
                                <span className="text-sm">{item.owner}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages>1 && (
                      <div className="flex justify-center items-center gap-4 py-6">
                        <Button variant="outline" size="sm" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>Préc.</Button>
                        <span className="text-sm">Page {currentPage}/{totalPages}</span>
                        <Button variant="outline" size="sm" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}>Suiv.</Button>
                      </div>
                    )}
                    {actionPlan.length > 5 && !showAllActions && (
                      <div className="text-center py-4">
                        <Button variant="outline" onClick={() => setShowAllActions(true)} className="rounded-full">
                          Voir toutes les {actionPlan.length} actions
                        </Button>
                      </div>
                    )}
                    {showAllActions && (
                      <div className="text-center py-4">
                        <Button variant="secondary" onClick={() => setShowAllActions(false)} className="rounded-full">
                          Masquer la liste complète
                        </Button>
                      </div>
                    )}
                  </div>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des audits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
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
                <div className="mt-6 p-4 bg-accent border border-primary/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">À propos des rapports PDF</h4>
                      <p className="text-sm text-primary">
                        Les rapports générés incluent une analyse complète de votre audit avec :
                      </p>
                      <ul className="text-sm text-primary mt-2 space-y-1">
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
  );
}
export default function DashboardPage() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <DashboardSkeleton />;
  // L'admin pilote des clients : son accueil montre le portefeuille, pas un score personnel.
  if (session?.user?.role === 'admin') return <AdminCockpit />;
  return <PersonalDashboard />;
}
