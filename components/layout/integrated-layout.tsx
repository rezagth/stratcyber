"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { IntegratedSidebar } from '@/components/navigation/integrated-sidebar'
import { DynamicBreadcrumb } from '@/components/navigation/dynamic-breadcrumb'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Menu } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { LegacyLayout } from './legacy-layout'

// Context pour gérer l'état de la sidebar
interface SidebarContextType {
  isOpen: boolean
  isCompact: boolean
  toggleSidebar: () => void
  setOpen: (open: boolean) => void
  setCompact: (compact: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export const useSidebarState = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarState must be used within IntegratedLayout')
  }
  return context
}

// Routes qui utilisent le legacy layout
const LEGACY_ROUTES = [
  '/auth/login',
  '/auth/register',
]

interface IntegratedLayoutProps {
  children: React.ReactNode
}

export function IntegratedLayout({ children }: IntegratedLayoutProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  
  // État de la sidebar
  const [isOpen, setIsOpen] = useState(true)
  const [isCompact, setIsCompact] = useState(false)
  const [showMobileOverlay, setShowMobileOverlay] = useState(false)

  // Vérifier si la route courante utilise le legacy layout
  const useLegacyLayout = LEGACY_ROUTES.some(route => pathname.startsWith(route))

  // Initialiser l'état selon la taille d'écran
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false)
      setIsCompact(false)
    } else {
      // Restaurer l'état depuis localStorage
      const savedState = localStorage.getItem('sidebar-state')
      if (savedState) {
        const { open, compact } = JSON.parse(savedState)
        setIsOpen(open)
        setIsCompact(compact)
      }
    }
  }, [isMobile])

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-state', JSON.stringify({
        open: isOpen,
        compact: isCompact
      }))
    }
  }, [isOpen, isCompact, isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileOverlay(!showMobileOverlay)
    } else {
      if (isOpen) {
        // Si ouvert, fermer complètement
        setIsOpen(false)
        setIsCompact(false)
      } else {
        // Si fermé, ouvrir complètement
        setIsOpen(true)
        setIsCompact(false)
      }
    }
  }

  const setOpen = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setIsCompact(false)
    }
  }

  const setCompact = (compact: boolean) => {
    setIsCompact(compact)
    if (compact) {
      setIsOpen(false)
    }
  }

  // Calculer les dimensions
  const getSidebarWidth = () => {
    if (isMobile) return 0 // Pas de marge sur mobile
    if (!isOpen && !isCompact) return 0 // Completement fermé
    if (isCompact) return 64 // 4rem en mode compact
    if (isOpen) return 240 // 15rem en mode ouvert
    return 0
  }

  const sidebarWidth = getSidebarWidth()

  // Context value
  const contextValue: SidebarContextType = {
    isOpen: isMobile ? showMobileOverlay : isOpen,
    isCompact,
    toggleSidebar,
    setOpen,
    setCompact
  }

  // Utiliser le legacy layout pour certaines routes
  if (useLegacyLayout) {
    return <LegacyLayout>{children}</LegacyLayout>
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <IntegratedSidebar 
          isOpen={isMobile ? showMobileOverlay : isOpen}
          isCompact={isCompact}
          isMobile={isMobile}
          onClose={() => isMobile ? setShowMobileOverlay(false) : undefined}
        />
        
        {/* Overlay pour mobile */}
        {isMobile && showMobileOverlay && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileOverlay(false)}
          />
        )}
        
        {/* Zone de contenu principal */}
        <div 
          className="flex-1 flex flex-col min-w-0 main-content-transition"
          style={{
            marginLeft: isMobile ? 0 : `${sidebarWidth}px`
          }}
        >
          {/* Header */}
          <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center gap-4 px-4 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                onDoubleClick={() => {
                  if (!isMobile) {
                    setIsCompact(!isCompact)
                    setIsOpen(!isCompact) // Si on passe en compact, on ferme, sinon on ouvre
                  }
                }}
                className="h-8 w-8"
                title={isOpen ? "Fermer la sidebar" : isCompact ? "Ouvrir la sidebar" : "Ouvrir la sidebar (Double-clic pour mode compact)"}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
              
              {!isMobile && (
                <Button
                  variant={isCompact ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => {
                    if (isCompact) {
                      // Si en mode compact, ouvrir complet
                      setIsCompact(false)
                      setIsOpen(true)
                    } else {
                      // Sinon, passer en mode compact
                      setIsCompact(true)
                      setIsOpen(false)
                    }
                  }}
                  className="h-8 px-2 text-xs"
                  title={isCompact ? "Ouvrir la sidebar complètement" : "Passer en mode compact"}
                >
                  {isCompact ? 'Étendre' : 'Compact'}
                </Button>
              )}
            </div>
            
            <Separator orientation="vertical" className="h-4" />
            
            <DynamicBreadcrumb />
            
            {/* Spacer pour pousser les éléments à droite si nécessaire */}
            <div className="flex-1" />
          </header>
          
          {/* Contenu principal */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
