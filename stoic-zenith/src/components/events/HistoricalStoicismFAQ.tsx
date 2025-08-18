"use client"

import React, { useState } from 'react'
import { Clock, Users, ChevronDown } from 'lucide-react'
import { getAllHistoricalFAQ, getHistoricalFAQByCategory, type HistoricalFAQItem } from '@/lib/historicalStoicismFAQ'
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'

interface HistoricalStoicismFAQProps {
  showCategoryFilter?: boolean
  initialCategory?: HistoricalFAQItem['category'] | 'all'
}

export function HistoricalStoicismFAQ({
  showCategoryFilter = true,
  initialCategory = 'all'
}: HistoricalStoicismFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<HistoricalFAQItem['category'] | 'all'>(initialCategory)

  const allFAQs = getAllHistoricalFAQ()
  const displayedFAQs = selectedCategory === 'all'
    ? allFAQs
    : getHistoricalFAQByCategory(selectedCategory)

  // Convert HistoricalFAQItem to FAQItem format
  const faqItems: FAQItem[] = displayedFAQs.map(item => ({
    question: item.question,
    answer: item.answer,
    category: item.category,
    period: item.period,
    keyFigures: item.keyFigures,
    relatedEvents: item.relatedEvents
  }))

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'hellenistic':
        return 'Hellenistic Period'
      case 'roman-republic':
        return 'Roman Republic Crisis'
      case 'roman-empire':
        return 'Roman Empire'
      case 'general':
        return 'General History'
      default:
        return 'All Periods'
    }
  }

  const getCategoryCount = (category: HistoricalFAQItem['category'] | 'all') => {
    if (category === 'all') return allFAQs.length
    return getHistoricalFAQByCategory(category).length
  }

  return (
    <div>
      {/* Category Filter */}
      {showCategoryFilter && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(['all', 'hellenistic', 'roman-republic', 'roman-empire', 'general'] as const).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getCategoryLabel(category)} ({getCategoryCount(category)})
            </button>
          ))}
        </div>
      )}

      <SmoothFAQ
        items={faqItems}
        title="Frequently Asked Questions"
        description="Common questions about the historical events and periods that shaped Stoic philosophy, answered with academic accuracy and historical context."
        showMetadata={true}
        maxWidth="800px"
        showBackground={false}
      />
    </div>
  )
}
