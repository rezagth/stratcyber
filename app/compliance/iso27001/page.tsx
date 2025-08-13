'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Users, 
  Lock, 
  Eye, 
  Download,
  Clock,
  AlertTriangle,
  Server,
  Settings,
  Award,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function ISO27001Documentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'context-analysis', text: 'Analyser le contexte organisationnel', critical: true },
    { id: 'scope-definition', text: 'Définir le périmètre du SMSI', critical: true },
    { id: 'risk-assessment', text: 'Réaliser l\'évaluation des risques', critical: true },
    { id: 'risk-treatment', text: 'Définir le plan de traitement des risques', critical: true },
    { id: 'policies-procedures', text: 'Élaborer les politiques et procédures', critical: true },
    { id: 'controls-implementation', text: 'Mettre en œuvre les contrôles de sécurité', critical: true },
    { id: 'awareness-training', text: 'Former et sensibiliser le personnel', critical: false },
    { id: 'monitoring-measurement', text: 'Surveiller et mesurer l\'efficacité', critical: true },
    { id: 'internal-audit', text: 'Réaliser des audits internes', critical: true },
    { id: 'management-review', text: 'Organiser la revue de direction', critical: true }
  ];

  const controlCategories = [
    {
      category: 'Politiques de Sécurité',
      controls: 2,
      description: 'Politiques et procédures de sécurité de l\'information',
      examples: ['Politique de sécurité générale', 'Revue des politiques']
    },
    {
      category: 'Organisation de la Sécurité',
      controls: 7,
      description: 'Organisation interne et relations avec les tiers',
      examples: ['Responsabilités sécurité', 'Accords de confidentialité', 'Contact avec autorités']
    },
    {
      category: 'Sécurité des Ressources Humaines',
      controls: 6,
      description: 'Sécurité avant, pendant et après l\'emploi',
      examples: ['Vérifications d\'antécédents', 'Conditions d\'emploi', 'Processus de départ']
    },
    {
      category: 'Gestion des Actifs',
      controls: 10,
      description: 'Inventaire et classification des actifs informationnels',
      examples: ['Inventaire des actifs', 'Classification', 'Manipulation des supports']
    }
  ];

  const certificationProcess = [
    {
      phase: 'Phase 1 - Préparation',
      duration: '6-12 mois',
      description: 'Gap analysis et mise en place du SMSI',
      activities: [
        'Analyse des écarts avec ISO 27001',
        'Formation de l\'équipe projet',
        'Élaboration des politiques et procédures',
        'Mise en place des contrôles'
      ]
    },
    {
      phase: 'Phase 2 - Implémentation',
      duration: '6-9 mois',
      description: 'Déploiement opérationnel du système',
      activities: [
        'Formation du personnel',
        'Tests des procédures',
        'Surveillance et mesure',
        'Audits internes'
      ]
    },
    {
      phase: 'Phase 3 - Certification',
      duration: '2-3 mois',
      description: 'Audit de certification par organisme accrédité',
      activities: [
        'Audit documentaire (Stage 1)',
        'Audit sur site (Stage 2)',
        'Traitement des non-conformités',
        'Obtention du certificat'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Documentation ISO 27001
            </h1>
            <p className="text-lg text-gray-600">
              Norme internationale pour les systèmes de management de la sécurité de l'information
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Award className="h-5 w-5 mr-2" />
            Norme ISO
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#controls">Contrôles</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#certification">Certification</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#implementation">Mise en œuvre</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="controls">Contrôles</TabsTrigger>
          <TabsTrigger value="certification">Certification</TabsTrigger>
          <TabsTrigger value="implementation">Mise en œuvre</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" id="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Introduction à ISO 27001
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    ISO/IEC 27001 est la norme internationale de référence pour les systèmes de management 
                    de la sécurité de l'information (SMSI). Publiée en 2013 et révisée régulièrement, 
                    elle fournit un cadre systématique pour gérer les informations sensibles de l'entreprise.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Bénéfices clés :</h3>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Protection systématique des informations sensibles</li>
                      <li>• Amélioration de la crédibilité et confiance clients</li>
                      <li>• Conformité aux exigences légales et réglementaires</li>
                      <li>• Avantage concurrentiel et différenciation</li>
                      <li>• Réduction des coûts liés aux incidents de sécurité</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Applicabilité</h4>
                      <p className="text-green-800">Toute organisation, toute taille, tout secteur</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Validité certificat</h4>
                      <p className="text-purple-800">3 ans avec audits de surveillance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actions rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Norme ISO 27001:2022
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Gap analysis template
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Kit de documentation SMSI
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources officielles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.iso.org/isoiec-27001-information-security.html" className="block text-blue-600 hover:underline">
                    → ISO - Site officiel
                  </Link>
                  <Link href="https://www.afnor.org" className="block text-blue-600 hover:underline">
                    → AFNOR - Organisme français
                  </Link>
                  <Link href="#" className="block text-blue-600 hover:underline">
                    → Organismes de certification
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Contrôles */}
        <TabsContent value="controls" id="controls">
          <Card>
            <CardHeader>
              <CardTitle>Les 114 Contrôles ISO 27001:2022</CardTitle>
              <CardDescription>
                Contrôles organisés en 4 domaines principaux avec 93 mesures spécifiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {controlCategories.map((category, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{category.category}</span>
                        <Badge variant="outline">{category.controls} contrôles</Badge>
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Exemples de contrôles :</h4>
                        <ul className="space-y-1">
                          {category.examples.map((example, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certification */}
        <TabsContent value="certification" id="certification">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processus de Certification ISO 27001</CardTitle>
                <CardDescription>
                  Démarche structurée en 3 phases principales sur 12-24 mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {certificationProcess.map((phase, index) => (
                    <Card key={index} className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>{phase.phase}</span>
                          <Badge variant="secondary">{phase.duration}</Badge>
                        </CardTitle>
                        <CardDescription>{phase.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {phase.activities.map((activity, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                              <span className="text-sm">{activity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coûts et ROI de la Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Investissement initial</h4>
                    <ul className="space-y-1 text-red-800 text-sm">
                      <li>• Audit de certification : 15-30k€</li>
                      <li>• Accompagnement conseil : 30-80k€</li>
                      <li>• Formation équipe : 10-20k€</li>
                      <li>• Outils et technologies : 20-50k€</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Coûts de maintien</h4>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>• Audits de surveillance : 5-10k€/an</li>
                      <li>• Formation continue : 5-15k€/an</li>
                      <li>• Amélioration continue : 10-20k€/an</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Retour sur investissement</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>• Réduction primes assurance : 10-20%</li>
                      <li>• Nouveaux marchés accessibles</li>
                      <li>• Évitement coûts incidents</li>
                      <li>• Productivité améliorée</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Mise en œuvre */}
        <TabsContent value="implementation" id="implementation">
          <Card>
            <CardHeader>
              <CardTitle>Guide de Mise en Œuvre ISO 27001</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="step1">
                  <AccordionTrigger>1. Analyse du contexte et définition du périmètre</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Comprendre l'organisation et définir le scope du SMSI.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Activités clés :</h4>
                      <ul className="space-y-1">
                        <li>• Analyse des enjeux internes et externes</li>
                        <li>• Identification des parties intéressées</li>
                        <li>• Définition du périmètre du SMSI</li>
                        <li>• Documentation du contexte organisationnel</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2">
                  <AccordionTrigger>2. Leadership et engagement de la direction</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Démonstration de l'engagement de la direction et allocation des ressources.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Exigences :</h4>
                      <ul className="space-y-1">
                        <li>• Politique de sécurité de l'information</li>
                        <li>• Attribution des rôles et responsabilités</li>
                        <li>• Allocation des ressources nécessaires</li>
                        <li>• Communication sur l'importance du SMSI</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3">
                  <AccordionTrigger>3. Planification - Évaluation des risques</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Processus systématique d'évaluation et de traitement des risques.</p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Méthodes recommandées :</h4>
                      <ul className="space-y-1">
                        <li>• EBIOS RM pour l'analyse des risques cyber</li>
                        <li>• ISO 27005 pour le management des risques</li>
                        <li>• MEHARI pour l'évaluation des risques</li>
                        <li>• Méthodes propriétaires validées</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist" id="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Mise en Conformité ISO 27001</CardTitle>
              <CardDescription>
                Suivez cette liste pour vous assurer de votre conformité à la norme ISO 27001
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checklistItems.map((item) => (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      checkedItems.includes(item.id) 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={checkedItems.includes(item.id)}
                      onChange={() => toggleCheck(item.id)}
                      className="h-5 w-5 text-green-600"
                    />
                    <label htmlFor={item.id} className="flex-1 cursor-pointer">
                      <span className={checkedItems.includes(item.id) ? 'line-through text-gray-500' : ''}>
                        {item.text}
                      </span>
                      {item.critical && (
                        <Badge variant="destructive" className="ml-2">Critique</Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Progression :</strong> {checkedItems.length} / {checklistItems.length} éléments complétés
                  ({Math.round((checkedItems.length / checklistItems.length) * 100)}%)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
