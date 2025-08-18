'use client'

import React, { useState } from 'react'
import { ChevronDown, Users, BookOpen, Clock, Award } from 'lucide-react'
import {
  getEventFAQs,
  getEventFAQsByCategory,
  type EventFAQItem,
} from '@/lib/eventSpecificFAQ'
import { cn } from '@/lib/utils'

interface FAQItemProps {
  item: EventFAQItem
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ item, isOpen, onToggle }: FAQItemProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'historical-context':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'stoic-influence':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'key-figures':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'legacy':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'historical-context':
        return <Clock className="w-3 h-3" />
      case 'stoic-influence':
        return <BookOpen className="w-3 h-3" />
      case 'key-figures':
        return <Users className="w-3 h-3" />
      case 'legacy':
        return <Award className="w-3 h-3" />
      default:
        return <BookOpen className="w-3 h-3" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'historical-context':
        return 'Historical Context'
      case 'stoic-influence':
        return 'Stoic Influence'
      case 'key-figures':
        return 'Key Figures'
      case 'legacy':
        return 'Legacy'
      default:
        return 'General'
    }
  }

  const handleClick = () => {
    onToggle()
  }

  return (
    <div
      className={cn(
        'w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-start gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1">
          {/* Category Badge */}
          <div className="mb-3">
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                getCategoryColor(item.category)
              )}
            >
              {getCategoryIcon(item.category)}
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Question */}
          <div className="text-foreground text-base font-medium leading-6 break-words mb-2">
            {item.question}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {item.keyFigures && item.keyFigures.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                {item.keyFigures.slice(0, 2).join(', ')}
                {item.keyFigures.length > 2 &&
                  ` +${item.keyFigures.length - 2} more`}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-center items-center">
          <ChevronDown
            className={cn(
              'w-6 h-6 text-muted-foreground transition-all duration-500 ease-out',
              isOpen ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
            )}
          />
        </div>
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-out',
          isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        )}
        style={{
          transitionProperty: 'max-height, opacity, padding',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          className={cn(
            'px-5 transition-all duration-500 ease-out',
            isOpen ? 'pb-[18px] pt-2 translate-y-0' : 'pb-0 pt-0 -translate-y-2'
          )}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words mb-4">
            {item.answer}
          </div>

          {/* Additional metadata */}
          <div className="space-y-3 text-sm">
            {item.keyFigures && item.keyFigures.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Key Figures:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {item.keyFigures.map((figure, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                    >
                      {figure}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {item.relatedConcepts && item.relatedConcepts.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-1">
                  Related Concepts:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {item.relatedConcepts.map((concept, index) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface EventSpecificFAQProps {
  eventId: string
  showCategoryFilter?: boolean
  initialCategory?: EventFAQItem['category'] | 'all'
}

export function EventSpecificFAQ({
  eventId,
  showCategoryFilter = true,
  initialCategory = 'all',
}: EventSpecificFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    EventFAQItem['category'] | 'all'
  >(initialCategory)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const allFAQs = getEventFAQs(eventId)
  const displayedFAQs =
    selectedCategory === 'all'
      ? allFAQs
      : getEventFAQsByCategory(eventId, selectedCategory)

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  // Don't render if no FAQs exist for this event
  if (allFAQs.length === 0) {
    return null
  }

  const categories = [
    { id: 'all' as const, name: 'All Topics', count: allFAQs.length },
    {
      id: 'historical-context' as const,
      name: 'Historical Context',
      count: getEventFAQsByCategory(eventId, 'historical-context').length,
    },
    {
      id: 'stoic-influence' as const,
      name: 'Stoic Influence',
      count: getEventFAQsByCategory(eventId, 'stoic-influence').length,
    },
    {
      id: 'key-figures' as const,
      name: 'Key Figures',
      count: getEventFAQsByCategory(eventId, 'key-figures').length,
    },
    {
      id: 'legacy' as const,
      name: 'Legacy',
      count: getEventFAQsByCategory(eventId, 'legacy').length,
    },
    {
      id: 'general' as const,
      name: 'General',
      count: getEventFAQsByCategory(eventId, 'general').length,
    },
  ].filter(category => category.count > 0) // Only show categories with content

  return (
    <section className="w-full pt-[66px] pb-20 md:pb-40 px-5 relative flex flex-col justify-center items-center">
      {/* Background blur effect */}
      <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />

      {/* Header */}
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            Frequently Asked Questions
          </h2>
          <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
            Common questions about this historical event and its significance
            for Stoic philosophy, answered with historical context and scholarly
            insight.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      {showCategoryFilter && categories.length > 1 && (
        <div className="w-full max-w-[600px] mb-8 relative z-10">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {category.name}
                <span className="ml-1 text-xs opacity-75">
                  ({category.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Items */}
      <div className="w-full max-w-[600px] pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10">
        {displayedFAQs.map((item, index) => (
          <FAQItem
            key={`${selectedCategory}-${index}`}
            item={item}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      {/* No results message */}
      {displayedFAQs.length === 0 && (
        <div className="text-center py-12 relative z-10">
          <p className="text-muted-foreground">
            No questions found for the selected category.
          </p>
        </div>
      )}
    </section>
  )
}
