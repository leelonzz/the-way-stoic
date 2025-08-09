'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Star, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import type { Quote as QuoteType } from '@/hooks/useCachedQuotes'

interface QuoteCarouselProps {
  quotes: QuoteType[]
  isQuoteSaved?: (quoteId: string) => boolean
  onSave?: (quoteId: string) => Promise<boolean>
  onUnsave?: (quoteId: string) => Promise<boolean>
}

export function QuoteCarousel({ 
  quotes, 
  isQuoteSaved, 
  onSave, 
  onUnsave 
}: QuoteCarouselProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const currentQuote = quotes[currentIndex]
  const isSaved = currentQuote && isQuoteSaved ? isQuoteSaved(currentQuote.id) : false

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? quotes.length - 1 : prev - 1)
  }, [quotes.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => prev === quotes.length - 1 ? 0 : prev + 1)
  }, [quotes.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToNext()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToPrevious()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [goToPrevious, goToNext])

  // Touch/swipe support
  useEffect(() => {
    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !startY) return

      const endX = e.changedTouches[0].clientX
      const endY = e.changedTouches[0].clientY
      
      const diffX = startX - endX
      const diffY = startY - endY

      // Only trigger swipe if horizontal movement is greater than vertical
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToPrevious() // Swipe left = previous
        } else {
          goToNext() // Swipe right = next
        }
      }

      startX = 0
      startY = 0
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [goToPrevious, goToNext])

  const handleSaveToggle = async (): Promise<void> => {
    if (!onSave || !onUnsave || !currentQuote) return

    setIsLoading(true)
    try {
      const success = isSaved
        ? await onUnsave(currentQuote.id)
        : await onSave(currentQuote.id)

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
      setIsLoading(false)
    }
  }

  const handleShare = async (): Promise<void> => {
    if (!currentQuote) return

    const text = `"${currentQuote.text}" - ${currentQuote.author}${currentQuote.source ? ` (${currentQuote.source})` : ''}`
    
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

  if (!currentQuote) {
    return (
      <div className="fixed inset-0 bg-hero flex items-center justify-center">
        <p className="text-stone">No quotes available</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-hero animate-fade-in">
      {/* Left Navigation Arrow - Now goes to Next */}
      <Button
        variant="default"
        size="lg"
        onClick={goToNext}
        className="fixed left-72 top-1/2 -translate-y-1/2 p-3 bg-stone hover:bg-stone/80 rounded-full text-white shadow-lg transition-all duration-200 z-50"
        aria-label="Next quote"
        style={{ 
          minWidth: '56px', 
          minHeight: '56px'
        }}
      >
        <ChevronLeft className="w-8 h-8 text-white" />
      </Button>

      {/* Quote Content - Perfectly Centered */}
      <div className="fixed left-64 right-0 top-0 bottom-0 flex items-center justify-center px-16 md:px-24">
        <div className="max-w-4xl w-full text-center space-y-8">
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed text-ink font-inknut">
            "{currentQuote.text}"
          </blockquote>
          
          <div className="text-lg md:text-xl font-medium text-stone font-inknut">
            — {currentQuote.author}
            {currentQuote.source && (
              <div className="text-base md:text-lg text-stone/70 mt-2">
                {currentQuote.source}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Navigation Arrow - Now goes to Previous */}
      <Button
        variant="default"
        size="lg"
        onClick={goToPrevious}
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-stone hover:bg-stone/80 rounded-full text-white shadow-lg transition-all duration-200 z-50"
        aria-label="Previous quote"
        style={{ 
          minWidth: '56px', 
          minHeight: '56px'
        }}
      >
        <ChevronRight className="w-8 h-8 text-white" />
      </Button>

      {/* Bottom Controls */}
      <div className="fixed left-64 right-0 bottom-8 flex items-center justify-center gap-4 z-10">
        {(onSave || onUnsave) && (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleSaveToggle}
            disabled={isLoading}
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
      <div className="absolute bottom-8 right-8 text-stone/70 text-sm z-10">
        {currentIndex + 1} / {quotes.length}
      </div>
    </div>
  )
}