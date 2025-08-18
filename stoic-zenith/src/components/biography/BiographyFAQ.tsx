"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { getPhilosopherFAQ, type FAQItem } from "@/lib/philosopherFAQData"

interface BiographyFAQProps {
  philosopherSlug: string
  philosopherName: string
}

interface FAQItemProps {
  question: string
  answer: string
  category?: string
  isOpen: boolean
  onToggle: () => void
}

const FAQItemComponent = ({ question, answer, category, isOpen, onToggle }: FAQItemProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault()
    onToggle()
  }

  return (
    <div
      className={`w-full bg-white/50 shadow-sm border border-amber-100 overflow-hidden rounded-lg transition-all duration-500 ease-out cursor-pointer hover:shadow-md`}
      onClick={handleClick}
    >
      <div className="w-full px-6 py-5 pr-4 flex justify-between items-start gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1">
          <div className="text-gray-900 text-lg font-semibold leading-7 break-words font-inknut">
            {question}
          </div>
        </div>
        <div className="flex justify-center items-center mt-1">
          <ChevronDown
            className={`w-6 h-6 text-amber-600 transition-all duration-500 ease-out ${
              isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
            }`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-6 transition-all duration-500 ease-out ${
            isOpen ? "pb-6 pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"
          }`}
        >
          <div className="text-gray-700 text-base font-normal leading-7 break-words font-poppins font-light">
            {answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BiographyFAQ({ philosopherSlug, philosopherName }: BiographyFAQProps): JSX.Element | null {
  const faqItems = getPhilosopherFAQ(philosopherSlug)
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  // Don't render if no FAQ items exist
  if (faqItems.length === 0) {
    return null
  }

  const toggleItem = (index: number): void => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className="mb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-inknut">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed font-poppins font-light">
          Common questions about {philosopherName} and their philosophical teachings, answered with historical context and practical insights.
        </p>
      </div>
      
      <div className="space-y-4">
        {faqItems.map((faq, index) => (
          <FAQItemComponent
            key={index}
            question={faq.question}
            answer={faq.answer}
            category={faq.category}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>
    </section>
  )
}
