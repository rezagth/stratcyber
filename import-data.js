const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🚀 Début de l\'importation des données vers PostgreSQL...');
    
    // Lire les données sauvegardées
    const backupFile = path.join(__dirname, 'backup-data.json');
    const data = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    
    console.log('📊 Données chargées du fichier de sauvegarde');
    
    // Ordre d'importation pour respecter les contraintes de clés étrangères
    const importOrder = [
      { name: 'users', data: data.users },
      { name: 'sessions', data: data.sessions },
      { name: 'audits', data: data.audits },
      { name: 'auditResponses', data: data.auditResponses },
      { name: 'reports', data: data.reports },
      { name: 'resources', data: data.resources },
      { name: 'ebooks', data: data.ebooks },
      { name: 'readingSessions', data: data.readingSessions },
      { name: 'ebookQuizzes', data: data.ebookQuizzes },
      { name: 'ebookQuizAttempts', data: data.ebookQuizAttempts },
      { name: 'chatHistories', data: data.chatHistories },
      { name: 'courses', data: data.courses },
      { name: 'courseModules', data: data.courseModules },
      { name: 'courseEnrollments', data: data.courseEnrollments },
      { name: 'learningProgress', data: data.learningProgress },
      { name: 'quizzes', data: data.quizzes },
      { name: 'quizQuestions', data: data.quizQuestions },
      { name: 'quizAttempts', data: data.quizAttempts },
      { name: 'certifications', data: data.certifications },
      { name: 'complianceFrameworks', data: data.complianceFrameworks },
      { name: 'securityAlerts', data: data.securityAlerts },
      { name: 'complianceDocuments', data: data.complianceDocuments },
      { name: 'documentSections', data: data.documentSections },
      { name: 'documentTemplates', data: data.documentTemplates },
      { name: 'actionPlans', data: data.actionPlans },
      { name: 'actionTasks', data: data.actionTasks },
      { name: 'complianceChecklists', data: data.complianceChecklists },
      { name: 'checklistItems', data: data.checklistItems },
      { name: 'riskAssessments', data: data.riskAssessments },
      { name: 'threatScenarios', data: data.threatScenarios },
      { name: 'vulnerabilities', data: data.vulnerabilities },
      { name: 'policyDocuments', data: data.policyDocuments },
      { name: 'incidentReports', data: data.incidentReports },
      { name: 'strategicActions', data: data.strategicActions },
      { name: 'strategicMilestones', data: data.strategicMilestones },
      { name: 'roadmapQuarters', data: data.roadmapQuarters },
      { name: 'complianceScores', data: data.complianceScores },
      { name: 'legalRiskAssessments', data: data.legalRiskAssessments },
    ];

    let totalImported = 0;

    for (const table of importOrder) {
      if (table.data && table.data.length > 0) {
        console.log(`📝 Importation de ${table.data.length} enregistrements pour ${table.name}...`);
        
        try {
          for (const record of table.data) {
            // Convertir les dates au format approprié
            const convertedRecord = convertDates(record);
            
            switch (table.name) {
              case 'users':
                await prisma.user.create({ data: convertedRecord });
                break;
              case 'sessions':
                await prisma.session.create({ data: convertedRecord });
                break;
              case 'audits':
                await prisma.audit.create({ data: convertedRecord });
                break;
              case 'auditResponses':
                await prisma.auditResponse.create({ data: convertedRecord });
                break;
              case 'reports':
                await prisma.report.create({ data: convertedRecord });
                break;
              case 'resources':
                await prisma.resource.create({ data: convertedRecord });
                break;
              case 'ebooks':
                await prisma.ebook.create({ data: convertedRecord });
                break;
              case 'readingSessions':
                await prisma.readingSession.create({ data: convertedRecord });
                break;
              case 'ebookQuizzes':
                await prisma.ebookQuiz.create({ data: convertedRecord });
                break;
              case 'ebookQuizAttempts':
                await prisma.ebookQuizAttempt.create({ data: convertedRecord });
                break;
              case 'chatHistories':
                await prisma.chatHistory.create({ data: convertedRecord });
                break;
              case 'courses':
                await prisma.course.create({ data: convertedRecord });
                break;
              case 'courseModules':
                await prisma.courseModule.create({ data: convertedRecord });
                break;
              case 'courseEnrollments':
                await prisma.courseEnrollment.create({ data: convertedRecord });
                break;
              case 'learningProgress':
                await prisma.learningProgress.create({ data: convertedRecord });
                break;
              case 'quizzes':
                await prisma.quiz.create({ data: convertedRecord });
                break;
              case 'quizQuestions':
                await prisma.quizQuestion.create({ data: convertedRecord });
                break;
              case 'quizAttempts':
                await prisma.quizAttempt.create({ data: convertedRecord });
                break;
              case 'certifications':
                await prisma.certification.create({ data: convertedRecord });
                break;
              case 'complianceFrameworks':
                await prisma.complianceFramework.create({ data: convertedRecord });
                break;
              case 'securityAlerts':
                await prisma.securityAlert.create({ data: convertedRecord });
                break;
              case 'complianceDocuments':
                await prisma.complianceDocument.create({ data: convertedRecord });
                break;
              case 'documentSections':
                await prisma.documentSection.create({ data: convertedRecord });
                break;
              case 'documentTemplates':
                await prisma.documentTemplate.create({ data: convertedRecord });
                break;
              case 'actionPlans':
                await prisma.actionPlan.create({ data: convertedRecord });
                break;
              case 'actionTasks':
                await prisma.actionTask.create({ data: convertedRecord });
                break;
              case 'complianceChecklists':
                await prisma.complianceChecklist.create({ data: convertedRecord });
                break;
              case 'checklistItems':
                await prisma.checklistItem.create({ data: convertedRecord });
                break;
              case 'riskAssessments':
                await prisma.riskAssessment.create({ data: convertedRecord });
                break;
              case 'threatScenarios':
                await prisma.threatScenario.create({ data: convertedRecord });
                break;
              case 'vulnerabilities':
                await prisma.vulnerability.create({ data: convertedRecord });
                break;
              case 'policyDocuments':
                await prisma.policyDocument.create({ data: convertedRecord });
                break;
              case 'incidentReports':
                await prisma.incidentReport.create({ data: convertedRecord });
                break;
              case 'strategicActions':
                await prisma.strategicAction.create({ data: convertedRecord });
                break;
              case 'strategicMilestones':
                await prisma.strategicMilestone.create({ data: convertedRecord });
                break;
              case 'roadmapQuarters':
                await prisma.roadmapQuarter.create({ data: convertedRecord });
                break;
              case 'complianceScores':
                await prisma.complianceScore.create({ data: convertedRecord });
                break;
              case 'legalRiskAssessments':
                await prisma.legalRiskAssessment.create({ data: convertedRecord });
                break;
            }
          }
          
          totalImported += table.data.length;
          console.log(`✅ ${table.name}: ${table.data.length} enregistrements importés`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'importation de ${table.name}:`, error.message);
          // Continuer avec la table suivante en cas d'erreur
        }
      } else {
        console.log(`⏭️  ${table.name}: aucun enregistrement à importer`);
      }
    }

    console.log(`\n🎉 Importation terminée !`);
    console.log(`📊 Total: ${totalImported} enregistrements importés`);
    
  } catch (error) {
    console.error('❌ Erreur générale lors de l\'importation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function convertDates(record) {
  const converted = { ...record };
  
  // Champs de date communs
  const dateFields = [
    'createdAt', 'updatedAt', 'expires', 'enrolledAt', 'completedAt',
    'lastAccessedAt', 'startedAt', 'issuedAt', 'expiresAt', 'approvedDate',
    'reviewDate', 'detectedAt', 'reportedAt', 'resolvedAt', 'startDate',
    'endDate', 'dueDate', 'lastReviewed', 'nextReview', 'lastUpdated',
    'nextReviewDate', 'lastReadAt'
  ];
  
  for (const field of dateFields) {
    if (converted[field]) {
      converted[field] = new Date(converted[field]);
    }
  }
  
  return converted;
}

importData().catch(console.error);
