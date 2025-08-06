  'use client';

  import { useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useSession } from 'next-auth/react';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { Button } from '@/components/ui/button';
  import { Input } from '@/components/ui/input';
  import { Label } from '@/components/ui/label';
  import { Textarea } from '@/components/ui/textarea';
  import { ArrowLeft, Save, Upload } from 'lucide-react';
  import Link from 'next/link';

  export default function CreateEbookPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      title: '',
      author: '',
      content: '',
      url: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;

      setLoading(true);
      try {
        const response = await fetch('/api/training/ebook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          router.push('/training');
          router.refresh();
        } else {
          const error = await response.text();
          alert('Erreur lors de la création de l\'ebook: ' + error);
        }
      } catch (error) {
        console.error('Error creating ebook:', error);
        alert('Erreur lors de la création de l\'ebook');
      } finally {
        setLoading(false);
      }
    };

    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
        </div>
      );
    }

    // if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    //   return (
    //     <div className="container mx-auto px-4 py-8">
    //       <div className="text-center">
    //         <h1 className="text-2xl font-bold mb-4">Accès restreint</h1>
    //         <p className="text-gray-600 mb-4">
    //           Vous devez être administrateur pour créer des ebooks.
    //         </p>
    //         <Link href="/training">
    //           <Button>Retour à la formation</Button>
    //         </Link>
    //       </div>
    //     </div>
    //   );
    // }

    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/training" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la formation
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Créer un nouvel ebook
            </CardTitle>
            <CardDescription>
              Ajoutez un nouveau livre électronique à la bibliothèque de formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'ebook *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Entrez le titre de l'ebook"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Auteur *</Label>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="Nom de l'auteur"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL du fichier *</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/ebook.pdf"
                  required
                />
                <p className="text-sm text-gray-500">
                  Lien direct vers le fichier PDF ou autre format de l'ebook
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Description (optionnel)</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Description ou résumé de l'ebook..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Créer l'ebook
                    </>
                  )}
                </Button>
                <Link href="/training">
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
