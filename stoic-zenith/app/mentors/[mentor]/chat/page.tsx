'use client'

// Force dynamic rendering to prevent static generation issues with AuthProvider
export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { ChatInterface } from '@/components/mentors/ChatInterface'
import { AppLayout } from '@/components/layout/AppLayout'
import { mentorPersonalities } from '@/lib/gemini'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { hasPhilosopherPlan } from '@/utils/subscription'
import { MentorUpgradePrompt } from '@/components/mentors/MentorUpgradePrompt'
import { supabase } from '@/integrations/supabase/client'

const queryClient = new QueryClient()

export default function MentorChatPage(): JSX.Element {
  const params = useParams()
  const mentorKey = params.mentor as string
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([])
  const { profile } = useAuthContext()

  // Check if user has Philosopher plan access
  const hasAccess = hasPhilosopherPlan(profile)

  // Show upgrade prompt for non-philosopher users
  if (!hasAccess) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppLayout>
            <MentorUpgradePrompt />
          </AppLayout>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }

  const mentor = mentorPersonalities[mentorKey]

  if (!mentor) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold text-ink">
                  Mentor Not Found
                </h1>
                <p className="text-stone">
                  The mentor you&apos;re looking for doesn&apos;t exist.
                </p>
                <a href="/mentors" className="text-cta hover:underline">
                  Return to Mentors
                </a>
              </div>
            </div>
          </AppLayout>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Get the current session token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mentorKey,
          message,
          conversationHistory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.response },
      ])

      return data.response
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout fullWidth>
          <div className="h-full">
            <ChatInterface
              mentorName={mentor.name}
              mentorTitle={getMentorTitle(mentorKey)}
              mentorGreeting={mentor.greeting}
              onSendMessage={handleSendMessage}
            />
          </div>
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

function getMentorTitle(mentorKey: string): string {
  const titles: Record<string, string> = {
    seneca: 'Roman Stoic Philosopher & Statesman',
    epictetus: 'Former Slave Turned Stoic Teacher',
    'marcus-aurelius': 'The Philosopher Emperor',
  }
  return titles[mentorKey] || 'Stoic Philosopher'
}
