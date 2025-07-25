import React from 'react';
import { prisma } from '../../lib/db';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import RadarChart from '../../components/charts/RadarChart';
import BarChart from '../../components/charts/BarChart';
import { AlertCircle, Download } from 'lucide-react';
import { generateActionPlan, computeAuditResult, calculateCrazyScore } from '../../lib/audit/scoring';

async function getAudits(userId: string) {
  return prisma.audit.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { responses: true },
  });
}

export default async function DashboardPage() {
  // TODO: remplacer par l'ID utilisateur réel (auth à intégrer)
  const userId = 'demo-user-id';
  const audits = await getAudits(userId);
  const lastAudit = audits[0];
  
  // Utiliser computeAuditResult pour obtenir les scores
  const auditResult = lastAudit ? computeAuditResult(
    lastAudit.responses.map(r => ({
      questionId: r.question,
      answer: r.answer,
      score: r.score || 0
    }))
  ) : null;
  const scores = auditResult ? auditResult.scoresByCategory : {
    Gouvernance: 0,
    Technique: 0,
    Organisationnel: 0,
    GRC: 0,
    Sensibilisation: 0,
    RGPD: 0,
  };
  
  // Calculer le Crazy Score
  const crazyScore = auditResult ? calculateCrazyScore(auditResult) : null;
  
  const actionPlan = lastAudit ? generateActionPlan({
    globalScore: auditResult?.globalScore || 0,
    scoresByCategory: scores,
    maturity: auditResult?.maturity || '',
    recommendations: lastAudit.recommendations?.split('\n') || [],
    roadmap: [],
  }) : [];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Mon tableau de bord cybersécurité</h1>
      {audits.length === 0 ? (
        <div className="text-center text-muted-foreground">Aucun audit réalisé pour l&apos;instant.</div>
      ) : (
        <>
          {/* Crazy Score - Indicateur ludique */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Crazy Score {crazyScore?.emoji}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className="text-5xl font-bold mb-2">
                  {crazyScore?.score || 0}
                </div>
                <div className="text-xl font-semibold text-primary">
                  {crazyScore?.label || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground mt-2 text-center max-w-md">
                  Le Crazy Score est un indicateur ludique qui combine votre score global avec des bonus/malus en fonction des domaines critiques et conformes.
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Indicateurs clés de performance */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Score Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {auditResult?.globalScore || 0}%
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Maturité: {auditResult?.maturity || 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Conformité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {Object.values(scores).filter(score => score >= 70).length} / {Object.keys(scores).length}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Domaines conformes
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Points Critiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center text-destructive">
                  {Object.values(scores).filter(score => score < 40).length}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Domaines à risque
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Progression</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center text-green-600">
                  {lastAudit && audits.length > 1 ? 
                    `${(((auditResult?.globalScore || 0) - (computeAuditResult(
                      audits[1].responses.map(r => ({
                        questionId: r.question,
                        answer: r.answer,
                        score: r.score || 0
                      }))
                    )?.globalScore || 0)) / (computeAuditResult(
                      audits[1].responses.map(r => ({
                        questionId: r.question,
                        answer: r.answer,
                        score: r.score || 0
                      }))
                    )?.globalScore || 1) * 100).toFixed(1)}%` : 
                    'N/A'}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Depuis dernier audit
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cartographie des risques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Radar des risques</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="text-xs text-muted-foreground">Votre score</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <span className="text-xs text-muted-foreground">Idéal</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <RadarChart scores={scores} />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Plus la surface est grande, meilleure est votre maturité cyber
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Barres par domaine</CardTitle>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    Seuil critique: 40%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <BarChart scores={scores} />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Les barres rouges indiquent les domaines nécessitant une attention immédiate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Synthèse par domaine */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Object.entries(scores).map(([cat, score]) => {
              const numScore = Number(score);
              return (
                <Card key={cat} className={`${numScore < 40 ? 'border-destructive/50' : numScore < 70 ? 'border-amber-500/50' : 'border-green-500/50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{cat}</span>
                      <Badge variant={numScore < 40 ? 'destructive' : numScore < 70 ? 'secondary' : 'default'} className="ml-2">
                        {numScore < 40 ? 'Critique' : numScore < 70 ? 'À améliorer' : 'Conforme'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold">{numScore}<span className="text-lg font-normal text-muted-foreground">/100</span></div>
                      <div className="flex-1 bg-muted rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${numScore < 40 ? 'bg-destructive' : numScore < 70 ? 'bg-amber-500' : 'bg-green-500'}`} 
                          style={{ width: `${numScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Feuille de route (timeline) */}
          <Card>
            <CardHeader>
              <CardTitle>Feuille de route priorisée</CardTitle>
            </CardHeader>
            <CardContent>
              {actionPlan.length === 0 ? (
                <div className="text-center text-muted-foreground">Aucune action à afficher.</div>
              ) : (
                <ol className="relative border-l border-primary/30 ml-2">
                  {actionPlan.slice(0, 5).map((item, i) => (
                    <li key={i} className="mb-8 ml-4">
                      <div className={`absolute w-4 h-4 rounded-full -left-2 border-2 border-white ${item.priority === 'Haute' ? 'bg-destructive' : item.priority === 'Moyenne' ? 'bg-amber-500' : 'bg-green-500'}`} />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg">Étape {i + 1}</span>
                          <Badge variant={item.priority === 'Haute' ? 'destructive' : item.priority === 'Moyenne' ? 'secondary' : 'default'}>
                            {item.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">• {item.deadline}</span>
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
                    <div className="text-center text-primary font-semibold mt-4">
                      + {actionPlan.length - 5} autres actions (voir plan détaillé ci-dessous)
                    </div>
                  )}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Plan d'action détaillé */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plan d&apos;action détaillé</CardTitle>
              <div className="text-sm text-muted-foreground">
                {actionPlan.length} actions identifiées
              </div>
            </CardHeader>
            <CardContent>
              {actionPlan.length === 0 ? (
                <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <h3 className="font-semibold">Aucune action à afficher</h3>
                    <p>Vérifiez que vos scores sont bien pris en compte dans le formulaire d&apos;audit.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        Toutes ({actionPlan.length})
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-destructive/10">
                        Haute priorité ({actionPlan.filter(a => a.priority === 'Haute').length})
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer hover:bg-amber-500/10">
                        Moyenne priorité ({actionPlan.filter(a => a.priority === 'Moyenne').length})
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Exporter
                      </Button>
                    </div>
                  </div>
                  <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium rounded-tl-lg">#</th>
                        <th className="text-left p-3 font-medium">Action</th>
                        <th className="text-left p-3 font-medium">Domaine</th>
                        <th className="text-left p-3 font-medium">Priorité</th>
                        <th className="text-left p-3 font-medium">Deadline</th>
                        <th className="text-left p-3 font-medium rounded-tr-lg">Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actionPlan.map((item, i) => (
                        <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-medium">{item.action}</td>
                          <td className="p-3">
                            <Badge variant="secondary">{item.category}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={item.priority === 'Haute' ? 'destructive' : 'secondary'}>
                              {item.priority}
                            </Badge>
                          </td>
                          <td className="p-3">{item.deadline}</td>
                          <td className="p-3">
                            <Badge variant="outline">{item.owner}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Historique des audits */}
          <Card>
            <CardHeader>
              <CardTitle>Historique de mes audits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {audits.map(audit => (
                  <li key={audit.id} className="flex items-center gap-2">
                    <Badge variant="secondary">{new Date(audit.createdAt).toLocaleDateString()}</Badge>
                    <span>Score : <span className="font-bold">{audit.score}</span></span>
                    <span>Maturité : <Badge>{audit.maturity}</Badge></span>
                    <Link href={`/audit/${audit.id}`} className="btn btn-sm btn-primary">Détail</Link>
                    <Link href={`/audit/${audit.id}/pdf`} className="btn btn-sm btn-secondary">PDF</Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}