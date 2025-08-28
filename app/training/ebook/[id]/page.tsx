'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/styles/tomorrow';
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

  // Fonction globale pour extraire les points clés du contenu
  const extractKeyPoints = useCallback((content: string) => {
    const lines = content.split('\n');
    const keyPoints = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // Extraire les listes numérotées (priorité pour "7 principes", etc.)
      if (trimmedLine.match(/^\d+\.\s+(.+)/)) {
        keyPoints.push(trimmedLine.replace(/^\d+\.\s+/, '').trim());
      }
      // Extraire les listes à puces
      else if (trimmedLine.match(/^[\-\*\+]\s+(.+)/)) {
        keyPoints.push(trimmedLine.replace(/^[\-\*\+]\s+/, '').trim());
      }
      // Extraire les points avec émojis étendus
      else if (trimmedLine.match(/^[✅❌⚠️📊🎯🔒🛡️📋📝🚀💡⭐]\s*(.+)/)) {
        keyPoints.push(trimmedLine);
      }
      // Extraire les lignes qui commencent par des mots-clés importants
      else if (trimmedLine.match(/^(Principe|Règle|Étape|Point|Important|Attention|Note)\s*\d*\s*[:\-]?\s*(.+)/i)) {
        keyPoints.push(trimmedLine);
      }
      // Tableaux markdown - extraire les lignes de données
      else if (trimmedLine.includes('|') && !trimmedLine.includes('---') && trimmedLine.split('|').length > 2) {
        const cells = trimmedLine.split('|').map(cell => cell.trim()).filter(cell => cell);
        if (cells.length >= 2) {
          keyPoints.push(`${cells[0]}: ${cells.slice(1).join(' - ')}`);
        }
      }
    }
    
    return keyPoints.slice(0, 8); // Augmenté à 8 points pour les contenus riches
  }, []);

  // Fonction améliorée pour diviser le contenu en slides plus digestes avec visuels
  const convertToSlides = useCallback((content: string) => {
    const sections = content.split(/^#{1,3}\s+/m).filter(Boolean);
    const slidesData = [];
    
    // Banque d'images par sujet
    const getImageForSlide = (title: string, content: string) => {
      const titleLower = title.toLowerCase();
      const contentLower = content.toLowerCase();
      
      // Images par thème
      if (titleLower.includes('introduction') || titleLower.includes('objectifs')) {
        return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('sécurité') || contentLower.includes('sécurité')) {
        return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('données') || contentLower.includes('données')) {
        return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('incident') || contentLower.includes('incident')) {
        return 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('conformité') || titleLower.includes('rgpd') || titleLower.includes('nis2')) {
        return 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('plan') || titleLower.includes('action') || titleLower.includes('mise en œuvre')) {
        return 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('équipe') || titleLower.includes('organisation')) {
        return 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('processus') || titleLower.includes('méthodologie')) {
        return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&w=800';
      }
      if (titleLower.includes('risque') || titleLower.includes('analyse')) {
        return 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&w=800';
      }
      // Image par défaut
      return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=800';
    };
    
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
        // Contenu court, une seule slide avec image
        const slideData = {
          type: detectContentType(content),
          title,
          content,
          index: index + 1,
          image: getImageForSlide(title, content),
          keyPoints: extractKeyPoints(content)
        };
        slidesData.push(slideData);
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
  }, [ebook, extractKeyPoints]);
  
  // Fonction helper améliorée pour détecter le type de contenu
  const detectContentType = (content: string) => {
    // Priorité aux listes numérotées longues (comme "7 principes")
    const numberedLists = content.match(/^\d+\./gm);
    if (numberedLists && numberedLists.length >= 3) return 'list';
    
    // Listes à puces multiples
    const bulletLists = content.match(/^[\-\*\+]/gm);
    if (bulletLists && bulletLists.length >= 3) return 'list';
    
    // Listes avec émojis
    const emojiLists = content.match(/^[✅❌⚠️📊🎯🔒🛡️]/gm);
    if (emojiLists && emojiLists.length >= 2) return 'list';
    
    // Éviter les blocs de code markdown (on les traite comme du contenu normal)
    if (content.includes('```')) return 'content'; // Changé de 'code' à 'content'
    
    // Éviter les tableaux markdown (on les traite comme des listes)
    if (content.includes('|') && content.includes('---')) return 'list'; // Changé de 'table' à 'list'
    
    // Contenu court = highlight
    if (content.length < 200) return 'highlight';
    
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
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                    <BookOpenIcon className="h-16 w-16 text-blue-200" />
                  </div>
                </div>
              </motion.div>
              
              {/* Titre principal */}
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight"
              >
                {currentSlideData.content}
              </motion.h1>
              
              {/* Sous-titre */}
              {currentSlideData.subtitle && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl text-slate-200 mb-8 font-normal max-w-3xl mx-auto leading-relaxed"
                >
                  {currentSlideData.subtitle}
                </motion.p>
              )}
              
              {/* Métadonnées */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-8 flex-wrap"
              >
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <ClockIcon className="h-4 w-4 text-blue-300" />
                  <span className="text-slate-200 text-sm font-medium">{currentSlideData.duration}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <AcademicCapIcon className="h-4 w-4 text-purple-300" />
                  <span className="text-slate-200 text-sm font-medium">{currentSlideData.difficulty}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <StarIcon className="h-4 w-4 text-indigo-300" />
                  <span className="text-slate-200 text-sm font-medium">{ebook?.category}</span>
                </div>
              </motion.div>
              
              {/* Tags */}
              {currentSlideData.tags?.length > 0 && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 flex gap-3 justify-center flex-wrap"
                >
                  {currentSlideData.tags.slice(0, 4).map((tag: string, i: number) => (
                    <span key={i} className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-full text-sm text-blue-200 font-medium">
                      {tag}
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-1 shadow-2xl">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  <TrophyIcon className="h-12 w-12 text-amber-300" />
                </div>
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">{currentSlideData.title}</h2>
            <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto leading-relaxed">{currentSlideData.content}</p>
            
            <div className="grid gap-3 max-w-lg mx-auto mb-8">
              {currentSlideData.nextSteps?.map((step: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/10 p-4 rounded-xl"
                >
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-slate-200 font-medium">{step.text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/training/quiz/${ebookId}`}>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none shadow-lg px-6 py-3">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  Passer le quiz
                </Button>
              </Link>
              <Link href="/training">
                <Button className="bg-white/10 backdrop-blur-sm border border-white/20 text-slate-200 hover:bg-white/20 px-6 py-3">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Autres formations
                </Button>
              </Link>
            </div>
          </motion.div>
        );
        
      case 'list':
        // Extraire les points de façon intelligente
        const listPoints = extractKeyPoints(currentSlideData.content);
        const hasMany = listPoints.length > 6;
        
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center px-4"
          >
            <div className="max-w-7xl w-full">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl md:text-4xl font-bold text-white mb-8 text-center leading-tight"
              >
                {currentSlideData.title}
              </motion.h2>
              
              {/* Layout adaptatif selon le nombre d'éléments */}
              <div className={`${
                hasMany 
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto' 
                  : 'grid gap-4 max-w-4xl mx-auto'
              }`}>
                {listPoints.map((item: string, i: number) => {
                  // Nettoyer le texte
                  let cleanText = item
                    .replace(/^[\-\*\+\d\.\s]+/, '') // Enlever puces et numéros
                    .replace(/^[✅❌⚠️📊🎯🔒🛡️📋📝🚀💡⭐]\s*/, '') // Enlever émojis
                    .replace(/\*\*(.+?)\*\*/g, '$1') // Enlever markdown gras
                    .replace(/\*(.+?)\*/g, '$1') // Enlever markdown italique
                    .replace(/`(.+?)`/g, '$1') // Enlever code inline
                    .trim();
                  
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-300 ${
                        hasMany ? 'p-4' : 'p-5'
                      }`}
                    >
                      <div className={`flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg ${
                        hasMany ? 'w-8 h-8' : 'w-10 h-10'
                      }`}>
                        <span className={`text-white font-semibold ${
                          hasMany ? 'text-xs' : 'text-sm'
                        }`}>{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-slate-200 leading-relaxed font-medium block ${
                          hasMany ? 'text-base' : 'text-lg'
                        }`}>
                          {cleanText}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
        
      case 'highlight':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center px-8"
          >
            <div className="text-center max-w-5xl mx-auto">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-8"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 p-1 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                    <LightBulbIcon className="h-12 w-12 text-amber-300" />
                  </div>
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight"
              >
                {currentSlideData.title}
              </motion.h2>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-w-4xl mx-auto"
              >
                <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">
                  {currentSlideData.content.replace(/^#{1,6}\s+.*$/gm, '').replace(/\*\*(.+?)\*\*/g, '$1').trim()}
                </p>
              </motion.div>
            </div>
          </motion.div>
        );
        
      case 'code':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col px-8 py-8"
          >
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
            >
              {currentSlideData.title}
            </motion.h2>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[60vh] overflow-auto"
            >
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
                        className="rounded-lg"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="text-blue-300 bg-slate-800 px-2 py-1 rounded font-mono text-sm">
                        {children}
                      </code>
                    );
                  },
                  p: ({children}) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
                  ul: ({children}) => <ul className="list-none space-y-2 ml-0">{children}</ul>,
                  li: ({children}) => (
                    <li className="flex items-start gap-3 text-slate-300">
                      <span className="text-blue-400 mt-1 text-sm">▸</span>
                      <span>{children}</span>
                    </li>
                  ),
                  h1: ({children}) => <h3 className="text-xl font-semibold text-white mb-3">{children}</h3>,
                  h2: ({children}) => <h4 className="text-lg font-medium text-slate-200 mb-2">{children}</h4>,
                  h3: ({children}) => <h5 className="text-base font-medium text-slate-300 mb-2">{children}</h5>
                }}
              >
                {currentSlideData.content}
              </ReactMarkdown>
            </motion.div>
          </motion.div>
        );
        
      default:
        // Rendu unifié intelligent avec gestion automatique du layout
        const contentPoints = extractKeyPoints(currentSlideData.content);
        const hasImage = currentSlideData.image;
        const hasMultiplePoints = contentPoints.length > 3;
        const shouldUseFullWidth = hasMultiplePoints || !hasImage;
        
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex items-center justify-center px-4"
          >
            <div className={`w-full ${
              shouldUseFullWidth 
                ? 'max-w-7xl' 
                : 'max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
            }`}>
              
              {/* Image à gauche (si layout 2 colonnes) */}
              {hasImage && !shouldUseFullWidth && (
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <img 
                      src={currentSlideData.image} 
                      alt={currentSlideData.title}
                      className="w-full h-72 lg:h-80 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  </div>
                </motion.div>
              )}
              
              {/* Contenu principal */}
              <motion.div
                initial={{ x: shouldUseFullWidth ? 0 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={shouldUseFullWidth ? 'text-center' : 'space-y-6'}
              >
                <motion.h2
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`font-bold text-white leading-tight ${
                    shouldUseFullWidth 
                      ? 'text-3xl md:text-4xl mb-10' 
                      : 'text-3xl lg:text-4xl mb-8'
                  }`}
                >
                  {currentSlideData.title}
                </motion.h2>
                
                {/* Points clés extraits intelligemment */}
                {contentPoints.length > 0 ? (
                  <div className={`${
                    shouldUseFullWidth && contentPoints.length > 4
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-3 max-w-6xl mx-auto' 
                      : 'space-y-3 max-w-4xl mx-auto'
                  }`}>
                    {contentPoints.map((point: string, index: number) => {
                      // Nettoyage avancé du texte
                      let cleanText = point
                        .replace(/^[\-\*\+\d\.\s]+/, '') // Enlever puces/numéros
                        .replace(/^[✅❌⚠️📊🎯🔒🛡️📋📝🚀💡⭐]\s*/, '') // Enlever émojis
                        .replace(/\*\*(.+?)\*\*/g, '$1') // Enlever markdown gras
                        .replace(/\*(.+?)\*/g, '$1') // Enlever markdown italique
                        .replace(/`(.+?)`/g, '$1') // Enlever code inline
                        .replace(/^(Principe|Règle|Étape|Point|Important|Attention|Note)\s*\d*\s*[:\-]?\s*/i, '') // Enlever préfixes
                        .replace(/\|/g, ' - ') // Remplacer les pipes de tableaux
                        .replace(/---+/g, '') // Enlever les séparateurs de tableau
                        .replace(/\s+/g, ' ') // Normaliser les espaces
                        .trim();
                      
                      if (!cleanText) return null;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + index * 0.08 }}
                          className={`flex items-start gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/8 transition-all duration-300 ${
                            shouldUseFullWidth && contentPoints.length > 4 ? 'p-4' : 'p-5'
                          }`}
                        >
                          <div className={`flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg ${
                            shouldUseFullWidth && contentPoints.length > 4 ? 'w-8 h-8' : 'w-10 h-10'
                          }`}>
                            <span className={`text-white font-semibold ${
                              shouldUseFullWidth && contentPoints.length > 4 ? 'text-xs' : 'text-sm'
                            }`}>{index + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className={`text-slate-200 leading-relaxed font-medium block ${
                              shouldUseFullWidth && contentPoints.length > 4 ? 'text-base' : 'text-lg'
                            }`}>
                              {cleanText}
                            </span>
                          </div>
                        </motion.div>
                      );
                    }).filter(Boolean)}
                  </div>
                ) : (
                  // Contenu markdown ultra-nettoyé si pas de points extraits
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 max-h-96 overflow-y-auto max-w-4xl mx-auto"
                  >
                    {(() => {
                      let ultraCleanContent = currentSlideData.content
                        // Supprimer tout le markdown
                        .replace(/^#{1,6}\s+.*$/gm, '')
                        .replace(/```[\s\S]*?```/g, '') // Supprimer blocs de code
                        .replace(/`([^`]+)`/g, '$1') // Code inline
                        .replace(/\*\*(.+?)\*\*/g, '$1') // Gras
                        .replace(/\*(.+?)\*/g, '$1') // Italique
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Liens
                        .replace(/^[\-\*\+]\s+/gm, '• ') // Puces
                        .replace(/^\d+\.\s+/gm, '') // Numéros de liste
                        .replace(/\|[^\n]*\|/g, '') // Lignes de tableau
                        .replace(/---+/g, '') // Séparateurs
                        .replace(/\n\s*\n\s*\n/g, '\n\n') // Espaces multiples
                        .trim();
                      
                      return ultraCleanContent.split('\n\n').filter(p => p.trim()).map((paragraph, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + i * 0.1 }}
                          className="text-slate-200 leading-relaxed mb-4 text-lg font-medium"
                        >
                          {paragraph}
                        </motion.p>
                      ));
                    })()}
                  </motion.div>
                )}
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
