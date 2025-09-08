'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Download,
  Settings,
  ArrowRight,
  Rocket,
  RefreshCw,
  Users,
  Shield,
  BookOpen
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AutomationRequest {
  id: string;
  actionId: string;
  actionTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  estimatedSavings?: string;
  adminResponse?: string;
}

interface AvailableAutomation {
  id: string;
  name: string;
  type: string;
  requiredInputs: string[];
}

export default function AutomationDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AutomationRequest[]>([]);
  const [availableTypes, setAvailableTypes] = useState<AvailableAutomation[]>([]);
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);

  // Questionnaire dynamique
  const [questionnaire, setQuestionnaire] = useState<Record<string, any>>({});

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les demandes d'automatisation
      const requestsRes = await fetch('/api/automation/request');
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData.requests || []);
      }

      // Récupérer les actions automatisables depuis la roadmap du client
      const roadmapRes = await fetch('/api/roadmap/data');
      if (roadmapRes.ok) {
        const roadmapData = await roadmapRes.json();
        
        // Filtrer uniquement les actions automatisables
        const automatableActions = roadmapData.actions?.filter((action: any) => action.isAutomatable) || [];
        
        // Convertir en format pour le dashboard
        const automationTypes = automatableActions.map((action: any) => {
          const typeMap = {
            'Mettre en place une procédure de notification des violations de données dans les 72h à la CNIL': {
              id: 'cnil-procedure',
              name: 'Procédure CNIL 72h',
              requiredInputs: ['company_info', 'data_types', 'systems', 'contacts']
            },
            'Créer et maintenir le registre des traitements de données personnelles': {
              id: 'registre-rgpd', 
              name: 'Registre RGPD',
              requiredInputs: ['business_processes', 'data_flows', 'retention_periods']
            },
            'Développer un programme complet de sensibilisation à la cybersécurité': {
              id: 'programme-sensibilisation',
              name: 'Programme Sensibilisation',
              requiredInputs: ['company_size', 'sector', 'risk_level']
            }
          };
          
          const mapping = typeMap[action.action as keyof typeof typeMap];
          if (mapping) {
            return {
              id: mapping.id,
              name: mapping.name,
              type: action.automationType,
              requiredInputs: mapping.requiredInputs,
              actionId: action.id,
              timeSavedHours: action.timeSavedHours,
              originalAction: action
            };
          }
          return null;
        }).filter(Boolean);
        
        setAvailableTypes(automationTypes);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!generationResult) return;
    
    try {
      const response = await fetch('/api/automation/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: generationResult.actionId,
          documents: generationResult.generated.documents,
          content: generationResult.generated.content
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${generationResult.generated.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const handleGenerateNow = async (automationType: string) => {
    if (!questionnaire[automationType]) {
      alert('Veuillez remplir le questionnaire d\'abord');
      return;
    }

    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/automation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionId: `auto-${automationType}-${Date.now()}`,
          automationType,
          inputs: questionnaire[automationType]
        })
      });

      if (response.ok) {
        const result = await response.json();
        setGenerationResult(result);
        setSelectedAutomation(null);
        
        // Trouver l'action correspondante et la marquer comme terminée
        const automation = availableTypes.find(a => a.id === automationType);
        if (automation?.actionId) {
          try {
            await fetch('/api/roadmap/actions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                actionId: automation.actionId,
                status: 'Terminé',
                progress: 100
              })
            });
            
            console.log(`✅ Action ${automation.actionId} marquée comme terminée automatiquement`);
          } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
          }
        }
      } else {
        alert('Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderQuestionnaire = (type: AvailableAutomation) => {
    const questions = {
      'cnil-procedure': {
        title: 'Configuration Procédure CNIL',
        fields: [
          { key: 'company_info.name', label: 'Nom de l\'entreprise', type: 'text', required: true },
          { key: 'company_info.sector', label: 'Secteur d\'activité', type: 'text', required: true },
          { key: 'data_types', label: 'Types de données (séparés par virgule)', type: 'text', required: true },
          { key: 'systems', label: 'Systèmes utilisés (séparés par virgule)', type: 'text', required: true },
          { key: 'contacts.dpoName', label: 'Nom du DPO', type: 'text', required: true },
          { key: 'contacts.dpoEmail', label: 'Email du DPO', type: 'email', required: true },
          { key: 'contacts.itManager', label: 'Nom du responsable IT', type: 'text', required: true }
        ]
      },
      'registre-rgpd': {
        title: 'Configuration Registre RGPD',
        fields: [
          { key: 'retention_periods.clients', label: 'Durée conservation clients', type: 'text', placeholder: '5 ans après fin contrat' },
          { key: 'retention_periods.employees', label: 'Durée conservation employés', type: 'text', placeholder: '5 ans après départ' },
          { key: 'retention_periods.prospects', label: 'Durée conservation prospects', type: 'text', placeholder: '3 ans sans contact' }
        ]
      },
      'programme-sensibilisation': {
        title: 'Configuration Programme Sensibilisation',
        fields: [
          { key: 'company_size', label: 'Taille entreprise', type: 'select', options: ['PME', 'ETI', 'Grande entreprise'], required: true },
          { key: 'sector', label: 'Secteur d\'activité', type: 'text', required: true },
          { key: 'risk_level', label: 'Niveau de risque', type: 'select', options: ['Faible', 'Moyen', 'Élevé'], required: true }
        ]
      }
    };

    const config = questions[type.id as keyof typeof questions];
    if (!config) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{config.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'select' ? (
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={getNestedValue(questionnaire[type.id] || {}, field.key) || ''}
                  onChange={(e) => setNestedValue(type.id, field.key, e.target.value)}
                >
                  <option value="">Choisir...</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={getNestedValue(questionnaire[type.id] || {}, field.key) || ''}
                  onChange={(e) => setNestedValue(type.id, field.key, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        <Button 
          onClick={() => handleGenerateNow(type.id)} 
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Générer maintenant (2-3 min)
            </>
          )}
        </Button>
      </div>
    );
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const setNestedValue = (automationType: string, path: string, value: any) => {
    setQuestionnaire(prev => {
      const updated = { ...prev };
      if (!updated[automationType]) updated[automationType] = {};
      
      const keys = path.split('.');
      let current = updated[automationType];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      // Traiter les listes (séparées par virgule)
      if (path === 'data_types' || path === 'systems') {
        current[keys[keys.length - 1]] = value.split(',').map((item: string) => item.trim()).filter(Boolean);
      } else {
        current[keys[keys.length - 1]] = value;
      }
      
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3">Chargement du dashboard automatisation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="h-8 w-8 text-purple-600" />
            Automatisation StratCyber
          </h1>
          <p className="text-gray-600 mt-1">
            Générez automatiquement vos documents de conformité en 5 minutes
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/roadmap')} variant="outline">
          Retour à la roadmap
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Résultat de génération */}
      {generationResult && (
        <Card className="border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              {generationResult.generated.title} - Généré avec succès !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Documents générés:</h4>
                <ul className="space-y-1">
                  {generationResult.generated.documents.map((doc: string) => (
                    <li key={doc} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Contenu principal:</h4>
                <div className="text-sm bg-white p-3 rounded border max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs">
                    {generationResult.generated.content.mainDocument.substring(0, 300)}...
                  </pre>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleDownloadZip}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger ZIP
                </Button>
                <Button variant="outline" onClick={() => setGenerationResult(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Automatisations Disponibles</TabsTrigger>
          <TabsTrigger value="requests">Mes Demandes</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        {/* Automatisations disponibles */}
        <TabsContent value="available" className="space-y-6">
          {availableTypes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Aucune action automatisable disponible</h3>
                <p className="text-gray-600 mb-4">
                  Votre roadmap ne contient actuellement aucune action que nous pouvons automatiser.
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p><strong>Actions automatisables :</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Procédure notification CNIL 72h</li>
                    <li>Registre RGPD des traitements</li>
                    <li>Programme de sensibilisation</li>
                  </ul>
                </div>
                <Button className="mt-4" onClick={() => router.push('/dashboard/roadmap')}>
                  Voir ma roadmap
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTypes.map((automation) => {
              const icons = {
                'document_generation': FileText,
                'training_program': BookOpen,
                'monitoring': Shield
              };
              const IconComponent = icons[automation.type as keyof typeof icons] || FileText;
              
              const savings = {
                'cnil-procedure': { hours: 24, cost: '1,800€' },
                'registre-rgpd': { hours: 32, cost: '2,400€' },
                'programme-sensibilisation': { hours: 32, cost: '2,400€' }
              };
              
              const saving = savings[automation.id as keyof typeof savings] || { hours: 0, cost: '0€' };
              
              return (
                <Card key={automation.id} className="border-purple-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                      <IconComponent className="h-6 w-6" />
                      {automation.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Temps économisé:</span>
                        <p className="text-green-600 font-bold">{saving.hours}h</p>
                      </div>
                      <div>
                        <span className="font-semibold">Valeur:</span>
                        <p className="text-green-600 font-bold">{saving.cost}</p>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="bg-purple-50">
                      {automation.type === 'document_generation' ? '📄 Génération automatique' :
                       automation.type === 'training_program' ? '🎓 Programme formation' : 
                       '🔍 Monitoring'}
                    </Badge>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => setSelectedAutomation(automation.id)}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Générer en 5 min
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{automation.name}</DialogTitle>
                        </DialogHeader>
                        {renderQuestionnaire(automation)}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          )}
        </TabsContent>

        {/* Mes demandes */}
        <TabsContent value="requests" className="space-y-4">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Aucune demande d'automatisation</h3>
                <p className="text-gray-600">Commencez par automatiser une action depuis votre roadmap.</p>
                <Button className="mt-4" onClick={() => router.push('/dashboard/roadmap')}>
                  Voir ma roadmap
                </Button>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{request.actionTitle}</h3>
                      <p className="text-sm text-gray-600">
                        Demandé le {new Date(request.requestedAt).toLocaleDateString('fr-FR')}
                      </p>
                      {request.estimatedSavings && (
                        <p className="text-sm text-green-600">
                          Économies estimées: {request.estimatedSavings}
                        </p>
                      )}
                      {request.adminResponse && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Réponse StratCyber:</strong> {request.adminResponse}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 
                               request.status === 'rejected' ? 'destructive' : 'secondary'}
                    >
                      {request.status === 'approved' ? '✅ Approuvée' :
                       request.status === 'rejected' ? '❌ Rejetée' : '⏳ En attente'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Statistiques */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold">88h</h3>
                <p className="text-gray-600">Temps total économisé</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-2xl font-bold">12</h3>
                <p className="text-gray-600">Documents générés</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                <h3 className="text-2xl font-bold">6,600€</h3>
                <p className="text-gray-600">Valeur créée</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
