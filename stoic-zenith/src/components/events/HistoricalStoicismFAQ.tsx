'use client'

import React, { useState } from 'react'
import { ChevronDown, Clock, Users, MapPin } from 'lucide-react'
import {
  getAllHistoricalFAQ,
  getHistoricalFAQByCategory,
  type HistoricalFAQItem,
} from '@/lib/historicalStoicismFAQ'

interface FAQItemProps {
  item: HistoricalFAQItem
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ item, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <h3
            className="text-lg font-semibold text-gray-900 mb-2"
            style={{ fontFamily: 'Inknut Antiqua, serif' }}
          >
            {item.question}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {item.period && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.period}
              </span>
            )}
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
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-4">
            <p
              className="text-gray-700 leading-relaxed mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {item.answer}
            </p>

            {/* Additional metadata */}
            <div className="space-y-3 text-sm">
              {item.keyFigures && item.keyFigures.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
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

              {item.relatedEvents && item.relatedEvents.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Related Events:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {item.relatedEvents.map((event, index) => (
                      <span
                        key={index}
                        className="inline-block bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface HistoricalStoicismFAQProps {
  showCategoryFilter?: boolean
  initialCategory?: HistoricalFAQItem['category'] | 'all'
}

export function HistoricalStoicismFAQ({
  showCategoryFilter = true,
  initialCategory = 'all',
}: HistoricalStoicismFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    HistoricalFAQItem['category'] | 'all'
  >(initialCategory)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const allFAQs = getAllHistoricalFAQ()
  const displayedFAQs =
    selectedCategory === 'all'
      ? allFAQs
      : getHistoricalFAQByCategory(selectedCategory)

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  const categories = [
    { id: 'all' as const, name: 'All Periods', count: allFAQs.length },
    {
      id: 'hellenistic' as const,
      name: 'Hellenistic Period',
      count: getHistoricalFAQByCategory('hellenistic').length,
    },
    {
      id: 'roman-republic' as const,
      name: 'Roman Republic Crisis',
      count: getHistoricalFAQByCategory('roman-republic').length,
    },
    {
      id: 'roman-empire' as const,
      name: 'Roman Empire',
      count: getHistoricalFAQByCategory('roman-empire').length,
    },
    {
      id: 'general' as const,
      name: 'General History',
      count: getHistoricalFAQByCategory('general').length,
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="text-3xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: 'Inknut Antiqua, serif' }}
          >
            Frequently Asked Questions
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto font-light"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Common questions about the historical events and periods that shaped
            Stoic philosophy, answered with academic accuracy and historical
            context.
          </p>
        </div>

        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
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
        <div className="space-y-4">
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
          <div className="text-center py-12">
            <p className="text-gray-500">
              No questions found for the selected category.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
