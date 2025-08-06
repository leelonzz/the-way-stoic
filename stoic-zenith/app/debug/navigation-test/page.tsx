'use client'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { NavigationQuoteTest } from '@/components/debug/NavigationQuoteTest'

export default function NavigationTestPage(): JSX.Element {
  return (
    <ProtectedRoute>
      <AppLayout>
        <NavigationQuoteTest />
      </AppLayout>
    </ProtectedRoute>
  )
}
