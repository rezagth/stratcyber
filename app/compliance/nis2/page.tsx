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
  Network, 
  Building2,
  Users, 
  Lock, 
  Eye, 
  Download,
  Clock,
  Globe,
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function NIS2Documentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'risk-management', text: 'Mettre en place un système de gestion des risques cybersécurité', critical: true },
    { id: 'incident-response', text: 'Établir une procédure de gestion d\'incidents', critical: true },
    { id: 'incident-notification', text: 'Implémenter la notification d\'incidents aux autorités', critical: true },
    { id: 'supply-chain', text: 'Sécuriser la chaîne d\'approvisionnement', critical: true },
    { id: 'governance', text: 'Définir une gouvernance cybersécurité au niveau direction', critical: true },
    { id: 'vulnerability-management', text: 'Mettre en œuvre la gestion des vulnérabilités', critical: false },
    { id: 'access-control', text: 'Implémenter des contrôles d\'accès robustes', critical: true },
    { id: 'cryptography', text: 'Déployer des mesures de cryptographie appropriées', critical: false },
    { id: 'training', text: 'Former les équipes aux bonnes pratiques cybersécurité', critical: false },
    { id: 'business-continuity', text: 'Établir un plan de continuité d\'activité', critical: true }
  ];

  const sectors = [
    {
      category: 'Secteurs Essentiels',
      color: 'red',
      items: [
        'Énergie (électricité, pétrole, gaz)',
        'Transport (aérien, ferroviaire, maritime, routier)',
        'Secteur bancaire et infrastructures de marchés financiers',
        'Santé',
        'Eau potable',
        'Infrastructure numérique'
      ]
    },
    {
      category: 'Secteurs Importants',
      color: 'orange',
      items: [
        'Services postaux et de courrier',
        'Gestion des déchets',
        'Fabrication de produits chimiques',
        'Production et distribution alimentaires',
        'Fabrication (équipements médicaux, électroniques, machines)',
        'Fournisseurs de services numériques',
        'Recherche'
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
              Documentation NIS2
            </h1>
            <p className="text-lg text-gray-600">
              Network and Information Systems Directive 2 - Renforcement de la cybersécurité en Europe
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Network className="h-5 w-5 mr-2" />
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
            <Link href="#requirements">Exigences</Link>
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
          <TabsTrigger value="requirements">Exigences</TabsTrigger>
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
                    Introduction à NIS2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    La directive NIS2 (Network and Information Systems Directive 2) est entrée en vigueur en janvier 2023 
                    et doit être transposée dans le droit national des États membres avant octobre 2024. Elle remplace 
                    et renforce significativement la directive NIS originale.
                  </p>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Objectifs principaux :</h3>
                    <ul className="space-y-1 text-orange-800">
                      <li>• Renforcer la résilience cybersécurité des secteurs critiques</li>
                      <li>• Harmoniser les exigences de sécurité à l'échelle européenne</li>
                      <li>• Améliorer la coopération et le partage d'informations</li>
                      <li>• Étendre le périmètre aux secteurs "importants"</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Sanctions</h4>
                      <p className="text-red-800">Jusqu'à 10M€ ou 2% du CA annuel mondial</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Délai notification</h4>
                      <p className="text-blue-800">24h pour alerte préliminaire</p>
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
                    Guide NIS2 complet
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Auto-évaluation conformité
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Modèle notification incident
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources externes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.enisa.europa.eu/topics/directive-nis" className="block text-blue-600 hover:underline">
                    → Site officiel ENISA
                  </Link>
                  <Link href="https://www.anssi.gouv.fr" className="block text-blue-600 hover:underline">
                    → ANSSI France
                  </Link>
                  <Link href="#" className="block text-blue-600 hover:underline">
                    → Lignes directrices techniques
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
              <CardTitle>Périmètre d'Application NIS2</CardTitle>
              <CardDescription>
                La directive s'applique aux entités essentielles et importantes selon leur secteur d'activité et leur taille
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sectors.map((sector, index) => (
                  <div key={index} className={`p-6 rounded-lg border-2 ${
                    sector.color === 'red' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'
                  }`}>
                    <h3 className={`text-xl font-bold mb-4 ${
                      sector.color === 'red' ? 'text-red-900' : 'text-orange-900'
                    }`}>
                      {sector.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sector.items.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm`}>
                          <Building2 className={`h-4 w-4 flex-shrink-0 ${
                            sector.color === 'red' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Critères de taille :</h4>
                  <ul className="space-y-1 text-blue-800 text-sm">
                    <li>• <strong>Moyennes entreprises :</strong> 50-249 employés (secteurs importants)</li>
                    <li>• <strong>Grandes entreprises :</strong> 250+ employés (tous secteurs concernés)</li>
                    <li>• <strong>Exemptions :</strong> Micro et petites entreprises (&lt; 50 employés) sauf exceptions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exigences */}
        <TabsContent value="requirements" id="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Exigences Techniques et Organisationnelles</CardTitle>
              <CardDescription>
                Mesures de cybersécurité que les entités doivent mettre en place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="risk-management">
                  <AccordionTrigger>1. Gestion des risques cybersécurité</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Mettre en place une approche structurée de gestion des risques cyber.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Éléments requis :</h4>
                      <ul className="space-y-1">
                        <li>• Évaluation régulière des risques</li>
                        <li>• Cartographie des actifs critiques</li>
                        <li>• Définition d'une stratégie de traitement</li>
                        <li>• Documentation des processus</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="incident-handling">
                  <AccordionTrigger>2. Gestion des incidents</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Capacité à détecter, analyser et répondre aux incidents de sécurité.</p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">⚠️ Délais de notification :</h4>
                      <ul className="space-y-1">
                        <li>• <strong>24h :</strong> Alerte préliminaire aux autorités</li>
                        <li>• <strong>72h :</strong> Rapport détaillé d'incident</li>
                        <li>• <strong>1 mois :</strong> Rapport final avec mesures correctives</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="business-continuity">
                  <AccordionTrigger>3. Continuité d'activité</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Plans pour maintenir les opérations critiques en cas d'incident.</p>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Bonnes pratiques :</h4>
                      <ul className="space-y-1">
                        <li>• Plan de continuité d'activité (PCA)</li>
                        <li>• Plan de reprise d'activité (PRA)</li>
                        <li>• Tests réguliers des procédures</li>
                        <li>• Sites de secours opérationnels</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="supply-chain">
                  <AccordionTrigger>4. Sécurité de la chaîne d'approvisionnement</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Évaluation et gestion des risques liés aux fournisseurs et partenaires.</p>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Mesures requises :</h4>
                      <ul className="space-y-1">
                        <li>• Due diligence des fournisseurs critiques</li>
                        <li>• Clauses contractuelles de sécurité</li>
                        <li>• Surveillance continue des prestataires</li>
                        <li>• Plans de substitution des fournisseurs</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="technical-measures">
                  <AccordionTrigger>5. Mesures techniques de sécurité</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Contrôles techniques pour protéger les systèmes d'information.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Contrôles essentiels :</h4>
                      <ul className="space-y-1">
                        <li>• Gestion des identités et accès</li>
                        <li>• Chiffrement des données sensibles</li>
                        <li>• Gestion des vulnérabilités</li>
                        <li>• Surveillance et détection d'intrusion</li>
                        <li>• Sauvegardes sécurisées</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Obligations */}
        <TabsContent value="obligations" id="obligations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Obligations des Entités Concernées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Gouvernance et Organisation</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                        <span>Responsabilité de la direction générale</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
                        <span>Nomination d'un responsable cybersécurité</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                        <span>Politiques de sécurité formalisées</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        <span>Formation du personnel</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Surveillance et Rapportage</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Surveillance continue des systèmes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Détection des incidents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Notification dans les délais</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Server className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Registre des incidents</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Autorités Compétentes et Coopération</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">France - ANSSI</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Autorité nationale de cybersécurité</li>
                      <li>• Point de contact pour notifications</li>
                      <li>• Contrôles et inspections</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">CSIRT Réseau</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Équipes de réponse aux incidents</li>
                      <li>• Support technique</li>
                      <li>• Partage d'informations sur menaces</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Coopération EU</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Réseau de coopération NIS</li>
                      <li>• Partage de bonnes pratiques</li>
                      <li>• Exercices cybersécurité conjoints</li>
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
              <CardTitle>Checklist de Mise en Conformité NIS2</CardTitle>
              <CardDescription>
                Suivez cette liste pour vous assurer de votre conformité à la directive NIS2
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
              
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800">
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
