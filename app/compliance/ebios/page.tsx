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
  Target, 
  Users, 
  Lock, 
  Eye, 
  Download,
  Clock,
  Globe,
  AlertTriangle,
  Server,
  Zap,
  TrendingUp,
  BarChart3,
  Crosshair,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function EBIOSDocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'scope-definition', text: 'Définir le périmètre et les enjeux de l\'étude', critical: true },
    { id: 'stakeholder-identification', text: 'Identifier les parties prenantes', critical: true },
    { id: 'threat-sources', text: 'Recenser les sources de risques', critical: true },
    { id: 'dreaded-events', text: 'Élaborer les événements redoutés', critical: true },
    { id: 'attack-scenarios', text: 'Construire les scénarios d\'attaque', critical: true },
    { id: 'risk-assessment', text: 'Évaluer les risques cyber', critical: true },
    { id: 'treatment-strategy', text: 'Définir la stratégie de traitement', critical: true },
    { id: 'security-measures', text: 'Sélectionner les mesures de sécurité', critical: false },
    { id: 'action-plan', text: 'Élaborer le plan d\'action', critical: true },
    { id: 'monitoring', text: 'Mettre en place le suivi des risques', critical: false }
  ];

  const workshopPhases = [
    {
      phase: 'Atelier 1',
      title: 'Socle de sécurité',
      icon: <Shield className="h-6 w-6" />,
      color: 'blue',
      description: 'Cadrage de l\'étude et identification des biens supports',
      objectives: [
        'Définir le périmètre d\'étude',
        'Identifier les biens supports critiques',
        'Cartographier l\'écosystème',
        'Déterminer les enjeux de sécurité'
      ],
      deliverables: [
        'Périmètre d\'étude formalisé',
        'Cartographie des biens supports',
        'Matrice des enjeux',
        'Socle de sécurité défini'
      ]
    },
    {
      phase: 'Atelier 2',
      title: 'Sources de risques',
      icon: <AlertTriangle className="h-6 w-6" />,
      color: 'orange',
      description: 'Identification et caractérisation des sources de menaces',
      objectives: [
        'Identifier les sources de risques pertinentes',
        'Caractériser leurs motivations',
        'Évaluer leurs ressources',
        'Analyser leur expertise'
      ],
      deliverables: [
        'Catalogue des sources de risques',
        'Fiches de caractérisation',
        'Matrice capacités/motivations',
        'Priorisation des menaces'
      ]
    },
    {
      phase: 'Atelier 3',
      title: 'Scénarios stratégiques',
      icon: <Target className="h-6 w-6" />,
      color: 'purple',
      description: 'Construction des événements redoutés et scénarios d\'attaque',
      objectives: [
        'Élaborer les événements redoutés',
        'Construire les scénarios stratégiques',
        'Évaluer la vraisemblance',
        'Analyser les impacts'
      ],
      deliverables: [
        'Événements redoutés documentés',
        'Scénarios stratégiques détaillés',
        'Évaluation de vraisemblance',
        'Matrice d\'impact'
      ]
    },
    {
      phase: 'Atelier 4',
      title: 'Scénarios opérationnels',
      icon: <Crosshair className="h-6 w-6" />,
      color: 'red',
      description: 'Détaillage des modes opératoires et chemins d\'attaque',
      objectives: [
        'Détailler les chemins d\'attaque',
        'Identifier les vulnérabilités exploitables',
        'Évaluer la faisabilité technique',
        'Quantifier les risques'
      ],
      deliverables: [
        'Scénarios opérationnels détaillés',
        'Cartographie des chemins d\'attaque',
        'Analyse de vulnérabilités',
        'Évaluation des risques'
      ]
    },
    {
      phase: 'Atelier 5',
      title: 'Traitement des risques',
      icon: <Settings className="h-6 w-6" />,
      color: 'green',
      description: 'Définition de la stratégie de traitement et mesures de sécurité',
      objectives: [
        'Définir les stratégies de traitement',
        'Sélectionner les mesures de sécurité',
        'Évaluer les risques résiduels',
        'Élaborer le plan d\'action'
      ],
      deliverables: [
        'Stratégie de traitement des risques',
        'Catalogue de mesures de sécurité',
        'Analyse coûts/bénéfices',
        'Plan d\'action priorisé'
      ]
    }
  ];

  const stakeholderTypes = [
    {
      category: 'Parties Prenantes Internes',
      items: [
        'Direction générale/métier',
        'RSSI et équipe sécurité',
        'DSI et équipes techniques',
        'Responsables métier',
        'Utilisateurs finaux',
        'Audit interne'
      ]
    },
    {
      category: 'Parties Prenantes Externes',
      items: [
        'Clients et partenaires',
        'Fournisseurs critiques',
        'Prestataires de services',
        'Autorités de régulation',
        'Forces de l\'ordre',
        'Assureurs'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-900',
      orange: 'border-orange-200 bg-orange-50 text-orange-900',
      purple: 'border-purple-200 bg-purple-50 text-purple-900',
      red: 'border-red-200 bg-red-50 text-red-900',
      green: 'border-green-200 bg-green-50 text-green-900'
    };
    return colors[color as keyof typeof colors] || 'border-gray-200 bg-gray-50 text-gray-900';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Documentation EBIOS RM
            </h1>
            <p className="text-lg text-gray-600">
              Expression des Besoins et Identification des Objectifs de Sécurité - Risk Manager
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Target className="h-5 w-5 mr-2" />
            Méthodologie ANSSI
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#methodology">Méthodologie</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#workshops">5 Ateliers</Link>
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
          <TabsTrigger value="methodology">Méthodologie</TabsTrigger>
          <TabsTrigger value="workshops">5 Ateliers</TabsTrigger>
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
                    Introduction à EBIOS Risk Manager
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    EBIOS Risk Manager est la méthode française de référence pour l'appréciation et le traitement 
                    des risques numériques. Développée par l'ANSSI depuis 2010, sa version actuelle (2018) 
                    s'adapte aux enjeux contemporains de cybersécurité et d'analyse des risques cyber.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Objectifs stratégiques :</h3>
                    <ul className="space-y-1 text-purple-800">
                      <li>• Identifier et évaluer les risques cyber de manière structurée</li>
                      <li>• Comprendre l'écosystème et les parties prenantes</li>
                      <li>• Anticiper les modes opératoires d'attaquants</li>
                      <li>• Définir une stratégie de traitement proportionnée</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Version actuelle</h4>
                      <p className="text-blue-800">EBIOS RM 2018</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Durée typique</h4>
                      <p className="text-green-800">3-6 mois selon périmètre</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources ANSSI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Guide méthodologique
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Boîte à outils
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Tables de risques
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources officielles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.ssi.gouv.fr/guide/ebios-risk-manager/" className="block text-blue-600 hover:underline">
                    → ANSSI - Guide officiel
                  </Link>
                  <Link href="https://www.ssi.gouv.fr/uploads/2019/11/anssi-guide-ebios_risk_manager-fr-v1.0.pdf" className="block text-blue-600 hover:underline">
                    → Guide méthodologique PDF
                  </Link>
                  <Link href="#" className="block text-blue-600 hover:underline">
                    → Formation EBIOS RM
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Méthodologie */}
        <TabsContent value="methodology" id="methodology">
          <Card>
            <CardHeader>
              <CardTitle>Approche Méthodologique EBIOS RM</CardTitle>
              <CardDescription>
                Méthode structurée en 5 ateliers collaboratifs pour une analyse complète des risques cyber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Principes fondamentaux</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                      <span>Approche collaborative et pluridisciplinaire</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                      <span>Centré sur les sources de risques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                      <span>Évolutif et adaptatif</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                      <span>Orienté vers l'action</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Parties prenantes</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {stakeholderTypes.map((type, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 text-sm">{type.category}</h4>
                        <ul className="space-y-1">
                          {type.items.map((item, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Bonnes pratiques :</h4>
                <ul className="space-y-1 text-yellow-800 text-sm">
                  <li>• Impliquer la direction dès le démarrage</li>
                  <li>• Constituer une équipe projet pluridisciplinaire</li>
                  <li>• Adapter la méthode au contexte organisationnel</li>
                  <li>• Documenter les décisions et hypothèses</li>
                  <li>• Prévoir la mise à jour régulière de l'analyse</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5 Ateliers */}
        <TabsContent value="workshops" id="workshops">
          <Card>
            <CardHeader>
              <CardTitle>Les 5 Ateliers EBIOS Risk Manager</CardTitle>
              <CardDescription>
                Processus structuré en 5 ateliers séquentiels pour une analyse complète des risques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {workshopPhases.map((workshop, index) => (
                  <Card key={index} className={`border-l-4 ${getColorClasses(workshop.color)}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {workshop.icon}
                        {workshop.phase}: {workshop.title}
                      </CardTitle>
                      <CardDescription>{workshop.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3 text-sm">Objectifs :</h4>
                          <ul className="space-y-1">
                            {workshop.objectives.map((objective, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Target className="h-3 w-3 mt-1 flex-shrink-0 text-gray-500" />
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3 text-sm">Livrables :</h4>
                          <ul className="space-y-1">
                            {workshop.deliverables.map((deliverable, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 mt-1 flex-shrink-0 text-green-600" />
                                {deliverable}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mise en œuvre */}
        <TabsContent value="implementation" id="implementation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mise en Œuvre d'une Étude EBIOS RM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Phase de Préparation
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Définition des objectifs de l'étude</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Constitution de l'équipe projet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Planification des ateliers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Collecte documentaire préalable</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-600" />
                      Phase de Réalisation
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Animation des 5 ateliers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Synthèse et validation intermédiaires</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Documentation des résultats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Élaboration du rapport final</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Phase de Suivi
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Présentation des résultats</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Mise en œuvre du plan d'action</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Suivi des indicateurs de risques</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span>Révision périodique de l'analyse</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facteurs Clés de Succès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">🎯 Conditions de réussite :</h4>
                    <ul className="space-y-1 text-green-800 text-sm">
                      <li>• Soutien visible de la direction</li>
                      <li>• Équipe projet expérimentée</li>
                      <li>• Participation active des métiers</li>
                      <li>• Adaptation au contexte organisationnel</li>
                      <li>• Communication régulière</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">⚠️ Écueils à éviter :</h4>
                    <ul className="space-y-1 text-red-800 text-sm">
                      <li>• Périmètre trop large dès la première étude</li>
                      <li>• Participation limitée des parties prenantes</li>
                      <li>• Manque de réalisme dans les scénarios</li>
                      <li>• Absence de priorisation des actions</li>
                      <li>• Pas de suivi après l'étude</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist" id="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Réalisation EBIOS RM</CardTitle>
              <CardDescription>
                Suivez cette liste pour vous assurer d'une étude complète et efficace
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
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
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
