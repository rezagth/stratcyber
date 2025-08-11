const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🚀 Début de l\'export des données...');
    
    const data = {
      users: await prisma.user.findMany(),
      sessions: await prisma.session.findMany(),
      audits: await prisma.audit.findMany(),
      auditResponses: await prisma.auditResponse.findMany(),
      reports: await prisma.report.findMany(),
      resources: await prisma.resource.findMany(),
      ebooks: await prisma.ebook.findMany(),
      readingSessions: await prisma.readingSession.findMany(),
      ebookQuizzes: await prisma.ebookQuiz.findMany(),
      ebookQuizAttempts: await prisma.ebookQuizAttempt.findMany(),
      chatHistories: await prisma.chatHistory.findMany(),
      courses: await prisma.course.findMany(),
      courseModules: await prisma.courseModule.findMany(),
      courseEnrollments: await prisma.courseEnrollment.findMany(),
      learningProgress: await prisma.learningProgress.findMany(),
      quizzes: await prisma.quiz.findMany(),
      quizQuestions: await prisma.quizQuestion.findMany(),
      quizAttempts: await prisma.quizAttempt.findMany(),
      certifications: await prisma.certification.findMany(),
      complianceFrameworks: await prisma.complianceFramework.findMany(),
      securityAlerts: await prisma.securityAlert.findMany(),
      complianceDocuments: await prisma.complianceDocument.findMany(),
      documentSections: await prisma.documentSection.findMany(),
      documentTemplates: await prisma.documentTemplate.findMany(),
      actionPlans: await prisma.actionPlan.findMany(),
      actionTasks: await prisma.actionTask.findMany(),
      complianceChecklists: await prisma.complianceChecklist.findMany(),
      checklistItems: await prisma.checklistItem.findMany(),
      riskAssessments: await prisma.riskAssessment.findMany(),
      threatScenarios: await prisma.threatScenario.findMany(),
      vulnerabilities: await prisma.vulnerability.findMany(),
      policyDocuments: await prisma.policyDocument.findMany(),
      incidentReports: await prisma.incidentReport.findMany(),
      strategicActions: await prisma.strategicAction.findMany(),
      strategicMilestones: await prisma.strategicMilestone.findMany(),
      roadmapQuarters: await prisma.roadmapQuarter.findMany(),
      complianceScores: await prisma.complianceScore.findMany(),
      legalRiskAssessments: await prisma.legalRiskAssessment.findMany(),
    };

    // Compter le nombre total d'enregistrements
    const totalRecords = Object.values(data).reduce((sum, table) => sum + table.length, 0);
    console.log(`📊 Total des enregistrements trouvés: ${totalRecords}`);
    
    // Afficher les statistiques par table
    console.log('\n📋 Statistiques par table:');
    Object.entries(data).forEach(([tableName, records]) => {
      console.log(`  ${tableName}: ${records.length} enregistrements`);
    });

    // Sauvegarder les données dans un fichier JSON
    const backupFile = path.join(__dirname, 'backup-data.json');
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    
    console.log(`\n💾 Données exportées vers: ${backupFile}`);
    console.log('✅ Export terminé avec succès !');
    
    return data;
  } catch (error) {
    console.error('❌ Erreur lors de l\'export:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData().catch(console.error);
