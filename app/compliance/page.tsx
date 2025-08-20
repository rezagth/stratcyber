'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Network, 
  Building2, 
  Target, 
  MapPin, 
  CheckCircle,
  BookOpen,
  TrendingUp,
  Users,
  Lock,
  Globe,
  Clock,
  ArrowRight,
  Award,
  Flag
} from 'lucide-react';

const CompliancePlatform = () => {
const complianceModules = [
    {
      id: 'rgpd',
      title: 'RGPD',
      subtitle: 'Règlement Général sur la Protection des Données',
      description: 'Framework européen complet pour la protection des données personnelles et la vie privée des citoyens.',
      icon: <Shield className="h-8 w-8" />,
      color: 'blue',
      status: 'Actif depuis 2018',
      scope: 'Union Européenne + Extraterritorial',
      priority: 'Critique',
      features: [
        'Droits des personnes concernées',
        'Obligations des responsables de traitement',
        'Amendes jusqu\'à 4% du CA ou 20M€',
        'Principe de accountability'
      ],
      href: '/compliance/rgpd'
    },
    {
      id: 'nis2',
      title: 'NIS2',
      subtitle: 'Network and Information Systems Directive 2',
      description: 'Directive européenne renforcée sur la sécurité des réseaux et systèmes d\'information pour les secteurs critiques.',
      icon: <Network className="h-8 w-8" />,
      color: 'orange',
      status: 'Applicable depuis octobre 2024',
      scope: 'Secteurs essentiels et importants EU',
      priority: 'Élevée',
      features: [
        'Mesures de cybersécurité renforcées',
        'Notification d\'incidents obligatoire',
        'Gouvernance et gestion des risques',
        'Chaîne d\'approvisionnement sécurisée'
      ],
      href: '/compliance/nis2'
    },
    {
      id: 'dora',
      title: 'DORA',
      subtitle: 'Digital Operational Resilience Act',
      description: 'Règlement européen sur la résilience opérationnelle numérique pour le secteur financier.',
      icon: <Building2 className="h-8 w-8" />,
      color: 'green',
      status: 'Applicable depuis janvier 2025',
      scope: 'Secteur financier européen',
      priority: 'Critique',
      features: [
        'Gestion des risques TIC',
        'Tests de résilience opérationnelle',
        'Notification d\'incidents TIC',
        'Surveillance des tiers critiques'
      ],
      href: '/compliance/dora'
    },
    {
      id: 'iso27001',
      title: 'ISO 27001',
      subtitle: 'Management de la Sécurité de l\'Information',
      description: 'Norme internationale de référence pour les systèmes de management de la sécurité de l\'information.',
      icon: <Award className="h-8 w-8" />,
      color: 'indigo',
      status: 'Norme ISO 27001:2022 en vigueur',
      scope: 'International - Toutes organisations',
      priority: 'Importante',
      features: [
        '114 contrôles de sécurité',
        'Certification par organisme accrédité',
        'Amélioration continue (PDCA)',
        'Avantage concurrentiel reconnu'
      ],
      href: '/compliance/iso27001'
    },
    {
      id: 'anssi',
      title: 'ANSSI',
      subtitle: 'Agence Nationale de la Sécurité des SI',
      description: 'Autorité française de cybersécurité - Guides, services et obligations réglementaires.',
      icon: <Flag className="h-8 w-8" />,
      color: 'red',
      status: 'Autorité active depuis 2009',
      scope: 'France - Secteurs critiques et privés',
      priority: 'Importante',
      features: [
        'Guides sectoriels et bonnes pratiques',
        'Services gratuits (Cyberscore, CERT-FR)',
        'Obligations OIV/OSE',
        'Formation SecNumAcadémie'
      ],
      href: '/compliance/anssi'
    },
    {
      id: 'ebios',
      title: 'EBIOS RM',
      subtitle: 'Expression des Besoins et Identification des Objectifs de Sécurité',
      description: 'Méthode française de référence pour l\'analyse et l\'évaluation des risques numériques.',
      icon: <Target className="h-8 w-8" />,
      color: 'purple',
      status: 'Version 2018 en vigueur',
      scope: 'France (recommandée ANSSI)',
      priority: 'Recommandée',
      features: [
        'Analyse des risques cyber',
        'Identification des sources de menaces',
        'Évaluation des impacts métier',
        'Stratégie de traitement des risques'
      ],
      href: '/compliance/ebios'
    }
  ];

  const managementTools = [
    {
      title: 'Dashboard de Conformité',
      description: 'Suivi en temps réel de votre posture de conformité avec KPIs et indicateurs avancés.',
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/compliance/dashboard',
      features: ['KPIs temps réel', 'Alertes personnalisées', 'Rapports automatisés']
    },
    {
      title: 'Templates & Modèles',
      description: 'Bibliothèque de templates professionnels pour accélérer votre mise en conformité.',
      icon: <FileText className="h-6 w-6" />,
      href: '/compliance/templates',
      features: ['12+ templates prêts', 'Multi-formats', 'Mise à jour régulière']
    },
    {
      title: 'Alertes Réglementaires',
      description: 'Veille automatisée des évolutions législatives et réglementaires en temps réel.',
      icon: <AlertTriangle className="h-6 w-6" />,
      href: '/compliance/alertes',
      features: ['Veille 24/7', 'Notifications personnalisées', 'Analyse d\'impact']
    },
    {
      title: 'Plans d\'Action',
      description: 'Suivi opérationnel et gestion des actions correctives pour maintenir la conformité.',
      icon: <CheckCircle className="h-6 w-6" />,
      href: '/compliance/action-plan',
      features: ['Actions correctives', 'Suivi des échéances', 'Tableaux de bord']
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50',
      orange: 'border-orange-200 bg-orange-50',
      green: 'border-green-200 bg-green-50',
      purple: 'border-purple-200 bg-purple-50',
      indigo: 'border-indigo-200 bg-indigo-50',
      red: 'border-red-200 bg-red-50'
    };
    return colors[color as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority) {
      case 'Critique':
        return <Badge variant="destructive">{priority}</Badge>;
      case 'Élevée':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{priority}</Badge>;
      case 'Recommandée':
        return <Badge variant="outline">{priority}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Plateforme de Conformité Réglementaire
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Centre de ressources unifié pour la gestion de la conformité aux réglementations 
              européennes et françaises en matière de cybersécurité, protection des données et résilience numérique.
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 hidden md:flex">
            <Globe className="h-5 w-5 mr-2" />
            Multi-réglementaire
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">6</div>
              <div className="text-sm text-gray-600">Réglementations</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">8+</div>
              <div className="text-sm text-gray-600">Modules intégrés</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">12+</div>
              <div className="text-sm text-gray-600">Templates téléchargeables</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-600">Ressources expertes</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="#regulations">Réglementations</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#management">Outils de gestion</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#resources">Ressources</Link>
          </Button>
        </div>
      </div>

      {/* Réglementations Section */}
      <section id="regulations" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          Réglementations et Frameworks
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {complianceModules.map((module) => (
            <Card key={module.id} className={`transition-all duration-200 hover:shadow-lg ${getColorClasses(module.color)}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      {module.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <CardDescription className="font-medium">{module.subtitle}</CardDescription>
                    </div>
                  </div>
                  {getPriorityBadge(module.priority)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{module.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{module.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{module.scope}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Points clés :</h4>
                  <ul className="space-y-1">
                    {module.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link href={module.href} className="flex items-center justify-center gap-2">
                    Accéder à la documentation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Outils de gestion Section */}

      {/* TODO: fix bug link */}

      {/* <section id="management" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Outils de Gestion et Suivi
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {managementTools.map((tool, index) => (
            <Card key={index} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tool.icon}
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href={tool.href} className="flex items-center justify-center gap-2">
                    Ouvrir l&apos;outil
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}

      {/* Ressources Section */}
      <section id="resources">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Ressources et Support
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Link href="/compliance/glossaire" className="block text-blue-600 hover:underline text-sm">
                  → Glossaire réglementaire complet
                </Link>
                <Link href="/compliance/faq" className="block text-blue-600 hover:underline text-sm">
                  → FAQ avancée avec réponses d&apos;experts
                </Link>
                <Link href="/compliance/bibliotheque" className="block text-blue-600 hover:underline text-sm">
                  → Bibliothèque documentaire complète
                </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes Réglementaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Dernières évolutions législatives
              </Link>
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Jurisprudence récente
              </Link>
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Échéances importantes
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Sécurité et Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Auto-évaluations
              </Link>
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Checklist de conformité
              </Link>
              <Link href="#" className="block text-blue-600 hover:underline text-sm">
                → Outils de diagnostic
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default CompliancePlatform;
