'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Clock,
  Zap,
  Settings,
  Filter,
  Search,
  ArrowLeft,
  ExternalLink,
  Download,
  Share2,
  Eye,
  Archive,
  Star,
  TrendingUp,
  Globe,
  FileText,
  Users,
  Briefcase
} from 'lucide-react';

const AlertesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showRead, setShowRead] = useState(false);

  // Données simulées pour les alertes
  const alerts = [
    {
      id: 'alert-001',
      title: 'Nouveau Guide CNIL : IA et Protection des Données',
      category: 'RGPD',
      type: 'Guide officiel',
      priority: 'high',
      date: '2024-01-15T10:30:00',
      source: 'CNIL',
      description: 'La CNIL publie ses recommandations pour l\'utilisation éthique et conforme de l\'intelligence artificielle dans le traitement des données personnelles.',
      content: 'Ce nouveau guide de 45 pages détaille les bonnes pratiques pour les entreprises utilisant l\'IA, incluant les obligations d\'information, les mesures de sécurité spécifiques et les droits des personnes concernées.',
      impact: 'Toutes les organisations utilisant des systèmes d\'IA doivent réviser leurs pratiques',
      actions: [
        'Évaluer vos systèmes IA actuels',
        'Mettre à jour vos politiques de confidentialité',
        'Former les équipes techniques',
        'Documenter les algorithmes utilisés'
      ],
      deadline: '2024-05-15',
      url: 'https://www.cnil.fr/guide-ia-donnees-personnelles',
      read: false,
      starred: true
    },
    {
      id: 'alert-002',
      title: 'NIS2 : Publication des Décrets d\'Application',
      category: 'NIS2',
      type: 'Texte réglementaire',
      priority: 'critical',
      date: '2024-01-12T14:20:00',
      source: 'ANSSI',
      description: 'Publication des décrets d\'application français de la directive NIS2 avec précisions sur les secteurs concernés et les obligations.',
      content: 'Les décrets précisent la liste des entités essentielles et importantes, les modalités de notification des incidents et les sanctions applicables.',
      impact: 'Impact direct sur les entités des secteurs critiques',
      actions: [
        'Vérifier votre classification (essentielle/importante)',
        'Mettre en place les mesures de cybersécurité requises',
        'Préparer les procédures de notification',
        'Identifier votre CSIRT national'
      ],
      deadline: '2024-04-18',
      url: 'https://www.legifrance.gouv.fr/nis2-decrets',
      read: false,
      starred: false
    },
    {
      id: 'alert-003',
      title: 'DORA : RTS sur les Tests de Résilience Opérationnelle',
      category: 'DORA',
      type: 'Standards techniques',
      priority: 'high',
      date: '2024-01-10T09:15:00',
      source: 'EBA',
      description: 'Publication des standards techniques réglementaires (RTS) définissant les modalités des tests de pénétration basés sur les menaces (TLPT).',
      content: 'Les RTS détaillent les critères de fréquence, la méthodologie des tests, les qualifications requises des testeurs et les rapports à fournir.',
      impact: 'Entités financières soumises aux tests TLPT obligatoires',
      actions: [
        'Planifier vos tests TLPT triennaux',
        'Sélectionner des testeurs qualifiés',
        'Définir le périmètre des tests',
        'Préparer le reporting aux autorités'
      ],
      deadline: '2024-07-17',
      url: 'https://www.eba.europa.eu/dora-tlpt-rts',
      read: true,
      starred: true
    },
    {
      id: 'alert-004',
      title: 'Mise à jour ISO 27001 : Nouvelle Version 2024',
      category: 'ISO 27001',
      type: 'Norme internationale',
      priority: 'medium',
      date: '2024-01-08T16:45:00',
      source: 'ISO',
      description: 'Annonce de la révision mineure de l\'ISO 27001:2022 avec clarifications sur certains contrôles et mise à jour des références.',
      content: 'La mise à jour corrige des ambiguïtés dans 8 contrôles et ajoute des références aux nouvelles menaces cybersécurité émergentes.',
      impact: 'Organisations certifiées ISO 27001',
      actions: [
        'Réviser les contrôles modifiés',
        'Planifier l\'audit de surveillance',
        'Mettre à jour la documentation SMSI',
        'Informer l\'organisme certificateur'
      ],
      deadline: '2024-12-31',
      url: 'https://www.iso.org/standard/27001-update',
      read: false,
      starred: false
    },
    {
      id: 'alert-005',
      title: 'Sanctions RGPD Record : 1.2 Milliard d\'Euros',
      category: 'RGPD',
      type: 'Jurisprudence',
      priority: 'critical',
      date: '2024-01-05T11:30:00',
      source: 'Autorité de protection irlandaise',
      description: 'Amende record infligée à une grande tech pour violations massives du RGPD concernant les transferts de données vers les États-Unis.',
      content: 'La décision porte sur des transferts illégaux de données personnelles européennes sans garanties appropriées, affectant plusieurs centaines de millions d\'utilisateurs.',
      impact: 'Toutes les entreprises effectuant des transferts hors UE',
      actions: [
        'Auditer vos transferts internationaux',
        'Réviser vos BCR ou SCC',
        'Évaluer les mesures supplémentaires',
        'Mettre à jour l\'analyse TIA'
      ],
      deadline: '2024-03-31',
      url: 'https://edpb.europa.eu/news/sanctions-record',
      read: true,
      starred: true
    },
    {
      id: 'alert-006',
      title: 'ANSSI : Nouveau Référentiel SecNumCloud v4.0',
      category: 'ANSSI',
      type: 'Référentiel',
      priority: 'medium',
      date: '2024-01-03T13:20:00',
      source: 'ANSSI',
      description: 'Évolution majeure du référentiel SecNumCloud avec renforcement des exigences de souveraineté et nouvelles mesures zero-trust.',
      content: 'Le référentiel v4.0 introduit 12 nouvelles exigences, renforce les critères d\'immunité et étend le périmètre aux services d\'IA.',
      impact: 'Prestataires cloud et utilisateurs administrations',
      actions: [
        'Évaluer la conformité de vos prestataires',
        'Planifier la migration si nécessaire',
        'Réviser les contrats cloud',
        'Former les équipes procurement'
      ],
      deadline: '2024-09-01',
      url: 'https://www.ssi.gouv.fr/secnumcloud-v4',
      read: false,
      starred: false
    }
  ];

  // Configuration des notifications
  const [notificationSettings, setNotificationSettings] = useState({
    rgpd: { email: true, push: true, sms: false },
    nis2: { email: true, push: true, sms: true },
    dora: { email: true, push: false, sms: false },
    iso27001: { email: false, push: true, sms: false },
    anssi: { email: true, push: true, sms: false },
    jurisprudence: { email: true, push: true, sms: true }
  });

  const categories = [
    { id: 'all', name: 'Toutes catégories', count: alerts.length },
    { id: 'RGPD', name: 'RGPD', count: alerts.filter(a => a.category === 'RGPD').length },
    { id: 'NIS2', name: 'NIS2', count: alerts.filter(a => a.category === 'NIS2').length },
    { id: 'DORA', name: 'DORA', count: alerts.filter(a => a.category === 'DORA').length },
    { id: 'ISO 27001', name: 'ISO 27001', count: alerts.filter(a => a.category === 'ISO 27001').length },
    { id: 'ANSSI', name: 'ANSSI', count: alerts.filter(a => a.category === 'ANSSI').length }
  ];

  const priorities = [
    { id: 'all', name: 'Toutes priorités' },
    { id: 'critical', name: 'Critique' },
    { id: 'high', name: 'Élevée' },
    { id: 'medium', name: 'Moyenne' },
    { id: 'low', name: 'Faible' }
  ];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || alert.priority === selectedPriority;
      const matchesReadStatus = showRead || !alert.read;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesReadStatus;
    });
  }, [searchTerm, selectedCategory, selectedPriority, showRead]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'RGPD': 'bg-blue-100 text-blue-800',
      'NIS2': 'bg-orange-100 text-orange-800',
      'DORA': 'bg-green-100 text-green-800',
      'ISO 27001': 'bg-indigo-100 text-indigo-800',
      'ANSSI': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAlertIcon = (priority: string, type: string) => {
    if (priority === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (type === 'Jurisprudence') return <Briefcase className="h-5 w-5 text-purple-600" />;
    if (type === 'Guide officiel') return <FileText className="h-5 w-5 text-blue-600" />;
    return <Info className="h-5 w-5 text-gray-600" />;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const toggleStar = (alertId: string) => {
    // Simulation - ici vous implémenteriez la logique pour marquer/démarquer comme favori
    console.log(`Toggle star for alert: ${alertId}`);
  };

  const markAsRead = (alertId: string) => {
    // Simulation - ici vous implémenteriez la logique pour marquer comme lu
    console.log(`Mark as read: ${alertId}`);
  };

  const unreadCount = alerts.filter(a => !a.read).length;
  const criticalCount = alerts.filter(a => a.priority === 'critical' && !a.read).length;

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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-orange-100 relative">
              <Bell className="h-8 w-8 text-orange-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {unreadCount}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alertes Réglementaires</h1>
              <p className="text-lg text-gray-600">Veille automatisée des évolutions législatives et réglementaires</p>
            </div>
          </div>
          
          <Button asChild>
            <Link href="#settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Non lues</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => {
                    const alertDate = new Date(a.date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return alertDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favoris</p>
                <p className="text-2xl font-bold text-purple-600">
                  {alerts.filter(a => a.starred).length}
                </p>
              </div>
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs principales */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
          <TabsTrigger value="alerts">Alertes Récentes</TabsTrigger>
          <TabsTrigger value="trending">Tendances</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Alertes récentes */}
        <TabsContent value="alerts" className="space-y-6">
          {/* Filtres */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher dans les alertes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
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
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Priorité:</span>
                {priorities.map((priority) => (
                  <Button
                    key={priority.id}
                    variant={selectedPriority === priority.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPriority(priority.id)}
                  >
                    {priority.name}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={showRead}
                  onCheckedChange={setShowRead}
                  id="show-read"
                />
                <label htmlFor="show-read" className="text-sm text-gray-700">
                  Afficher les lues
                </label>
              </div>
            </div>
          </div>

          {/* Liste des alertes */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`hover:shadow-md transition-shadow ${!alert.read ? 'border-l-4 border-l-orange-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.priority, alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(alert.category)}>
                            {alert.category}
                          </Badge>
                          <Badge className={getPriorityColor(alert.priority)}>
                            {alert.priority}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type}
                          </Badge>
                        </div>
                        <CardTitle className={`text-lg ${!alert.read ? 'font-bold' : 'font-medium'}`}>
                          {alert.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(alert.date)}</span>
                          {alert.deadline && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Échéance: {new Date(alert.deadline).toLocaleDateString('fr-FR')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStar(alert.id)}
                      >
                        <Star className={`h-4 w-4 ${alert.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                      </Button>
                      {!alert.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(alert.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{alert.description}</p>
                  
                  {alert.content && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-800">{alert.content}</p>
                    </div>
                  )}

                  {alert.impact && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-1">Impact :</h4>
                      <p className="text-sm text-blue-800">{alert.impact}</p>
                    </div>
                  )}

                  {alert.actions && (
                    <div>
                      <h4 className="font-semibold mb-2">Actions recommandées :</h4>
                      <ul className="space-y-1">
                        {alert.actions.map((action, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href={alert.url} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Consulter
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tendances */}
        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendances Réglementaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Intelligence Artificielle et RGPD</h3>
                    <Badge className="bg-green-100 text-green-800">+15% cette semaine</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Multiplication des guides et recommandations sur l'usage de l'IA conforme au RGPD
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Sanctions RGPD Transfrontalières</h3>
                    <Badge className="bg-red-100 text-red-800">+8% ce mois</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Augmentation des sanctions pour non-respect des règles de transfert international
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Cybersécurité Secteur Financier</h3>
                    <Badge className="bg-blue-100 text-blue-800">+12% ce trimestre</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Renforcement des exigences DORA et nouvelles orientations des superviseurs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(notificationSettings).map(([key, settings]) => (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                      <p className="text-sm text-gray-600">
                        Recevoir les alertes pour cette catégorie
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.email}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], email: checked }
                            }))
                          }
                        />
                        <span className="text-sm">Email</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.push}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], push: checked }
                            }))
                          }
                        />
                        <span className="text-sm">Push</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={settings.sms}
                          onCheckedChange={(checked) => 
                            setNotificationSettings(prev => ({
                              ...prev,
                              [key]: { ...prev[key as keyof typeof prev], sms: checked }
                            }))
                          }
                        />
                        <span className="text-sm">SMS</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button>
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer avec statistiques de recherche */}
      {filteredAlerts.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          Affichage de {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''} 
          {selectedCategory !== 'all' && ` dans la catégorie "${categories.find(c => c.id === selectedCategory)?.name}"`}
          {selectedPriority !== 'all' && ` avec priorité "${priorities.find(p => p.id === selectedPriority)?.name}"`}
          {searchTerm && ` correspondant à "${searchTerm}"`}
        </div>
      )}
    </div>
  );
};

export default AlertesPage;
