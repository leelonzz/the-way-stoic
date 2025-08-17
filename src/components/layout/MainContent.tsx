'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

interface MainContentProps {
  children: React.ReactNode
}

export const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const pathname = usePathname()

  // Check if header should be shown (same logic as ConditionalHeader)
  const shouldShowHeader = !(
    pathname === '/' || 
    pathname === '/login' || 
    pathname.startsWith('/journal') || 
    pathname.startsWith('/calendar') || 
    pathname.startsWith('/quotes') || 
    pathname.startsWith('/mentors') || 
    pathname.startsWith('/settings')
  )

  return (
    <main className={shouldShowHeader ? 'pt-16' : ''}>
      {children}
    </main>
  )
}

export default MainContent
