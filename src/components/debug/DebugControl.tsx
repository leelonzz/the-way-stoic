'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { debugControl, debugLog } from '@/lib/debug'
import { Settings, Bug, X } from 'lucide-react'

interface DebugControlProps {
  className?: string
}

export function DebugControl({ className = '' }: DebugControlProps): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false)
  const [debugStatus, setDebugStatus] = useState({
    general: false,
    auth: false,
    journal: false,
    performance: false
  })

  // Ensure hooks are never called conditionally
  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    setDebugStatus(debugControl.getDebugStatus())
  }, [])

  const handleToggle = (category: keyof typeof debugStatus, enabled: boolean) => {
    switch (category) {
      case 'general':
        debugControl.setDebugEnabled(enabled)
        break
      case 'auth':
        debugControl.setAuthDebugEnabled(enabled)
        break
      case 'journal':
        debugControl.setJournalDebugEnabled(enabled)
        break
      case 'performance':
        debugControl.setPerformanceDebugEnabled(enabled)
        break
    }
    
    setDebugStatus(prev => ({ ...prev, [category]: enabled }))
    
    // Log the change
    debugLog.log(`Debug ${category} ${enabled ? 'enabled' : 'disabled'}`)
  }

  const handleClearAll = () => {
    debugControl.clearDebugSettings()
    setDebugStatus({
      general: false,
      auth: false,
      journal: false,
      performance: false
    })
    debugLog.log('All debug settings cleared')
  }

  // Don't render in production
  if (isProduction) {
    return null
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-sm border-stone-300 hover:bg-stone-50 ${className}`}
        title="Debug Controls"
      >
        <Bug className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-80 bg-white/95 backdrop-blur-sm border-stone-300 shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Debug Controls
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-general" className="text-sm">
              General Debug
            </Label>
            <Switch
              id="debug-general"
              checked={debugStatus.general}
              onCheckedChange={(checked) => handleToggle('general', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-auth" className="text-sm">
              Auth Debug
            </Label>
            <Switch
              id="debug-auth"
              checked={debugStatus.auth}
              onCheckedChange={(checked) => handleToggle('auth', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-journal" className="text-sm">
              Journal Debug
            </Label>
            <Switch
              id="debug-journal"
              checked={debugStatus.journal}
              onCheckedChange={(checked) => handleToggle('journal', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-performance" className="text-sm">
              Performance Debug
            </Label>
            <Switch
              id="debug-performance"
              checked={debugStatus.performance}
              onCheckedChange={(checked) => handleToggle('performance', checked)}
            />
          </div>
        </div>
        
        <div className="pt-2 border-t border-stone-200">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full text-xs"
          >
            Clear All Debug Settings
          </Button>
        </div>
        
        <div className="text-xs text-stone-500">
          <p>Debug settings are stored in localStorage and persist across page reloads.</p>
        </div>
      </CardContent>
    </Card>
  )
}
