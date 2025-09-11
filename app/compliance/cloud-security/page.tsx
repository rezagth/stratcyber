'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Cloud, Shield, Network, Lock, Eye, Download, ExternalLink, BookOpen, CheckCircle, AlertCircle, Server, Database } from 'lucide-react';
import Link from 'next/link';

export default function CloudSecurityDocumentation() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const checklistItems = [
    { id: 'vpc', text: 'Configurer un VPC dédié avec segmentation réseau', critical: true },
    { id: 'iam', text: 'Mettre en place des politiques IAM granulaires', critical: true },
    { id: 'encryption', text: 'Activer le chiffrement au repos et en transit', critical: true },
    { id: 'monitoring', text: 'Déployer un système de monitoring et alertes', critical: true },
    { id: 'backup', text: 'Implémenter une stratégie de sauvegarde 3-2-1', critical: true },
    { id: 'firewall', text: 'Configurer les groupes de sécurité/pare-feu', critical: true },
    { id: 'logging', text: 'Activer la journalisation complète', critical: false },
    { id: 'compliance', text: 'Vérifier la conformité RGPD des données', critical: true },
    { id: 'incident', text: 'Définir les procédures de réponse aux incidents', critical: false },
    { id: 'training', text: 'Former les équipes à la sécurité cloud', critical: false }
  ];

  const cloudProviders = [
    {
      name: 'AWS',
      services: ['IAM', 'VPC', 'CloudTrail', 'GuardDuty', 'KMS'],
      color: 'orange'
    },
    {
      name: 'Azure',
      services: ['Azure AD', 'Network Security Groups', 'Security Center', 'Key Vault'],
      color: 'blue'
    },
    {
      name: 'Google Cloud',
      services: ['Cloud IAM', 'VPC', 'Security Command Center', 'Cloud KMS'],
      color: 'green'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sécurité Cloud ANSSI
            </h1>
            <p className="text-lg text-gray-600">
              Guide complet pour sécuriser vos infrastructures cloud selon les recommandations ANSSI
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Cloud className="h-5 w-5 mr-2" />
            Guide ANSSI
          </Badge>
        </div>
        
        {/* Navigation rapide */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="#overview">Vue d'ensemble</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#architecture">Architecture</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#security">Sécurité</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#providers">Fournisseurs</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="#checklist">Checklist</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="providers">Fournisseurs</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" id="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Introduction à la Sécurité Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    La sécurité cloud nécessite une approche spécifique basée sur le modèle de responsabilité partagée 
                    entre le fournisseur cloud et l'organisation.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Modèle de responsabilité partagée :</h3>
                    <ul className="space-y-1 text-green-800">
                      <li><strong>Fournisseur cloud :</strong> Sécurité DE l'infrastructure</li>
                      <li><strong>Client :</strong> Sécurité DANS l'infrastructure</li>
                      <li><strong>Partagé :</strong> Configuration, contrôles d'accès</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Avantages</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Élasticité et scalabilité</li>
                        <li>• Réduction des coûts</li>
                        <li>• Sécurité renforcée</li>
                        <li>• Haute disponibilité</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Risques spécifiques</h4>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• Perte de contrôle</li>
                        <li>• Dépendance fournisseur</li>
                        <li>• Localisation des données</li>
                        <li>• Conformité réglementaire</li>
                      </ul>
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
                  <Link href="https://www.ssi.gouv.fr/guide/recommandations-de-securite-relatives-a-un-systeme-generique-de-cloud-computing/" target="_blank">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Guide ANSSI Cloud
                    </Button>
                  </Link>
                  <Link href="/compliance/templates#cloud">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Templates de sécurité
                    </Button>
                  </Link>
                  <Link href="#checklist">
                    <Button variant="outline" className="w-full justify-start">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Checklist de configuration
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <strong>SecNumCloud :</strong> Visa ANSSI
                  </div>
                  <div className="text-sm">
                    <strong>ISO 27001 :</strong> Standard international
                  </div>
                  <div className="text-sm">
                    <strong>SOC 2 :</strong> Contrôles de service
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Architecture */}
        <TabsContent value="architecture" id="architecture">
          <Card>
            <CardHeader>
              <CardTitle>Architecture Cloud Sécurisée</CardTitle>
              <CardDescription>
                Principes fondamentaux pour une architecture cloud sécurisée selon l'ANSSI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="network">
                  <AccordionTrigger>Segmentation Réseau</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Isoler les différents composants de votre infrastructure cloud.</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Bonnes pratiques :</h4>
                      <ul className="space-y-1">
                        <li>• VPC/VNet dédié par environnement</li>
                        <li>• Sous-réseaux privés et publics séparés</li>
                        <li>• NAT Gateway pour l'accès sortant</li>
                        <li>• Pas d'accès internet direct aux ressources sensibles</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="access">
                  <AccordionTrigger>Contrôle d'Accès (IAM)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Principe du moindre privilège et gestion fine des permissions.</p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Éléments clés :</h4>
                      <ul className="space-y-1">
                        <li>• Authentification multi-facteurs (MFA)</li>
                        <li>• Rôles plutôt que permissions directes</li>
                        <li>• Rotation régulière des clés d'accès</li>
                        <li>• Audit des permissions trimestriel</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="encryption">
                  <AccordionTrigger>Chiffrement des Données</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p>Protection des données au repos et en transit.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Au repos :</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Chiffrement des volumes</li>
                          <li>• Chiffrement des bases de données</li>
                          <li>• Chiffrement du stockage objet</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">En transit :</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• TLS 1.3 minimum</li>
                          <li>• VPN pour connexions admin</li>
                          <li>• Chiffrement inter-services</li>
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="monitoring">
                  <AccordionTrigger>Surveillance et Monitoring</AccordionTrigger>
                  <AccordionContent>
                    <p>Détection d'anomalies et réponse aux incidents en temps réel.</p>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-segibold mb-2">Composants essentiels :</h4>
                      <ul className="space-y-1">
                        <li>• SIEM centralisé</li>
                        <li>• Logs d'audit complets</li>
                        <li>• Alertes automatisées</li>
                        <li>• Dashboard de sécurité temps réel</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security" id="security">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Protection des Données",
                icon: <Lock className="h-6 w-6" />,
                description: "Sécurisation et classification des données sensibles",
                details: ["Chiffrement AES-256", "Gestion des clés (KMS)", "Classification automatique", "DLP (Data Loss Prevention)"]
              },
              {
                title: "Sécurité Réseau",
                icon: <Network className="h-6 w-6" />,
                description: "Protection périmétrique et segmentation",
                details: ["WAF (Web Application Firewall)", "DDoS Protection", "Inspection du trafic", "Micro-segmentation"]
              },
              {
                title: "Surveillance Continue",
                icon: <Eye className="h-6 w-6" />,
                description: "Monitoring et détection d'anomalies 24/7",
                details: ["SIEM centralisé", "Détection comportementale", "Threat Intelligence", "SOC as a Service"]
              },
              {
                title: "Sauvegarde & Recovery",
                icon: <Database className="h-6 w-6" />,
                description: "Continuité d'activité et plan de reprise",
                details: ["Règle 3-2-1", "Tests de restauration", "RTO/RPO définis", "Site de secours"]
              }
            ].map((security, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {security.icon}
                    {security.title}
                  </CardTitle>
                  <CardDescription>{security.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {security.details.map((detail, idx) => (
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

        {/* Fournisseurs Cloud */}
        <TabsContent value="providers" id="providers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comparaison des Fournisseurs Cloud</CardTitle>
                <CardDescription>
                  Services de sécurité des principaux fournisseurs cloud
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cloudProviders.map((provider) => (
                    <div key={provider.name} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">{provider.name}</h3>
                      <div className="space-y-2">
                        {provider.services.map((service, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critères de Sélection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Sécurité</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Certifications (ISO 27001, SOC 2)</li>
                      <li>• Localisation des données (EU)</li>
                      <li>• Chiffrement natif</li>
                      <li>• Services de sécurité intégrés</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Conformité</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Conformité RGPD</li>
                      <li>• Certification SecNumCloud</li>
                      <li>• Audit des sous-traitants</li>
                      <li>• Transparence sur les accès</li>
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
              <CardTitle>Checklist de Sécurité Cloud</CardTitle>
              <CardDescription>
                Vérifiez que votre infrastructure cloud respecte les bonnes pratiques de sécurité
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
