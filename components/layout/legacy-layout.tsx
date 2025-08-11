"use client"

import React from 'react'
import { Nav } from '@/components/ui/nav'

interface LegacyLayoutProps {
  children: React.ReactNode
}

export function LegacyLayout({ children }: LegacyLayoutProps) {
  return (
    <>
      <Nav />
      <main className="min-h-screen pt-16">
        {children}
      </main>
    </>
  )
}
