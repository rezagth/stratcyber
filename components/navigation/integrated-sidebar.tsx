"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  BookOpen,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  ShieldCheck,
  Target,
  User2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface IntegratedSidebarProps {
  isOpen: boolean
  isCompact: boolean
  isMobile: boolean
  onClose?: () => void
}

// Configuration des éléments de navigation
const navigationItems = [
  {
    title: 'Accueil',
    url: '/',
    icon: Home,
  },
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: LayoutDashboard,
    items: [
      {
        title: 'Roadmap',
        url: '/dashboard/roadmap',
      },
    ],
  },
  {
    title: 'Audit',
    icon: Shield,
    items: [
      {
        title: 'Audit Dynamique',
        url: '/strategie',
      },
      {
        title: 'Historique',
        url: '/dashboard/audits',
      },
    ],
  },
  {
    title: 'Documentation',
    icon: ShieldCheck,
    items: [
      {
        title: 'Vue d\'ensemble',
        url: '/compliance',
      },
      {
        title: 'RGPD',
        url: '/compliance/rgpd',
      },
      {
        title: 'NIS2',
        url: '/compliance/nis2',
      },
      {
        title: 'DORA',
        url: '/compliance/dora',
      },
      {
        title: 'EBIOS',
        url: '/compliance/ebios',
      },
    ],
  },
  {
    title: 'Formation',
    icon: BookOpen,
    items: [
      {
        title: 'Ebooks',
        url: '/training',
      },
      // {
      //   title: 'Créer',
      //   url: '/training/create',
      // },
    ],
  },
  // {
  //   title: 'Stratégie',
  //   url: '/strategie',
  //   icon: Target,
  // },
]

export function IntegratedSidebar({ 
  isOpen, 
  isCompact, 
  isMobile, 
  onClose 
}: IntegratedSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const sidebarWidth = isCompact ? 'w-16' : 'w-60'
  const showLabels = !isCompact

  // Ne pas rendre la sidebar si elle est fermée en desktop
  const shouldRender = isMobile || isOpen || isCompact
  
  if (!shouldRender) {
    return null
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border sidebar-transition z-50',
          isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          isMobile ? 'w-72' : sidebarWidth,
          isCompact && 'sidebar-compact'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center gap-2 px-3 border-b border-sidebar-border">
            {isMobile && onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              {showLabels && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold">StratCyber</span>
                  <span className="text-xs text-muted-foreground">Platforme de Cybersécurité</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = item.url ? pathname === item.url : 
                item.items?.some(subItem => pathname === subItem.url)

              if (item.items) {
                // Menu avec sous-éléments
                return (
                  <Collapsible key={item.title} defaultOpen={isActive && showLabels}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-2 h-9 sidebar-compact-item',
                          !showLabels && 'px-2 justify-center'
                        )}
                        title={!showLabels ? item.title : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {showLabels && (
                          <>
                            <span className="flex-1 text-left">{item.title}</span>
                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </>
                        )}
                        {!showLabels && (
                          <div className="compact-tooltip">{item.title}</div>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    
                    {showLabels && (
                      <CollapsibleContent className="space-y-1 ml-4 mt-1">
                        {item.items?.map((subItem) => (
                          <Button
                            key={subItem.url}
                            asChild
                            variant={pathname === subItem.url ? 'secondary' : 'ghost'}
                            size="sm"
                            className="w-full justify-start h-8"
                          >
                            <Link href={subItem.url}>
                              <span className="text-xs">{subItem.title}</span>
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                )
              } else {
                // Menu simple
                return (
                  <div key={item.title} className="sidebar-compact-item relative">
                    <Button
                      asChild
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-2 h-9',
                        !showLabels && 'px-2 justify-center'
                      )}
                      title={!showLabels ? item.title : undefined}
                    >
                      <Link href={item.url!}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {showLabels && <span>{item.title}</span>}
                      </Link>
                    </Button>
                    {!showLabels && (
                      <div className="compact-tooltip">{item.title}</div>
                    )}
                  </div>
                )
              }
            })}
          </nav>

          {/* Footer avec utilisateur */}
          <div className="mt-auto border-t border-sidebar-border p-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full gap-2 h-10',
                      showLabels ? 'justify-start' : 'justify-center px-2'
                    )}
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User2 className="h-3 w-3" />
                    </div>
                    {showLabels && (
                      <div className="flex flex-1 flex-col items-start text-left">
                        <span className="text-xs font-medium truncate max-w-[120px]">
                          {session.user?.email}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Connecté
                        </span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent 
                  side="right" 
                  align="end" 
                  className="w-56"
                >
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="space-y-2">
                <Button asChild size="sm" className="w-full">
                  <Link href="/auth/login">
                    {showLabels ? 'Connexion' : <User2 className="h-4 w-4" />}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
