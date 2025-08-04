'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Search, Bookmark, BookmarkCheck, Share, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useQuotes } from '@/hooks/useQuotes'
import { useAuthContext } from '@/components/auth/AuthProvider'
import type { Quote as QuoteType } from '@/hooks/useQuotes'
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
    <Card className="bg-white border-stone/20 shadow-lg animate-fade-in">
      <CardContent className="p-16 relative">
        {/* Action buttons in top right */}
        <div className="absolute top-4 right-6 flex items-center gap-2">
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
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-stone hover:text-cta hover:bg-transparent p-2"
          >
            <Share className="w-4 h-4" />
          </Button>
          
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
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Quote content */}
        <div className="text-center space-y-8 max-w-6xl mx-auto pt-4">
          <blockquote className="text-lg md:text-xl font-bold leading-relaxed text-ink font-inknut">
            &ldquo;{quote.text}&rdquo;
          </blockquote>
          
          <div className="text-base md:text-lg font-medium text-ink font-inknut">
            {quote.author}
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
    <Card className="bg-white border-stone/20 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <CardContent className="p-8">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-3">
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
          
          <div className="flex items-center gap-1 shrink-0">
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-stone hover:text-cta hover:bg-transparent p-2"
            >
              <Share className="w-4 h-4" />
            </Button>
            
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
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'library' | 'favorites' | 'my-quotes'>('library')
  
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
  } = useQuotes(user)

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

  // Show toast when refetching due to tab visibility
  useEffect(() => {
    if (isRefetching) {
      toast({
        title: "Refreshing quotes...",
        description: "Loading latest quotes from the database",
      })
    }
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

  // Show loading screen for initial load or refetching
  if (loading || isRefetching) {
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

  return (
    <div className="min-h-screen animate-fade-in" style={{ backgroundColor: '#f2e5d4' }}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-inknut leading-normal">
            Daily Stoic Wisdom
          </h1>
        </div>

        {/* Today Quote Section */}
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-medium text-ink font-inika">
            Today Quote
          </h2>
          
          {(currentDailyQuote || dailyQuote) && (
            <DailyStoicQuoteCard
              quote={currentDailyQuote || dailyQuote}
              isSaved={isAuthenticated ? isQuoteSaved((currentDailyQuote || dailyQuote).id) : false}
              onSave={isAuthenticated ? saveQuote : undefined}
              onUnsave={isAuthenticated ? unsaveQuote : undefined}
              onRefresh={handleRefreshDailyQuote}
              canReload={canReload}
              reloadCount={reloadCount}
              maxReloads={maxReloads}
              isRefreshing={isRefreshing}
            />
          )}
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

        {/* Navigation Tabs */}
        <div className="flex justify-center animate-fade-in">
          <div className="flex bg-white rounded-full p-1 shadow-lg border border-stone/20">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-all ${
                activeTab === 'library'
                  ? 'bg-stone text-white'
                  : 'text-stone hover:text-ink'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              disabled={!isAuthenticated}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'favorites'
                  ? 'bg-stone text-white'
                  : 'text-stone hover:text-ink'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('my-quotes')}
              disabled={!isAuthenticated}
              className={`px-6 py-2 rounded-full text-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                activeTab === 'my-quotes'
                  ? 'bg-stone text-white'
                  : 'text-stone hover:text-ink'
              }`}
            >
              My Quotes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 animate-fade-in">
          {activeTab === 'library' && (
            <div className="space-y-4">
              {filteredQuotes.length > 0 ? (
                filteredQuotes.map((originalQuote) => {
                  const displayQuote = getDisplayQuote(originalQuote)
                  const isRefreshing = individualRefreshStates.get(originalQuote.id) || false
                  
                  return (
                    <SimplifiedQuoteCard
                      key={originalQuote.id}
                      quote={displayQuote}
                      isSaved={isAuthenticated ? isQuoteSaved(displayQuote.id) : false}
                      onSave={isAuthenticated ? saveQuote : undefined}
                      onUnsave={isAuthenticated ? unsaveQuote : undefined}
                      onRefresh={() => handleRefreshIndividualQuote(originalQuote.id)}
                      canReload={canReload}
                      reloadCount={reloadCount}
                      maxReloads={maxReloads}
                      isRefreshing={isRefreshing}
                    />
                  )
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-stone">No quotes found matching your search.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              {isAuthenticated ? (
                savedQuotes.length > 0 ? (
                  savedQuotes.map((savedQuote) => (
                    <SimplifiedQuoteCard
                      key={savedQuote.id}
                      quote={savedQuote.quote}
                      isSaved={true}
                      onUnsave={unsaveQuote}
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