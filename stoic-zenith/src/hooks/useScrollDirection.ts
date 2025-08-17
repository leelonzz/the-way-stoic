'use client'

import { useState, useEffect } from 'react'

interface UseScrollDirectionOptions {
  threshold?: number
  initialDirection?: 'up' | 'down'
}

interface ScrollDirectionState {
  scrollDirection: 'up' | 'down'
  isVisible: boolean
  scrollY: number
}

export function useScrollDirection({
  threshold = 100,
  initialDirection = 'up'
}: UseScrollDirectionOptions = {}): ScrollDirectionState {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>(initialDirection)
  const [isVisible, setIsVisible] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let ticking = false

    const updateScrollDirection = () => {
      const currentScrollY = window.scrollY

      // Always show header when at the top of the page
      if (currentScrollY <= threshold) {
        setIsVisible(true)
        setScrollDirection('up')
        setScrollY(currentScrollY)
        setLastScrollY(currentScrollY)
        ticking = false
        return
      }

      // Only update if we've scrolled past the threshold and component is initialized
      if (!isInitialized || Math.abs(currentScrollY - lastScrollY) < threshold) {
        ticking = false
        return
      }

      // Determine scroll direction
      const direction = currentScrollY > lastScrollY ? 'down' : 'up'

      setScrollDirection(direction)
      setIsVisible(direction === 'up')
      setScrollY(currentScrollY)
      setLastScrollY(currentScrollY)

      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection)
        ticking = true
      }
    }

    // Initialize scroll position
    if (typeof window !== 'undefined') {
      const initialScrollY = window.scrollY
      setScrollY(initialScrollY)
      setLastScrollY(initialScrollY)
      setIsInitialized(true)

      // Show header initially if at top
      if (initialScrollY <= threshold) {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold, lastScrollY, isInitialized])

  return {
    scrollDirection,
    isVisible,
    scrollY
  }
}
