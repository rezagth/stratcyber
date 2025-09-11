'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search,
  Filter,
  ArrowLeft,
  Shield,
  FileText,
  Globe,
  Lock,
  AlertTriangle,
  Users,
  Cog
} from 'lucide-react';

const GlossairePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const glossaryTerms = [
    // RGPD
    {
      term: 'Accountability (Responsabilité)',
      definition: 'Principe du RGPD selon lequel les responsables de traitement doivent être en mesure de démontrer leur conformité aux règles de protection des données.',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Responsable de traitement', 'DPO', 'Privacy by Design']
    },
    {
      term: 'Analyse d\'Impact (AIPD/DPIA)',
      definition: 'Évaluation préalable obligatoire pour les traitements présentant des risques élevés pour les droits et libertés des personnes concernées.',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Risque élevé', 'Consultation préalable', 'Privacy by Design']
    },
    {
      term: 'Consentement',
      definition: 'Manifestation de volonté, libre, spécifique, éclairée et univoque par laquelle la personne concernée accepte que des données à caractère personnel la concernant fassent l\'objet d\'un traitement.',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Base légale', 'Retrait du consentement', 'Données sensibles']
    },
    {
      term: 'DPO (Data Protection Officer)',
      definition: 'Délégué à la protection des données. Personne désignée pour veiller au respect du RGPD au sein de l\'organisation.',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Responsable de traitement', 'CNIL', 'Registre des traitements']
    },
    {
      term: 'Données à caractère personnel',
      definition: 'Toute information se rapportant à une personne physique identifiée ou identifiable (pseudonymisation incluse).',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Personne concernée', 'Données sensibles', 'Pseudonymisation']
    },
    {
      term: 'Privacy by Design',
      definition: 'Principe consistant à intégrer la protection des données dès la conception des systèmes et par défaut.',
      category: 'RGPD',
      regulation: 'RGPD',
      relatedTerms: ['Privacy by Default', 'AIPD', 'Minimisation des données']
    },

    // NIS2
    {
      term: 'Entité essentielle',
      definition: 'Organisation fournissant des services essentiels dans les secteurs critiques (énergie, transport, santé, etc.) selon NIS2.',
      category: 'NIS2',
      regulation: 'NIS2',
      relatedTerms: ['Entité importante', 'OSE', 'Secteurs critiques']
    },
    {
      term: 'Incident de cybersécurité',
      definition: 'Événement ayant ou susceptible d\'avoir un impact négatif sur la sécurité des réseaux et systèmes d\'information.',
      category: 'NIS2',
      regulation: 'NIS2',
      relatedTerms: ['Notification d\'incident', 'Gestion de crise', 'CSIRT']
    },
    {
      term: 'Mesures de cybersécurité',
      definition: 'Ensemble des mesures techniques et organisationnelles destinées à gérer les risques pesant sur la sécurité des réseaux et systèmes d\'information.',
      category: 'NIS2',
      regulation: 'NIS2',
      relatedTerms: ['Gestion des risques', 'Résilience', 'Continuité d\'activité']
    },

    // DORA
    {
      term: 'Résilience opérationnelle numérique',
      definition: 'Capacité d\'une entité financière à construire, assurer et réviser son intégrité opérationnelle et sa fiabilité.',
      category: 'DORA',
      regulation: 'DORA',
      relatedTerms: ['Risque TIC', 'Tests de pénétration', 'Tiers critique TIC']
    },
    {
      term: 'Risque TIC',
      definition: 'Risque d\'atteinte ou de dysfonctionnement des technologies de l\'information et de la communication pouvant compromettre les activités d\'une entité financière.',
      category: 'DORA',
      regulation: 'DORA',
      relatedTerms: ['Résilience opérationnelle', 'Gestion des incidents TIC', 'Continuité d\'activité']
    },
    {
      term: 'Tiers critique TIC',
      definition: 'Prestataire de services TIC dont une défaillance ou une interruption de service pourrait avoir un impact significatif sur les activités commerciales d\'une entité financière.',
      category: 'DORA',
      regulation: 'DORA',
      relatedTerms: ['Surveillance', 'Contrat TIC', 'Concentration des risques']
    },

    // ISO 27001
    {
      term: 'SMSI (Système de Management de la Sécurité de l\'Information)',
      definition: 'Système de management permettant d\'établir, de mettre en œuvre, de faire fonctionner, de surveiller et d\'améliorer la sécurité de l\'information.',
      category: 'ISO 27001',
      regulation: 'ISO 27001',
      relatedTerms: ['PDCA', 'Amélioration continue', 'Contrôles de sécurité']
    },
    {
      term: 'Analyse de risques',
      definition: 'Processus d\'identification, d\'analyse et d\'évaluation des risques de sécurité de l\'information.',
      category: 'ISO 27001',
      regulation: 'ISO 27001',
      relatedTerms: ['Traitement du risque', 'Actifs informationnels', 'Menaces']
    },
    {
      term: 'Contrôles de sécurité',
      definition: 'Mesures de protection appliquées pour traiter les risques de sécurité de l\'information (114 contrôles dans l\'Annexe A).',
      category: 'ISO 27001',
      regulation: 'ISO 27001',
      relatedTerms: ['Annexe A', 'Déclaration d\'applicabilité', 'Efficacité des contrôles']
    },

    // ANSSI
    {
      term: 'OIV (Opérateur d\'Importance Vitale)',
      definition: 'Opérateurs publics ou privés gérant des établissements ou ouvrages indispensables à la vie de la nation.',
      category: 'ANSSI',
      regulation: 'ANSSI',
      relatedTerms: ['Points d\'importance vitale', 'Secteurs d\'activité vitale', 'Homologation']
    },
    {
      term: 'Homologation de sécurité',
      definition: 'Validation officielle qu\'un système d\'information présente un niveau de sécurité acceptable au regard des enjeux.',
      category: 'ANSSI',
      regulation: 'ANSSI',
      relatedTerms: ['RGS', 'Autorité d\'homologation', 'Dossier de sécurité']
    },
    {
      term: 'PASSI (Prestataires d\'Audit de la Sécurité des Systèmes d\'Information)',
      definition: 'Qualification délivrée par l\'ANSSI aux prestataires spécialisés dans l\'audit de sécurité.',
      category: 'ANSSI',
      regulation: 'ANSSI',
      relatedTerms: ['PRIS', 'Qualification', 'Prestataire de confiance']
    },

    // EBIOS RM
    {
      term: 'Bien support',
      definition: 'Élément du système d\'information qui porte ou traite les valeurs métier et dont la compromission peut affecter ces valeurs.',
      category: 'EBIOS RM',
      regulation: 'EBIOS RM',
      relatedTerms: ['Valeurs métier', 'Sources de risques', 'Événements redoutés']
    },
    {
      term: 'Source de risque',
      definition: 'Élément qui peut être à l\'origine d\'un risque (naturel, humain, environnemental, etc.).',
      category: 'EBIOS RM',
      regulation: 'EBIOS RM',
      relatedTerms: ['Événement redouté', 'Scénario de menace', 'Impact']
    },
    {
      term: 'Scénario de risque',
      definition: 'Combinaison d\'un scénario de menace et d\'un ou plusieurs scénarios opérationnels décrivant comment le risque peut se concrétiser.',
      category: 'EBIOS RM',
      regulation: 'EBIOS RM',
      relatedTerms: ['Vraisemblance', 'Gravité', 'Mesures de sécurité']
    },

    // Termes généraux cybersécurité
    {
      term: 'APT (Advanced Persistent Threat)',
      definition: 'Cyberattaque sophistiquée et prolongée, généralement menée par des groupes organisés pour infiltrer et maintenir un accès à long terme.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['Threat Intelligence', 'IOC', 'Kill Chain']
    },
    {
      term: 'Chiffrement',
      definition: 'Procédé cryptographique permettant de rendre des données illisibles sans la clé de déchiffrement appropriée.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['Chiffrement symétrique', 'Chiffrement asymétrique', 'PKI']
    },
    {
      term: 'Défense en profondeur',
      definition: 'Stratégie de sécurité multicouches utilisant plusieurs mesures de protection redondantes pour sécuriser un système.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['Sécurité multicouches', 'Redondance', 'Fail-safe']
    },
    {
      term: 'SIEM (Security Information and Event Management)',
      definition: 'Solution technologique qui collecte et analyse en temps réel les événements de sécurité provenant de l\'ensemble du système d\'information.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['SOC', 'Corrélation d\'événements', 'Détection d\'incidents']
    },
    {
      term: 'SOC (Security Operations Center)',
      definition: 'Centre opérationnel dédié à la surveillance, la détection, l\'analyse et la réponse aux incidents de cybersécurité.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['SIEM', 'Threat Hunting', 'Incident Response']
    },
    {
      term: 'Zero Trust',
      definition: 'Modèle de sécurité basé sur le principe "ne jamais faire confiance, toujours vérifier", qui vérifie chaque transaction.',
      category: 'Cybersécurité',
      regulation: 'Général',
      relatedTerms: ['Authentification forte', 'Principe de moindre privilège', 'Micro-segmentation']
    },

    // Termes juridiques
    {
      term: 'Base légale',
      definition: 'Fondement juridique autorisant un traitement de données personnelles selon le RGPD (consentement, intérêt légitime, etc.).',
      category: 'Juridique',
      regulation: 'RGPD',
      relatedTerms: ['Consentement', 'Intérêt légitime', 'Obligation légale']
    },
    {
      term: 'Force majeure',
      definition: 'Événement imprévisible, irrésistible et extérieur qui rend impossible l\'exécution d\'une obligation contractuelle.',
      category: 'Juridique',
      regulation: 'Général',
      relatedTerms: ['Cas fortuit', 'Responsabilité contractuelle', 'Exonération']
    },
    {
      term: 'Sous-traitance',
      definition: 'Opération par laquelle une personne confie à une autre l\'exécution d\'une prestation selon ses directives.',
      category: 'Juridique',
      regulation: 'RGPD',
      relatedTerms: ['Responsable de traitement', 'Contrat de sous-traitance', 'Co-responsabilité']
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous les termes', icon: BookOpen },
    { id: 'RGPD', name: 'RGPD', icon: Shield },
    { id: 'NIS2', name: 'NIS2', icon: Globe },
    { id: 'DORA', name: 'DORA', icon: FileText },
    { id: 'ISO 27001', name: 'ISO 27001', icon: Lock },
    { id: 'ANSSI', name: 'ANSSI', icon: AlertTriangle },
    { id: 'EBIOS RM', name: 'EBIOS RM', icon: Users },
    { id: 'Cybersécurité', name: 'Cybersécurité', icon: Cog },
    { id: 'Juridique', name: 'Juridique', icon: FileText }
  ];

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
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
      'EBIOS RM': 'bg-purple-100 text-purple-800',
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
          <div className="p-3 rounded-lg bg-blue-100">
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Glossaire Réglementaire & Cybersécurité</h1>
            <p className="text-lg text-gray-600">Définitions complètes des termes techniques et juridiques</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{glossaryTerms.length}</div>
                <div className="text-sm text-gray-600">Termes définis</div>
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
                <div className="text-2xl font-bold text-orange-600">6</div>
                <div className="text-sm text-gray-600">Réglementations</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredTerms.length}</div>
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
              placeholder="Rechercher un terme ou une définition..."
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
                  {category.id !== 'all' && (
                    <Badge variant="secondary" className="ml-1">
                      {glossaryTerms.filter(t => t.category === category.id).length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liste des termes */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucun résultat trouvé</h3>
                <p>Essayez de modifier vos critères de recherche ou de sélectionner une autre catégorie.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTerms.map((term, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{term.term}</CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getCategoryColor(term.category)}>
                      {term.category}
                    </Badge>
                    <Badge variant="outline">
                      {term.regulation}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">{term.definition}</p>
                
                {term.relatedTerms && term.relatedTerms.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Termes associés :</h4>
                    <div className="flex flex-wrap gap-2">
                      {term.relatedTerms.map((relatedTerm, idx) => (
                        <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-gray-200"
                               onClick={() => setSearchTerm(relatedTerm)}>
                          {relatedTerm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer avec statistiques de recherche */}
      {filteredTerms.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Affichage de {filteredTerms.length} terme{filteredTerms.length > 1 ? 's' : ''} 
          {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`}
          {searchTerm && ` correspondant à "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default GlossairePage;
