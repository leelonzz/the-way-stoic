'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Quote as QuoteType } from '@/hooks/useCachedQuotes'

interface QuoteCarouselProps {
  currentQuote: QuoteType | null
  currentIndex: number
  totalCount: number
  isQuoteSaved?: (quoteId: string) => boolean
  onSave?: (quoteId: string) => Promise<boolean>
  onUnsave?: (quoteId: string) => Promise<boolean>
  onNext: () => void
  onPrevious: () => void
  isLoading?: boolean
  quoteSession?: {
    currentQuote: QuoteType | null
    currentIndex: number
    totalQuotes: number
    allSessionQuotes: QuoteType[]
    goToNext: () => Promise<boolean>
    goToPrevious: () => boolean
    canGoNext: boolean
    canGoPrevious: boolean
    isLoading: boolean
    error: string | null
  }
}

export function QuoteCarousel({
  currentQuote,
  currentIndex,
  totalCount,
  isQuoteSaved,
  onSave,
  onUnsave,
  onNext,
  onPrevious,
  isLoading: externalLoading = false,
  quoteSession
}: QuoteCarouselProps): JSX.Element {
  const { toast } = useToast()

  const [isActionLoading, setIsActionLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Check if we're using API quotes - look at session quotes presence too
  const isUsingApiQuotes = (currentQuote?.id?.startsWith('api-quote-') || (quoteSession && quoteSession.totalQuotes > 0)) || false
  console.log('[QuoteCarousel] isUsingApiQuotes:', isUsingApiQuotes, 'currentQuote ID:', currentQuote?.id, 'session quotes:', quoteSession?.totalQuotes)

  // Use session quote if available (API quotes), otherwise use passed quote
  const displayQuote = isUsingApiQuotes && quoteSession && quoteSession.currentQuote ? quoteSession.currentQuote : currentQuote
  const isSaved = displayQuote && isQuoteSaved ? isQuoteSaved(displayQuote.id) : false
  
  // Use session counts for API quotes, passed props for others
  const displayCurrentIndex = isUsingApiQuotes && quoteSession ? quoteSession.currentIndex : currentIndex
  const displayTotalCount = isUsingApiQuotes && quoteSession ? quoteSession.totalQuotes : totalCount

  // Check if we can navigate in each direction
  const canGoNext = isUsingApiQuotes && quoteSession ? quoteSession.canGoNext : displayCurrentIndex < displayTotalCount - 1
  const canGoPrevious = isUsingApiQuotes && quoteSession ? quoteSession.canGoPrevious : displayCurrentIndex > 0

  console.log('[QuoteCarousel] Display state:', {
    isUsingApiQuotes,
    displayQuoteId: displayQuote?.id,
    displayCurrentIndex,
    displayTotalCount,
    canGoNext,
    canGoPrevious,
    sessionCurrentIndex: quoteSession?.currentIndex,
    sessionTotalQuotes: quoteSession?.totalQuotes
  })

  // Handle initialization and prevent flash
  useEffect(() => {
    const initTimer = setTimeout(() => {
      setIsInitializing(false)
    }, 100) // Shorter delay for better responsiveness, especially with persistence

    return () => clearTimeout(initTimer)
  }, [])

  // Navigation functions with smooth transition
  const handlePrevious = useCallback(async () => {
    if (isTransitioning || isInitializing || externalLoading || !canGoPrevious) return
    setIsTransitioning(true)
    
    setTimeout(async () => {
      if (isUsingApiQuotes && quoteSession) {
        // For API quotes, use session navigation
        console.log('[QuoteCarousel] Calling quoteSession.goToPrevious()')
        const success = quoteSession.goToPrevious()
        console.log('[QuoteCarousel] goToPrevious result:', success)
        if (!success) {
          console.log('Cannot go to previous API quote')
        }
      } else {
        // For persistence-based quotes, use passed callback
        console.log('[QuoteCarousel] Using passed onPrevious callback')
        onPrevious()
      }
      setTimeout(() => setIsTransitioning(false), 200)
    }, 150)
  }, [isTransitioning, isInitializing, externalLoading, canGoPrevious, onPrevious, isUsingApiQuotes, quoteSession])

  const handleNext = useCallback(async () => {
    // For API quotes, always allow since they can fetch more. For others, check canGoNext
    if (isTransitioning || isInitializing || externalLoading || (!isUsingApiQuotes && !canGoNext)) return
    setIsTransitioning(true)
    
    setTimeout(async () => {
      if (isUsingApiQuotes && quoteSession) {
        // For API quotes, use session navigation to fetch next
        console.log('[QuoteCarousel] Calling quoteSession.goToNext()')
        const success = await quoteSession.goToNext()
        console.log('[QuoteCarousel] goToNext result:', success)
        if (!success) {
          console.log('Unable to fetch next API quote')
        }
      } else {
        // For persistence-based quotes, use passed callback
        console.log('[QuoteCarousel] Using passed onNext callback')
        onNext()
      }
      setTimeout(() => setIsTransitioning(false), 200)
    }, 150)
  }, [isTransitioning, isInitializing, externalLoading, canGoNext, onNext, isUsingApiQuotes, quoteSession])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return (): void => window.removeEventListener('keydown', handleKeyPress)
  }, [handlePrevious, handleNext])

  // Touch/swipe support
  useEffect(() => {
    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent): void => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent): void => {
      if (!startX || !startY) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY

      const diffX = startX - endX
      const diffY = startY - endY

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          handleNext() // Swipe left = next
        } else {
          handlePrevious() // Swipe right = previous
        }
      }

      startX = 0
      startY = 0
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return (): void => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handlePrevious, handleNext])

  const handleSaveToggle = async (): Promise<void> => {
    if (!onSave || !onUnsave || !displayQuote) return

    setIsActionLoading(true)
    try {
      const success = isSaved
        ? await onUnsave(displayQuote.id)
        : await onSave(displayQuote.id)

      if (success) {
        toast({
          title: isSaved ? "Quote removed" : "Quote saved",
          description: isSaved ? "Removed from your favorites" : "Added to your favorites",
        })
      } else {
        toast({
          title: "Error",
          description: isSaved ? "Failed to remove quote" : "Failed to save quote",
          variant: "destructive"
        })
      }
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleShare = async (): Promise<void> => {
    if (!displayQuote) return

    const text = `"${displayQuote.text}" - ${displayQuote.author}${displayQuote.source ? ` (${displayQuote.source})` : ''}`
    
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

  if (!displayQuote || isInitializing) {
    return (
      <div className="fixed inset-0 bg-hero flex items-center justify-center">
        {isInitializing ? (
          <div className="animate-pulse">
            <div className="h-8 bg-stone/20 rounded w-64 mb-4 mx-auto"></div>
            <div className="h-6 bg-stone/20 rounded w-48 mx-auto"></div>
          </div>
        ) : (
          <p className="text-stone">No quotes available</p>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-hero">
      {/* Left Navigation Arrow - Goes to Previous */}
      <Button
        variant="default"
        size="lg"
        onClick={handlePrevious}
        disabled={isTransitioning || externalLoading || !canGoPrevious}
        className={`fixed left-72 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-50 ${
          !canGoPrevious
            ? 'bg-stone/30 text-stone/50 cursor-not-allowed opacity-30' 
            : 'bg-stone hover:bg-stone/80 text-white'
        }`}
        aria-label={canGoPrevious ? "Previous quote" : "At first quote"}
        title={canGoPrevious ? "Go to previous quote" : "You're at the first quote"}
        style={{
          minWidth: '56px',
          minHeight: '56px'
        }}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      {/* Quote Content - Perfectly Centered with smooth transition */}
      <div className="fixed left-64 right-0 top-0 bottom-0 flex items-center justify-center px-16 md:px-24">
        <div 
          className={`max-w-4xl w-full text-center space-y-8 transition-opacity duration-300 ${
            isTransitioning || isInitializing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-ink font-inknut">
            &quot;{displayQuote.text}&quot;
          </blockquote>

          <div className="text-lg md:text-xl font-medium text-stone font-inknut">
            — {displayQuote.author}
            {displayQuote.source && (
              <div className="text-base md:text-lg text-stone/70 mt-2">
                {displayQuote.source}
              </div>
            )}
          </div>

          {/* Loading indicator for API quotes */}
          {isUsingApiQuotes && quoteSession?.isLoading && (
            <div className="flex items-center justify-center gap-2 text-stone/70 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-stone/70 border-t-transparent rounded-full" />
              <span>Loading more wisdom...</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Navigation Arrow - Goes to Next */}
      <Button
        variant="default"
        size="lg"
        onClick={handleNext}
        disabled={isTransitioning || externalLoading || (!canGoNext && !isUsingApiQuotes)}
        className={`fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-50 ${
          (!canGoNext && !isUsingApiQuotes)
            ? 'bg-stone/30 text-stone/50 cursor-not-allowed opacity-30' 
            : 'bg-stone hover:bg-stone/80 text-white'
        }`}
        aria-label={canGoNext || isUsingApiQuotes ? "Next quote" : "At last quote"}
        title={canGoNext || isUsingApiQuotes ? "Go to next quote" : "You're at the last quote"}
        style={{
          minWidth: '56px',
          minHeight: '56px'
        }}
      >
        {isUsingApiQuotes && quoteSession?.isLoading ? (
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <ChevronRight className="w-8 h-8" />
        )}
      </Button>

      {/* Bottom Controls */}
      <div className="fixed left-64 right-0 bottom-8 flex items-center justify-center gap-4 z-10">
        {(onSave || onUnsave) && (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleSaveToggle}
            disabled={isActionLoading}
            className={`p-4 hover:bg-transparent transition-colors ${
              isSaved
                ? 'text-cta hover:text-cta/80'
                : 'text-stone hover:text-cta'
            }`}
            aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="lg"
          onClick={handleShare}
          className="p-4 hover:bg-transparent text-stone hover:text-cta transition-colors"
          aria-label="Share quote"
        >
          <Share className="w-6 h-6" />
        </Button>
      </div>

      {/* Quote Counter */}
      <div className="fixed bottom-8 right-8 text-stone/70 text-sm z-10">
        {displayCurrentIndex + 1} / {isUsingApiQuotes ? `${displayTotalCount}${quoteSession?.canGoNext ? '+' : ''}` : displayTotalCount}
        {isUsingApiQuotes && displayTotalCount >= 200 && (
          <div className="text-xs text-stone/50 mt-1">
            Infinite scrolling enabled
          </div>
        )}
      </div>
    </div>
  )
}