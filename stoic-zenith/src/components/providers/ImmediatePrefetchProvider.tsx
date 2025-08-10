'use client'

import React, { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ImmediatePrefetchProviderProps {
  children: ReactNode
}

const PRIORITY_ROUTES = [
  '/',
  '/quotes',
  '/quotes?tab=library'
]

const SECONDARY_ROUTES = [
  '/journal',
  '/mentors',
  '/quotes?tab=favorites',
  '/quotes?tab=my-quotes'
]

export function ImmediatePrefetchProvider({ children }: ImmediatePrefetchProviderProps): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    // Start prefetching immediately - no delays
    const prefetchRoutes = async () => {
      // Critical routes first - prefetch immediately
      for (const route of PRIORITY_ROUTES) {
        router.prefetch(route)
      }

      // Secondary routes after a tiny delay
      setTimeout(() => {
        for (const route of SECONDARY_ROUTES) {
          router.prefetch(route)
        }
      }, 100)
    }

    // Start prefetching as soon as this provider mounts
    prefetchRoutes()
  }, [router])

  return <>{children}</>
}