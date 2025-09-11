'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  HelpCircle, 
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Shield,
  FileText,
  Globe,
  Lock,
  AlertTriangle,
  Users,
  BookOpen,
  Lightbulb
} from 'lucide-react';

const FAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const faqItems = [
    // RGPD
    {
      id: 'rgpd-1',
      category: 'RGPD',
      question: 'Quand dois-je obligatoirement désigner un DPO (Data Protection Officer) ?',
      answer: `La désignation d'un DPO est obligatoire dans 3 cas selon l'article 37 du RGPD :
      
1. **Organismes publics** : Toutes les autorités publiques ou organismes publics (sauf juridictions dans l'exercice de leur fonction juridictionnelle)

2. **Traitement à grande échelle** : Responsable de traitement ou sous-traitant dont les activités de base consistent en des opérations de traitement qui exigent un suivi régulier et systématique à grande échelle des personnes concernées

3. **Données sensibles** : Activités de base qui consistent en un traitement à grande échelle de données sensibles (origine raciale, opinions politiques, santé, etc.) ou de données relatives à des condamnations pénales

**Points clés :**
- Le DPO peut être interne ou externe (prestataire)
- Il doit être désigné sur la base de ses qualités professionnelles et de ses connaissances en matière de protection des données
- Sa désignation doit être notifiée à l'autorité de contrôle (CNIL en France)`,
      tags: ['DPO', 'Obligation', 'Désignation', 'CNIL']
    },
    {
      id: 'rgpd-2',
      category: 'RGPD',
      question: 'Comment calculer les délais de notification en cas de violation de données ?',
      answer: `Les délais de notification RGPD sont stricts et comptent en heures :

**Notification à l'autorité de contrôle :**
- **72 heures** maximum après en avoir pris connaissance
- Si délai dépassé : justification obligatoire du retard
- Même si l'enquête n'est pas terminée, notification avec les informations disponibles

**Notification aux personnes concernées :**
- **Dans les meilleurs délais** si risque élevé pour leurs droits et libertés
- Pas de délai fixe mais doit être "sans retard indu"
- Communication claire et compréhensible

**Calcul du délai :**
- Début : moment où l'organisme "prend connaissance" de la violation
- Pas forcément le moment de la violation elle-même
- Week-ends et jours fériés inclus dans le calcul

**Exceptions à la notification aux personnes :**
- Mesures techniques/organisationnelles rendant les données illisibles
- Mesures ultérieures garantissant que le risque ne se matérialisera pas
- Communication disproportionnée (remplacée par communication publique)`,
      tags: ['Violation', 'Notification', 'Délais', '72h', 'CNIL']
    },
    {
      id: 'rgpd-3',
      category: 'RGPD',
      question: 'Puis-je traiter des données personnelles sans consentement ?',
      answer: `Oui, le consentement n'est qu'une des 6 bases légales du RGPD selon l'article 6 :

**1. Consentement** : libre, spécifique, éclairé et univoque
**2. Contrat** : nécessaire à l'exécution d'un contrat ou de mesures précontractuelles
**3. Obligation légale** : respecter une obligation légale (ex: comptabilité, déclaration fiscale)
**4. Sauvegarde des intérêts vitaux** : protéger la vie d'une personne
**5. Mission d'intérêt public** : exécution d'une mission d'intérêt public ou relevant de l'autorité publique
**6. Intérêt légitime** : poursuivre un intérêt légitime à condition qu'il ne prédomine pas sur les droits des personnes

**L'intérêt légitime** est souvent utilisé pour :
- Marketing direct auprès de clients existants
- Prévention de la fraude
- Sécurité des SI et des locaux
- Gestion administrative interne

**Attention :** Pour les données sensibles, bases légales plus restrictives (article 9)`,
      tags: ['Base légale', 'Consentement', 'Intérêt légitime', 'Contrat']
    },

    // NIS2
    {
      id: 'nis2-1',
      category: 'NIS2',
      question: 'Comment savoir si mon entreprise est concernée par NIS2 ?',
      answer: `NIS2 s'applique aux entités selon deux critères : secteur d'activité et taille.

**ENTITÉS ESSENTIELLES (seuils plus bas) :**
- Énergie, Transport, Services bancaires, Infrastructures de marchés financiers, Santé, Eau potable, Eaux usées, Infrastructure numérique, Gestion des services TIC, Espace, Administrations publiques

**ENTITÉS IMPORTANTES (seuils plus élevés) :**
- Poste et courrier, Gestion des déchets, Fabrication/production/distribution de produits chimiques, Production/transformation/distribution de denrées alimentaires, Fabrication (dispositifs médicaux, ordinateurs, machines, véhicules), Fournisseurs de services numériques, Recherche

**SEUILS DE TAILLE :**
- **Entités essentielles :** ≥ 50 salariés OU ≥ 10M€ de chiffre d'affaires
- **Entités importantes :** ≥ 250 salariés OU ≥ 50M€ de chiffre d'affaires ET ≥ 43M€ de bilan

**MICROENTREPRISES EXEMPTÉES :**
- < 10 salariés ET < 2M€ de chiffre d'affaires ou de bilan

**Vérification pratique :**
1. Identifier votre secteur d'activité principal
2. Calculer votre taille selon les critères
3. Consulter la liste nationale des entités désignées par l'ANSSI`,
      tags: ['Périmètre', 'Entités essentielles', 'Entités importantes', 'Seuils']
    },
    {
      id: 'nis2-2',
      category: 'NIS2',
      question: 'Quelles sanctions risque-t-on en cas de non-conformité NIS2 ?',
      answer: `NIS2 prévoit des sanctions administratives et pénales proportionnées :

**SANCTIONS ADMINISTRATIVES :**
- **Entités essentielles :** jusqu'à 10M€ ou 2% du chiffre d'affaires annuel mondial
- **Entités importantes :** jusqu'à 7M€ ou 1,4% du chiffre d'affaires annuel mondial

**SANCTIONS PERSONNELLES :**
- Suspension temporaire des dirigeants
- Interdiction d'exercer des fonctions de direction
- Ces mesures peuvent viser les dirigeants des entités essentielles

**SANCTIONS PÉNALES (droit français) :**
- Amendes pénales pour entrave aux contrôles
- Sanctions pour manquement aux obligations de notification

**FACTEURS AGGRAVANTS :**
- Récidive
- Coopération avec les autorités
- Ampleur du préjudice
- Mesures prises pour atténuer le dommage

**CUMUL POSSIBLE :**
- Sanctions NIS2 + sanctions RGPD si traitement de données personnelles
- Sanctions sectorielles spécifiques (ARCEP, ACPR, etc.)

**Bonnes pratiques :**
- Mise en place d'un programme de conformité
- Documentation des mesures prises
- Formation des équipes dirigeantes`,
      tags: ['Sanctions', 'Amendes', 'Dirigeants', 'Conformité']
    },

    // DORA
    {
      id: 'dora-1',
      category: 'DORA',
      question: 'Quelles sont les différences entre les tests DORA et les tests de pénétration classiques ?',
      answer: `DORA introduit un cadre spécifique pour les tests de résilience opérationnelle :

**TESTS DORA - TLPT (Threat-Led Penetration Testing) :**
- **Fréquence :** Au moins tous les 3 ans
- **Approche :** Basée sur les menaces réelles du secteur financier
- **Périmètre :** Fonctions critiques et importantes de l'entité
- **Simulation :** Scénarios d'attaques sophistiquées (APT)
- **Durée :** Tests prolongés (plusieurs mois possibles)
- **Autorisation :** Tests menés par testeurs certifiés par les autorités

**TESTS DE PÉNÉTRATION CLASSIQUES :**
- Fréquence variable selon la politique interne
- Approche généraliste ou spécialisée
- Périmètre défini contractuellement
- Simulation d'attaques standards
- Durée généralement courte (quelques jours/semaines)
- Prestataires choisis librement

**SPÉCIFICITÉS DORA :**
- **Approche threat-led :** Les tests simulent spécifiquement les tactiques, techniques et procédures (TTP) observées dans les cyberattaques contre le secteur financier
- **Couverture holistique :** Personnes, processus ET technologies
- **Coordination :** Avec les autorités de supervision nationales
- **Objectif :** Tester la résilience face aux menaces les plus sophistiquées

**COMPLÉMENTARITÉ :**
- DORA n'exclut pas d'autres tests de sécurité
- Les tests DORA complètent une stratégie de test plus large`,
      tags: ['Tests', 'TLPT', 'Résilience', 'Threat-led', 'APT']
    },

    // ISO 27001
    {
      id: 'iso27001-1',
      category: 'ISO 27001',
      question: 'Comment définir le périmètre de certification ISO 27001 ?',
      answer: `Le périmètre (scope) de certification est une décision stratégique cruciale :

**CRITÈRES DE DÉFINITION :**
- **Activités métier :** Processus critiques à sécuriser en priorité
- **Localisation :** Sites géographiques concernés
- **Technologies :** Systèmes d'information dans le périmètre
- **Organisations :** Départements, filiales inclus
- **Parties externes :** Prestataires, partenaires concernés

**APPROCHES POSSIBLES :**
1. **Périmètre large :** Toute l'organisation (plus complexe mais plus valorisant)
2. **Périmètre ciblé :** Activités critiques spécifiques (plus manageable)
3. **Périmètre évolutif :** Extension progressive post-certification

**FACTEURS À CONSIDÉRER :**
- **Risques :** Concentrer sur les actifs les plus sensibles
- **Ressources :** Capacité de mise en œuvre et maintenance
- **Métier :** Exigences clients, réglementaires, contractuelles
- **Interdépendances :** Interfaces avec les éléments hors périmètre

**DOCUMENTATION REQUISE :**
- **Déclaration de périmètre :** Description précise et non ambiguë
- **Justification :** Rationale des choix d'inclusion/exclusion
- **Interfaces :** Gestion des éléments en bordure de périmètre

**EVOLUTION POST-CERTIFICATION :**
- Modifications possibles mais justifiées
- Impact sur le certificat à évaluer
- Audits supplémentaires si modifications majeures

**Piège à éviter :** Périmètre trop restreint perdant sa crédibilité métier`,
      tags: ['Périmètre', 'Scope', 'Certification', 'Activités critiques']
    },
    {
      id: 'iso27001-2',
      category: 'ISO 27001',
      question: 'Combien de temps faut-il pour obtenir la certification ISO 27001 ?',
      answer: `La durée varie selon la maturité initiale et les ressources déployées :

**DURÉE TYPIQUE TOTALE : 12 à 24 MOIS**

**PHASE 1 - ANALYSE INITIALE (1-3 mois) :**
- Gap analysis approfondie
- Définition du périmètre et de la stratégie
- Mise en place de la gouvernance projet

**PHASE 2 - CONCEPTION (2-4 mois) :**
- Analyse de risques complète
- Sélection et conception des contrôles
- Rédaction des politiques et procédures

**PHASE 3 - DÉPLOIEMENT (6-12 mois) :**
- Implémentation des 114 contrôles sélectionnés
- Déploiement technique et organisationnel
- Formation et sensibilisation des équipes

**PHASE 4 - PRÉPARATION AUDIT (2-3 mois) :**
- Audit interne complet
- Correction des non-conformités
- Revue de direction et amélioration

**PHASE 5 - CERTIFICATION (1-2 mois) :**
- Audit étape 1 (préparatoire)
- Audit étape 2 (certification)
- Correction écarts mineurs

**FACTEURS ACCÉLÉRATEURS :**
- Maturité sécurité existante élevée
- Ressources dédiées à temps plein
- Accompagnement externe expérimenté
- Périmètre bien délimité

**FACTEURS RETARDATEURS :**
- Organisation complexe/internationale
- Maturité sécurité faible
- Ressources partielles ou partagées
- Périmètre large ou évolutif

**CONSEIL :** Prévoir 18 mois en moyenne pour une première certification`,
      tags: ['Certification', 'Durée', 'Planning', 'Phases', 'Audit']
    },

    // ANSSI
    {
      id: 'anssi-1',
      category: 'ANSSI',
      question: 'Comment obtenir la qualification PASSI et quels sont les avantages ?',
      answer: `La qualification PASSI (Prestataires d'Audit de la Sécurité des Systèmes d'Information) est délivrée par l'ANSSI :

**PROCESS D'OBTENTION :**
1. **Pré-requis :**
   - Société française ou filiale française
   - Activité principale dans l'audit de sécurité
   - 3 ans d'antériorité minimum
   - Références clients significatives

2. **Dossier de candidature :**
   - Capacités techniques et méthodologiques
   - Références et certifications du personnel
   - Organisation et processus qualité
   - Moyens techniques (laboratoires, outils)

3. **Audit ANSSI :**
   - Visite sur site
   - Entretiens avec les équipes
   - Vérification des compétences techniques
   - Contrôle des références

4. **Décision :**
   - Comité de qualification ANSSI
   - Qualification pour 3 ans renouvelable

**AVANTAGES POUR LE PRESTATAIRE :**
- **Reconnaissance officielle :** Gage de compétence reconnu par l'État
- **Marché OIV/OSE :** Accès privilégié aux audits des secteurs critiques
- **Différenciation :** Avantage concurrentiel significatif
- **Réseau :** Intégration dans l'écosystème ANSSI

**AVANTAGES POUR LES CLIENTS :**
- **Qualité garantie :** Compétences vérifiées par l'ANSSI
- **Conformité :** Respect des exigences réglementaires
- **Méthodologie :** Approche standardisée et reconnue
- **Confidentialité :** Habilitation et processus de sécurité

**OBLIGATIONS POST-QUALIFICATION :**
- Maintien des compétences
- Reporting annuel à l'ANSSI
- Respect du référentiel de qualification
- Formation continue du personnel`,
      tags: ['PASSI', 'Qualification', 'ANSSI', 'Audit', 'Prestataire']
    },

    // Cybersécurité générale
    {
      id: 'cyber-1',
      category: 'Cybersécurité',
      question: 'Comment mettre en place une stratégie Zero Trust efficace ?',
      answer: `Le Zero Trust est un modèle de sécurité basé sur "ne jamais faire confiance, toujours vérifier" :

**PRINCIPES FONDAMENTAUX :**
1. **Vérification explicite :** Authentification et autorisation pour chaque transaction
2. **Accès de moindre privilège :** Droits minimaux nécessaires uniquement
3. **Assume breach :** Partir du principe que la compromission est possible

**ÉTAPES DE MISE EN ŒUVRE :**

**1. CARTOGRAPHIE ET INVENTAIRE**
- Identifier tous les actifs (utilisateurs, appareils, applications, données)
- Cartographier les flux de données et communications
- Classifier les actifs selon leur criticité

**2. ARCHITECTURE DE SÉCURITÉ**
- **Micro-segmentation :** Découpage du réseau en zones de confiance minimales
- **SDP (Software-Defined Perimeter) :** Périmètre défini par logiciel
- **SASE (Secure Access Service Edge) :** Convergence réseau et sécurité

**3. TECHNOLOGIES CLÉS**
- **Identity & Access Management (IAM) :** Gestion centralisée des identités
- **Multi-Factor Authentication (MFA) :** Authentification forte systématique
- **CASB (Cloud Access Security Broker) :** Contrôle des accès cloud
- **EDR/XDR :** Détection et réponse sur les terminaux

**4. GOUVERNANCE**
- Politiques de sécurité adaptées
- Formation et sensibilisation
- Monitoring et amélioration continue

**DÉFIS PRINCIPAUX :**
- Complexité de mise en œuvre
- Impact sur l'expérience utilisateur
- Coût des technologies
- Résistance au changement

**ROI ATTENDU :**
- Réduction du temps de détection des incidents
- Limitation de la propagation latérale
- Amélioration de la conformité réglementaire`,
      tags: ['Zero Trust', 'Architecture', 'IAM', 'Micro-segmentation']
    },

    // Juridique
    {
      id: 'juridique-1',
      category: 'Juridique',
      question: 'Comment rédiger une clause de cybersécurité efficace dans un contrat ?',
      answer: `Une clause de cybersécurité doit couvrir les aspects préventifs, opérationnels et de gestion de crise :

**ÉLÉMENTS ESSENTIELS À INCLURE :**

**1. OBLIGATIONS DE SÉCURITÉ**
- Standards de sécurité applicables (ISO 27001, NIST, etc.)
- Mesures techniques minimales (chiffrement, antivirus, pare-feu)
- Mesures organisationnelles (formation, procédures, contrôles)
- Audits et certifications requis

**2. PROTECTION DES DONNÉES**
- Classification des données échangées
- Mesures de protection spécifiques par niveau
- Localisation et souveraineté des données
- Durée de conservation et modalités de destruction

**3. GESTION DES INCIDENTS**
- Définition précise de ce qui constitue un incident
- Délais de notification (ex: 24h pour les incidents majeurs)
- Procédures de remontée et de coordination
- Préservation des preuves et forensic

**4. CONTRÔLES ET AUDITS**
- Droit d'audit de la partie contractante
- Fréquence et modalités des contrôles
- Accès aux rapports de sécurité
- Obligations de transparence

**5. RESPONSABILITÉS ET SANCTIONS**
- Répartition claire des responsabilités
- Régime de responsabilité (limitation/exclusion)
- Pénalités en cas de manquement
- Modalités de résiliation pour cause sécuritaire

**6. SOUS-TRAITANCE**
- Obligations identiques imposées aux sous-traitants
- Validation préalable des sous-traitants sensibles
- Clauses de flow-down

**EXEMPLES DE CLAUSES TYPES :**
- "Le Prestataire s'engage à maintenir un niveau de sécurité au moins équivalent à [référentiel] et à notifier dans les [X] heures tout incident de sécurité susceptible d'affecter les données du Client."

**POINTS D'ATTENTION :**
- Équilibre entre exigences de sécurité et faisabilité opérationnelle
- Articulation avec les clauses RGPD si données personnelles
- Prise en compte de l'évolution technologique`,
      tags: ['Contrat', 'Clause', 'Cybersécurité', 'Responsabilité', 'Audit']
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes les questions', icon: HelpCircle, count: faqItems.length },
    { id: 'RGPD', name: 'RGPD', icon: Shield, count: faqItems.filter(item => item.category === 'RGPD').length },
    { id: 'NIS2', name: 'NIS2', icon: Globe, count: faqItems.filter(item => item.category === 'NIS2').length },
    { id: 'DORA', name: 'DORA', icon: FileText, count: faqItems.filter(item => item.category === 'DORA').length },
    { id: 'ISO 27001', name: 'ISO 27001', icon: Lock, count: faqItems.filter(item => item.category === 'ISO 27001').length },
    { id: 'ANSSI', name: 'ANSSI', icon: AlertTriangle, count: faqItems.filter(item => item.category === 'ANSSI').length },
    { id: 'Cybersécurité', name: 'Cybersécurité', icon: Users, count: faqItems.filter(item => item.category === 'Cybersécurité').length },
    { id: 'Juridique', name: 'Juridique', icon: BookOpen, count: faqItems.filter(item => item.category === 'Juridique').length }
  ];

  const filteredItems = useMemo(() => {
    return faqItems.filter(item => {
      const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'RGPD': 'bg-blue-100 text-blue-800',
      'NIS2': 'bg-orange-100 text-orange-800',
      'DORA': 'bg-green-100 text-green-800',
      'ISO 27001': 'bg-indigo-100 text-indigo-800',
      'ANSSI': 'bg-red-100 text-red-800',
      'Cybersécurité': 'bg-gray-100 text-gray-800',
      'Juridique': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/compliance">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-lg bg-orange-100">
            <Lightbulb className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ Avancée</h1>
            <p className="text-lg text-gray-600">Questions fréquentes avec réponses détaillées d'experts</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{faqItems.length}</div>
                <div className="text-sm text-gray-600">Questions répondues</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">Catégories</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{faqItems.reduce((acc, item) => acc + item.tags.length, 0)}</div>
                <div className="text-sm text-gray-600">Tags associés</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredItems.length}</div>
                <div className="text-sm text-gray-600">Résultats affichés</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une question, réponse ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucune question trouvée</h3>
                <p>Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <Collapsible>
                <CollapsibleTrigger 
                  className="w-full"
                  onClick={() => toggleItem(item.id)}
                >
                  <CardHeader className="hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg pr-4">{item.question}</CardTitle>
                      </div>
                      <div className="flex-shrink-0">
                        {openItems.includes(item.id) ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, idx) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => setSearchTerm(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>

      {/* Actions rapides */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-4">Vous ne trouvez pas votre réponse ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <BookOpen className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="font-semibold">Consultez le glossaire</h3>
                <p className="text-sm text-gray-600">Définitions complètes des termes techniques</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/compliance/glossaire">Accéder au glossaire</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <FileText className="h-8 w-8 mx-auto text-green-600" />
                <h3 className="font-semibold">Documentation détaillée</h3>
                <p className="text-sm text-gray-600">Guides complets par réglementation</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/compliance">Voir la documentation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <HelpCircle className="h-8 w-8 mx-auto text-orange-600" />
                <h3 className="font-semibold">Contactez-nous</h3>
                <p className="text-sm text-gray-600">Support expert personnalisé</p>
                <Button variant="outline" size="sm">
                  Obtenir de l'aide
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer avec statistiques de recherche */}
      {filteredItems.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Affichage de {filteredItems.length} question{filteredItems.length > 1 ? 's' : ''} 
          {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`}
          {searchTerm && ` correspondant à "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default FAQPage;
