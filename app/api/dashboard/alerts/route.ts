import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '../../auth/[...nextauth]/route';

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'incident' | 'compliance' | 'security' | 'progress';
  severity: 'info' | 'warning' | 'error' | 'success';
  date: Date;
  actionRequired?: boolean;
  relatedEntity?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const alerts: Alert[] = [];
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Alertes d'échéances - Actions stratégiques
    const upcomingActions = await prisma.strategicAction.findMany({
      where: {
        audit: { userId: session.user.id },
        dueDate: {
          gte: now,
          lte: oneMonth
        },
        status: { not: 'Terminé' }
      },
      orderBy: { dueDate: 'asc' }
    });

    upcomingActions.forEach(action => {
      const daysUntilDue = Math.ceil((action.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let severity: 'info' | 'warning' | 'error' = 'info';
      
      if (daysUntilDue <= 3) severity = 'error';
      else if (daysUntilDue <= 7) severity = 'warning';
      
      alerts.push({
        id: `action-${action.id}`,
        title: 'Échéance Action Stratégique',
        message: `"${action.title}" doit être terminée dans ${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''}`,
        type: 'deadline',
        severity,
        date: action.dueDate,
        actionRequired: daysUntilDue <= 7,
        relatedEntity: action.id
      });
    });

    // Alertes d'échéances - Jalons
    const upcomingMilestones = await prisma.strategicMilestone.findMany({
      where: {
        audit: { userId: session.user.id },
        dueDate: {
          gte: now,
          lte: oneMonth
        },
        status: { not: 'Terminé' }
      },
      orderBy: { dueDate: 'asc' }
    });

    upcomingMilestones.forEach(milestone => {
      const daysUntilDue = Math.ceil((milestone.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let severity: 'info' | 'warning' | 'error' = 'info';
      
      if (daysUntilDue <= 5) severity = 'error';
      else if (daysUntilDue <= 10) severity = 'warning';
      
      alerts.push({
        id: `milestone-${milestone.id}`,
        title: 'Échéance Jalon Stratégique',
        message: `Jalon "${milestone.title}" prévu dans ${daysUntilDue} jour${daysUntilDue > 1 ? 's' : ''}`,
        type: 'deadline',
        severity,
        date: milestone.dueDate,
        actionRequired: daysUntilDue <= 10,
        relatedEntity: milestone.id
      });
    });

    // Alertes d'incidents critiques non résolus
    const criticalIncidents = await prisma.incidentReport.findMany({
      where: {
        severity: 'critical',
        status: { in: ['open', 'investigating'] }
      },
      orderBy: { reportedAt: 'desc' }
    });

    criticalIncidents.forEach(incident => {
      const daysSinceReported = Math.floor((now.getTime() - incident.reportedAt.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `incident-${incident.id}`,
        title: 'Incident Critique Non Résolu',
        message: `Incident "${incident.title}" ouvert depuis ${daysSinceReported} jour${daysSinceReported > 1 ? 's' : ''}`,
        type: 'incident',
        severity: 'error',
        date: incident.reportedAt,
        actionRequired: true,
        relatedEntity: incident.id
      });
    });

    // Alertes de vulnérabilités critiques
    const criticalVulnerabilities = await prisma.vulnerability.findMany({
      where: {
        severity: 'critical',
        status: 'open'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    criticalVulnerabilities.forEach(vuln => {
      const daysSinceDetected = Math.floor((now.getTime() - vuln.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `vuln-${vuln.id}`,
        title: 'Vulnérabilité Critique',
        message: `"${vuln.name}" détectée il y a ${daysSinceDetected} jour${daysSinceDetected > 1 ? 's' : ''}`,
        type: 'security',
        severity: 'error',
        date: vuln.createdAt,
        actionRequired: true,
        relatedEntity: vuln.id
      });
    });

    // Alertes de conformité - Actions en retard
    const overdueActions = await prisma.strategicAction.findMany({
      where: {
        audit: { userId: session.user.id },
        dueDate: { lt: now },
        status: { not: 'Terminé' }
      },
      orderBy: { dueDate: 'asc' },
      take: 10
    });

    overdueActions.forEach(action => {
      const daysOverdue = Math.floor((now.getTime() - action.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `overdue-${action.id}`,
        title: 'Action en Retard',
        message: `"${action.title}" en retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}`,
        type: 'deadline',
        severity: 'error',
        date: action.dueDate,
        actionRequired: true,
        relatedEntity: action.id
      });
    });

    // Alertes de progrès - Actions bloquées (0% depuis plus de 7 jours)
    const stalledActions = await prisma.strategicAction.findMany({
      where: {
        audit: { userId: session.user.id },
        progress: 0,
        status: 'En cours',
        createdAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      },
      take: 5
    });

    stalledActions.forEach(action => {
      const daysSinceCreated = Math.floor((now.getTime() - action.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `stalled-${action.id}`,
        title: 'Action Sans Progrès',
        message: `"${action.title}" aucun progrès depuis ${daysSinceCreated} jour${daysSinceCreated > 1 ? 's' : ''}`,
        type: 'progress',
        severity: 'warning',
        date: action.createdAt,
        actionRequired: true,
        relatedEntity: action.id
      });
    });

    // Alertes de conformité réglementaire
    const lastAudit = await prisma.audit.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { complianceScores: true }
    });

    if (lastAudit?.complianceScores) {
      lastAudit.complianceScores.forEach(compliance => {
        if (compliance.score < 60) { // Score de conformité faible
          alerts.push({
            id: `compliance-${compliance.id}`,
            title: 'Conformité Réglementaire Faible',
            message: `Score de conformité ${compliance.regulation}: ${Math.round(compliance.score)}%`,
            type: 'compliance',
            severity: compliance.score < 40 ? 'error' : 'warning',
            date: lastAudit.createdAt,
            actionRequired: compliance.score < 50,
            relatedEntity: compliance.id
          });
        }
      });
    }

    // Alertes de sécurité non résolues
    const unresolvedSecurityAlerts = await prisma.securityAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    unresolvedSecurityAlerts.forEach(secAlert => {
      const daysSinceCreated = Math.floor((now.getTime() - secAlert.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `sec-alert-${secAlert.id}`,
        title: 'Alerte Sécurité Non Résolue',
        message: `"${secAlert.title}" non résolue depuis ${daysSinceCreated} jour${daysSinceCreated > 1 ? 's' : ''}`,
        type: 'security',
        severity: secAlert.severity === 'critical' ? 'error' : secAlert.severity === 'high' ? 'warning' : 'info',
        date: secAlert.createdAt,
        actionRequired: ['critical', 'high'].includes(secAlert.severity),
        relatedEntity: secAlert.id
      });
    });

    // Notifications positives
    const recentCompletedActions = await prisma.strategicAction.findMany({
      where: {
        audit: { userId: session.user.id },
        status: 'Terminé',
        updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { updatedAt: 'desc' },
      take: 3
    });

    recentCompletedActions.forEach(action => {
      alerts.push({
        id: `completed-${action.id}`,
        title: 'Action Terminée',
        message: `"${action.title}" a été terminée avec succès`,
        type: 'progress',
        severity: 'success',
        date: action.updatedAt,
        actionRequired: false,
        relatedEntity: action.id
      });
    });

    // Trier les alertes par priorité et date
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { error: 3, warning: 2, info: 1, success: 0 };
      const priorityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (priorityDiff !== 0) return priorityDiff;
      return b.date.getTime() - a.date.getTime();
    });

    // Limiter à 20 alertes maximum
    const finalAlerts = sortedAlerts.slice(0, 20);

    return NextResponse.json({
      alerts: finalAlerts,
      summary: {
        total: finalAlerts.length,
        byType: {
          deadline: finalAlerts.filter(a => a.type === 'deadline').length,
          incident: finalAlerts.filter(a => a.type === 'incident').length,
          compliance: finalAlerts.filter(a => a.type === 'compliance').length,
          security: finalAlerts.filter(a => a.type === 'security').length,
          progress: finalAlerts.filter(a => a.type === 'progress').length
        },
        bySeverity: {
          error: finalAlerts.filter(a => a.severity === 'error').length,
          warning: finalAlerts.filter(a => a.severity === 'warning').length,
          info: finalAlerts.filter(a => a.severity === 'info').length,
          success: finalAlerts.filter(a => a.severity === 'success').length
        },
        requiresAction: finalAlerts.filter(a => a.actionRequired).length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la génération des alertes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des alertes' },
      { status: 500 }
    );
  }
}
