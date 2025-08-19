"use client"

import React, { useState } from 'react'
import { ChevronDown, MapPin, Users, Clock, BookOpen } from 'lucide-react'
import { getAllAncientAthensFAQ, getAncientAthensFAQByCategory, type AncientAthensFAQItem } from '@/lib/ancientAthensFAQ'

interface FAQItemProps {
  item: AncientAthensFAQItem
  isOpen: boolean
  onToggle: () => void
}

const FAQItem = ({ item, isOpen, onToggle }: FAQItemProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stoicism':
        return 'bg-blue-50 text-blue-700'
      case 'schools':
        return 'bg-purple-50 text-purple-700'
      case 'locations':
        return 'bg-green-50 text-green-700'
      case 'visiting':
        return 'bg-orange-50 text-orange-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'stoicism':
        return <BookOpen className="w-3 h-3" />
      case 'schools':
        return <Users className="w-3 h-3" />
      case 'locations':
        return <MapPin className="w-3 h-3" />
      case 'visiting':
        return <Clock className="w-3 h-3" />
      default:
        return <BookOpen className="w-3 h-3" />
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
              {getCategoryIcon(item.category)}
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </span>
            {item.period && (
              <span className="text-xs text-gray-500">
                {item.period}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            {item.question}
          </h3>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            {item.keyFigures && item.keyFigures.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                {item.keyFigures.slice(0, 2).join(', ')}
                {item.keyFigures.length > 2 && ` +${item.keyFigures.length - 2} more`}
              </span>
            )}
            {item.relatedSites && item.relatedSites.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.relatedSites.slice(0, 2).join(', ')}
                {item.relatedSites.length > 2 && ` +${item.relatedSites.length - 2} more`}
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
            <p className="text-gray-700 leading-relaxed mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {item.answer}
            </p>
            
            {/* Additional metadata */}
            <div className="space-y-3 text-sm">
              {item.keyFigures && item.keyFigures.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Key Figures:</h4>
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
              
              {item.relatedSites && item.relatedSites.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Related Sites:</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.relatedSites.map((site, index) => (
                      <span 
                        key={index}
                        className="inline-block bg-green-50 text-green-700 px-2 py-1 rounded text-xs"
                      >
                        {site}
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

interface AncientAthensFAQProps {
  showCategoryFilter?: boolean
  initialCategory?: AncientAthensFAQItem['category'] | 'all'
}

export function AncientAthensFAQ({ 
  showCategoryFilter = true, 
  initialCategory = 'all' 
}: AncientAthensFAQProps) {
  const [selectedCategory, setSelectedCategory] = useState<AncientAthensFAQItem['category'] | 'all'>(initialCategory)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const allFAQs = getAllAncientAthensFAQ()
  const displayedFAQs = selectedCategory === 'all' 
    ? allFAQs 
    : getAncientAthensFAQByCategory(selectedCategory)

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
    { id: 'all' as const, name: 'All Topics', count: allFAQs.length },
    { id: 'general' as const, name: 'General History', count: getAncientAthensFAQByCategory('general').length },
    { id: 'stoicism' as const, name: 'Stoicism', count: getAncientAthensFAQByCategory('stoicism').length },
    { id: 'schools' as const, name: 'Philosophical Schools', count: getAncientAthensFAQByCategory('schools').length },
    { id: 'locations' as const, name: 'Locations & Sites', count: getAncientAthensFAQByCategory('locations').length },
    { id: 'visiting' as const, name: 'Visiting Today', count: getAncientAthensFAQByCategory('visiting').length },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Inknut Antiqua, serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Common questions about Athens' philosophical heritage, answered with historical context and practical information for modern visitors.
          </p>
        </div>

        {/* Category Filter */}
        {showCategoryFilter && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
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
                  <span className="ml-1 text-xs opacity-75">({category.count})</span>
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
            <p className="text-gray-500">No questions found for the selected category.</p>
          </div>
        )}
      </div>
    </section>
  )
}
