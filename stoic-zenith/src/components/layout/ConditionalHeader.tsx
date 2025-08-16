'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './Header'

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname()

  // Don't render header on the home page or app routes (journal, etc.)
  if (pathname === '/' || pathname.startsWith('/journal') || pathname.startsWith('/calendar') || pathname.startsWith('/quotes') || pathname.startsWith('/mentors') || pathname.startsWith('/settings')) {
    return null
  }

  return <Header />
}

export default ConditionalHeader
