"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Mapping des routes vers des labels lisibles
const pathLabels: Record<string, string> = {
  "/": "Accueil",
  "/dashboard": "Tableau de bord",
  "/audit": "Audit",
  "/audit/dynamic": "Audit Dynamique",
  "/compliance": "Conformité",
  "/compliance/rgpd": "RGPD",
  "/compliance/nis2": "NIS2",
  "/compliance/dora": "DORA",
  "/compliance/ebios": "EBIOS",
  "/training": "Formation",
  "/training/create": "Créer une formation",
  "/training/ebook": "E-books",
  "/training/quiz": "Quiz",
  "/strategie": "Stratégie",
  "/dashboard/organizations": "Clients",
  "/dashboard/roadmap": "Roadmap",
  "/dashboard/audits": "Historique des audits",
  "/dashboard/policy-templates": "Modèles de politiques",
  "/auth": "Authentification",
  "/auth/login": "Connexion",
  "/auth/register": "Inscription",
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const segmentLabels: Record<string, string> = {
  "action-plan": "Plan d'action",
  incidents: "Incidents",
}

// Fonction pour obtenir le label d'un segment de path
function getPathLabel(path: string, segment?: string, clientNames: Record<string, string> = {}): string {
  if (pathLabels[path]) {
    return pathLabels[path]
  }
  if (segment && segmentLabels[segment]) return segmentLabels[segment]

  // Dossier d'un client : son nom plutôt que son identifiant ; page d'un incident : Mode urgence.
  if (segment && UUID.test(segment)) {
    const parent = path.slice(0, path.lastIndexOf('/'))
    if (parent.endsWith('/organizations')) return clientNames[segment] ?? 'Client'
    if (parent.endsWith('/incidents')) return 'Mode urgence'
  }
  
  // Pour les routes dynamiques comme /audit/[id], /training/ebook/[id], etc.
  if (segment) {
    // Si c'est un UUID ou un ID, on essaie de deviner le type
    if (/^[a-f0-9-]+$/i.test(segment)) {
      const parent = path.replace(`/${segment}`, '')
      if (parent.includes('/audit/')) return `Audit #${segment.slice(0, 8)}`
      if (parent.includes('/training/ebook/')) return `E-book`
      if (parent.includes('/training/quiz/')) return `Quiz`
    }
    
    // Sinon on capitalise le segment
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
  }
  
  // Fallback: capitaliser le dernier segment du path
  const segments = path.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]
  return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ') : 'Page'
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const [clientNames, setClientNames] = React.useState<Record<string, string>>({})
  const onClientPage = /^\/dashboard\/organizations\/[^/]+/.test(pathname)

  // Charge les noms des clients une seule fois, seulement sur les pages d'un client (réservées à l'admin).
  React.useEffect(() => {
    if (!onClientPage || Object.keys(clientNames).length > 0) return
    fetch('/api/organizations')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Array<{ id: string; name: string }>) =>
        setClientNames(Object.fromEntries((Array.isArray(list) ? list : []).map((o) => [o.id, o.name]))))
      .catch(() => undefined)
  }, [onClientPage, clientNames])
  
  // Ne pas afficher le breadcrumb sur la page d'accueil
  if (pathname === '/') {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        Accueil
      </div>
    )
  }

  try {
    // Diviser le chemin en segments
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // Construire les éléments du breadcrumb
    const breadcrumbItems = [
      {
        href: '/',
        label: 'Accueil',
        isLast: false,
      }
    ]

    // Ajouter chaque segment au breadcrumb
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // « incidents » n'a pas de page propre : le lien ramène au dossier du client (onglet Incidents).
      const parentPath = currentPath.slice(0, currentPath.lastIndexOf('/'))
      breadcrumbItems.push({
        href: segment === 'incidents' ? parentPath : currentPath,
        label: getPathLabel(currentPath, segment, clientNames),
        isLast,
      })
    })

    return (
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={`${item.href}-${index}`}>
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  } catch (error) {
    // Fallback en cas d'erreur
    console.warn('Erreur dans le breadcrumb:', error)
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        Navigation
      </div>
    )
  }
}
