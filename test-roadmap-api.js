// Test simple pour vérifier l'API roadmap avec le paramètre auditId
// Ce script peut être exécuté dans la console du navigateur ou avec Node.js

async function testRoadmapAPI() {
  const baseUrl = 'http://localhost:3000/api/roadmap/data';
  
  console.log('=== Test API Roadmap ===');
  
  // Test 1: Appel sans paramètre auditId (comportement par défaut)
  try {
    console.log('\n1. Test sans auditId (récupération du dernier audit):');
    const response1 = await fetch(baseUrl);
    const data1 = await response1.json();
    
    if (response1.ok) {
      console.log('✅ Succès - Données reçues:', {
        actions: data1.actions?.length || 0,
        score: data1.score,
        lastAuditDate: data1.lastAuditDate?.substring(0, 10)
      });
    } else {
      console.log('❌ Erreur:', data1);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  // Test 2: Appel avec un auditId spécifique (exemple)
  try {
    console.log('\n2. Test avec auditId spécifique:');
    const auditId = 'exemple-audit-id'; // À remplacer par un vrai ID
    const response2 = await fetch(`${baseUrl}?auditId=${auditId}`);
    const data2 = await response2.json();
    
    if (response2.ok) {
      console.log('✅ Succès - Données reçues pour audit spécifique:', {
        actions: data2.actions?.length || 0,
        score: data2.score,
        lastAuditDate: data2.lastAuditDate?.substring(0, 10)
      });
    } else {
      console.log('❌ Erreur (normal si l\'audit n\'existe pas):', data2);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  // Test 3: Appel avec un auditId inexistant
  try {
    console.log('\n3. Test avec auditId inexistant:');
    const fakeAuditId = 'fake-audit-id-12345';
    const response3 = await fetch(`${baseUrl}?auditId=${fakeAuditId}`);
    const data3 = await response3.json();
    
    if (response3.status === 404) {
      console.log('✅ Erreur 404 correctement gérée:', data3.error);
    } else if (response3.ok) {
      console.log('⚠️ Réponse inattendue (devrait être 404):', data3);
    } else {
      console.log('❌ Autre erreur:', data3);
    }
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
  
  console.log('\n=== Fin des tests ===');
}

// Instructions pour utiliser ce script:
console.log(`
Instructions d'utilisation:
1. Assurez-vous que votre serveur Next.js fonctionne (npm run dev)
2. Copiez ce code dans la console du navigateur sur votre site
3. Exécutez: testRoadmapAPI()

Ou pour Node.js:
1. Installez node-fetch: npm install node-fetch
2. Ajoutez "import fetch from 'node-fetch';" en haut du fichier
3. Exécutez: node test-roadmap-api.js
`);

// Pour Node.js, décommentez cette ligne:
// testRoadmapAPI();
