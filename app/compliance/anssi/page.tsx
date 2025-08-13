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
  Flag, 
  Users, 
  Lock, 
  Eye, 
  Download,
  Clock,
  AlertTriangle,
  Server,
  Settings,
  Award,
  TrendingUp,
  Book,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function ANSSIDocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'cyberscore', text: 'Réaliser le diagnostic Cyberscore', critical: false },
    { id: 'guides-anssi', text: 'Consulter les guides sectoriels ANSSI', critical: true },
    { id: 'ebios-rm', text: 'Mettre en œuvre la méthode EBIOS Risk Manager', critical: false },
    { id: 'pssie', text: 'Appliquer la Politique Sectorielle de Sécurité', critical: true },
    { id: 'incident-reporting', text: 'Mettre en place la notification d\'incidents', critical: true },
    { id: 'certif-anssi', text: 'Utiliser des produits certifiés ANSSI', critical: false },
    { id: 'formation-cyber', text: 'Former les équipes avec SecNumAcadémie', critical: false },
    { id: 'veille-cyber', text: 'S\'abonner aux alertes CERT-FR', critical: true },
    { id: 'documentation', text: 'Documenter les mesures de sécurité', critical: true },
    { id: 'audit-conformite', text: 'Réaliser des audits de conformité', critical: false }
  ];

  const anssiServices = [
    {
      service: 'CERT-FR',
      description: 'Centre gouvernemental de veille, d\'alerte et de réponse aux attaques informatiques',
      benefits: [
        'Alertes de sécurité en temps réel',
        'Analyse des menaces émergentes',
        'Support en cas d\'incident majeur',
        'Bulletins de vulnérabilités'
      ],
      audience: 'Administrations, OIV, OSE, entreprises'
    },
    {
      service: 'Cyberscore',
      description: 'Outil d\'autodiagnostic pour évaluer la cybersécurité des TPE/PME',
      benefits: [
        'Évaluation gratuite en 15 minutes',
        'Recommandations personnalisées',
        'Plan d\'action priorisé',
        'Sensibilisation des équipes'
      ],
      audience: 'TPE, PME, ETI'
    },
    {
      service: 'SecNumAcadémie',
      description: 'MOOC gratuit de sensibilisation à la cybersécurité',
      benefits: [
        'Formation gratuite et certifiante',
        'Modules adaptés aux métiers',
        'Suivi de progression individuel',
        'Ressources pédagogiques'
      ],
      audience: 'Tous publics, collaborateurs'
    },
    {
      service: 'Certification de Sécurité',
      description: 'Certification des produits et solutions de cybersécurité',
      benefits: [
        'Garantie de sécurité des produits',
        'Conformité aux exigences françaises',
        'Critères Communs internationaux',
        'Qualification de prestataires'
      ],
      audience: 'Fournisseurs, acheteurs publics'
    }
  ];

  const regulatoryFramework = [
    {
      category: 'Opérateurs d\'Importance Vitale (OIV)',
      description: 'Secteurs critiques pour la souveraineté nationale',
      sectors: ['Énergie', 'Transport', 'Télécoms', 'Santé', 'Eau', 'Alimentaire'],
      obligations: [
        'Déclaration des incidents significatifs',
        'Mise en place de mesures de sécurité',
        'Contrôles de sécurité réguliers',
        'Homologation de sécurité'
      ]
    },
    {
      category: 'Opérateurs de Services Essentiels (OSE)',
      description: 'Acteurs critiques pour les services numériques',
      sectors: ['Cloud computing', 'Moteurs de recherche', 'Plateformes e-commerce'],
      obligations: [
        'Notification d\'incidents sous 24h',
        'Mesures de sécurité appropriées',
        'Évaluation des risques',
        'Plans de continuité d\'activité'
      ]
    },
    {
      category: 'Administrations',
      description: 'Secteur public et collectivités territoriales',
      sectors: ['État', 'Collectivités', 'Hôpitaux publics', 'Universités'],
      obligations: [
        'Référentiel Général de Sécurité (RGS)',
        'Homologation de sécurité',
        'Politique de Sécurité des SI',
        'Formation des agents'
      ]
    }
  ];

  const guides = [
    {
      title: 'Guide d\'hygiène informatique',
      description: 'Pratiques essentielles pour renforcer la sécurité des SI',
      target: 'Toutes organisations',
      measures: 40,
      priority: 'Essentiel'
    },
    {
      title: 'Guide de la sécurité des données personnelles',
      description: 'Mesures de protection des données à caractère personnel',
      target: 'Responsables de traitement',
      measures: 17,
      priority: 'Important'
    },
    {
      title: 'Guide des bonnes pratiques de l\'informatique',
      description: 'Recommandations pour les TPE/PME',
      target: 'TPE, PME',
      measures: 12,
      priority: 'Recommandé'
    },
    {
      title: 'Guide sécurité du cloud',
      description: 'Recommandations pour l\'utilisation sécurisée du cloud',
      target: 'Utilisateurs cloud',
      measures: 25,
      priority: 'Important'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Documentation ANSSI
            </h1>
            <p className="text-lg text-gray-600">
              Agence Nationale de la Sécurité des Systèmes d'Information - Autorité française de cybersécurité
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Flag className="h-5 w-5 mr-2" />
            Autorité Française
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#services">Services</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#regulatory">Cadre réglementaire</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#guides">Guides ANSSI</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="regulatory">Cadre réglementaire</TabsTrigger>
          <TabsTrigger value="guides">Guides ANSSI</TabsTrigger>
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
                    Mission de l'ANSSI
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    L'ANSSI est l'autorité nationale française en matière de cybersécurité et de sécurité numérique. 
                    Créée en 2009, elle est rattachée au Secrétaire général de la défense et de la sécurité nationale (SGDSN).
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Missions principales :</h3>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Comprendre et anticiper les menaces cyber</li>
                      <li>• Prévenir les risques numériques</li>
                      <li>• Accompagner les acteurs publics et privés</li>
                      <li>• Répondre aux attaques informatiques</li>
                      <li>• Développer la souveraineté numérique française</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Périmètre d'action</h4>
                      <p className="text-red-800">Secteurs publics et infrastructures critiques</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Accompagnement</h4>
                      <p className="text-green-800">Entreprises et collectivités</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Services gratuits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Cyberscore - Autodiagnostic
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Book className="h-4 w-4 mr-2" />
                    SecNumAcadémie - Formation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    CERT-FR - Alertes sécurité
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources officielles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.ssi.gouv.fr" className="block text-blue-600 hover:underline">
                    → Site officiel ANSSI
                  </Link>
                  <Link href="https://www.cert.ssi.gouv.fr" className="block text-blue-600 hover:underline">
                    → CERT-FR
                  </Link>
                  <Link href="https://secnumacademie.gouv.fr" className="block text-blue-600 hover:underline">
                    → SecNumAcadémie
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" id="services">
          <Card>
            <CardHeader>
              <CardTitle>Services et Outils ANSSI</CardTitle>
              <CardDescription>
                Panorama des services gratuits et payants proposés par l'ANSSI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {anssiServices.map((service, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{service.service}</span>
                        <Badge variant="outline">{service.audience}</Badge>
                      </CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
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

        {/* Cadre réglementaire */}
        <TabsContent value="regulatory" id="regulatory">
          <Card>
            <CardHeader>
              <CardTitle>Cadre Réglementaire Français</CardTitle>
              <CardDescription>
                Obligations de cybersécurité selon les secteurs d'activité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {regulatoryFramework.map((framework, index) => (
                  <Card key={index} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{framework.category}</CardTitle>
                      <CardDescription>{framework.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Secteurs concernés :</h4>
                        <div className="flex flex-wrap gap-2">
                          {framework.sectors.map((sector, idx) => (
                            <Badge key={idx} variant="secondary">{sector}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Obligations principales :</h4>
                        <ul className="space-y-1">
                          {framework.obligations.map((obligation, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              {obligation}
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

        {/* Guides ANSSI */}
        <TabsContent value="guides" id="guides">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guides et Bonnes Pratiques ANSSI</CardTitle>
                <CardDescription>
                  Documentation technique et méthodologique pour la sécurisation des SI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guides.map((guide, index) => (
                    <Card key={index} className="h-full">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="text-base">{guide.title}</span>
                          <Badge variant={
                            guide.priority === 'Essentiel' ? 'destructive' :
                            guide.priority === 'Important' ? 'default' : 'secondary'
                          }>
                            {guide.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{guide.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Public cible :</span>
                          <Badge variant="outline">{guide.target}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mesures :</span>
                          <span className="font-semibold">{guide.measures} recommandations</span>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le guide
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes et Référentiels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">EBIOS Risk Manager</h4>
                      <p className="text-sm text-purple-800 mb-3">
                        Méthode d'évaluation des risques numériques
                      </p>
                      <ul className="text-xs text-purple-700 space-y-1">
                        <li>• 5 ateliers structurés</li>
                        <li>• Approche par sources de risques</li>
                        <li>• Scénarios d'attaque réalistes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">RGS - Référentiel Général de Sécurité</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        Cadre réglementaire pour le secteur public
                      </p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Homologation de sécurité</li>
                        <li>• Politique de sécurité</li>
                        <li>• Audit de conformité</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-900 mb-2">PSSIE</h4>
                      <p className="text-sm text-green-800 mb-3">
                        Politique de Sécurité des SI de l'État
                      </p>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Mesures de sécurité obligatoires</li>
                        <li>• Classification des informations</li>
                        <li>• Gestion des incidents</li>
                      </ul>
                    </div>
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
              <CardTitle>Checklist de Conformité ANSSI</CardTitle>
              <CardDescription>
                Actions recommandées pour suivre les préconisations ANSSI
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
