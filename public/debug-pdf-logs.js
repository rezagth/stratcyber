// Script pour capturer et afficher les logs de génération PDF dans la console du navigateur
// À inclure dans les pages où tu veux débugger la génération PDF

console.log('🔍 [DEBUG] PDF Debug Logger loaded');

// Fonction pour intercepter les téléchargements de PDF et afficher les logs
function interceptPDFDownloads() {
  // Intercepter les liens de téléchargement PDF
  document.addEventListener('click', function(event) {
    const target = event.target.closest('a, button');
    if (target && (
      target.href?.includes('/export/comprehensive-pdf') ||
      target.href?.includes('/export/test-pdf') ||
      target.onclick?.toString().includes('pdf') ||
      target.textContent.toLowerCase().includes('pdf')
    )) {
      console.log('🚀 [PDF Debug] PDF download initiated');
      console.log('📄 [PDF Debug] Target:', target);
      console.log('🔗 [PDF Debug] URL:', target.href || 'No href (button/onclick)');
      
      // Démarrer le monitoring des logs
      startPDFLogMonitoring();
    }
  });
}

// Fonction pour monitorer les logs via les headers de réponse
function startPDFLogMonitoring() {
  console.log('🔍 [PDF Debug] Starting PDF log monitoring...');
  
  // Override fetch pour intercepter les réponses
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args)
      .then(response => {
        if (response.url.includes('/export/')) {
          console.log('📨 [PDF Debug] Response received:', response);
          console.log('📊 [PDF Debug] Status:', response.status, response.statusText);
          
          // Afficher les logs de debug si disponibles
          const debugLogs = response.headers.get('X-Debug-Logs');
          const debugCount = response.headers.get('X-Debug-Count');
          
          if (debugLogs) {
            console.group('📋 [PDF Debug] Server Logs (' + (debugCount || 'unknown count') + ')');
            const logs = debugLogs.split(' | ');
            logs.forEach(log => {
              if (log.includes('ERROR') || log.includes('❌')) {
                console.error('🔴', log);
              } else if (log.includes('WARN') || log.includes('⚠️')) {
                console.warn('🟡', log);
              } else if (log.includes('SUCCESS') || log.includes('✅')) {
                console.info('🟢', log);
              } else {
                console.log('ℹ️', log);
              }
            });
            console.groupEnd();
          } else {
            console.warn('⚠️ [PDF Debug] No debug logs found in response headers');
          }
          
          // Afficher les autres headers utiles
          console.group('📋 [PDF Debug] Response Headers');
          for (const [key, value] of response.headers.entries()) {
            if (key.toLowerCase().includes('debug') || 
                key.toLowerCase().includes('error') ||
                key.toLowerCase().includes('content-type') ||
                key.toLowerCase().includes('content-disposition')) {
              console.log(`${key}:`, value);
            }
          }
          console.groupEnd();
        }
        return response;
      })
      .catch(error => {
        console.error('❌ [PDF Debug] Fetch error:', error);
        throw error;
      });
  };
  
  // Restaurer fetch après 30 secondes
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log('🔄 [PDF Debug] Fetch monitoring restored');
  }, 30000);
}

// Fonction pour tester manuellement la génération PDF
window.testPDFGeneration = function(auditId) {
  console.log('🧪 [PDF Debug] Testing PDF generation for audit:', auditId);
  
  if (!auditId) {
    console.error('❌ [PDF Debug] Please provide an audit ID');
    return;
  }
  
  const testUrl = `/api/audit/${auditId}/export/test-pdf`;
  console.log('🔗 [PDF Debug] Test URL:', testUrl);
  
  startPDFLogMonitoring();
  
  fetch(testUrl)
    .then(response => {
      if (response.ok) {
        console.log('✅ [PDF Debug] Test PDF generation successful');
        return response.blob();
      } else {
        console.error('❌ [PDF Debug] Test PDF generation failed:', response.status);
        return response.text().then(text => {
          console.error('📄 [PDF Debug] Error response:', text);
          try {
            const errorData = JSON.parse(text);
            console.error('📋 [PDF Debug] Error details:', errorData);
          } catch (e) {
            console.error('📋 [PDF Debug] Raw error:', text);
          }
        });
      }
    })
    .then(blob => {
      if (blob && blob.type === 'application/pdf') {
        console.log('✅ [PDF Debug] PDF blob received, size:', blob.size, 'bytes');
        
        // Optionnel: télécharger le PDF de test
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-pdf-${auditId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('📥 [PDF Debug] Test PDF downloaded');
      }
    })
    .catch(error => {
      console.error('❌ [PDF Debug] Test failed:', error);
    });
};

// Fonction pour obtenir les logs en temps réel
window.getPDFLogs = function(auditId, type = 'comprehensive') {
  console.log(`🔍 [PDF Debug] Getting PDF logs for audit ${auditId} (${type})`);
  
  const url = `/api/audit/${auditId}/export/${type}-pdf`;
  
  console.group(`📋 [PDF Debug] Real-time monitoring for ${url}`);
  console.log('⏱️ [PDF Debug] Starting request at:', new Date().toISOString());
  
  startPDFLogMonitoring();
  
  const startTime = Date.now();
  
  return fetch(url)
    .then(response => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('⏱️ [PDF Debug] Request completed in:', duration + 'ms');
      console.log('📊 [PDF Debug] Final status:', response.status, response.statusText);
      
      console.groupEnd();
      return response;
    })
    .catch(error => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('❌ [PDF Debug] Request failed after:', duration + 'ms');
      console.error('❌ [PDF Debug] Error:', error);
      console.groupEnd();
      throw error;
    });
};

// Fonction d'aide pour les développeurs
window.pdfDebugHelp = function() {
  console.group('🔧 [PDF Debug] Available Debug Functions');
  console.log('🧪 testPDFGeneration(auditId) - Test PDF generation');
  console.log('📋 getPDFLogs(auditId, type) - Get detailed logs (type: "comprehensive" or "test")');
  console.log('🔍 interceptPDFDownloads() - Monitor PDF downloads');
  console.log('📋 pdfDebugHelp() - Show this help');
  
  console.log('\n📝 Examples:');
  console.log('testPDFGeneration("your-audit-id")');
  console.log('getPDFLogs("your-audit-id", "test")');
  console.log('getPDFLogs("your-audit-id", "comprehensive")');
  console.groupEnd();
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 [PDF Debug] Auto-initializing PDF debug tools');
  interceptPDFDownloads();
  
  // Afficher l'aide au démarrage
  setTimeout(() => {
    console.log('💡 [PDF Debug] Type pdfDebugHelp() in console for available debug functions');
  }, 1000);
});

// Export des fonctions pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testPDFGeneration: window.testPDFGeneration,
    getPDFLogs: window.getPDFLogs,
    interceptPDFDownloads,
    pdfDebugHelp: window.pdfDebugHelp
  };
}
