"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  BookOpen,
  Building2,
  ChevronUp,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  RouteIcon,
  Settings,
  Shield,
  ShieldCheck,
  Target,
  User2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Configuration des éléments de navigation
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john-doe.jpg",
  },
  navMain: [
    {
      title: "Accueil",
      url: "/",
      icon: Home,
    },
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Audit",
      url: "#",
      icon: Shield,
      items: [
        {
          title: "Audit Dynamique",
          url: "/audit/dynamic",
        },
        {
          title: "Historique des Audits",
          url: "/dashboard", // Va vers dashboard qui contient l'historique
        },
      ],
    },
    {
      title: "Conformité",
      url: "#",
      icon: ShieldCheck,
      items: [
        {
          title: "Vue d'ensemble",
          url: "/compliance",
        },
        {
          title: "RGPD",
          url: "/compliance/rgpd",
        },
        {
          title: "NIS2",
          url: "/compliance/nis2",
        },
        {
          title: "DORA",
          url: "/compliance/dora",
        },
        {
          title: "EBIOS",
          url: "/compliance/ebios",
        },
      ],
    },
    {
      title: "Formation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Parcours de formation",
          url: "/training",
        },
        {
          title: "Créer une formation",
          url: "/training/create",
        },
      ],
    },
    {
      title: "Stratégie",
      url: "/strategie",
      icon: Target,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">StratCyber</span>
                  <span className="truncate text-xs">Plateforme Cybersécurité</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => {
                const isActive = pathname === item.url || 
                  (item.items && item.items.some(subItem => pathname === subItem.url))

                return item.items ? (
                  <Collapsible
                    key={item.title}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                          <ChevronUp className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
                      <Link href={item.url}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <User2 className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {session?.user?.email || 'Utilisateur'}
                    </span>
                    <span className="truncate text-xs">Connecté</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 size-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
