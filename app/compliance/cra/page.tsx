'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Settings, 
  FileText, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Code,
  ArrowLeft,
  ExternalLink,
  Download
} from 'lucide-react';

const CRACompliancePage = () => {
  const craRequirements = [
    {
      title: "Cybersécurité by Design",
      description: "Intégrer la sécurité dès la conception du produit",
      status: "Obligatoire",
      deadline: "Octobre 2027",
      icon: <Settings className="h-5 w-5" />
    },
    {
      title: "Gestion des Vulnérabilités",
      description: "Processus de détection, correction et notification des vulnérabilités",
      status: "Obligatoire", 
      deadline: "Octobre 2027",
      icon: <Shield className="h-5 w-5" />
    },
    {
      title: "Documentation Technique",
      description: "Documentation de sécurité complète et accessible",
      status: "Obligatoire",
      deadline: "Octobre 2027", 
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Déclaration de Conformité",
      description: "Déclaration CE incluant les aspects cybersécurité",
      status: "Obligatoire",
      deadline: "Octobre 2027",
      icon: <CheckCircle2 className="h-5 w-5" />
    }
  ];

  const productCategories = [
    {
      category: "Classe I - Produits Critiques",
      description: "Produits avec impact critique sur la sécurité",
      examples: ["Systèmes industriels", "Infrastructures critiques", "Dispositifs médicaux connectés"],
      requirements: "Évaluation par tierce partie obligatoire",
      color: "red"
    },
    {
      category: "Classe II - Produits Importants", 
      description: "Produits numériques grand public et professionnels",
      examples: ["Objets connectés", "Logiciels grand public", "Applications mobiles"],
      requirements: "Auto-évaluation avec déclaration de conformité",
      color: "orange"
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: "Évaluation de l'applicabilité",
      description: "Déterminer si vos produits sont soumis au CRA",
      duration: "2-3 semaines",
      deliverables: ["Analyse produits", "Classification CRA"]
    },
    {
      step: 2,
      title: "Analyse d'écart",
      description: "Identifier les écarts avec les exigences CRA",
      duration: "4-6 semaines", 
      deliverables: ["Gap analysis", "Plan de mise en conformité"]
    },
    {
      step: 3,
      title: "Mise en œuvre technique",
      description: "Implémentation des mesures de cybersécurité",
      duration: "6-12 mois",
      deliverables: ["Mesures techniques", "Processus sécurisés"]
    },
    {
      step: 4,
      title: "Documentation et certification",
      description: "Préparer la documentation de conformité",
      duration: "4-8 semaines",
      deliverables: ["Documentation technique", "Déclaration CE"]
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
          <Badge className="bg-purple-100 text-purple-800">En Préparation</Badge>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          CRA - Cyber Resilience Act
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Règlement européen sur la résilience cybernétique des produits numériques. 
          Applicable à partir d'octobre 2027 pour tous les produits numériques commercialisés dans l'UE.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-semibold">Entrée en vigueur</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">Oct. 2027</p>
              <p className="text-sm text-gray-600">Produits mis sur le marché</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Portée</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">Produits UE</p>
              <p className="text-sm text-gray-600">Connectés et numériques</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold">Sanctions</span>
              </div>
              <p className="text-2xl font-bold text-red-600">15M€</p>
              <p className="text-sm text-gray-600">Ou 2.5% du CA mondial</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Exigences principales */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Exigences Principales du CRA</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {craRequirements.map((req, index) => (
            <Card key={index} className="border-l-4 border-l-purple-400">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {req.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{req.title}</CardTitle>
                      <CardDescription>{req.description}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-purple-700">
                    {req.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Échéance: {req.deadline}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Classification des produits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Classification des Produits</h2>
        <div className="space-y-6">
          {productCategories.map((category, index) => (
            <Card key={index} className={`border-l-4 ${category.color === 'red' ? 'border-l-red-400' : 'border-l-orange-400'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                  <Badge variant={category.color === 'red' ? 'destructive' : 'secondary'}>
                    {category.color === 'red' ? 'Critique' : 'Important'}
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Exemples de produits :</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {category.examples.map((example, idx) => (
                        <li key={idx} className="text-gray-600">{example}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Exigences :</h4>
                    <p className="text-sm text-gray-600">{category.requirements}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Étapes de mise en œuvre */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Plan de Mise en Conformité</h2>
        <div className="space-y-6">
          {implementationSteps.map((step) => (
            <Card key={step.step} className="relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600"></div>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-purple-700">
                    {step.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="font-semibold mb-2">Livrables :</h4>
                  <div className="flex flex-wrap gap-2">
                    {step.deliverables.map((deliverable, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {deliverable}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ressources et outils */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Ressources et Outils</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation Officielle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <a href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R2847" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Règlement CRA (UE) 2024/2847
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full justify-start">
                <a href="https://www.enisa.europa.eu/topics/cybersecurity-policy/cyber-resilience-act" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Guide ENISA CRA
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Templates StratCyber
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Checklist d'évaluation CRA
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Template de documentation technique
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Modèle de déclaration de conformité
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section>
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Besoin d'aide pour le CRA ?</h3>
              <p className="text-gray-600 mb-6">
                Notre équipe d'experts vous accompagne dans votre mise en conformité CRA. 
                De l'évaluation initiale à la certification, nous vous guidons à chaque étape.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/contact">
                    <Zap className="h-4 w-4 mr-2" />
                    Demander un accompagnement
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

export default CRACompliancePage;
