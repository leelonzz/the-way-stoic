'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { completeProfileRefresh } from '@/utils/profileRefresh'
import { useToast } from '@/hooks/use-toast'
import { RefreshCw } from 'lucide-react'

export default function TestProfileRefreshPage() {
  const { user, profile, refreshProfile } = useAuthContext()
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)

  const handleForceRefresh = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      toast({
        title: 'Refreshing Profile',
        description: 'Clearing cached data and fetching fresh profile information...',
        variant: 'default',
      })
      
      await completeProfileRefresh(user.id, refreshProfile)
      
      toast({
        title: 'Profile Refreshed',
        description: 'Your profile data has been updated. The page will reload to show the latest information.',
        variant: 'default',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile'
      toast({
        title: 'Refresh Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Refresh Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Profile Data:</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-1 text-sm">
              <p><strong>Email:</strong> {profile?.email || 'Not loaded'}</p>
              <p><strong>Plan:</strong> {profile?.subscription_plan || 'Not loaded'}</p>
              <p><strong>Status:</strong> {profile?.subscription_status || 'Not loaded'}</p>
              <p><strong>Expires:</strong> {profile?.subscription_expires_at || 'Not set'}</p>
              <p><strong>Updated:</strong> {profile?.updated_at || 'Not loaded'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              If your subscription status isn't updating correctly, use this button to clear cached data and refresh your profile.
            </p>
            <Button
              onClick={handleForceRefresh}
              disabled={loading || !user}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing Profile...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh Profile Data
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Clears all cached profile data from localStorage</li>
              <li>Forces a fresh fetch from the database</li>
              <li>Updates the authentication context</li>
              <li>Reloads the page to ensure all components get fresh data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
