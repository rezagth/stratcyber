"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Nav } from '@/components/ui/nav'

interface LegacyLayoutProps {
  children: React.ReactNode
}

// Routes où on ne veut pas de navigation
const NO_NAV_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
]

export function LegacyLayout({ children }: LegacyLayoutProps) {
  const pathname = usePathname()
  const shouldHideNav = NO_NAV_ROUTES.some(route => pathname.startsWith(route))

  if (shouldHideNav) {
    // Pages d'auth sans navigation
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }

  // Autres pages avec navigation
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </>
  )
}
