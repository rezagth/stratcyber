'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  FileText,
  FileSpreadsheet,
  FileImage,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  User,
  Star,
  Eye,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Shield,
  Building2,
  Network,
  Award,
  Flag
} from 'lucide-react';

const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');

  const templates = [
    // RGPD Templates
    {
      id: 'rgpd-registry',
      title: 'Registre des Traitements RGPD',
      description: 'Modèle complet pour documenter tous les traitements de données personnelles selon l\'article 30 du RGPD.',
      category: 'RGPD',
      format: 'Excel',
      size: '2.8 MB',
      difficulty: 'Intermédiaire',
      downloadCount: 3456,
      rating: 4.8,
      lastUpdate: '2024-01-15',
      features: [
        'Feuilles pré-configurées par type de traitement',
        'Formules de validation automatique',
        'Export PDF intégré',
        'Guide d\'utilisation inclus'
      ],
      preview: '/templates/previews/rgpd-registry.png',
      downloadUrl: '/templates/downloads/rgpd-registry.xlsx'
    },
    {
      id: 'rgpd-privacy-policy',
      title: 'Politique de Confidentialité Type',
      description: 'Modèle de politique de confidentialité conforme RGPD avec clauses personnalisables selon votre activité.',
      category: 'RGPD',
      format: 'Word',
      size: '450 KB',
      difficulty: 'Facile',
      downloadCount: 5672,
      rating: 4.9,
      lastUpdate: '2024-01-10',
      features: [
        'Clauses conformes RGPD',
        'Sections modulaires',
        'Instructions de personnalisation',
        'Versions web et mobile'
      ],
      preview: '/templates/previews/rgpd-privacy.png',
      downloadUrl: '/templates/downloads/rgpd-privacy.docx'
    },
    {
      id: 'rgpd-dpia-template',
      title: 'Analyse d\'Impact (AIPD/DPIA)',
      description: 'Template d\'analyse d\'impact sur la protection des données avec méthodologie complète et grilles d\'évaluation.',
      category: 'RGPD',
      format: 'Word',
      size: '1.2 MB',
      difficulty: 'Avancé',
      downloadCount: 2134,
      rating: 4.7,
      lastUpdate: '2024-01-08',
      features: [
        'Méthodologie étape par étape',
        'Grilles d\'évaluation des risques',
        'Matrices de probabilité/impact',
        'Recommandations types'
      ],
      preview: '/templates/previews/rgpd-dpia.png',
      downloadUrl: '/templates/downloads/rgpd-dpia.docx'
    },

    // NIS2 Templates
    {
      id: 'nis2-incident-report',
      title: 'Formulaire Notification Incident NIS2',
      description: 'Modèle de notification d\'incident de cybersécurité conforme aux exigences NIS2 et délais réglementaires.',
      category: 'NIS2',
      format: 'Word',
      size: '380 KB',
      difficulty: 'Intermédiaire',
      downloadCount: 1567,
      rating: 4.6,
      lastUpdate: '2024-01-12',
      features: [
        'Formulaire pré-structuré',
        'Check-list des informations requises',
        'Calcul automatique des délais',
        'Modèles de communication'
      ],
      preview: '/templates/previews/nis2-incident.png',
      downloadUrl: '/templates/downloads/nis2-incident.docx'
    },
    {
      id: 'nis2-risk-assessment',
      title: 'Analyse de Risques Cybersécurité NIS2',
      description: 'Framework complet d\'analyse et de gestion des risques cybersécurité selon les exigences NIS2.',
      category: 'NIS2',
      format: 'Excel',
      size: '3.4 MB',
      difficulty: 'Avancé',
      downloadCount: 987,
      rating: 4.5,
      lastUpdate: '2024-01-05',
      features: [
        'Matrices de risques prédéfinies',
        'Calculs automatisés',
        'Dashboard de synthèse',
        'Plan de traitement intégré'
      ],
      preview: '/templates/previews/nis2-risk.png',
      downloadUrl: '/templates/downloads/nis2-risk.xlsx'
    },
    {
      id: 'nis2-supply-chain',
      title: 'Cartographie Chaîne d\'Approvisionnement',
      description: 'Outil de cartographie et d\'évaluation de la sécurité de votre chaîne d\'approvisionnement numérique.',
      category: 'NIS2',
      format: 'Excel',
      size: '2.1 MB',
      difficulty: 'Intermédiaire',
      downloadCount: 756,
      rating: 4.4,
      lastUpdate: '2023-12-28',
      features: [
        'Inventaire des fournisseurs',
        'Évaluation des risques par tiers',
        'Matrice de criticité',
        'Plans d\'action automatisés'
      ],
      preview: '/templates/previews/nis2-supply.png',
      downloadUrl: '/templates/downloads/nis2-supply.xlsx'
    },

    // DORA Templates
    {
      id: 'dora-ict-risk-framework',
      title: 'Framework Gestion Risques TIC DORA',
      description: 'Cadre complet de gestion des risques TIC conforme au règlement DORA pour le secteur financier.',
      category: 'DORA',
      format: 'Word',
      size: '1.8 MB',
      difficulty: 'Avancé',
      downloadCount: 634,
      rating: 4.7,
      lastUpdate: '2024-01-11',
      features: [
        'Processus de gestion intégrés',
        'Matrices d\'évaluation TIC',
        'Procédures de surveillance',
        'Reporting réglementaire'
      ],
      preview: '/templates/previews/dora-framework.png',
      downloadUrl: '/templates/downloads/dora-framework.docx'
    },
    {
      id: 'dora-third-party-register',
      title: 'Registre des Tiers Critiques TIC',
      description: 'Modèle de registre pour identifier, évaluer et surveiller vos prestataires TIC critiques selon DORA.',
      category: 'DORA',
      format: 'Excel',
      size: '1.6 MB',
      difficulty: 'Intermédiaire',
      downloadCount: 543,
      rating: 4.6,
      lastUpdate: '2024-01-07',
      features: [
        'Classification automatique des tiers',
        'Évaluation de criticité',
        'Suivi des contrats',
        'Alertes d\'échéances'
      ],
      preview: '/templates/previews/dora-tiers.png',
      downloadUrl: '/templates/downloads/dora-tiers.xlsx'
    },

    // ISO 27001 Templates
    {
      id: 'iso27001-gap-analysis',
      title: 'Gap Analysis ISO 27001:2022',
      description: 'Évaluation complète de conformité aux 114 contrôles de l\'ISO 27001 version 2022.',
      category: 'ISO 27001',
      format: 'Excel',
      size: '4.2 MB',
      difficulty: 'Avancé',
      downloadCount: 2789,
      rating: 4.9,
      lastUpdate: '2024-01-14',
      features: [
        'Évaluation des 114 contrôles',
        'Scoring automatique',
        'Plan d\'action priorisé',
        'Roadmap de certification'
      ],
      preview: '/templates/previews/iso-gap.png',
      downloadUrl: '/templates/downloads/iso-gap.xlsx'
    },
    {
      id: 'iso27001-soa',
      title: 'Déclaration d\'Applicabilité (SOA)',
      description: 'Modèle de Statement of Applicability conforme ISO 27001 avec justifications types.',
      category: 'ISO 27001',
      format: 'Word',
      size: '920 KB',
      difficulty: 'Intermédiaire',
      downloadCount: 1876,
      rating: 4.8,
      lastUpdate: '2024-01-09',
      features: [
        'Contrôles pré-renseignés',
        'Justifications types',
        'Références croisées',
        'Format audit-ready'
      ],
      preview: '/templates/previews/iso-soa.png',
      downloadUrl: '/templates/downloads/iso-soa.docx'
    },

    // Templates génériques
    {
      id: 'generic-policy-cybersecurity',
      title: 'Politique de Cybersécurité Générale',
      description: 'Modèle de politique de cybersécurité adaptable à toute organisation avec bonnes pratiques intégrées.',
      category: 'Générique',
      format: 'Word',
      size: '650 KB',
      difficulty: 'Facile',
      downloadCount: 4321,
      rating: 4.7,
      lastUpdate: '2024-01-13',
      features: [
        'Structure modulaire',
        'Clauses personnalisables',
        'Références réglementaires',
        'Checklist d\'implémentation'
      ],
      preview: '/templates/previews/generic-policy.png',
      downloadUrl: '/templates/downloads/generic-policy.docx'
    },
    {
      id: 'generic-incident-response',
      title: 'Plan de Réponse aux Incidents',
      description: 'Plan complet de gestion des incidents de sécurité avec procédures détaillées et contacts d\'urgence.',
      category: 'Générique',
      format: 'PowerPoint',
      size: '2.3 MB',
      difficulty: 'Intermédiaire',
      downloadCount: 2654,
      rating: 4.8,
      lastUpdate: '2024-01-06',
      features: [
        'Procédures étape par étape',
        'Matrices de décision',
        'Templates de communication',
        'Fiches réflexes'
      ],
      preview: '/templates/previews/generic-incident.png',
      downloadUrl: '/templates/downloads/generic-incident.pptx'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tous les templates', count: templates.length },
    { id: 'RGPD', name: 'RGPD', count: templates.filter(t => t.category === 'RGPD').length },
    { id: 'NIS2', name: 'NIS2', count: templates.filter(t => t.category === 'NIS2').length },
    { id: 'DORA', name: 'DORA', count: templates.filter(t => t.category === 'DORA').length },
    { id: 'ISO 27001', name: 'ISO 27001', count: templates.filter(t => t.category === 'ISO 27001').length },
    { id: 'Générique', name: 'Génériques', count: templates.filter(t => t.category === 'Générique').length }
  ];

  const formats = [
    { id: 'all', name: 'Tous formats' },
    { id: 'Word', name: 'Word (.docx)' },
    { id: 'Excel', name: 'Excel (.xlsx)' },
    { id: 'PowerPoint', name: 'PowerPoint (.pptx)' },
    { id: 'PDF', name: 'PDF (.pdf)' }
  ];

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesFormat = selectedFormat === 'all' || template.format === selectedFormat;
      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [searchTerm, selectedCategory, selectedFormat]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Word':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'Excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'PowerPoint':
        return <FileImage className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'RGPD': 'bg-blue-100 text-blue-800',
      'NIS2': 'bg-orange-100 text-orange-800',
      'DORA': 'bg-green-100 text-green-800',
      'ISO 27001': 'bg-indigo-100 text-indigo-800',
      'Générique': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'Facile': 'bg-green-100 text-green-800',
      'Intermédiaire': 'bg-yellow-100 text-yellow-800',
      'Avancé': 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const handleDownload = (template: typeof templates[0]) => {
    // Simulation du téléchargement
    console.log(`Téléchargement du template: ${template.title}`);
    // Ici vous pourriez implémenter la logique réelle de téléchargement
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
          <div className="p-3 rounded-lg bg-green-100">
            <Download className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Templates & Modèles</h1>
            <p className="text-lg text-gray-600">Collection de templates professionnels pour accélérer votre conformité</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
                <div className="text-sm text-gray-600">Templates disponibles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {templates.reduce((acc, t) => acc + t.downloadCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Téléchargements total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{categories.length - 1}</div>
                <div className="text-sm text-gray-600">Catégories</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(templates.reduce((acc, t) => acc + t.rating, 0) / templates.length).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche et filtres */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un template par titre ou description..."
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
            
            {/* Filtres par format */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Format:</span>
              {formats.map((format) => (
                <Button
                  key={format.id}
                  variant={selectedFormat === format.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFormat(format.id)}
                >
                  {format.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Aucun template trouvé</h3>
                  <p>Essayez de modifier vos critères de recherche ou vos filtres.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getFormatIcon(template.format)}
                    <div>
                      <CardTitle className="text-lg leading-tight">{template.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(template.rating)}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category}
                  </Badge>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm leading-relaxed">{template.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span>Mis à jour: {new Date(template.lastUpdate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-gray-500" />
                    <span>{template.downloadCount} téléchargements</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3 text-gray-500" />
                    <span>{template.format} - {template.size}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-gray-500" />
                    <span>{template.difficulty}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Fonctionnalités incluses :</h4>
                  <ul className="space-y-1">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleDownload(template)}
                    className="flex-1"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Sections d'aide */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-semibold mb-6">Besoin d'aide avec les templates ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Zap className="h-8 w-8 mx-auto text-blue-600" />
                <h3 className="font-semibold">Guide d'utilisation</h3>
                <p className="text-sm text-gray-600">Instructions détaillées pour chaque template</p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/compliance/faq">Consulter la FAQ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Target className="h-8 w-8 mx-auto text-green-600" />
                <h3 className="font-semibold">Personnalisation</h3>
                <p className="text-sm text-gray-600">Services d'adaptation à vos besoins</p>
                <Button variant="outline" size="sm">
                  Demander un devis
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <AlertTriangle className="h-8 w-8 mx-auto text-orange-600" />
                <h3 className="font-semibold">Support technique</h3>
                <p className="text-sm text-gray-600">Assistance pour l'utilisation des templates</p>
                <Button variant="outline" size="sm">
                  Contacter le support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer avec statistiques de recherche */}
      {filteredTemplates.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Affichage de {filteredTemplates.length} template{filteredTemplates.length > 1 ? 's' : ''} 
          {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`}
          {selectedFormat !== 'all' && ` au format "${formats.find(f => f.id === selectedFormat)?.name}"`}
          {searchTerm && ` correspondant à "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;
