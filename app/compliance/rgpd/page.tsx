'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, FileText, CheckCircle, AlertCircle, Users, Lock, Eye, Download, ExternalLink, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function RGPDDocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [documentationContent, setDocumentationContent] = useState<string>('');
  const [templatesContent, setTemplatesContent] = useState<string>('');

  useEffect(() => {
    // En production, vous récupéreriez le contenu depuis votre API/CMS
    // Pour le moment, nous affichons des liens vers la documentation
    setDocumentationContent('Documentation RGPD complète disponible');
    setTemplatesContent('Templates et outils pratiques disponibles');
  }, []);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'dpo', text: 'Désigner un Délégué à la Protection des Données (DPO)', critical: true },
    { id: 'privacy-policy', text: 'Rédiger une politique de confidentialité claire', critical: true },
    { id: 'consent', text: 'Mettre en place un système de consentement valide', critical: true },
    { id: 'data-mapping', text: 'Cartographier les traitements de données personnelles', critical: true },
    { id: 'impact-assessment', text: 'Réaliser des analyses d\'impact (AIPD) si nécessaire', critical: false },
    { id: 'breach-procedure', text: 'Établir une procédure de notification de violation', critical: true },
    { id: 'user-rights', text: 'Implémenter les droits des personnes concernées', critical: true },
    { id: 'training', text: 'Former les équipes au RGPD', critical: false },
    { id: 'contracts', text: 'Réviser les contrats avec les sous-traitants', critical: true },
    { id: 'security', text: 'Mettre en place des mesures de sécurité appropriées', critical: true }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Documentation RGPD
            </h1>
            <p className="text-lg text-gray-600">
              Règlement Général sur la Protection des Données - Guide complet de mise en conformité
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Shield className="h-5 w-5 mr-2" />
            Réglementation EU
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#principles">Principes</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#rights">Droits</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#obligations">Obligations</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#documentation">Documentation</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="principles">Principes</TabsTrigger>
          <TabsTrigger value="rights">Droits</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
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
                    Introduction au RGPD
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Le Règlement Général sur la Protection des Données (RGPD) est entré en vigueur le 25 mai 2018. 
                    Il constitue la principale législation européenne en matière de protection des données personnelles.
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Objectifs principaux :</h3>
                    <ul className="space-y-1 text-blue-800">
                      <li>• Renforcer les droits des personnes</li>
                      <li>• Harmoniser la réglementation européenne</li>
                      <li>• Responsabiliser les organisations</li>
                      <li>• Adapter la loi à l'ère numérique</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Amendes maximales</h4>
                      <p className="text-red-800">Jusqu'à 20M€ ou 4% du CA annuel mondial</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Portée territoriale</h4>
                      <p className="text-green-800">Toute organisation traitant des données d'EU</p>
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
                  <Link href="/docs/rgpd-guide-complet.pdf" target="_blank">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le guide complet
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                  <Link href="/compliance/rgpd/auto-evaluation">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Auto-évaluation RGPD
                    </Button>
                  </Link>
                  <Link href="/compliance/templates#rgpd">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Modèles de documents
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources externes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.cnil.fr" className="block text-blue-600 hover:underline">
                    → Site officiel CNIL
                  </Link>
                  <Link href="https://edpb.europa.eu" className="block text-blue-600 hover:underline">
                    → European Data Protection Board
                  </Link>
                  <Link href="#" className="block text-blue-600 hover:underline">
                    → Jurisprudence récente
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Principes */}
        <TabsContent value="principles" id="principles">
          <Card>
            <CardHeader>
              <CardTitle>Les 7 Principes Fondamentaux du RGPD</CardTitle>
              <CardDescription>
                Ces principes doivent guider tous vos traitements de données personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="lawfulness">
                  <AccordionTrigger>1. Licéité, loyauté et transparence</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Les données doivent être traitées de manière licite, loyale et transparente.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Bases légales possibles :</h4>
                      <ul className="space-y-1">
                        <li>• Consentement de la personne concernée</li>
                        <li>• Exécution d'un contrat</li>
                        <li>• Respect d'une obligation légale</li>
                        <li>• Sauvegarde des intérêts vitaux</li>
                        <li>• Mission d'intérêt public</li>
                        <li>• Intérêt légitime (avec balance des intérêts)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="purpose">
                  <AccordionTrigger>2. Limitation des finalités</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Les données doivent être collectées pour des finalités déterminées, explicites et légitimes.</p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">⚠️ Important :</h4>
                      <p>Vous ne pouvez pas traiter les données à d'autres fins que celles annoncées initialement, sauf exceptions prévues par la loi.</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="minimization">
                  <AccordionTrigger>3. Minimisation des données</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Les données doivent être adéquates, pertinentes et limitées à ce qui est nécessaire.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Bonnes pratiques :</h4>
                      <ul className="space-y-1">
                        <li>• Ne collectez que les données strictement nécessaires</li>
                        <li>• Questionnez régulièrement l'utilité de chaque donnée</li>
                        <li>• Supprimez les champs optionnels non utilisés</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="accuracy">
                  <AccordionTrigger>4. Exactitude</AccordionTrigger>
                  <AccordionContent>
                    <p>Les données doivent être exactes et tenues à jour. Les données inexactes doivent être effacées ou rectifiées sans délai.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="retention">
                  <AccordionTrigger>5. Limitation de la conservation</AccordionTrigger>
                  <AccordionContent>
                    <p>Les données ne doivent pas être conservées plus longtemps que nécessaire. Définissez des durées de conservation précises.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security">
                  <AccordionTrigger>6. Sécurité</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Les données doivent être traitées avec un niveau de sécurité approprié.</p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Mesures de sécurité requises :</h4>
                      <ul className="space-y-1">
                        <li>• Chiffrement des données sensibles</li>
                        <li>• Contrôle des accès</li>
                        <li>• Sauvegardes régulières</li>
                        <li>• Formation du personnel</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="accountability">
                  <AccordionTrigger>7. Responsabilité</AccordionTrigger>
                  <AccordionContent>
                    <p>Vous devez être en mesure de démontrer votre conformité au RGPD. Documentez vos mesures et tenez un registre des traitements.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Droits des personnes */}
        <TabsContent value="rights" id="rights">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Droit d'information",
                icon: <Eye className="h-6 w-6" />,
                description: "Information claire et transparente sur le traitement",
                details: ["Finalités du traitement", "Base légale", "Durée de conservation", "Droits de la personne"]
              },
              {
                title: "Droit d'accès",
                icon: <FileText className="h-6 w-6" />,
                description: "Accès aux données personnelles traitées",
                details: ["Copie des données", "Informations sur le traitement", "Délai : 1 mois maximum"]
              },
              {
                title: "Droit de rectification",
                icon: <CheckCircle className="h-6 w-6" />,
                description: "Correction des données inexactes",
                details: ["Modification des données erronées", "Complément des données incomplètes", "Sans délai injustifié"]
              },
              {
                title: "Droit à l'effacement",
                icon: <AlertCircle className="h-6 w-6" />,
                description: "Suppression des données (droit à l'oubli)",
                details: ["Données non nécessaires", "Retrait du consentement", "Traitement illicite"]
              },
              {
                title: "Droit à la limitation",
                icon: <Lock className="h-6 w-6" />,
                description: "Limitation du traitement dans certains cas",
                details: ["Conservation uniquement", "Pas de traitement ultérieur", "Sauf exceptions légales"]
              },
              {
                title: "Droit à la portabilité",
                icon: <Download className="h-6 w-6" />,
                description: "Récupération et transfert des données",
                details: ["Format structuré", "Transmission directe possible", "Seulement pour certains traitements"]
              }
            ].map((right, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {right.icon}
                    {right.title}
                  </CardTitle>
                  <CardDescription>{right.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {right.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {detail}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Obligations */}
        <TabsContent value="obligations" id="obligations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Obligations du Responsable de Traitement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Documentation obligatoire</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Registre des activités de traitement</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Analyse d'impact (si nécessaire)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Contrats avec les sous-traitants</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <span>Procédures internes</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Mesures organisationnelles</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Formation du personnel</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Mesures de sécurité appropriées</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Procédure de notification des violations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <span>Gestion des demandes d'exercice des droits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>DPO - Délégué à la Protection des Données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Désignation obligatoire</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Autorités publiques</li>
                      <li>• Suivi régulier et systématique</li>
                      <li>• Traitement à grande échelle de données sensibles</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Missions principales</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Information et conseil</li>
                      <li>• Contrôle du respect du RGPD</li>
                      <li>• Point de contact avec l'autorité</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Qualités requises</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Expertise juridique et technique</li>
                      <li>• Indépendance</li>
                      <li>• Moyens nécessaires</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documentation */}
        <TabsContent value="documentation" id="documentation">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Documentation RGPD Complète
                </CardTitle>
                <CardDescription>
                  Accès à la documentation complète, templates et outils pratiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Guide RGPD Complet
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">Documentation exhaustive de mise en conformité RGPD avec exemples concrets et cas d'usage.</p>
                      <ul className="text-sm space-y-1">
                        <li>• Principes fondamentaux détaillés</li>
                        <li>• Procédures pratiques</li>
                        <li>• Études de cas</li>
                        <li>• Checklist avancée</li>
                      </ul>
                      <Link href="/docs/rgpd-guide-complet.pdf" target="_blank">
                        <Button className="w-full" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le guide
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="border border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Templates RGPD
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">Collection de templates prêts à l'emploi pour accélérer votre mise en conformité.</p>
                      <ul className="text-sm space-y-1">
                        <li>• Registre des traitements</li>
                        <li>• Formulaire d'exercice des droits</li>
                        <li>• Politique de confidentialité</li>
                        <li>• Contrats sous-traitants</li>
                      </ul>
                      <Link href="/compliance/templates#rgpd">
                        <Button className="w-full" size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Accéder aux templates
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">📋 Documentation disponible dans les fichiers markdown :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <Link href="/compliance/docs/rgpd-guide-complet.md" className="text-blue-600 hover:underline block">
                        → rgpd-guide-complet.md
                      </Link>
                      <Link href="/compliance/docs/templates-outils-pratiques.md" className="text-blue-600 hover:underline block">
                        → templates-outils-pratiques.md
                      </Link>
                    </div>
                    <div>
                      <Link href="/compliance/docs/sensibilisation-cybersecurite.md" className="text-blue-600 hover:underline block">
                        → sensibilisation-cybersecurite.md
                      </Link>
                      <Link href="/compliance/docs/cloud-security-guide.md" className="text-blue-600 hover:underline block">
                        → cloud-security-guide.md
                      </Link>
                    </div>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Outils Interactifs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Link href="/compliance/rgpd/auto-evaluation">
                        <Button variant="outline" className="w-full h-auto p-4 flex-col">
                          <CheckCircle className="h-6 w-6 mb-2" />
                          <span className="font-medium">Auto-évaluation</span>
                          <span className="text-xs text-muted-foreground">Test de conformité</span>
                        </Button>
                      </Link>
                      <Link href="/compliance/rgpd/quiz">
                        <Button variant="outline" className="w-full h-auto p-4 flex-col">
                          <BookOpen className="h-6 w-6 mb-2" />
                          <span className="font-medium">Quiz RGPD</span>
                          <span className="text-xs text-muted-foreground">Test de connaissances</span>
                        </Button>
                      </Link>
                      <Link href="/compliance/rgpd/calculator">
                        <Button variant="outline" className="w-full h-auto p-4 flex-col">
                          <AlertCircle className="h-6 w-6 mb-2" />
                          <span className="font-medium">Calculateur</span>
                          <span className="text-xs text-muted-foreground">Estimation amendes</span>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist */}
        <TabsContent value="checklist" id="checklist">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Mise en Conformité RGPD</CardTitle>
              <CardDescription>
                Suivez cette liste pour vous assurer de votre conformité au RGPD
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
