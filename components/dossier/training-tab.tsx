'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ReadingSession = { ebookId: string; progress: number; completed: boolean; timeSpent: number; lastReadAt: string; ebook: { title: string } };
type QuizAttempt = { quizId: string; score: number; passed: boolean; completedAt: string; quiz: { title: string; ebook: { title: string } } };
type Employee = {
  id: string; name: string | null; email: string;
  ebooksCompleted: number; ebooksInProgress: number; quizzesPassed: number;
  readingSessions: ReadingSession[]; quizAttempts: QuizAttempt[];
};
type Dashboard = { catalogSize: number; employees: Employee[] };

export function TrainingTab({ organizationId }: { organizationId: string }) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    fetch(`/api/organizations/${organizationId}/training`).then((r) => r.json()).then(setDashboard);
  }, [organizationId]);

  return (
    <div className="space-y-4">
      {dashboard && (
        <p className="text-sm text-muted-foreground">
          Catalogue commun : {dashboard.catalogSize} ebook{dashboard.catalogSize > 1 ? 's' : ''} publié{dashboard.catalogSize > 1 ? 's' : ''}.
        </p>
      )}

      <ul className="space-y-3">
        {dashboard?.employees.map((emp) => (
          <li key={emp.id}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{emp.name ?? emp.email}</CardTitle>
                  <Badge variant="outline">{emp.ebooksCompleted} ebook{emp.ebooksCompleted > 1 ? 's' : ''} terminé{emp.ebooksCompleted > 1 ? 's' : ''}</Badge>
                  <Badge variant="outline">{emp.ebooksInProgress} en cours</Badge>
                  <Badge variant={emp.quizzesPassed > 0 ? 'default' : 'secondary'}>{emp.quizzesPassed} quiz réussi{emp.quizzesPassed > 1 ? 's' : ''}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{emp.email}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {emp.readingSessions.map((s) => (
                  <p key={s.ebookId} className="text-xs">
                    {s.ebook.title} — {s.completed ? 'Terminé' : `${Math.round(s.progress)}%`}
                    {' · '}dernière lecture le {new Date(s.lastReadAt).toLocaleDateString('fr-FR')}
                  </p>
                ))}
                {emp.quizAttempts.map((a, i) => (
                  <p key={i} className="text-xs">
                    Quiz « {a.quiz.title} » ({a.quiz.ebook.title}) — {a.score}%
                    {' '}<Badge variant={a.passed ? 'default' : 'destructive'} className="ml-1">{a.passed ? 'Réussi' : 'Non réussi'}</Badge>
                    {' · '}{new Date(a.completedAt).toLocaleDateString('fr-FR')}
                  </p>
                ))}
                {emp.readingSessions.length === 0 && emp.quizAttempts.length === 0 && (
                  <p className="text-xs text-muted-foreground">Aucune activité de formation pour le moment.</p>
                )}
              </CardContent>
            </Card>
          </li>
        ))}
        {dashboard?.employees.length === 0 && <p className="text-sm text-muted-foreground">Aucun compte client rattaché à cette organisation.</p>}
      </ul>
    </div>
  );
}
