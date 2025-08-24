'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Users, Brain, Target, Eye, CheckCircle, AlertCircle, Lightbulb, Award } from 'lucide-react';
import Link from 'next/link';

export default function SensibilisationDocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'assessment', text: 'Évaluer le niveau de sensibilisation actuel', critical: true },
    { id: 'program', text: 'Définir un programme de sensibilisation annuel', critical: true },
    { id: 'content', text: 'Créer des contenus adaptés par profil', critical: true },
    { id: 'phishing', text: 'Mettre en place des simulations de phishing', critical: true },
    { id: 'training', text: 'Organiser des formations régulières', critical: false },
    { id: 'communication', text: 'Établir un plan de communication continue', critical: false },
    { id: 'quiz', text: 'Déployer des quiz interactifs', critical: false },
    { id: 'ambassadors', text: 'Nommer des ambassadeurs cybersécurité', critical: false },
    { id: 'metrics', text: 'Définir des métriques de suivi', critical: true },
    { id: 'culture', text: 'Intégrer la sécurité dans la culture d\'entreprise', critical: false }
  ];

  const trainingTopics = [
    {
      month: 'Janvier',
      theme: 'Nouvelle Année, Nouvelles Habitudes',
      topics: ['Bonnes résolutions cyber', 'Bilan année précédente'],
      color: 'blue'
    },
    {
      month: 'Février',
      theme: 'Mots de Passe et Authentification',
      topics: ['Gestionnaire de mots de passe', 'MFA obligatoire'],
      color: 'green'
    },
    {
      month: 'Mars',
      theme: 'Attention au Phishing',
      topics: ['Détection d\'emails suspects', 'Signalement'],
      color: 'orange'
    },
    {
      month: 'Avril',
      theme: 'Sécurité Mobile',
      topics: ['BYOD', 'Applications autorisées'],
      color: 'purple'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sensibilisation Cybersécurité
            </h1>
            <p className="text-lg text-gray-600">
              Programme complet de sensibilisation aux risques cyber pour vos équipes
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            Formation Continue
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d&apos;ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#program">Programme</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#methods">Méthodes</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#calendar">Calendrier</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="program">Programme</TabsTrigger>
          <TabsTrigger value="methods">Méthodes</TabsTrigger>
          <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" id="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6" />
                    Importance de la Sensibilisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    95% des cyberattaques réussies sont dues à l&apos;erreur humaine. La sensibilisation est votre 
                    première ligne de défense contre les menaces cyber.
                  </p>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">Statistiques alarmantes :</h3>
                    <ul className="space-y-1 text-red-800">
                      <li>• 95% des incidents causés par l&apos;erreur humaine</li>
                      <li>• 1 email sur 4600 est un phishing</li>
                      <li>• 76% des entreprises victimes d&apos;attaques</li>
                      <li>• Coût moyen d&apos;une violation : 4,45M€</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Bénéfices</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Réduction des incidents (jusqu&apos;à 70%)</li>
                        <li>• Culture de sécurité renforcée</li>
                        <li>• Conformité réglementaire</li>
                        <li>• ROI positif démontrable</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Méthodes efficaces</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Simulations d&apos;attaques</li>
                        <li>• Micro-learning régulier</li>
                        <li>• Gamification</li>
                        <li>• Formation continue</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outils de sensibilisation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/compliance/templates#quiz">
                    <Button variant="outline" className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Quiz interactifs
                    </Button>
                  </Link>
                  <Link href="/compliance/templates#phishing">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Simulations de phishing
                    </Button>
                  </Link>
                  <Link href="/compliance/templates#posters">
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      Affiches de sensibilisation
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ressources externes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href="https://www.cybermalveillance.gouv.fr" target="_blank" className="block text-blue-600 hover:underline text-sm">
                    → Cybermalveillance.gouv.fr
                  </Link>
                  <Link href="https://www.ssi.gouv.fr/particulier/sensibilisation/" target="_blank" className="block text-blue-600 hover:underline text-sm">
                    → Sensibilisation ANSSI
                  </Link>
                  <Link href="https://www.cnil.fr/fr/sensibilisation" target="_blank" className="block text-blue-600 hover:underline text-sm">
                    → Sensibilisation CNIL
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Programme */}
        <TabsContent value="program" id="program">
          <Card>
            <CardHeader>
              <CardTitle>Programme de Sensibilisation Structuré</CardTitle>
              <CardDescription>
                Approche progressive et adaptée par profil utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="assessment">
                  <AccordionTrigger>1. Évaluation Initiale</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Mesurer le niveau de sensibilisation actuel de vos équipes.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Méthodes d&apos;évaluation :</h4>
                      <ul className="space-y-1">
                        <li>• Quiz de connaissances par département</li>
                        <li>• Test de phishing baseline</li>
                        <li>• Audit des comportements observés</li>
                        <li>• Enquête sur les pratiques actuelles</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="profiling">
                  <AccordionTrigger>2. Segmentation par Profil</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Adapter la sensibilisation selon les risques et besoins de chaque profil.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Profils à risque élevé :</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Direction et C-Level</li>
                          <li>• Finance et Comptabilité</li>
                          <li>• RH et Recrutement</li>
                          <li>• Support client</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Profils techniques :</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Développeurs</li>
                          <li>• Administrateurs système</li>
                          <li>• DevOps</li>
                          <li>• Architectes</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="content">
                  <AccordionTrigger>3. Création de Contenu</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Développer des contenus adaptés et engageants.</p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Types de contenu :</h4>
                      <ul className="space-y-1">
                        <li>• Modules e-learning interactifs (15-20 min max)</li>
                        <li>• Vidéos courtes et impactantes (3-5 min)</li>
                        <li>• Infographies et affiches</li>
                        <li>• Newsletters mensuelles</li>
                        <li>• Webinaires trimestriels</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="deployment">
                  <AccordionTrigger>4. Déploiement et Suivi</AccordionTrigger>
                  <AccordionContent>
                    <p>Mise en œuvre progressive avec mesure de l&apos;efficacité.</p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Indicateurs de succès :</h4>
                      <ul className="space-y-1">
                        <li>• Taux de participation aux formations (90%)</li>
                        <li>• Réduction du taux de clic sur phishing (5%)</li>
                        <li>• Augmentation des signalements d&apos;incidents (10%)</li>
                        <li>• Amélioration des scores aux quiz (10%)</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Méthodes */}
        <TabsContent value="methods" id="methods">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Simulations de Phishing",
                icon: <Target className="h-6 w-6" />,
                description: "Tests d'hameçonnage pour évaluer et former",
                details: ["Campagnes mensuelles", "Niveaux de difficulté progressifs", "Formation immédiate post-clic", "Suivi individuel et collectif"]
              },
              {
                title: "Micro-Learning",
                icon: <Lightbulb className="h-6 w-6" />,
                description: "Formations courtes et régulières",
                details: ["Modules de 5-10 minutes", "1 thème par semaine", "Compatible mobile", "Notifications push intelligentes"]
              },
              {
                title: "Gamification",
                icon: <Award className="h-6 w-6" />,
                description: "Mécaniques de jeu pour motiver",
                details: ["Points et badges", "Classements par équipe", "Défis mensuels", "Récompenses tangibles"]
              },
              {
                title: "Ambassadeurs Cyber",
                icon: <Users className="h-6 w-6" />,
                description: "Réseau interne de sensibilisation",
                details: ["1 ambassadeur par service", "Formation avancée", "Relais d'information", "Animation locale"]
              }
            ].map((method, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {method.icon}
                    {method.title}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {method.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Calendrier */}
        <TabsContent value="calendar" id="calendar">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendrier de Sensibilisation 2024</CardTitle>
                <CardDescription>
                  Programme thématique mensuel pour maintenir l&apos;engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trainingTopics.map((topic, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${
                      topic.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                      topic.color === 'green' ? 'border-green-200 bg-green-50' :
                      topic.color === 'orange' ? 'border-orange-200 bg-orange-50' :
                      'border-purple-200 bg-purple-50'
                    }`}>
                      <h3 className="font-semibold mb-2">{topic.month}</h3>
                      <h4 className="text-sm font-medium mb-2">{topic.theme}</h4>
                      <ul className="text-xs space-y-1">
                        {topic.topics.map((subtopic, idx) => (
                          <li key={idx}>• {subtopic}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Événements Transversaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-semibold">Simulations de Phishing</h4>
                    <p className="text-sm text-gray-600">1ère semaine de chaque mois - Rotation par service</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold">Alertes Sécurité</h4>
                    <p className="text-sm text-gray-600">Si menace critique - Notification dans les 24h</p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold">Formations Spécialisées</h4>
                    <p className="text-sm text-gray-600">Trimestrielles - Par profil métier</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold">Mois Européen de la Cybersécurité</h4>
                    <p className="text-sm text-gray-600">Octobre - Événement d&apos;envergure avec conférence</p>
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
              <CardTitle>Checklist Programme de Sensibilisation</CardTitle>
              <CardDescription>
                Vérifiez que votre programme de sensibilisation couvre tous les aspects essentiels
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

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Conseil StratCyber</h4>
                <p className="text-yellow-800 text-sm">
                  Un programme de sensibilisation efficace combine formation initiale, rappels réguliers, 
                  et tests pratiques. L&apos;objectif n&apos;est pas la perfection mais l&apos;amélioration continue !
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
