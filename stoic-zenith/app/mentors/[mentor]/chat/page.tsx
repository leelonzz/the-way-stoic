'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface, Message } from '@/components/mentors/ChatInterface';
import { AppLayout } from '@/components/layout/AppLayout';
import { mentorPersonalities } from '@/lib/gemini';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function MentorChatPage() {
  const params = useParams();
  const mentorKey = params.mentor as string;
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const mentor = mentorPersonalities[mentorKey];

  if (!mentor) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold text-ink">Mentor Not Found</h1>
                <p className="text-stone">The mentor you're looking for doesn't exist.</p>
                <a href="/mentors" className="text-cta hover:underline">Return to Mentors</a>
              </div>
            </div>
          </AppLayout>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorKey,
          message,
          conversationHistory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: data.response }
      ]);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
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
  );
}

function getMentorTitle(mentorKey: string): string {
  const titles: Record<string, string> = {
    'seneca': 'Roman Stoic Philosopher & Statesman',
    'epictetus': 'Former Slave Turned Stoic Teacher',
    'marcus-aurelius': 'The Philosopher Emperor'
  };
  return titles[mentorKey] || 'Stoic Philosopher';
}