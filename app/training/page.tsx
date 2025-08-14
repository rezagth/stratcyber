'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Search,
  Filter,
  Download,
  Eye,
  Shield,
  Lock,
  Globe,
  Server,
  AlertTriangle,
  FileText,
  Award,
  TrendingUp,
  Plus,
  Brain,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Quiz } from '@prisma/client';

interface Ebook {
  id: string;
  title: string;
  author: string;
  description?: string;
  content?: string;
  url?: string;
  category: string;
  difficulty: string;
  duration?: string;
  pages?: number;
  rating: number;
  downloads: number;
  tags?: string[];
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations (si incluses)
  readingSessions?: ReadingSession[];
  quizzes?: Quiz[];
}

interface ReadingSession {
  id: string;
  progress: number;
  currentPage: number;
  completed: boolean;
  timeSpent: number;
}

const CATEGORIES = ['Tous', 'Fondamentaux', 'Réseau', 'Gestion', 'Cloud', 'Conformité', 'Tests'];
const DIFFICULTIES = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé'];

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchEbooks();
  }, []);

  // Filtrage des ebooks
  useEffect(() => {
    let filtered = ebooks.filter(ebook => ebook.isPublished);

    if (searchTerm) {
      filtered = filtered.filter(ebook => 
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ebook.tags && ebook.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(ebook => ebook.category === selectedCategory);
    }

    if (selectedDifficulty !== 'Tous') {
      filtered = filtered.filter(ebook => ebook.difficulty === selectedDifficulty);
    }

    setFilteredEbooks(filtered);
  }, [searchTerm, selectedCategory, selectedDifficulty, ebooks]);

  const fetchEbooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/training/ebook');
      if (!response.ok) throw new Error('Erreur lors du chargement des ebooks');
      const data = await response.json();
      setEbooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Fondamentaux': return Shield;
      case 'Réseau': return Globe;
      case 'Gestion': return Users;
      case 'Cloud': return Server;
      case 'Conformité': return Lock;
      case 'Tests': return AlertTriangle;
      default: return BookOpen;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', { 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
    return `Il y a ${Math.floor(diffInDays / 365)} an${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
  };

  const getMonthlyStats = () => {
    const stats: { [key: string]: number } = {};
    ebooks.forEach(ebook => {
      if (ebook.isPublished) {
        const month = formatMonth(ebook.createdAt);
        stats[month] = (stats[month] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .sort(([a], [b]) => new Date(a + ' 01').getTime() - new Date(b + ' 01').getTime())
      .slice(-6); // Les 6 derniers mois
  };

  const generatePersonalizedEbooks = async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/training/generate-ebooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }
      
      const result = await response.json();
      console.log('Ebooks générés:', result);
      
      // Recharger la liste des ebooks
      await fetchEbooks();
      
      // Afficher un message de succès
      alert(`${result.ebooks?.length || 0} ebooks personnalisés ont été générés avec succès !`);
      
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération des ebooks');
    } finally {
      setGenerating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Chargement des ebooks">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <main className="container mx-auto px-4 py-8" role="main">
        <section className="text-center">
          <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder au module de formation.</p>
          <Link href="/auth/login" passHref>
            <Button asChild aria-label="Se connecter">
              Se connecter
            </Button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Formation Cybersécurité
          </h1>
          <p className="text-gray-600 mt-1">
            Bibliothèque d&apos;ebooks spécialisés en sécurité informatique
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {filteredEbooks.length} ebooks disponibles
          </Badge>
          <Button 
            onClick={generatePersonalizedEbooks}
            disabled={generating}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            size="sm"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {generating ? 'Génération...' : 'Générer mes ebooks'}
          </Button>
          {session?.user?.role === 'admin' && (
            <Link href="/training/create">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un ebook
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Ebooks</p>
                <p className="text-2xl font-bold text-blue-900">{ebooks.filter(e => e.isPublished).length}</p>
                <p className="text-xs text-blue-600 mt-1">Disponibles maintenant</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Complétés</p>
                <p className="text-2xl font-bold text-green-900">0</p>
                <p className="text-xs text-green-600 mt-1">Ebooks terminés</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">En cours</p>
                <p className="text-2xl font-bold text-orange-900">0</p>
                <p className="text-xs text-orange-600 mt-1">Lectures actives</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Cette semaine</p>
                <p className="text-2xl font-bold text-purple-900">
                  {ebooks.filter(e => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(e.createdAt) > weekAgo && e.isPublished;
                  }).length}
                </p>
                <p className="text-xs text-purple-600 mt-1">Nouveautés</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques mensuelles */}
      {getMonthlyStats().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Publications par mois
            </CardTitle>
            <CardDescription>
              Évolution des publications d&apos;ebooks au cours des derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {getMonthlyStats().map(([month, count]) => (
                <div key={month} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">{month}</p>
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-xs text-gray-500">ebook{count > 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un ebook..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtre par catégorie */}
            <select 
              className="px-3 py-2 text-sm border rounded-md"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Filtre par difficulté */}
            <select 
              className="px-3 py-2 text-sm border rounded-md"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des erreurs */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded" role="alert">
          {error}
          <button
            onClick={() => {
              setError(null);
              fetchEbooks();
            }}
            className="ml-4 underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Grille des ebooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEbooks.map((ebook) => {
          const IconComponent = getCategoryIcon(ebook.category);
          return (
            <Card key={ebook.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden border-0 shadow-md">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center">
                <IconComponent className="h-16 w-16 text-white opacity-90" />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Badge className={getDifficultyColor(ebook.difficulty)}>
                    {ebook.difficulty}
                  </Badge>
                  {new Date(ebook.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Nouveau
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs">
                    {ebook.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2 font-semibold">{ebook.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-medium">{ebook.rating}/5</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                  {ebook.description || 'Découvrez ce contenu enrichissant sur la cybersécurité, spécialement conçu pour approfondir vos connaissances dans ce domaine critique.'}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>Publié {getTimeAgo(ebook.createdAt)}</span>
                  <span>•</span>
                  <span>Mis à jour {formatMonth(ebook.updatedAt)}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {ebook.tags?.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                      {tag}
                    </Badge>
                  )) || (
                    <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700">
                      {ebook.category}
                    </Badge>
                  )}
                  {ebook.tags && ebook.tags.length > 4 && (
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                      +{ebook.tags.length - 4}
                    </Badge>
                  )}
                </div>

                {/* Métadonnées enrichies */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium">{ebook.duration || '2h 30min'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600">
                      <FileText className="h-3.5 w-3.5" />
                      <span className="font-medium">{ebook.pages || 65} pages</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-600">
                      <Download className="h-3.5 w-3.5" />
                      <span className="font-medium">{ebook.downloads.toLocaleString()} dl</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-purple-600">
                      <Users className="h-3.5 w-3.5" />
                      <span className="font-medium truncate">{ebook.author}</span>
                    </div>
                  </div>
                </div>

                {/* Barre de progression simulée */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progression</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/training/ebook/${ebook.id}`} className="flex-1">
                    <Button className="w-full text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Commencer la lecture
                    </Button>
                  </Link>
                  {ebook.url && (
                    <a href={ebook.url} target="_blank" rel="noopener noreferrer" download>
                      <Button variant="outline" size="sm" className="px-3 hover:bg-gray-50">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Message si aucun résultat */}
      {filteredEbooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucun ebook trouvé</h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche ou de filtrage.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
