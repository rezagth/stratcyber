'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  ArrowLeftIcon, 
  BookOpenIcon, 
  ClockIcon, 
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  AcademicCapIcon,
  TrophyIcon,
  SparklesIcon,
  CommandLineIcon,
  LightBulbIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface EbookContent {
  markdown: string;
  chapters?: Array<{
    title: string;
    content: string;
    practicalExamples?: string[];
    actionItems?: string[];
  }>;
  metadata?: {
    generatedFrom?: string;
    generatedAt?: string;
    userSpecific?: boolean;
  };
}

interface Ebook {
  id: string;
  title: string;
  author: string;
  description: string | null;
  content: string | null;
  url: string | null;
  category: string;
  difficulty: string;
  duration: string | null;
  pages: number | null;
  rating: number;
  downloads: number;
  tags: string[] | null;  // L'API renvoie maintenant un tableau
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function EbookPage({ params }: Props) {
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedContent, setParsedContent] = useState<EbookContent | null>(null);
  const [ebookId, setEbookId] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEbookId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  // Fonction améliorée pour diviser le contenu en slides plus digestes
  const convertToSlides = useCallback((content: string) => {
    const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
    const slidesData = [];
    
    // Slide de titre avec animation
    slidesData.push({
      type: 'title',
      content: ebook?.title || '',
      subtitle: ebook?.description || '',
      author: ebook?.author || '',
      tags: ebook?.tags || [],
      duration: ebook?.duration || '2h',
      difficulty: ebook?.difficulty || 'Intermédiaire'
    });
    
    // Diviser chaque section en slides plus petites
    sections.forEach((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0]?.replace(/^#+\s*/, '') || `Section ${index + 1}`;
      let content = lines.slice(1).join('\n').trim();
      
      // Si le contenu est trop long, le diviser en plusieurs slides
      const maxContentLength = 500; // Caractères max par slide
      const paragraphs = content.split('\n\n').filter(Boolean);
      
      if (content.length > maxContentLength) {
        let currentContent = '';
        let slideIndex = 0;
        
        paragraphs.forEach((paragraph) => {
          if ((currentContent + paragraph).length > maxContentLength && currentContent) {
            // Créer une slide avec le contenu actuel
            slidesData.push({
              type: detectContentType(currentContent),
              title: slideIndex === 0 ? title : `${title} (suite)`,
              content: currentContent.trim(),
              index: index + 1,
              partIndex: slideIndex + 1
            });
            currentContent = paragraph;
            slideIndex++;
          } else {
            currentContent += (currentContent ? '\n\n' : '') + paragraph;
          }
        });
        
        // Ajouter le contenu restant
        if (currentContent) {
          slidesData.push({
            type: detectContentType(currentContent),
            title: slideIndex === 0 ? title : `${title} (fin)`,
            content: currentContent.trim(),
            index: index + 1,
            partIndex: slideIndex + 1
          });
        }
      } else {
        // Contenu court, une seule slide
        slidesData.push({
          type: detectContentType(content),
          title,
          content,
          index: index + 1
        });
      }
    });
    
    // Slide de conclusion améliorée
    slidesData.push({
      type: 'conclusion',
      title: 'Bravo ! 🎉',
      content: `Formation terminée`,
      subtitle: ebook?.title,
      nextSteps: [
        { icon: '🎯', text: 'Tester vos connaissances avec le quiz' },
        { icon: '📥', text: 'Télécharger l\'ebook complet' },
        { icon: '🚀', text: 'Explorer d\'autres formations' }
      ]
    });
    
    return slidesData;
  }, [ebook]);
  
  // Fonction helper pour détecter le type de contenu
  const detectContentType = (content: string) => {
    if (content.includes('```')) return 'code';
    if (content.match(/^[\d\-\*]\s/m)) return 'list';
    if (content.includes('|') && content.includes('---')) return 'table';
    if (content.length < 150) return 'highlight';
    return 'content';
  };

  useEffect(() => {
    if (!ebookId) return;

    const fetchEbook = async () => {
      try {
        const response = await fetch(`/api/training/ebook/${ebookId}`);
        if (!response.ok) {
          throw new Error('Ebook non trouvé');
        }
        const ebookData = await response.json();
        setEbook(ebookData);
        
        // Parse le contenu JSON s'il existe
        if (ebookData.content) {
          try {
            const content = JSON.parse(ebookData.content);
            setParsedContent(content);
            
            // Convertir en slides
            if (content.markdown) {
              const slidesData = convertToSlides(content.markdown);
              setSlides(slidesData);
            }
          } catch (e) {
            console.warn('Impossible de parser le contenu JSON:', e);
            // Si le contenu n'est pas du JSON, on l'utilise tel quel
            setParsedContent({ markdown: ebookData.content });
            const slidesData = convertToSlides(ebookData.content);
            setSlides(slidesData);
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchEbook();
  }, [ebookId, convertToSlides]);
  
  // Navigation par clavier
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      } else if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ebook) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Ebook introuvable</h1>
          <p className="text-gray-600 mb-8">{error || "Cet ebook n'existe pas ou a été supprimé."}</p>
          <Link
            href="/training"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour à la formation
          </Link>
        </div>
      </div>
    );
  }

  // Les tags sont déjà parsés par l'API, on les utilise directement
  const tags = Array.isArray(ebook.tags) ? ebook.tags : [];
  const difficultyColor = {
    'Débutant': 'bg-green-100 text-green-800',
    'Intermédiaire': 'bg-yellow-100 text-yellow-800',
    'Avancé': 'bg-red-100 text-red-800'
  }[ebook.difficulty] || 'bg-gray-100 text-gray-800';

  const currentSlideData = slides[currentSlide];
  
  // Rendu du slide selon son type
  const renderSlide = () => {
    if (!currentSlideData) return null;
    
    switch (currentSlideData.type) {
      case 'title':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div className="text-center max-w-5xl mx-auto px-8">
              {/* Animation d'icône principale */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="mb-8 inline-block"
              >
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <BookOpenIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </motion.div>
              
              {/* Titre principal */}
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black mb-6 text-white"
              >
                {currentSlideData.content}
              </motion.h1>
              
              {/* Sous-titre */}
              {currentSlideData.subtitle && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl md:text-2xl text-gray-300 mb-8 font-light"
                >
                  {currentSlideData.subtitle}
                </motion.p>
              )}
              
              {/* Métadonnées */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-6 flex-wrap"
              >
                <div className="flex items-center gap-2 text-gray-400">
                  <ClockIcon className="h-5 w-5" />
                  <span>{currentSlideData.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <AcademicCapIcon className="h-5 w-5" />
                  <span>{currentSlideData.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <StarIcon className="h-5 w-5" />
                  <span>{ebook?.category}</span>
                </div>
              </motion.div>
              
              {/* Tags */}
              {currentSlideData.tags?.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex gap-2 justify-center flex-wrap"
                >
                  {currentSlideData.tags.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        );
        
      case 'conclusion':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center px-8"
          >
            <TrophyIcon className="h-24 w-24 text-yellow-500 mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentSlideData.title}</h2>
            <p className="text-xl text-gray-600 mb-8">{currentSlideData.content}</p>
            <div className="grid gap-4 max-w-md">
              {currentSlideData.nextSteps?.map((step: string, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>{step}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <Link href={`/training/quiz/${ebookId}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Passer le quiz
                </Button>
              </Link>
              <Link href="/training">
                <Button variant="outline">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Autres formations
                </Button>
              </Link>
            </div>
          </motion.div>
        );
        
      case 'list':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center px-12"
          >
            <div className="max-w-4xl w-full">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
              >
                {currentSlideData.title}
              </motion.h2>
              <div className="space-y-4">
                {currentSlideData.content.split('\n').filter((line: string) => line.trim()).map((item: string, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 bg-white/10 backdrop-blur p-6 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{i + 1}</span>
                    </div>
                    <span className="text-lg text-gray-200">{item.replace(/^[\-\*\d\.\s]+/, '')}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
        
      case 'highlight':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center px-12"
          >
            <div className="text-center max-w-4xl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="mb-8"
              >
                <LightBulbIcon className="h-24 w-24 mx-auto text-yellow-400" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                {currentSlideData.title}
              </h2>
              <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed">
                {currentSlideData.content}
              </p>
            </div>
          </motion.div>
        );
        
      case 'code':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col px-8 py-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              {currentSlideData.title}
            </h2>
            <div className="flex-1 overflow-auto bg-gray-900 rounded-xl p-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="text-green-400 bg-gray-800 px-2 py-1 rounded">
                        {children}
                      </code>
                    );
                  },
                  p: ({children}) => <p className="text-gray-300 mb-4">{children}</p>,
                  ul: ({children}) => <ul className="list-disc list-inside text-gray-300 space-y-2">{children}</ul>,
                  li: ({children}) => <li className="text-gray-300">{children}</li>
                }}
              >
                {currentSlideData.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        );
        
      default:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center px-12"
          >
            <div className="max-w-4xl">
              <motion.h2
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-8 text-center"
              >
                {currentSlideData.title}
              </motion.h2>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-8"
              >
                <div className="prose prose-xl prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({children}) => <p className="text-gray-200 leading-relaxed mb-6 text-lg">{children}</p>,
                      strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                      em: ({children}) => <em className="text-blue-300">{children}</em>,
                      ul: ({children}) => <ul className="space-y-3 my-6">{children}</ul>,
                      li: ({children}) => (
                        <li className="flex items-start gap-3">
                          <span className="text-blue-400 mt-1">•</span>
                          <span className="text-gray-200">{children}</span>
                        </li>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 border-blue-500 pl-6 my-6 italic text-gray-300">
                          {children}
                        </blockquote>
                      )
                    }}
                  >
                    {currentSlideData.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/training"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Retour
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white/80 hover:text-white"
            >
              {isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-white/80 hover:text-white"
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-md z-30 pt-20"
          >
            <div className="p-6">
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                {slides.map((slide, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentSlide === index
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-sm opacity-60">Slide {index + 1}</span>
                    <div className="font-medium truncate">
                      {slide.type === 'title' ? '🎯 Titre' :
                       slide.type === 'conclusion' ? '🎆 Conclusion' :
                       slide.title || `Section ${index}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone de présentation principale */}
      <div className="flex flex-col h-screen">
        {/* Zone de contenu */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl m-8" />
          
          <div className="relative z-10 w-full max-w-6xl h-full flex items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                className="w-full h-full"
              >
                {renderSlide()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>

        {/* Contrôles de navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-20">
          <Button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-50"
            size="lg"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? 'w-8 bg-white'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 disabled:opacity-50"
            size="lg"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Indicateurs de navigation clavier */}
        <div className="absolute bottom-8 right-8 text-white/40 text-sm space-y-1">
          <div>← → Naviguer</div>
          <div>F Plein écran</div>
          <div>ESC Quitter</div>
        </div>
      </div>
    </div>
  );
}
