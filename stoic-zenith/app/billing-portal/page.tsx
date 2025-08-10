'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Receipt, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function BillingPortalPage(): JSX.Element {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    // Automatically redirect to customer portal
    const redirectToPortal = async (): Promise<void> => {
      try {
        const response = await fetch('/api/dodo/customer-portal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id
          }),
        })

        const result = await response.json()

        if (response.ok && result.portalUrl) {
          window.location.href = result.portalUrl
        } else {
          // If failed, show error and redirect to subscription page
          console.error('Failed to create portal session:', result.error)
          router.push('/subscription?error=portal-failed')
        }
      } catch (error) {
        console.error('Portal redirect error:', error)
        router.push('/subscription?error=portal-error')
      }
    }

    redirectToPortal()
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-stone" />
              <span className="ml-2 text-stone">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Receipt className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle>Opening Billing Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-stone" />
            <span className="ml-2 text-stone">Redirecting to your billing portal...</span>
          </div>
          
          <p className="text-sm text-stone">
            You&apos;ll be redirected to your secure billing portal where you can:
          </p>
          
          <ul className="text-sm text-stone text-left space-y-1">
            <li>• View transaction history</li>
            <li>• Download invoices</li>
            <li>• Update payment methods</li>
            <li>• Manage your subscription</li>
          </ul>

          <div className="pt-4">
            <Link href="/subscription">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}