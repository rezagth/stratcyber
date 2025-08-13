'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Library, 
  Search,
  Download,
  ExternalLink,
  Filter,
  ArrowLeft,
  FileText,
  Globe,
  BookOpen,
  Calendar,
  Tag,
  Star,
  Eye,
  User
} from 'lucide-react';

const BibliothecairePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const documents = [
    // Normes ISO
    {
      id: 'iso-27001-2022',
      title: 'ISO/IEC 27001:2022',
      subtitle: 'Information security, cybersecurity and privacy protection',
      description: 'Norme internationale spécifiant les exigences pour établir, mettre en œuvre, maintenir et améliorer continuellement un système de management de la sécurité de l\'information.',
      category: 'ISO',
      type: 'Norme',
      language: 'EN/FR',
      publishDate: '2022-10-25',
      pages: 30,
      price: '158 CHF',
      access: 'Payant',
      rating: 5,
      downloads: 15420,
      views: 87650,
      tags: ['SMSI', 'Certification', 'Sécurité'],
      url: 'https://www.iso.org/standard/82875.html',
      summary: 'Cette nouvelle version 2022 introduit des modifications importantes avec une approche plus flexible et une meilleure intégration avec d\'autres normes ISO.'
    },
    {
      id: 'iso-27002-2022',
      title: 'ISO/IEC 27002:2022',
      subtitle: 'Code of practice for information security controls',
      description: 'Guide d\'implémentation des contrôles de sécurité de l\'information, référence pour l\'application de l\'ISO 27001.',
      category: 'ISO',
      type: 'Guide',
      language: 'EN/FR',
      publishDate: '2022-02-15',
      pages: 96,
      price: '198 CHF',
      access: 'Payant',
      rating: 5,
      downloads: 12380,
      views: 65420,
      tags: ['Contrôles', 'Implémentation', 'Bonnes pratiques'],
      url: 'https://www.iso.org/standard/75652.html',
      summary: 'Version 2022 avec 93 contrôles réorganisés en 4 thèmes principaux : organisationnel, humain, physique et technologique.'
    },
    {
      id: 'iso-27005-2022',
      title: 'ISO/IEC 27005:2022',
      subtitle: 'Guidance on managing information security risks',
      description: 'Lignes directrices pour la gestion des risques de sécurité de l\'information dans le cadre d\'un SMSI.',
      category: 'ISO',
      type: 'Guide',
      language: 'EN/FR',
      publishDate: '2022-10-31',
      pages: 86,
      price: '178 CHF',
      access: 'Payant',
      rating: 4,
      downloads: 8760,
      views: 43210,
      tags: ['Gestion des risques', 'Analyse', 'Évaluation'],
      url: 'https://www.iso.org/standard/80585.html',
      summary: 'Méthodologie complète pour l\'identification, l\'analyse, l\'évaluation et le traitement des risques de sécurité.'
    },

    // Directives européennes
    {
      id: 'rgpd-2016-679',
      title: 'Règlement (UE) 2016/679 - RGPD',
      subtitle: 'Règlement général sur la protection des données',
      description: 'Texte réglementaire européen complet sur la protection des données personnelles et la libre circulation de ces données.',
      category: 'UE',
      type: 'Règlement',
      language: 'FR/EN',
      publishDate: '2016-04-27',
      pages: 88,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 5,
      downloads: 45680,
      views: 234570,
      tags: ['Protection des données', 'Vie privée', 'Droits fondamentaux'],
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0679',
      summary: 'Le RGPD harmonise les règles de protection des données dans l\'UE et renforce les droits des personnes concernées.'
    },
    {
      id: 'nis2-directive-2022',
      title: 'Directive (UE) 2022/2555 - NIS2',
      subtitle: 'Mesures destinées à assurer un niveau élevé commun de cybersécurité',
      description: 'Directive européenne sur la sécurité des réseaux et systèmes d\'information pour les entités critiques et importantes.',
      category: 'UE',
      type: 'Directive',
      language: 'FR/EN',
      publishDate: '2022-12-14',
      pages: 124,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 4,
      downloads: 23450,
      views: 89760,
      tags: ['Cybersécurité', 'Infrastructures critiques', 'Gestion d\'incidents'],
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32022L2555',
      summary: 'NIS2 remplace la directive NIS originale et étend significativement le champ d\'application aux secteurs critiques.'
    },
    {
      id: 'dora-regulation-2022',
      title: 'Règlement (UE) 2022/2554 - DORA',
      subtitle: 'Résilience opérationnelle numérique du secteur financier',
      description: 'Règlement européen établissant des règles uniformes sur la résilience opérationnelle numérique pour le secteur financier.',
      category: 'UE',
      type: 'Règlement',
      language: 'FR/EN',
      publishDate: '2022-12-14',
      pages: 148,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 4,
      downloads: 18920,
      views: 67430,
      tags: ['Secteur financier', 'Résilience', 'Tests de pénétration'],
      url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32022R2554',
      summary: 'DORA impose des exigences strictes de résilience TIC aux entités financières et leurs prestataires critiques.'
    },

    // Guides ANSSI
    {
      id: 'anssi-hygiene-2023',
      title: 'Guide d\'hygiène informatique',
      subtitle: 'Renforcer la sécurité de son système d\'information en 42 mesures',
      description: 'Guide pratique de l\'ANSSI présentant 42 mesures d\'hygiène informatique essentielles pour sécuriser les systèmes d\'information.',
      category: 'ANSSI',
      type: 'Guide',
      language: 'FR',
      publishDate: '2023-01-10',
      pages: 48,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 5,
      downloads: 89760,
      views: 187650,
      tags: ['Hygiène informatique', 'PME', 'Bonnes pratiques'],
      url: 'https://www.ssi.gouv.fr/guide/guide-dhygiene-informatique/',
      summary: 'Version 2023 actualisée avec de nouvelles recommandations sur le télétravail et l\'usage du cloud.'
    },
    {
      id: 'anssi-secnumcloud-2024',
      title: 'SecNumCloud - Référentiel de sécurisation',
      subtitle: 'Référentiel de qualification des services cloud de confiance',
      description: 'Référentiel définissant les exigences de sécurité pour la qualification des services cloud par l\'ANSSI.',
      category: 'ANSSI',
      type: 'Référentiel',
      language: 'FR',
      publishDate: '2024-03-15',
      pages: 156,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 4,
      downloads: 12450,
      views: 34580,
      tags: ['Cloud', 'Qualification', 'Souveraineté'],
      url: 'https://www.ssi.gouv.fr/entreprise/qualification/secnumcloud/',
      summary: 'Référentiel renforcé intégrant les enjeux de souveraineté numérique et les nouvelles menaces cloud.'
    },
    {
      id: 'anssi-ebios-2018',
      title: 'EBIOS Risk Manager',
      subtitle: 'Méthode de gestion des risques numériques',
      description: 'Méthode française de référence pour l\'appréciation et le traitement des risques relatifs à la sécurité de l\'information.',
      category: 'ANSSI',
      type: 'Méthode',
      language: 'FR',
      publishDate: '2018-10-30',
      pages: 78,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 5,
      downloads: 23480,
      views: 76540,
      tags: ['Gestion des risques', 'Méthode', 'Analyse'],
      url: 'https://www.ssi.gouv.fr/guide/ebios-risk-manager-la-methode/',
      summary: 'EBIOS RM est une évolution majeure centrée sur un écosystème numérique et les risques cyber.'
    },

    // Documents techniques spécialisés
    {
      id: 'nist-cybersecurity-2.0',
      title: 'NIST Cybersecurity Framework 2.0',
      subtitle: 'A Profile of the Cybersecurity Framework 2.0',
      description: 'Cadre de cybersécurité du NIST version 2.0, référence mondiale pour l\'organisation de la cybersécurité en entreprise.',
      category: 'NIST',
      type: 'Framework',
      language: 'EN',
      publishDate: '2024-02-26',
      pages: 95,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 5,
      downloads: 67890,
      views: 145630,
      tags: ['Framework', 'Cybersécurité', 'Gouvernance'],
      url: 'https://www.nist.gov/cyberframework',
      summary: 'Version 2.0 incluant de nouvelles fonctions de gouvernance et une approche supply chain renforcée.'
    },
    {
      id: 'enisa-guidelines-2024',
      title: 'ENISA Guidelines for SMEs',
      subtitle: 'Cybersecurity guidelines for small and medium-sized enterprises',
      description: 'Guide pratique de l\'ENISA destiné aux PME européennes pour améliorer leur posture de cybersécurité.',
      category: 'ENISA',
      type: 'Guide',
      language: 'EN/FR',
      publishDate: '2024-01-18',
      pages: 64,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 4,
      downloads: 15670,
      views: 43210,
      tags: ['PME', 'Cybersécurité', 'Europe'],
      url: 'https://www.enisa.europa.eu/',
      summary: 'Recommandations pratiques adaptées aux contraintes budgétaires et organisationnelles des PME.'
    },
    {
      id: 'cisa-zero-trust-2023',
      title: 'CISA Zero Trust Maturity Model',
      subtitle: 'Zero Trust Architecture Implementation Guide',
      description: 'Modèle de maturité Zero Trust développé par la CISA pour guider les organisations dans leur transformation sécuritaire.',
      category: 'CISA',
      type: 'Modèle',
      language: 'EN',
      publishDate: '2023-09-12',
      pages: 89,
      price: 'Gratuit',
      access: 'Gratuit',
      rating: 4,
      downloads: 34520,
      views: 89760,
      tags: ['Zero Trust', 'Architecture', 'Maturité'],
      url: 'https://www.cisa.gov/zero-trust-maturity-model',
      summary: 'Framework complet avec 5 piliers et 3 niveaux de maturité pour une approche Zero Trust pragmatique.'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous les documents', count: documents.length },
    { id: 'ISO', name: 'Normes ISO', count: documents.filter(d => d.category === 'ISO').length },
    { id: 'UE', name: 'Réglementation UE', count: documents.filter(d => d.category === 'UE').length },
    { id: 'ANSSI', name: 'Guides ANSSI', count: documents.filter(d => d.category === 'ANSSI').length },
    { id: 'NIST', name: 'NIST', count: documents.filter(d => d.category === 'NIST').length },
    { id: 'ENISA', name: 'ENISA', count: documents.filter(d => d.category === 'ENISA').length },
    { id: 'CISA', name: 'CISA', count: documents.filter(d => d.category === 'CISA').length }
  ];

  const types = [
    { id: 'all', name: 'Tous types' },
    { id: 'Norme', name: 'Normes' },
    { id: 'Guide', name: 'Guides' },
    { id: 'Règlement', name: 'Règlements' },
    { id: 'Directive', name: 'Directives' },
    { id: 'Framework', name: 'Frameworks' },
    { id: 'Référentiel', name: 'Référentiels' }
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchTerm, selectedCategory, selectedType]);

  const getCategoryColor = (category: string) => {
    const colors = {
      'ISO': 'bg-blue-100 text-blue-800',
      'UE': 'bg-yellow-100 text-yellow-800',
      'ANSSI': 'bg-red-100 text-red-800',
      'NIST': 'bg-green-100 text-green-800',
      'ENISA': 'bg-purple-100 text-purple-800',
      'CISA': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAccessColor = (access: string) => {
    return access === 'Gratuit' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
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
          <div className="p-3 rounded-lg bg-purple-100">
            <Library className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bibliothèque Documentaire</h1>
            <p className="text-lg text-gray-600">Collection complète de normes, guides et références en cybersécurité</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                <div className="text-sm text-gray-600">Documents référencés</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{documents.filter(d => d.access === 'Gratuit').length}</div>
                <div className="text-sm text-gray-600">Documents gratuits</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">Sources officielles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{filteredDocuments.length}</div>
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
              placeholder="Rechercher par titre, description ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Filtres par catégorie */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Catégorie:</span>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
            
            {/* Filtres par type */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Type:</span>
              {types.map((type) => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      <div className="space-y-6">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Aucun document trouvé</h3>
                <p>Essayez de modifier vos critères de recherche ou vos filtres.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                      <Badge variant="outline">
                        {doc.type}
                      </Badge>
                      <Badge className={getAccessColor(doc.access)}>
                        {doc.access}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mb-1">{doc.title}</CardTitle>
                    <p className="text-gray-600 font-medium">{doc.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(doc.rating)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700">{doc.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(doc.publishDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{doc.pages} pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span>{doc.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span>{doc.price}</span>
                  </div>
                </div>

                {doc.summary && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">Résumé :</h4>
                    <p className="text-blue-800 text-sm">{doc.summary}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {doc.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer hover:bg-gray-200"
                           onClick={() => setSearchTerm(tag)}>
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{doc.downloads.toLocaleString()} téléchargements</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{doc.views.toLocaleString()} vues</span>
                    </div>
                  </div>
                  
                  <Button asChild>
                    <Link href={doc.url} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-2">
                      {doc.access === 'Gratuit' ? (
                        <>
                          <Download className="h-4 w-4" />
                          Télécharger
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4" />
                          Consulter
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Footer avec statistiques de recherche */}
      {filteredDocuments.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Affichage de {filteredDocuments.length} document{filteredDocuments.length > 1 ? 's' : ''} 
          {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`}
          {selectedType !== 'all' && ` de type "${types.find(t => t.id === selectedType)?.name}"`}
          {searchTerm && ` correspondant à "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default BibliothecairePage;
