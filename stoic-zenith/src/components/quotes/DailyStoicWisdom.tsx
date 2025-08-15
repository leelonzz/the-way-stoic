'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Bookmark, BookmarkCheck, Share, RotateCcw, Star, Plus, Edit, Trash2 } from 'lucide-react'
import { QuoteCarousel } from './QuoteCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useCachedQuotes } from '@/hooks/useCachedQuotes'
import { useQuotePersistence } from '@/hooks/useQuotePersistence'
import { useQuoteSession } from '@/hooks/useQuoteSession'
import { useAuthContext } from '@/components/auth/AuthProvider'
import type { Quote as QuoteType } from '@/hooks/useCachedQuotes'
import { MinimalLoadingScreen } from '@/components/ui/loading-spinner'
import { CreateQuoteDialog } from './CreateQuoteDialog'

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
    <Card className={`bg-hero/30 border-stone/20 shadow-lg ${isRefreshing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
      <CardContent className="p-12">
        <div className="space-y-6">
          {/* Quote content */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <blockquote className="text-xs md:text-sm font-bold leading-relaxed text-ink font-inknut">
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
    <Card className={`bg-hero/50 border-stone/20 shadow-sm hover:shadow-md transition-shadow ${isRefreshing ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Quote Content */}
          <div className="space-y-3">
            <blockquote className="text-xs font-medium italic text-ink leading-relaxed">
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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const activeTab = searchParams.get('tab') as 'library' | 'favorites' | 'my-quotes' || 'library'
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // On first load without a tab parameter, redirect to the last used tab if available
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (!tabParam) {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem('quotes_active_tab') : null
      const fallback = saved === 'favorites' || saved === 'my-quotes' || saved === 'library' ? saved : 'library'
      router.replace(`/quotes?tab=${fallback}`)
    }
  }, [searchParams, router])

  // Persist current tab to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && activeTab) {
      window.localStorage.setItem('quotes_active_tab', activeTab)
    }
  }, [activeTab])
  
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
    createUserQuote,
    updateUserQuote,
    deleteUserQuote,
    refreshDailyQuote,
    reloadCount,
    maxReloads,
    canReload,
    isRefetching,
    quoteSession
  } = useCachedQuotes(user)

  // Use quote session from useCachedQuotes to avoid multiple instances
  
  // Check if we're using API quotes
  const isUsingApiQuotes = useMemo(() => {
    // Check if we have any quotes with API format IDs or if we have session quotes
    const hasApiQuotes = quotes.length > 0 && quotes.some(q => q.id?.startsWith('api-quote-'))
    const hasSessionQuotes = quoteSession.allSessionQuotes.length > 0
    const result = hasApiQuotes || hasSessionQuotes
    
    console.log('[DailyStoicWisdom] isUsingApiQuotes check:', {
      quotesLength: quotes.length,
      sessionQuotesLength: quoteSession.allSessionQuotes.length,
      firstQuoteId: quotes[0]?.id,
      hasApiQuotes,
      hasSessionQuotes,
      result
    })
    return result
  }, [quotes, quoteSession.allSessionQuotes])

  // Use quote persistence hook for state management
  const {
    searchTerm: persistedSearchTerm,
    selectedCategory,
    activeTab: persistedActiveTab,
    currentQuoteId: persistedCurrentQuoteId,
    currentQuote: persistedCurrentQuote,
    currentIndex: persistedCurrentIndex,
    setSearchTerm: setPersistentSearchTerm,
    setSelectedCategory,
    setActiveTab: setPersistentActiveTab,
    setCurrentQuote,
    getFilteredQuotes,
    hasPersistedState,
    randomSeed,
    hasRandomizedOrder
  } = useQuotePersistence(quotes, {
    storageKey: 'twstoic:wisdom-state',
    persistAcrossSessions: true,
    userId: user?.id || null
  })

  // Debug logging removed - use debug utility if needed

  const dailyQuote = getDailyQuote()
  
  // Use persistent search term, fallback to local state
  const effectiveSearchTerm = persistedSearchTerm || searchTerm

  // Use the persistence hook's filtered quotes which includes randomization
  const filteredQuotes = useMemo(() => {
    return getFilteredQuotes(quotes)
  }, [getFilteredQuotes, quotes])

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshedQuotes, setRefreshedQuotes] = useState<Map<string, QuoteType>>(new Map())
  const [individualRefreshStates, setIndividualRefreshStates] = useState<Map<string, boolean>>(new Map())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Get the current display quote
  const currentDailyQuote = getDailyQuote()

  // Set initial load to false after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Show error messages to user
  useEffect(() => {
    if (error && error !== 'Failed to fetch quote') {
      toast({
        title: "Connection Issue",
        description: error,
        variant: "default",
        duration: 5000
      })
    }
  }, [error, toast])

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
    setIsTransitioning(true)
    try {
      // Start fade out
      await new Promise(resolve => setTimeout(resolve, 150))
      const success = await refreshDailyQuote()
      // Allow fade in
      await new Promise(resolve => setTimeout(resolve, 150))
      
      if (success) {
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
      setTimeout(() => setIsTransitioning(false), 300)
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
    setIsTransitioning(true)
    
    try {
      // Start fade out
      await new Promise(resolve => setTimeout(resolve, 150))
      
      // Use the hook's refreshDailyQuote function (now async, returns boolean)
      const success = await refreshDailyQuote()
      
      if (success) {
        // Get the current quote after refresh from the hook
        const currentQuote = getDailyQuote()
        if (currentQuote) {
          // Update the refreshed quotes map with the new quote
          setRefreshedQuotes(prev => new Map(prev).set(quoteId, currentQuote))
        }
        
        // Allow fade in
        await new Promise(resolve => setTimeout(resolve, 150))
        
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
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  // Get the display quote (either original or refreshed)
  const getDisplayQuote = (originalQuote: QuoteType): QuoteType => {
    return refreshedQuotes.get(originalQuote.id) || originalQuote
  }

  // Handle user quote deletion with confirmation
  const handleDeleteUserQuote = async (quoteId: string) => {
    const success = await deleteUserQuote(quoteId)
    if (success) {
      toast({
        title: "Quote deleted",
        description: "Your quote has been removed"
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive"
      })
    }
  }

  // Show loading screen only for initial load when no quotes exist at all
  // Don't show loading for pre-fetched quotes or when we have quotes available
  if ((loading && quotes.length === 0) || (isInitialLoad && quotes.length === 0)) {
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
      // For API quotes, use session's current quote
      let displayCurrentQuote: any = null
      let currentIndex = 0

      if (isUsingApiQuotes) {
        // Use the current quote from session
        displayCurrentQuote = quoteSession.currentQuote
        currentIndex = quoteSession.currentIndex
        console.log('[DailyStoicWisdom] Using API quote from session:', {
          quoteId: displayCurrentQuote?.id,
          currentIndex
        })
      } else {
        // For persistence-based quotes, use the persisted current quote
        displayCurrentQuote = persistedCurrentQuote && filteredQuotes.find(q => q.id === persistedCurrentQuote.id)
          ? getDisplayQuote(persistedCurrentQuote)
          : (filteredQuotes.length > 0 ? getDisplayQuote(filteredQuotes[0]) : null)

        // Calculate the current index within the filtered quotes array
        currentIndex = displayCurrentQuote
          ? Math.max(0, filteredQuotes.findIndex(q => q.id === displayCurrentQuote.id))
          : 0

        console.log('[DailyStoicWisdom] Using persisted quote:', {
          persistedCurrentQuoteId: persistedCurrentQuote?.id,
          displayCurrentQuoteId: displayCurrentQuote?.id,
          currentIndex,
          persistedCurrentIndex
        })
      }

      // Debug logging (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('[DailyStoicWisdom] Quote carousel state:', {
          persistedCurrentQuoteId,
          persistedCurrentQuoteFound: !!persistedCurrentQuote,
          displayCurrentQuoteId: displayCurrentQuote?.id,
          currentIndex,
          persistedCurrentIndex,
          filteredQuotesLength: filteredQuotes.length,
          firstFilteredQuoteId: filteredQuotes[0]?.id,
          randomSeed,
          hasRandomizedOrder
        })
      }

      // Navigation functions - handle both API and persistence-based quotes
      const handleNext = async () => {
        console.log('[DailyStoicWisdom] handleNext called, isUsingApiQuotes:', isUsingApiQuotes)
        
        if (isUsingApiQuotes) {
          // For API quotes, try to fetch next quote from session
          console.log('[DailyStoicWisdom] Calling quoteSession.goToNext()')
          const success = await quoteSession.goToNext()
          console.log('[DailyStoicWisdom] goToNext result:', success)
          if (!success) {
            console.log('Unable to fetch next API quote')
          }
        } else {
          // For persistence-based quotes, use traditional navigation and update persistence
          console.log('[DailyStoicWisdom] Using traditional navigation')
          const nextIndex = currentIndex === filteredQuotes.length - 1 ? 0 : currentIndex + 1
          const nextQuote = filteredQuotes[nextIndex]
          if (nextQuote) {
            setCurrentQuote(nextQuote, nextIndex)
            console.log('[DailyStoicWisdom] Set next quote:', { quoteId: nextQuote.id, nextIndex })
          }
        }
      }

      const handlePrevious = async () => {
        console.log('[DailyStoicWisdom] handlePrevious called, isUsingApiQuotes:', isUsingApiQuotes)
        
        if (isUsingApiQuotes) {
          // For API quotes, use session's previous navigation
          console.log('[DailyStoicWisdom] Calling quoteSession.goToPrevious()')
          const success = quoteSession.goToPrevious()
          console.log('[DailyStoicWisdom] goToPrevious result:', success)
          if (!success) {
            console.log('Cannot go to previous API quote')
          }
        } else {
          // For persistence-based quotes, use traditional navigation and update persistence
          console.log('[DailyStoicWisdom] Using traditional navigation')
          const prevIndex = currentIndex === 0 ? filteredQuotes.length - 1 : currentIndex - 1
          const prevQuote = filteredQuotes[prevIndex]
          if (prevQuote) {
            setCurrentQuote(prevQuote, prevIndex)
            console.log('[DailyStoicWisdom] Set previous quote:', { quoteId: prevQuote.id, prevIndex })
          }
        }
      }

      // Only render carousel if we have a valid quote
      if (!displayCurrentQuote) {
        return (
          <div className="fixed inset-0 bg-hero flex items-center justify-center">
            <p className="text-stone text-xl">Loading quotes...</p>
          </div>
        )
      }

      return (
        <QuoteCarousel
          currentQuote={displayCurrentQuote}
          currentIndex={Math.max(0, currentIndex)}
          totalCount={isUsingApiQuotes ? quoteSession.totalQuotes : filteredQuotes.length}
          isQuoteSaved={isAuthenticated ? isQuoteSaved : undefined}
          onSave={isAuthenticated ? (quoteId: string) => saveQuote(quoteId) : undefined}
          onUnsave={isAuthenticated ? (quoteId: string) => unsaveQuote(quoteId) : undefined}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isLoading={loading && quotes.length === 0}
          quoteSession={quoteSession}
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
    <div className="min-h-screen" style={{ backgroundColor: '#f2e5d4' }}>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-ink font-inknut leading-normal">
            My Quotes
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone w-5 h-5" />
          <Input
            type="text"
            placeholder="Search quotes..."
            value={effectiveSearchTerm}
            onChange={(e) => {
              const value = e.target.value
              setSearchTerm(value)
              setPersistentSearchTerm(value)
            }}
            className="pl-12 pr-4 py-3 text-lg bg-white border-stone/20 rounded-full focus:border-cta focus:ring-1 focus:ring-cta"
          />
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
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
                    <Card key={quote.id} className="bg-hero/50 border-stone/20 shadow-sm hover:shadow-md transition-shadow">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-stone hover:text-cta hover:bg-transparent p-2"
                              >
                                <Share className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUserQuote(quote.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-transparent p-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-stone">No personal quotes yet.</p>
                    <p className="text-stone/70 text-sm mt-2">
                      Click the + button to create your first quote!
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

      {/* Floating Action Button - only show on My Quotes tab */}
      {activeTab === 'my-quotes' && isAuthenticated && (
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow bg-cta hover:bg-cta/90"
          size="icon"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Create Quote Dialog */}
      <CreateQuoteDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateQuote={createUserQuote}
      />
    </div>
  )
}