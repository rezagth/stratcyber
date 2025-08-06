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
import {
  BookOpen,
  Plus,
  Search,
  Download,
  Eye,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Ebook {
  id: string;
  title: string;
  author: string;
  content?: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export default function TrainingPage() {
  const { data: session, status } = useSession();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Pagination states (example with simple page size)
  const PAGE_SIZE = 9;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // reset page on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    fetchEbooks();
  }, []);

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

  // Filtrage sur le terme debounced
  const filteredEbooks = ebooks.filter(
    (ebook) =>
      ebook.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      ebook.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Pagination slice
  const paginatedEbooks = filteredEbooks.slice(0, PAGE_SIZE * page);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(dateStr));

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
            <Button as="a" aria-label="Se connecter">
              Se connecter
            </Button>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8" role="main">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Centre de Formation</h1>
            <p className="text-gray-600">Explorez notre bibliothèque d'ebooks de cybersécurité</p>
          </div>
          {session?.user?.role === 'admin' && (
            <Link href="/training/create" passHref>
              <Button as="a" className="flex items-center gap-2" aria-label="Ajouter un ebook">
                <Plus className="h-4 w-4" />
                Ajouter un ebook
              </Button>
            </Link>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
            aria-hidden="true"
          />
          <Input
            type="text"
            placeholder="Rechercher par titre ou auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label="Rechercher un ebook par titre ou auteur"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              aria-label="Réinitialiser la recherche"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 underline"
              type="button"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Gestion des erreurs */}
        {error && (
          <div
            className="mb-4 p-4 bg-red-100 text-red-700 rounded"
            role="alert"
            aria-live="assertive"
          >
            {error}
            <button
              onClick={() => {
                setError(null);
                setSearchTerm('');
                fetchEbooks();
              }}
              className="ml-4 underline focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Réessayer le chargement des ebooks"
              type="button"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label="Statistiques ebooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ebooks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-live="polite">
                {ebooks.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-live="polite">
                {filteredEbooks.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Téléchargés</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" aria-live="polite">
                0
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      {/* Liste des ebooks */}
      {filteredEbooks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-gray-900 mb-2" role="status" aria-live="polite">
              {debouncedSearchTerm ? 'Aucun résultat trouvé' : 'Aucun ebook disponible'}
            </h3>
            <p className="text-gray-500 text-center">
              {debouncedSearchTerm
                ? 'Essayez de modifier votre recherche'
                : "Les ebooks apparaîtront ici une fois ajoutés"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-live="polite">
            {paginatedEbooks.map((ebook) => (
              <Card
                key={ebook.id}
                className="hover:shadow-lg transition-shadow"
                role="article"
                aria-label={`Ebook : ${ebook.title} par ${ebook.author}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{ebook.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Par {ebook.author}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="ml-2" aria-label="Type : Ebook">
                      Ebook
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ebook.content && (
                      <p className="text-sm text-gray-600 line-clamp-3" aria-label="Aperçu du contenu">
                        {ebook.content.substring(0, 120)}...
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <time
                        className="text-xs text-gray-500"
                        dateTime={ebook.createdAt}
                        aria-label={`Ajouté le ${formatDate(ebook.createdAt)}`}
                      >
                        Ajouté le {formatDate(ebook.createdAt)}
                      </time>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/training/ebook/${ebook.id}`} passHref>
                        <Button as="a" size="sm" aria-label={`Voir les détails de ${ebook.title}`}>
                          Voir
                        </Button>
                      </Link>
                      <a
                        href={ebook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Télécharger ${ebook.title}`}
                        download
                      >
                        <Button size="sm" variant="outline">
                          Télécharger
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination simple */}
          {paginatedEbooks.length < filteredEbooks.length && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setPage(page + 1)}
                aria-label="Charger plus d'ebooks"
                variant="secondary"
              >
                Charger plus
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
