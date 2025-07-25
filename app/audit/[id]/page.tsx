import React from 'react';
import { prisma } from '../../../lib/db';
import RadarChart from '../../../components/charts/RadarChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getAudit(id: string) {
  return prisma.audit.findUnique({
    where: { id },
    include: { responses: true },
  });
}

export default async function AuditDetailPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) return <div className="text-center py-8">Audit introuvable.</div>;

  // Regrouper les scores par catégorie
  const scoresByCategory: Record<string, number> = {};
  audit.responses.forEach(r => {
    scoresByCategory[r.category] = (scoresByCategory[r.category] || 0) + (r.score || 0);
  });

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Détail de l&apos;audit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:gap-8 mb-4">
            <div className="flex-1 space-y-2">
              <div>Date : <Badge variant="secondary">{new Date(audit.createdAt).toLocaleDateString()}</Badge></div>
              <div>Score global : <span className="font-bold text-primary">{audit.score} / 100</span></div>
              <div>Maturité : <Badge>{audit.maturity}</Badge></div>
            </div>
            <div className="flex-1">
              <RadarChart scores={scoresByCategory} />
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Feuille de route & recommandations</h2>
            <ol className="relative border-l border-primary/30 ml-2">
              {audit.recommendations?.split('\n').map((item, i) => (
                <li key={i} className="mb-6 ml-4">
                  <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-white" />
                  <span className="font-semibold">Étape {i + 1} :</span> {item}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Réponses détaillées</h2>
            <ul className="list-disc pl-6 space-y-1">
              {audit.responses.map(r => (
                <li key={r.id}><span className="font-semibold">{r.question}</span> : {r.answer} (score {r.score})</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 