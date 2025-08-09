'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Bookmark, BookmarkCheck, Share, RotateCcw, Star } from 'lucide-react'
import { QuoteCarousel } from './QuoteCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useCachedQuotes } from '@/hooks/useCachedQuotes'
import { useAuthContext } from '@/components/auth/AuthProvider'
import type { Quote as QuoteType } from '@/hooks/useCachedQuotes'
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner'

interface DailyStoicQuoteCardProps {
  quote: QuoteType
  isSaved?: boolean
  onSave?: (quoteId: string) => Promise<boolean>
  onUnsave?: (quoteId: string) => Promise<boolean>
  onRefresh?: () => void
  canReload?: boolean
  reloadCount?: number
  maxReloads?: number
  isRefreshing?: boolean
}

function DailyStoicQuoteCard({ 
  quote, 
  isSaved = false, 
  onSave, 
  onUnsave,
  onRefresh,
  canReload = true,
  reloadCount = 0,
  maxReloads = 10,
  isRefreshing = false
}: DailyStoicQuoteCardProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveToggle = async (): Promise<void> => {
    if (!onSave || !onUnsave) return

    setIsLoading(true)
    try {
      const success = isSaved
        ? await onUnsave(quote.id)
        : await onSave(quote.id)

      if (success) {
        toast({
          title: isSaved ? "Quote removed" : "Quote saved",
          description: isSaved ? "Removed from your collection" : "Added to your collection",
        })
      } else {
        toast({
          title: "Error",
          description: isSaved ? "Failed to remove quote" : "Failed to save quote",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (): Promise<void> => {
    const text = `"${quote.text}" - ${quote.author}${quote.source ? ` (${quote.source})` : ''}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Stoic Quote',
          text: text,
        })
              } catch {
          // User cancelled or error occurred
        }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Quote copied",
          description: "Quote copied to clipboard",
        })
      } catch {
        toast({
          title: "Failed to copy",
          description: "Unable to copy quote to clipboard",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Card className="bg-hero/30 border-stone/20 shadow-lg animate-fade-in">
      <CardContent className="p-12">
        <div className="space-y-6">
          {/* Quote content */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <blockquote className="text-lg md:text-xl font-bold leading-relaxed text-ink font-inknut">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            
            <div className="text-base md:text-lg font-medium text-ink font-inknut">
              — {quote.author}
            </div>
          </div>

          {/* Action buttons at bottom */}
          <div className="flex items-center justify-between pt-4 border-t border-stone/10 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              {(onSave || onUnsave) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  disabled={isLoading}
                  className={`p-2 hover:bg-transparent ${
                    isSaved 
                      ? 'text-cta hover:text-cta/70' 
                      : 'text-stone hover:text-cta'
                  }`}
                >
                  {isSaved ? (
                    <Star className="w-5 h-5 fill-current" />
                  ) : (
                    <Star className="w-5 h-5" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-stone hover:text-cta hover:bg-transparent p-2"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
            
            {onRefresh && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={!canReload || isRefreshing}
                  className={`p-2 hover:bg-transparent transition-all ${
                    canReload && !isRefreshing
                      ? 'text-stone hover:text-cta' 
                      : 'text-stone/40 cursor-not-allowed'
                  } ${isRefreshing ? 'animate-spin' : ''}`}
                  title={
                    !canReload 
                      ? `Daily quota reached (${reloadCount}/${maxReloads})` 
                      : `Reload quote (${maxReloads - reloadCount} left)`
                  }
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                {canReload && (
                  <span className="text-sm text-stone/70 font-medium">
                    {maxReloads - reloadCount} left
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface SimplifiedQuoteCardProps {
  quote: QuoteType
  isSaved?: boolean
  onSave?: (quoteId: string) => Promise<boolean>
  onUnsave?: (quoteId: string) => Promise<boolean>
  onRefresh?: () => void
  canReload?: boolean
  reloadCount?: number
  maxReloads?: number
  isRefreshing?: boolean
}

function SimplifiedQuoteCard({ 
  quote, 
  isSaved = false, 
  onSave, 
  onUnsave,
  onRefresh,
  canReload = true,
  reloadCount = 0,
  maxReloads = 10,
  isRefreshing = false
}: SimplifiedQuoteCardProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSaveToggle = async (): Promise<void> => {
    if (!onSave || !onUnsave) return

    setIsLoading(true)
    try {
      const success = isSaved
        ? await onUnsave(quote.id)
        : await onSave(quote.id)

      if (success) {
        toast({
          title: isSaved ? "Quote removed" : "Quote saved",
          description: isSaved ? "Removed from your collection" : "Added to your collection",
        })
      } else {
        toast({
          title: "Error",
          description: isSaved ? "Failed to remove quote" : "Failed to save quote",
          variant: "destructive"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (): Promise<void> => {
    const text = `"${quote.text}" - ${quote.author}${quote.source ? ` (${quote.source})` : ''}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Stoic Quote',
          text: text,
        })
      } catch {
        // User cancelled or error occurred
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Quote copied",
          description: "Quote copied to clipboard",
        })
      } catch {
        toast({
          title: "Failed to copy",
          description: "Unable to copy quote to clipboard",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Card className="bg-hero/50 border-stone/20 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Quote Content */}
          <div className="space-y-3">
            <blockquote className="text-lg font-medium italic text-ink leading-relaxed">
              &ldquo;{quote.text}&rdquo;
            </blockquote>
            
            <div className="text-base font-medium text-stone">
              — {quote.author}
              {quote.source && (
                <span className="text-sm text-stone/70 ml-2">({quote.source})</span>
              )}
            </div>
          </div>
          
          {/* Action Icons at Bottom */}
          <div className="flex items-center justify-between pt-2 border-t border-stone/10">
            <div className="flex items-center gap-2">
              {(onSave || onUnsave) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  disabled={isLoading}
                  className={`p-2 hover:bg-transparent ${
                    isSaved 
                      ? 'text-cta hover:text-cta/70' 
                      : 'text-stone hover:text-cta'
                  }`}
                >
                  {isSaved ? (
                    <Star className="w-4 h-4 fill-current" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-stone hover:text-cta hover:bg-transparent p-2"
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
            
            {onRefresh && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={!canReload || isRefreshing}
                  className={`p-2 hover:bg-transparent transition-all ${
                    canReload && !isRefreshing
                      ? 'text-stone hover:text-cta' 
                      : 'text-stone/40 cursor-not-allowed'
                  } ${isRefreshing ? 'animate-spin' : ''}`}
                  title={
                    !canReload 
                      ? `Daily quota reached (${reloadCount}/${maxReloads})` 
                      : `Reload quote (${maxReloads - reloadCount} left)`
                  }
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                {canReload && (
                  <span className="text-xs text-stone/70 font-medium">
                    {maxReloads - reloadCount}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DailyStoicWisdom(): JSX.Element {
  const { user } = useAuthContext()
  const { isAuthenticated } = useAuthContext()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState('')
  const activeTab = searchParams.get('tab') as 'library' | 'favorites' | 'my-quotes' || 'library'
  
  const { 
    quotes, 
    savedQuotes, 
    userQuotes, 
    loading, 
    error, 
    getDailyQuote, 
    saveQuote, 
    unsaveQuote, 
    isQuoteSaved, 
    searchQuotes,
    createUserQuote: _createUserQuote, 
    updateUserQuote: _updateUserQuote, 
    deleteUserQuote: _deleteUserQuote,
    refreshDailyQuote,
    reloadCount,
    maxReloads,
    canReload,
    isRefetching
  } = useCachedQuotes(user)

  const dailyQuote = getDailyQuote()
  
  const filteredQuotes = useMemo(() => {
    let filtered = quotes
    
    if (searchTerm) {
      filtered = searchQuotes(searchTerm)
    }
    
    return filtered
  }, [quotes, searchTerm, searchQuotes])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentDailyQuote, setCurrentDailyQuote] = useState<QuoteType | null>(null)
  const [refreshedQuotes, setRefreshedQuotes] = useState<Map<string, QuoteType>>(new Map())
  const [individualRefreshStates, setIndividualRefreshStates] = useState<Map<string, boolean>>(new Map())

  // Initialize current daily quote
  useEffect(() => {
    const quote = getDailyQuote()
    setCurrentDailyQuote(quote)
  }, [getDailyQuote])

  // Only show toast when manually refreshing, not on automatic refetch
  useEffect(() => {
    // Remove automatic toast on refetch to reduce UI noise
    // Users will only see toast when manually refreshing quotes
  }, [isRefetching, toast])

  const handleRefreshDailyQuote = async (): Promise<void> => {
    if (!canReload || isRefreshing) {
      if (!canReload) {
        toast({
          title: "Daily quota reached",
          description: `You've used all ${maxReloads} reloads for today. Come back tomorrow!`,
          variant: "destructive"
        })
      }
      return
    }
    
    setIsRefreshing(true)
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      const newQuote = refreshDailyQuote()
      setCurrentDailyQuote(newQuote)
      
      if (newQuote) {
        const remaining = maxReloads - reloadCount - 1
        toast({
          title: "Quote refreshed!",
          description: remaining > 0 
            ? `${remaining} reloads remaining today`
            : "Last reload for today used!",
        })
      } else {
        toast({
          title: "Unable to refresh",
          description: "No new quotes available at the moment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error refreshing quote:', error)
      toast({
        title: "Refresh failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshIndividualQuote = async (quoteId: string): Promise<void> => {
    if (!canReload) {
      toast({
        title: "Daily quota reached",
        description: `You've used all ${maxReloads} reloads for today. Come back tomorrow!`,
        variant: "destructive"
      })
      return
    }
    
    // Set individual refresh state
    setIndividualRefreshStates(prev => new Map(prev).set(quoteId, true))
    
    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Use the hook's refreshDailyQuote function as fallback
      const newQuote = refreshDailyQuote()
      
      if (newQuote) {
        // Update the refreshed quotes map with the new quote
        setRefreshedQuotes(prev => new Map(prev).set(quoteId, newQuote))
        
        const remaining = maxReloads - reloadCount - 1
        toast({
          title: "Quote refreshed!",
          description: remaining > 0 
            ? `${remaining} reloads remaining today`
            : "Last reload for today used!",
        })
      } else {
        toast({
          title: "Unable to refresh",
          description: "No new quotes available at the moment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error refreshing individual quote:', error)
      toast({
        title: "Refresh failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIndividualRefreshStates(prev => new Map(prev).set(quoteId, false))
    }
  }

  // Get the display quote (either original or refreshed)
  const getDisplayQuote = (originalQuote: QuoteType): QuoteType => {
    return refreshedQuotes.get(originalQuote.id) || originalQuote
  }

  // Show loading screen only for initial load or when no quotes exist
  if (loading || (isRefetching && quotes.length === 0)) {
    return <MinimalLoadingScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2e5d4' }}>
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-inknut text-ink">Daily Stoic Wisdom</h1>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    )
  }

  // For library tab, show full-screen carousel
  if (activeTab === 'library') {
    if (filteredQuotes.length > 0) {
      return (
        <QuoteCarousel
          quotes={filteredQuotes.map(originalQuote => getDisplayQuote(originalQuote))}
          isQuoteSaved={isAuthenticated ? isQuoteSaved : undefined}
          onSave={isAuthenticated ? (quoteId: string) => saveQuote(quoteId) : undefined}
          onUnsave={isAuthenticated ? (quoteId: string) => unsaveQuote(quoteId) : undefined}
        />
      )
    } else {
      return (
        <div className="fixed inset-0 bg-hero flex items-center justify-center">
          <p className="text-stone text-xl">No quotes found matching your search.</p>
        </div>
      )
    }
  }

  // For other tabs, show regular layout
  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: '#f2e5d4' }}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-inknut leading-normal">
            My Quotes
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-4xl mx-auto animate-fade-in">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone w-5 h-5" />
          <Input
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3 text-lg bg-white border-stone/20 rounded-full focus:border-cta focus:ring-1 focus:ring-cta"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-4 animate-fade-in">
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {isAuthenticated ? (
                savedQuotes.length > 0 ? (
                  savedQuotes.map((savedQuote) => (
                    <SimplifiedQuoteCard
                      key={savedQuote.id}
                      quote={savedQuote.quote}
                      isSaved={true}
                      onSave={(notes?: string) => saveQuote(savedQuote.quote.id, notes)}
                      onUnsave={() => unsaveQuote(savedQuote.quote.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-stone">No saved quotes yet.</p>
                    <p className="text-stone/70 text-sm mt-2">
                      Save quotes you love by clicking the bookmark icon.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone">Please sign in to view your favorite quotes.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'my-quotes' && (
            <div className="space-y-4">
              {isAuthenticated ? (
                userQuotes.length > 0 ? (
                  userQuotes.map((quote) => (
                    <SimplifiedQuoteCard
                      key={quote.id}
                      quote={quote}
                      isSaved={false}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-stone">No personal quotes yet.</p>
                    <p className="text-stone/70 text-sm mt-2">
                      Create your own quotes in the main quotes section.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone">Please sign in to view your quotes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}