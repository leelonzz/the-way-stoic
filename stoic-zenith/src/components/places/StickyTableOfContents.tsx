"use client"

import React, { useState, useEffect } from 'react'
import { ChevronRight, List } from 'lucide-react'

interface TOCItem {
  id: string
  title: string
  level: 2 | 3
}

interface StickyTableOfContentsProps {
  items: TOCItem[]
}

export function StickyTableOfContents({ items }: StickyTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // Observe all headings
    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) {
        observer.observe(element)
      }
    })

    // Show TOC after scrolling past hero section and keep it visible
    const handleScroll = () => {
      const heroHeight = 300 // Reduced hero section height threshold
      // Once visible, stay visible - don't hide when scrolling up
      if (window.scrollY > heroHeight) {
        setIsVisible(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [items])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80 // Account for any fixed headers
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (!isVisible) return null

  return (
    <div className="hidden xl:block fixed right-8 top-1/2 transform -translate-y-1/2 z-40">
      <div className="bg-white border border-gray-200 rounded-md shadow-md p-2 max-w-[240px]">
        <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-gray-100">
          <List className="w-3 h-3 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-900">Contents</h3>
        </div>
        
        <nav className="space-y-0.5">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`w-full text-left text-xs transition-colors duration-200 flex items-start gap-1.5 py-1 px-1.5 rounded ${
                activeId === item.id
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${item.level === 3 ? 'ml-3' : ''}`}
            >
              {item.level === 2 && (
                <ChevronRight 
                  className={`w-2.5 h-2.5 mt-0.5 transition-transform duration-200 flex-shrink-0 ${
                    activeId === item.id ? 'rotate-90' : ''
                  }`} 
                />
              )}
              <span className="line-clamp-2 leading-tight">{item.title}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
