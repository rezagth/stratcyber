/**
 * Script de test pour vérifier le flux complet :
 * 1. Soumission d'un audit
 * 2. Génération des données stratégiques
 * 3. Récupération via l'API strategic
 * 
 * Usage: node test-strategic-flow.js
 */

const BASE_URL = 'http://localhost:3000';

// Données d'audit de test
const testAuditData = {
  responses: [
    {
      question: "gov_1",
      answer: "Non",
      category: "Gouvernance",
      score: 1
    },
    {
      question: "tech_1", 
      answer: "Partiellement",
      category: "Technique",
      score: 2
    },
    {
      question: "org_1",
      answer: "Oui",
      category: "Organisationnel", 
      score: 4
    },
    {
      question: "rgpd_1",
      answer: "Non",
      category: "RGPD",
      score: 0
    },
    {
      question: "nis2_1",
      answer: "Partiellement",
      category: "NIS2", 
      score: 2
    }
  ],
  companyProfile: {
    name: "Test Company",
    sector: "Services",
    size: "PME"
  },
  score: 45,
  maturity: "Moyenne",
  recommendations: ["Améliorer la gouvernance", "Renforcer la sécurité technique"]
};

async function testStrategicFlow() {
  console.log('🚀 Démarrage du test du flux stratégique...\n');

  try {
    // 1. Test de soumission d'audit
    console.log('1️⃣ Soumission de l\'audit de test...');
    const submitResponse = await fetch(`${BASE_URL}/api/audit/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAuditData)
    });

    if (!submitResponse.ok) {
      console.error('❌ Erreur lors de la soumission:', await submitResponse.text());
      return;
    }

    const submitResult = await submitResponse.json();
    console.log('✅ Audit soumis avec succès, ID:', submitResult.audit.id);

    const auditId = submitResult.audit.id;

    // 2. Vérifier la génération des données stratégiques
    console.log('\n2️⃣ Vérification de la génération des données stratégiques...');
    
    // Attendre un peu pour que la génération se termine
    await new Promise(resolve => setTimeout(resolve, 2000));

    const strategicResponse = await fetch(`${BASE_URL}/api/strategic?auditId=${auditId}`);
    
    if (!strategicResponse.ok) {
      console.error('❌ Erreur lors de la récupération des données stratégiques:', await strategicResponse.text());
      return;
    }

    const strategicData = await strategicResponse.json();
    console.log('✅ Données stratégiques récupérées avec succès');

    // 3. Vérifier la structure des données
    console.log('\n3️⃣ Analyse de la structure des données...');
    console.log(`📊 Audit score: ${strategicData.audit.score}%`);
    console.log(`📈 Maturity: ${strategicData.audit.maturity}`);
    console.log(`🎯 Actions stratégiques: ${strategicData.strategicActions.length}`);
    console.log(`🏁 Jalons: ${strategicData.milestones.length}`);
    console.log(`📅 Données roadmap: ${strategicData.roadmapData.length} trimestres`);
    console.log(`⚖️ Scores de conformité: ${strategicData.complianceScores.length}`);
    console.log(`🚨 Évaluation risque légal: ${strategicData.legalRiskAssessment ? 'Oui' : 'Non'}`);

    if (strategicData.legalRiskAssessment) {
      console.log(`   - Niveau de risque: ${strategicData.legalRiskAssessment.riskLevel}`);
      console.log(`   - Score global: ${strategicData.legalRiskAssessment.overallScore}%`);
      console.log(`   - Tendance: ${strategicData.legalRiskAssessment.trendDirection}`);
    }

    // 4. Vérifier quelques actions stratégiques
    if (strategicData.strategicActions.length > 0) {
      console.log('\n4️⃣ Exemples d\'actions stratégiques générées:');
      strategicData.strategicActions.slice(0, 3).forEach((action, index) => {
        console.log(`   ${index + 1}. ${action.title} (${action.category} - ${action.priority})`);
        console.log(`      Échéance: ${new Date(action.dueDate).toLocaleDateString('fr-FR')}`);
        console.log(`      Budget: ${action.budget}€`);
      });
    }

    // 5. Vérifier les scores de conformité
    if (strategicData.complianceScores.length > 0) {
      console.log('\n5️⃣ Scores de conformité:');
      strategicData.complianceScores.forEach(score => {
        console.log(`   📋 ${score.regulation}: ${score.score}% (${score.status})`);
      });
    }

    console.log('\n✅ Test du flux stratégique terminé avec succès !');
    console.log('🎉 Le dashboard enhanced peut maintenant afficher ces données en temps réel.');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
testStrategicFlow();
