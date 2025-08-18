'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Shield, FileText, Eye, Trash2, Copy, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Audit } from '@prisma/client';

// Extend the Prisma Audit type to include responses
interface AuditWithResponses extends Audit {
  responses: {
    question: string;
    answer: string;
    score: number | null;
    category: string;
  }[];
}

interface FilterState {
  search: string;
  maturity: string;
  scoreRange: string;
  dateRange: string;
  sortBy: 'date' | 'score' | 'maturity';
  sortOrder: 'asc' | 'desc';
}

export default function AuditsHistoryPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [audits, setAudits] = useState<AuditWithResponses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    maturity: 'all',
    scoreRange: 'all',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAudits = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/audits?userId=${session.user.id}`);
          const data = await response.json();
          setAudits(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
          console.error('Erreur lors de la récupération des audits:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchAudits();
  }, [session]);

  // Filtrage des audits
  const filteredAudits = audits.filter(audit => {
    // Recherche textuelle
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        audit.maturity?.toLowerCase().includes(searchLower) ||
        audit.companyProfile?.toLowerCase().includes(searchLower) ||
        new Date(audit.createdAt).toLocaleDateString('fr-FR').includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtre par maturité
    if (filters.maturity !== 'all' && audit.maturity !== filters.maturity) {
      return false;
    }

    // Filtre par score
    if (filters.scoreRange !== 'all' && audit.score !== null) {
      const score = audit.score;
      switch (filters.scoreRange) {
        case 'low':
          if (score >= 50) return false;
          break;
        case 'medium':
          if (score < 50 || score >= 80) return false;
          break;
        case 'high':
          if (score < 80) return false;
          break;
      }
    }

    // Filtre par date
    if (filters.dateRange !== 'all') {
      const auditDate = new Date(audit.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - auditDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (filters.dateRange) {
        case 'week':
          if (daysDiff > 7) return false;
          break;
        case 'month':
          if (daysDiff > 30) return false;
          break;
        case 'quarter':
          if (daysDiff > 90) return false;
          break;
        case 'year':
          if (daysDiff > 365) return false;
          break;
      }
    }

    return true;
  });

  // Tri des audits
  const sortedAudits = [...filteredAudits].sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'score':
        comparison = (a.score || 0) - (b.score || 0);
        break;
      case 'maturity':
        comparison = (a.maturity || '').localeCompare(b.maturity || '');
        break;
    }
    
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedAudits.length / itemsPerPage);
  const paginatedAudits = sortedAudits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Actions
  const handleGeneratePdfReport = async (auditId: string) => {
    try {
      setGeneratingPdf(auditId);
      
      const response = await fetch(`/api/audit/${auditId}/export/comprehensive-pdf`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport');
      }
      
      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-audit-${auditId}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleViewPdfReport = async (auditId: string) => {
    try {
      const url = `/api/audit/${auditId}/export/comprehensive-pdf`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur ouverture rapport:', error);
      alert('Erreur lors de l\'ouverture du rapport.');
    }
  };

  const handleViewDetails = (auditId: string) => {
    router.push(`/dashboard/audits/${auditId}`);
  };

  const handleDuplicateAudit = async (auditId: string) => {
    try {
      const response = await fetch(`/api/audits/${auditId}/duplicate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la duplication');
      }
      
      const newAudit = await response.json();
      setAudits(prev => [newAudit, ...prev]);
      alert('Audit dupliqué avec succès !');
      
    } catch (error) {
      console.error('Erreur duplication:', error);
      alert('Erreur lors de la duplication de l\'audit.');
    }
  };

  const handleDeleteAudit = async (auditId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet audit ? Cette action est irréversible.')) {
      return;
    }

    try {
      const response = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      setAudits(prev => prev.filter(audit => audit.id !== auditId));
      alert('Audit supprimé avec succès.');
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression de l\'audit.');
    }
  };

  const getMaturityBadgeVariant = (maturity: string | null) => {
    if (!maturity) return 'secondary';
    if (maturity.includes('Initial') || maturity.includes('Ad hoc')) return 'destructive';
    if (maturity.includes('Défini') || maturity.includes('Intermédiaire')) return 'secondary';
    if (maturity.includes('Géré') || maturity.includes('Avancé')) return 'default';
    if (maturity.includes('Optimisé') || maturity.includes('Expert')) return 'default';
    return 'secondary';
  };

  const getScoreBadgeVariant = (score: number | null) => {
    if (!score) return 'secondary';
    if (score < 50) return 'destructive';
    if (score < 80) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Historique des Audits</h1>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Historique des Audits</h1>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Historique des Audits
          </h1>
          <p className="text-muted-foreground mt-2">
            Consultez, analysez et gérez tous vos audits de cybersécurité
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            ← Retour au dashboard
          </Button>
        </Link>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total des audits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Score moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.length > 0 
                ? Math.round(audits.reduce((sum, audit) => sum + (audit.score || 0), 0) / audits.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Dernier audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.length > 0 
                ? new Date(audits[0].createdAt).toLocaleDateString('fr-FR')
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audits ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {audits.filter(audit => {
                const auditDate = new Date(audit.createdAt);
                const now = new Date();
                return auditDate.getMonth() === now.getMonth() && auditDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres et recherche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select 
              value={filters.maturity} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, maturity: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Maturité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les maturités</SelectItem>
                <SelectItem value="Initial">Initial</SelectItem>
                <SelectItem value="Défini">Défini</SelectItem>
                <SelectItem value="Géré">Géré</SelectItem>
                <SelectItem value="Optimisé">Optimisé</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.scoreRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, scoreRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les scores</SelectItem>
                <SelectItem value="low">&lt; 50%</SelectItem>
                <SelectItem value="medium">50-79%</SelectItem>
                <SelectItem value="high">≥ 80%</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={filters.dateRange} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={`${filters.sortBy}-${filters.sortOrder}`} 
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (récent)</SelectItem>
                <SelectItem value="date-asc">Date (ancien)</SelectItem>
                <SelectItem value="score-desc">Score (élevé)</SelectItem>
                <SelectItem value="score-asc">Score (faible)</SelectItem>
                <SelectItem value="maturity-asc">Maturité (A-Z)</SelectItem>
                <SelectItem value="maturity-desc">Maturité (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredAudits.length} audit(s) trouvé(s)</span>
            {(filters.search || filters.maturity !== 'all' || filters.scoreRange !== 'all' || filters.dateRange !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilters({
                  search: '',
                  maturity: 'all',
                  scoreRange: 'all',
                  dateRange: 'all',
                  sortBy: 'date',
                  sortOrder: 'desc'
                })}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des audits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audits ({filteredAudits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedAudits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Aucun audit trouvé avec ces filtres</p>
              <p className="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedAudits.map((audit) => {
                const auditDate = new Date(audit.createdAt);
                const isGenerating = generatingPdf === audit.id;
                
                return (
                  <div key={audit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            Audit du {auditDate.toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h3>
                          <Badge variant={getMaturityBadgeVariant(audit.maturity)}>
                            {audit.maturity || 'En cours'}
                          </Badge>
                          <Badge variant={getScoreBadgeVariant(audit.score)}>
                            {audit.score?.toFixed(0) || 'N/A'}%
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Score: {audit.score?.toFixed(0) || 'N/A'}%
                          </span>
                          <span>
                            {audit.responses?.length || 0} réponses
                          </span>
                          <span>
                            Créé le {auditDate.toLocaleDateString('fr-FR')} à {auditDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        
                        {audit.recommendations && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {audit.recommendations}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(audit.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPdfReport(audit.id)}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Aperçu
                        </Button>
                        
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleGeneratePdfReport(audit.id)}
                          disabled={isGenerating}
                          className="flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <>
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Génération...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              PDF
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateAudit(audit.id)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Dupliquer
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAudit(audit.id)}
                          className="flex items-center gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredAudits.length)} sur {filteredAudits.length} audit(s)
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      {totalPages > 6 && <span className="text-muted-foreground">...</span>}
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
