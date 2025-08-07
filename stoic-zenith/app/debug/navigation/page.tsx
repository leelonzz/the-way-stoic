'use client'

import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { NavigationTester } from "@/components/debug/NavigationTester"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NavigationDebugPage() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <AppLayout>
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle>Debug Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Debug tools are only available in development mode.
            </p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Navigation Debug Tools</h1>
            <p className="text-muted-foreground mt-2">
              Test and monitor navigation performance in your application
            </p>
          </div>
          
          <NavigationTester />
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Navigation Tester</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click "Run Navigation Test" to test all routes automatically</li>
                  <li>Green results indicate fast navigation (&lt;500ms)</li>
                  <li>Yellow results indicate moderate navigation (500-1000ms)</li>
                  <li>Orange/Red results indicate slow navigation (&gt;1000ms)</li>
                  <li>"Cached" badge means the page was served from cache</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Performance Metrics</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Cache Hit Rate:</strong> Should be &gt;70% for good performance</li>
                  <li><strong>Average Time:</strong> Should be &lt;500ms for cached pages</li>
                  <li><strong>Cache Size:</strong> Number of pages currently cached</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Debug Console</h3>
                <p className="text-sm text-muted-foreground">
                  Check the browser console for detailed navigation logs and performance warnings.
                  The NavigationDebugger widget in the bottom-right corner shows real-time metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
