'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Truck, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Target,
  Users,
  Link as LinkIcon,
  ArrowLeft,
  Download,
  Building
} from 'lucide-react';

const SupplyChainSecurityPage = () => {
  const riskCategories = [
    {
      title: "Fournisseurs IT Critiques",
      description: "Prestataires ayant accès aux systèmes d'information",
      examples: ["Hébergeurs", "Éditeurs logiciels", "Intégrateurs", "Support technique"],
      riskLevel: "Critique",
      color: "red"
    },
    {
      title: "Sous-traitants Métier",
      description: "Partenaires traitant des données sensibles",
      examples: ["Comptabilité externalisée", "RH", "Marketing", "Juridique"],
      riskLevel: "Élevé",
      color: "orange"
    },
    {
      title: "Fournisseurs Opérationnels",
      description: "Prestataires avec accès physique ou logique limité",
      examples: ["Nettoyage", "Sécurité", "Livraisons", "Maintenance"],
      riskLevel: "Modéré",
      color: "yellow"
    }
  ];

  const evaluationCriteria = [
    {
      category: "Gouvernance Sécurité",
      criteria: [
        "Politique de sécurité formalisée",
        "Responsable sécurité désigné",
        "Comité de pilotage cybersécurité",
        "Processus de gestion des risques"
      ]
    },
    {
      category: "Certifications",
      criteria: [
        "ISO 27001 (Management sécurité)",
        "SOC 2 Type II (Contrôles internes)",
        "ISO 22301 (Continuité d'activité)",
        "Certifications sectorielles"
      ]
    },
    {
      category: "Mesures Techniques",
      criteria: [
        "Chiffrement des données",
        "Authentification multi-facteurs",
        "Surveillance et logging",
        "Sauvegarde et récupération"
      ]
    },
    {
      category: "Gestion des Incidents",
      criteria: [
        "Plan de réponse aux incidents",
        "Équipe CSIRT/SOC",
        "Notification client 24h max",
        "Retour d'expérience formalisé"
      ]
    }
  ];

  const contractualClauses = [
    {
      title: "Obligations de Sécurité",
      description: "Respect des standards et politiques de sécurité",
      elements: [
        "Application des mesures techniques appropriées",
        "Formation du personnel aux risques cyber",
        "Mise à jour régulière des systèmes",
        "Contrôle d'accès strict aux données"
      ]
    },
    {
      title: "Notification d'Incidents",
      description: "Signalement immédiat des violations de sécurité",
      elements: [
        "Notification sous 24h maximum",
        "Description détaillée de l'incident",
        "Impact et données concernées",
        "Mesures correctives mises en place"
      ]
    },
    {
      title: "Droit d'Audit",
      description: "Possibilité de contrôler la sécurité du fournisseur",
      elements: [
        "Audit sur site ou à distance",
        "Fréquence définie contractuellement",
        "Accès à la documentation sécurité",
        "Correction des non-conformités"
      ]
    },
    {
      title: "Continuité d'Activité",
      description: "Maintien des services en cas d'incident",
      elements: [
        "Plan de continuité formalisé",
        "RTO/RPO définis et testés",
        "Sites de secours opérationnels",
        "Communication de crise"
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compliance" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <Badge className="bg-blue-100 text-blue-800">Guide Expert</Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sécurisation de la Supply Chain
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Guide complet StratCyber pour sécuriser votre chaîne d'approvisionnement numérique. 
          Méthodologie, évaluation des risques et bonnes pratiques contractuelles.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Fournisseurs</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">360°</p>
              <p className="text-sm text-gray-600">Évaluation complète</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Conformité</span>
              </div>
              <p className="text-2xl font-bold text-green-600">NIS2</p>
              <p className="text-sm text-gray-600">+ ISO 27001</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Templates</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">12+</p>
              <p className="text-sm text-gray-600">Prêts à utiliser</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Classification des risques */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Classification des Risques Fournisseurs</h2>
        <div className="space-y-6">
          {riskCategories.map((category, index) => (
            <Card key={index} className={`border-l-4 ${
              category.color === 'red' ? 'border-l-red-400' : 
              category.color === 'orange' ? 'border-l-orange-400' : 
              'border-l-yellow-400'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <Badge variant={category.color === 'red' ? 'destructive' : category.color === 'orange' ? 'secondary' : 'outline'}>
                    {category.riskLevel}
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2">Exemples typiques :</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.examples.map((example, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Grille d'évaluation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Grille d'Évaluation Sécurité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluationCriteria.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.criteria.map((criterion, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {criterion}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Clauses contractuelles */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Clauses Contractuelles Essentielles</h2>
        <div className="space-y-6">
          {contractualClauses.map((clause, index) => (
            <Card key={index} className="border-l-4 border-l-blue-400">
              <CardHeader>
                <CardTitle className="text-lg">{clause.title}</CardTitle>
                <CardDescription>{clause.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {clause.elements.map((element, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {element}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Templates et outils */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Templates et Outils StratCyber</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Questionnaires d'Évaluation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Questionnaire fournisseur IT critique
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Évaluation sous-traitant métier
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Grille de scoring automatisée
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Clauses Contractuelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Clauses cybersécurité type
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Modèle d'accord de confidentialité
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Procédure d'audit fournisseur
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Méthodologie d'implémentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Méthodologie d'Implémentation</h2>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "Cartographie des Fournisseurs",
              description: "Inventaire exhaustif et classification par criticité",
              duration: "2-4 semaines"
            },
            {
              step: 2,
              title: "Évaluation Sécurité",
              description: "Audit et scoring de tous les fournisseurs critiques",
              duration: "4-8 semaines"
            },
            {
              step: 3,
              title: "Renégociation Contractuelle",
              description: "Intégration des clauses de cybersécurité",
              duration: "6-12 semaines"
            },
            {
              step: 4,
              title: "Surveillance Continue",
              description: "Mise en place du monitoring et de la veille",
              duration: "2-3 semaines"
            }
          ].map((phase) => (
            <Card key={phase.step} className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600"></div>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {phase.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{phase.title}</h3>
                    <p className="text-gray-600">{phase.description}</p>
                  </div>
                  <Badge variant="outline" className="text-blue-700">
                    {phase.duration}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Besoin d'accompagnement Supply Chain ?</h3>
              <p className="text-gray-600 mb-6">
                Notre équipe d'experts vous accompagne dans la sécurisation de votre chaîne d'approvisionnement. 
                De l'audit initial au déploiement, nous vous guidons à chaque étape.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">
                    <Shield className="h-4 w-4 mr-2" />
                    Demander un audit
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/compliance/templates">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger les templates
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default SupplyChainSecurityPage;
