'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthContext } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatInterfaceProps {
  mentorName: string;
  mentorTitle: string;
  mentorGreeting: string;
  onSendMessage: (message: string) => Promise<string>;
}

export function ChatInterface({
  mentorName,
  mentorTitle,
  mentorGreeting,
  onSendMessage
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: mentorGreeting,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuthContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an issue processing your message. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile?.email.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return profile?.full_name || profile?.email.split('@')[0] || 'User';
  };

  // Minimal markdown renderer for bold (**) and italics (*) without using innerHTML
  const renderMarkdown = (input: string): React.ReactNode[] => {
    const nodes: React.ReactNode[] = []
    let i = 0
    let key = 0

    const indexOfOrInfinity = (s: string, search: string, from: number) => {
      const idx = s.indexOf(search, from)
      return idx === -1 ? Number.POSITIVE_INFINITY : idx
    }

    while (i < input.length) {
      const nextBold = indexOfOrInfinity(input, "**", i)
      const nextItalic = indexOfOrInfinity(input, "*", i)
      const nextTokenPos = Math.min(nextBold, nextItalic)

      if (nextTokenPos === Number.POSITIVE_INFINITY) {
        // No more tokens
        if (i < input.length) nodes.push(<span key={`t-${key++}`}>{input.slice(i)}</span>)
        break
      }

      // Push plain text before token
      if (nextTokenPos > i) {
        nodes.push(<span key={`t-${key++}`}>{input.slice(i, nextTokenPos)}</span>)
        i = nextTokenPos
      }

      // Handle bold
      if (input.startsWith("**", i)) {
        const end = input.indexOf("**", i + 2)
        if (end !== -1) {
          const inner = input.slice(i + 2, end)
          nodes.push(<strong key={`b-${key++}`}>{inner}</strong>)
          i = end + 2
          continue
        } else {
          // No closing token; treat literally
          nodes.push(<span key={`t-${key++}`}>**</span>)
          i += 2
          continue
        }
      }

      // Handle italics
      if (input[i] === "*") {
        const end = input.indexOf("*", i + 1)
        if (end !== -1) {
          const inner = input.slice(i + 1, end)
          nodes.push(<em key={`i-${key++}`}>{inner}</em>)
          i = end + 1
          continue
        } else {
          nodes.push(<span key={`t-${key++}`}>*</span>)
          i += 1
          continue
        }
      }
    }

    return nodes
  }



  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      {/* Header */}
      <div className="bg-card/90 backdrop-blur border-b border-border shrink-0">
        <div className="px-6 py-3 flex items-center gap-3">
          <Link href="/mentors">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cta to-accent flex items-center justify-center text-accent-foreground font-semibold">
              {mentorName.charAt(0)}
            </div>
            <div className="leading-tight">
              <h2 className="text-[15px] font-semibold text-foreground">{mentorName}</h2>
              <p className="text-xs text-muted-foreground">{mentorTitle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="px-6 py-6">
            {messages.map((message) => (
              <div key={message.id} className="mb-8">
                {message.role === 'assistant' ? (
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-gradient-to-br from-cta to-accent flex items-center justify-center text-accent-foreground text-xs font-semibold flex-shrink-0">
                      {mentorName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-[15px] leading-7 text-foreground whitespace-pre-wrap">
                        {renderMarkdown(message.content)}
                      </div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-stone flex items-center justify-center text-primary-foreground text-xs font-semibold flex-shrink-0">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="text-[15px] leading-7 text-foreground whitespace-pre-wrap">
                        {renderMarkdown(message.content)}
                      </div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {isLoading && (
            <div className="flex items-start gap-4 mb-8">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-gradient-to-br from-cta to-accent flex items-center justify-center text-accent-foreground text-xs font-semibold flex-shrink-0">
                {mentorName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex space-x-1 pt-2">
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-sage rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background/90 backdrop-blur shrink-0">
        <div className="px-6 py-3">
          <div className="relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${mentorName} for guidance...`}
              className="w-full pr-12 rounded-full border border-border bg-card shadow-sm text-[15px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="absolute right-1.5 top-1.5 h-8 w-8 rounded-full bg-cta text-primary-foreground hover:bg-cta/90 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
