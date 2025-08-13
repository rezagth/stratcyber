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
  Building2, 
  Users, 
  Lock, 
  Eye, 
  Download,
  Clock,
  Globe,
  AlertTriangle,
  Server,
  Zap,
  Target,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function DORADocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'ict-risk-management', text: 'Mettre en place un cadre de gestion des risques TIC', critical: true },
    { id: 'incident-reporting', text: 'Établir un système de notification des incidents TIC', critical: true },
    { id: 'operational-resilience', text: 'Définir et tester la résilience opérationnelle', critical: true },
    { id: 'third-party-monitoring', text: 'Surveiller les prestataires TIC critiques', critical: true },
    { id: 'threat-intelligence', text: 'Implémenter une veille sur les cybermenaces', critical: false },
    { id: 'penetration-testing', text: 'Réaliser des tests d\'intrusion réguliers', critical: true },
    { id: 'vulnerability-disclosure', text: 'Établir un programme de divulgation de vulnérabilités', critical: false },
    { id: 'recovery-plans', text: 'Développer des plans de récupération et continuité', critical: true },
    { id: 'training-awareness', text: 'Former les équipes à la résilience numérique', critical: false },
    { id: 'governance-oversight', text: 'Assurer la supervision par la direction', critical: true }
  ];

  const financialEntities = [
    {
      category: 'Entités Financières',
      color: 'blue',
      items: [
        'Établissements de crédit',
        'Entreprises d\'investissement',
        'Entreprises d\'assurance et de réassurance',
        'Institutions de retraite professionnelle',
        'Contreparties centrales (CCP)',
        'Référentiels centraux (TR)',
        'Plateformes de négociation'
      ]
    },
    {
      category: 'Prestataires TIC Critiques',
      color: 'purple',
      items: [
        'Fournisseurs de services cloud',
        'Fournisseurs de logiciels financiers',
        'Fournisseurs de services de données',
        'Prestataires de services de paiement critique',
        'Centres de données critiques'
      ]
    }
  ];

  const pillarDetails = [
    {
      title: 'Gestion des Risques TIC',
      icon: <Shield className="h-6 w-6" />,
      description: 'Framework complet de gouvernance et gestion des risques',
      requirements: [
        'Stratégie TIC documentée et approuvée',
        'Cartographie des risques TIC',
        'Politiques de sécurité des SI',
        'Mesures de protection et détection'
      ]
    },
    {
      title: 'Notification d\'Incidents',
      icon: <AlertTriangle className="h-6 w-6" />,
      description: 'Processus de signalement des incidents TIC majeurs',
      requirements: [
        'Classification des incidents TIC',
        'Notification aux autorités (ESAs)',
        'Rapport initial sous 24h si critique',
        'Rapports de suivi détaillés'
      ]
    },
    {
      title: 'Tests de Résilience',
      icon: <Target className="h-6 w-6" />,
      description: 'Programme de tests pour valider la résilience opérationnelle',
      requirements: [
        'Tests d\'intrusion avancés (TLPT)',
        'Tests de continuité d\'activité',
        'Simulation de cyber-attaques',
        'Évaluation des plans de récupération'
      ]
    },
    {
      title: 'Supervision Tiers Critiques',
      icon: <Users className="h-6 w-6" />,
      description: 'Surveillance et gestion des risques des prestataires TIC',
      requirements: [
        'Due diligence approfondie',
        'Contrats avec clauses DORA',
        'Monitoring continu des services',
        'Plans de substitution'
      ]
    },
    {
      title: 'Partage d\'Informations',
      icon: <Eye className="h-6 w-6" />,
      description: 'Échange d\'informations sur les cybermenaces',
      requirements: [
        'Arrangements de partage volontaires',
        'Indicateurs de cybermenaces',
        'Tactiques et techniques d\'attaque',
        'Mesures de cybersécurité'
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
              Documentation DORA
            </h1>
            <p className="text-lg text-gray-600">
              Digital Operational Resilience Act - Résilience opérationnelle numérique du secteur financier
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Building2 className="h-5 w-5 mr-2" />
            Réglementation EU
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#scope">Périmètre</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#pillars">5 Piliers</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#obligations">Obligations</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="scope">Périmètre</TabsTrigger>
          <TabsTrigger value="pillars">5 Piliers</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
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
                    Introduction à DORA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Le Digital Operational Resilience Act (DORA) est un règlement européen entré en vigueur 
                    le 16 janvier 2023, applicable à partir du 17 janvier 2025. Il vise à harmoniser et renforcer 
                    la résilience opérationnelle numérique du secteur financier européen.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Objectifs stratégiques :</h3>
                    <ul className="space-y-1 text-green-800">
                      <li>• Harmoniser la résilience TIC du secteur financier EU</li>
                      <li>• Renforcer la supervision des prestataires TIC critiques</li>
                      <li>• Améliorer la gestion des risques cyber et opérationnels</li>
                      <li>• Faciliter le partage d'informations sur les cybermenaces</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Applicabilité</h4>
                      <p className="text-blue-800">17 janvier 2025</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Tests TLPT</h4>
                      <p className="text-purple-800">Obligation tous les 3 ans</p>
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
                    Guide DORA complet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Matrice d'auto-évaluation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="h-4 w-4 mr-2" />
                    Template plan TLPT
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources officielles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.eba.europa.eu/dora" className="block text-blue-600 hover:underline">
                    → EBA - Autorité bancaire européenne
                  </Link>
                  <Link href="https://www.esma.europa.eu/dora" className="block text-blue-600 hover:underline">
                    → ESMA - Autorité des marchés financiers
                  </Link>
                  <Link href="https://www.eiopa.europa.eu/dora" className="block text-blue-600 hover:underline">
                    → EIOPA - Autorité des assurances
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Périmètre */}
        <TabsContent value="scope" id="scope">
          <Card>
            <CardHeader>
              <CardTitle>Périmètre d'Application DORA</CardTitle>
              <CardDescription>
                Le règlement s'applique aux entités financières et aux prestataires TIC critiques de l'UE
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {financialEntities.map((category, index) => (
                  <div key={index} className={`p-6 rounded-lg border-2 ${
                    category.color === 'blue' ? 'border-blue-200 bg-blue-50' : 'border-purple-200 bg-purple-50'
                  }`}>
                    <h3 className={`text-xl font-bold mb-4 ${
                      category.color === 'blue' ? 'text-blue-900' : 'text-purple-900'
                    }`}>
                      {category.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.items.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm`}>
                          <Building2 className={`h-4 w-4 flex-shrink-0 ${
                            category.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                          }`} />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Exemptions et seuils :</h4>
                  <ul className="space-y-1 text-yellow-800 text-sm">
                    <li>• <strong>Petites entreprises :</strong> Exemptions partielles pour certaines obligations</li>
                    <li>• <strong>Microentreprises :</strong> Obligations allégées mais surveillance maintenue</li>
                    <li>• <strong>Prestataires TIC :</strong> Désignation basée sur la criticité et l'impact systémique</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5 Piliers */}
        <TabsContent value="pillars" id="pillars">
          <Card>
            <CardHeader>
              <CardTitle>Les 5 Piliers de DORA</CardTitle>
              <CardDescription>
                Framework structuré autour de cinq domaines clés de la résilience opérationnelle numérique
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pillarDetails.map((pillar, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {pillar.icon}
                        Pilier {index + 1}: {pillar.title}
                      </CardTitle>
                      <CardDescription>{pillar.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pillar.requirements.map((requirement, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligations */}
        <TabsContent value="obligations" id="obligations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Obligations Principales des Entités Financières</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gouvernance TIC</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Responsabilité de l'organe dirigeant</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Stratégie TIC documentée et approuvée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Fonctions de gestion des risques TIC</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Indicateurs de performance (KRI/KPI)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gestion des Incidents</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <span>Classification des incidents TIC</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-red-600 mt-0.5" />
                        <span>Notification sous 24h si incident majeur</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Server className="h-5 w-5 text-red-600 mt-0.5" />
                        <span>Registre détaillé des incidents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <span>Plans de réponse et récupération</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tests de Résilience Opérationnelle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">TLPT (Threat-Led Penetration Testing)</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Tests tous les 3 ans minimum</li>
                      <li>• Scénarios réalistes d'attaques</li>
                      <li>• Équipes externes spécialisées</li>
                      <li>• Supervision des autorités compétentes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Tests de Résilience</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Analyse de vulnérabilités</li>
                      <li>• Tests de continuité d'activité</li>
                      <li>• Simulation d'incidents cyber</li>
                      <li>• Évaluation des plans de récupération</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Rapportage et Suivi</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Rapport d'évaluation détaillé</li>
                      <li>• Plan d'actions correctives</li>
                      <li>• Suivi de la mise en œuvre</li>
                      <li>• Communication aux autorités</li>
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
              <CardTitle>Checklist de Mise en Conformité DORA</CardTitle>
              <CardDescription>
                Suivez cette liste pour vous assurer de votre conformité au règlement DORA
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
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
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
