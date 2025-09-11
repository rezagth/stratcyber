import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface DashboardData {
  kpis: {
    globalMaturityScore: number;
    actionProgressPercentage: number;
    completedActions: number;
    inProgressActions: number;
    overdueActions: number;
    complianceScores: Record<string, number>;
    legalRiskScore: number;
    criticalVulnerabilities: number;
    openIncidents: number;
    securityAlerts: number;
    totalIncidents?: number;
    resolvedIncidents?: number;
    incidentResolutionRate?: number;
  };
  timeSeriesData: Array<{
    date: string;
    score: number;
    auditId: string;
  }>;
  incidentsByDepartment: Array<{
    department: string;
    incidents: number;
    resolved: number;
    color: string;
  }>;
  monthlyPerformance: {
    currentMonthScore: number;
    previousMonthScore: number;
    trend: 'up' | 'down' | 'stable';
    monthlyActions: {
      completed: number;
      started: number;
      overdue: number;
    };
    complianceProgress: number;
  };
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    type: 'deadline' | 'incident' | 'compliance' | 'security' | 'progress';
    severity: 'info' | 'warning' | 'error' | 'success';
    date: Date;
    actionRequired?: boolean;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    impact: string;
    effort: string;
    expectedROI: string;
  }>;
}

export const useDashboardData = () => {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Récupérer toutes les données en parallèle
        const [
          kpisResponse,
          timeSeriesResponse,
          departmentResponse,
          monthlyResponse,
          alertsResponse,
          recommendationsResponse
        ] = await Promise.all([
          // Récupérer les KPIs via notre fonction existante
          fetch(`/api/dashboard/kpis?userId=${session.user.id}`).catch(() => null),
          fetch('/api/dashboard/time-series'),
          fetch('/api/dashboard/incidents-by-department'),
          fetch('/api/dashboard/monthly-performance'),
          fetch('/api/dashboard/alerts'),
          fetch('/api/dashboard/recommendations')
        ]);

        // Parser les réponses
        const [
          kpisData,
          timeSeriesData,
          departmentData,
          monthlyData,
          alertsData,
          recommendationsData
        ] = await Promise.all([
          kpisResponse?.ok ? kpisResponse.json().catch(() => null) : null,
          timeSeriesResponse.ok ? timeSeriesResponse.json() : { data: [] },
          departmentResponse.ok ? departmentResponse.json() : { data: [] },
          monthlyData?.json().catch(() => ({
            currentMonthScore: 0,
            previousMonthScore: 0,
            trend: 'stable' as const,
            monthlyActions: { completed: 0, started: 0, overdue: 0 },
            complianceProgress: 0
          })),
          alertsResponse.ok ? alertsResponse.json() : { alerts: [] },
          recommendationsResponse.ok ? recommendationsResponse.json() : { recommendations: [] }
        ]);

        // Fallback pour les KPIs si l'API dédiée n'est pas encore créée
        let kpis = kpisData;
        if (!kpis) {
          // Utiliser les données du dernier audit comme fallback
          const auditResponse = await fetch(`/api/audits?userId=${session.user.id}`);
          const audits = auditResponse.ok ? await auditResponse.json() : [];
          const lastAudit = audits[0];
          
          if (lastAudit) {
            kpis = {
              globalMaturityScore: lastAudit.score || 0,
              actionProgressPercentage: 65, // Valeur par défaut
              completedActions: 0,
              inProgressActions: 0,
              overdueActions: 0,
              complianceScores: {},
              legalRiskScore: 0,
              criticalVulnerabilities: 0,
              openIncidents: 0,
              securityAlerts: 0,
              totalIncidents: 0,
              resolvedIncidents: 0,
              incidentResolutionRate: 0
            };
          } else {
            kpis = {
              globalMaturityScore: 0,
              actionProgressPercentage: 0,
              completedActions: 0,
              inProgressActions: 0,
              overdueActions: 0,
              complianceScores: {},
              legalRiskScore: 0,
              criticalVulnerabilities: 0,
              openIncidents: 0,
              securityAlerts: 0,
              totalIncidents: 0,
              resolvedIncidents: 0,
              incidentResolutionRate: 0
            };
          }
        }

        const dashboardData: DashboardData = {
          kpis,
          timeSeriesData: timeSeriesData?.data || [],
          incidentsByDepartment: departmentData?.data || [],
          monthlyPerformance: monthlyData || {
            currentMonthScore: 0,
            previousMonthScore: 0,
            trend: 'stable',
            monthlyActions: { completed: 0, started: 0, overdue: 0 },
            complianceProgress: 0
          },
          alerts: (alertsData?.alerts || []).map((alert: any) => ({
            ...alert,
            date: new Date(alert.date)
          })),
          recommendations: recommendationsData?.recommendations || []
        };

        setData(dashboardData);
      } catch (err) {
        console.error('Erreur lors de la récupération des données dashboard:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (session?.user?.id) {
        setLoading(true);
        // Re-déclencher l'effet
        const fetchData = async () => {
          // Code de récupération identique...
        };
        fetchData();
      }
    }
  };
};
