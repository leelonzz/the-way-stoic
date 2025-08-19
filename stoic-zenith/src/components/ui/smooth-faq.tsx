"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FAQItem {
  question: string
  answer: string
  category?: string
  period?: string
  keyFigures?: string[]
  relatedEvents?: string[]
}

interface SmoothFAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  className?: string
  showMetadata?: boolean
  keyFigures?: string[]
  relatedEvents?: string[]
  period?: string
}

const SmoothFAQItem = ({ 
  question, 
  answer, 
  isOpen, 
  onToggle, 
  className,
  showMetadata = false,
  keyFigures,
  relatedEvents,
  period
}: SmoothFAQItemProps): JSX.Element => {
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault()
    onToggle()
  }

  return (
    <div
      className={cn(
        "w-full bg-[rgba(231,236,235,0.08)] shadow-[0px_2px_4px_rgba(0,0,0,0.16)] overflow-hidden rounded-[10px] outline outline-1 outline-border outline-offset-[-1px] transition-all duration-500 ease-out cursor-pointer",
        className
      )}
      onClick={handleClick}
    >
      <div className="w-full px-5 py-[18px] pr-4 flex justify-between items-center gap-5 text-left transition-all duration-300 ease-out">
        <div className="flex-1 text-foreground text-base font-medium leading-6 break-words">
          {question}
        </div>
        <div className="flex justify-center items-center">
          <ChevronDown
            className={`w-6 h-6 text-muted-foreground-dark transition-all duration-500 ease-out ${
              isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"
            }`}
          />
        </div>
      </div>
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transitionProperty: "max-height, opacity, padding",
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`px-5 transition-all duration-500 ease-out ${
            isOpen ? "pb-[18px] pt-2 translate-y-0" : "pb-0 pt-0 -translate-y-2"
          }`}
        >
          <div className="text-foreground/80 text-sm font-normal leading-6 break-words mb-4">
            {answer}
          </div>
          
          {/* Additional metadata for historical FAQs */}
          {showMetadata && isOpen && (
            <div className="space-y-3 text-sm">
              {period && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Period:</h4>
                  <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                    {period}
                  </span>
                </div>
              )}
              
              {keyFigures && keyFigures.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Key Figures:</h4>
                  <div className="flex flex-wrap gap-1">
                    {keyFigures.map((figure, index) => (
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
              
              {relatedEvents && relatedEvents.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-1">Related Events:</h4>
                  <div className="flex flex-wrap gap-1">
                    {relatedEvents.map((event, index) => (
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
          )}
        </div>
      </div>
    </div>
  )
}

interface SmoothFAQProps {
  items: FAQItem[]
  title?: string
  description?: string
  className?: string
  showMetadata?: boolean
  maxWidth?: string
  showBackground?: boolean
}

export function SmoothFAQ({ 
  items, 
  title = "Frequently Asked Questions",
  description,
  className,
  showMetadata = false,
  maxWidth = "600px",
  showBackground = false
}: SmoothFAQProps): JSX.Element {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())
  
  const toggleItem = (index: number): void => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      newOpenItems.add(index)
    }
    setOpenItems(newOpenItems)
  }

  if (items.length === 0) {
    return <></>
  }

  return (
    <section className={cn(
      "w-full relative flex flex-col justify-center items-center",
      className
    )}>
      {/* Optional background blur effect */}
      {showBackground && (
        <div className="w-[300px] h-[500px] absolute top-[150px] left-1/2 -translate-x-1/2 origin-top-left rotate-[-33.39deg] bg-primary/10 blur-[100px] z-0" />
      )}
      
      {/* Header */}
      <div className="self-stretch pt-8 pb-8 md:pt-14 md:pb-14 flex flex-col justify-center items-center gap-2 relative z-10">
        <div className="flex flex-col justify-start items-center gap-4">
          <h2 className="w-full max-w-[435px] text-center text-foreground text-4xl font-semibold leading-10 break-words">
            {title}
          </h2>
          {description && (
            <p className="self-stretch text-center text-muted-foreground text-sm font-medium leading-[18.20px] break-words">
              {description}
            </p>
          )}
        </div>
      </div>
      
      {/* FAQ Items */}
      <div 
        className="w-full pt-0.5 pb-10 flex flex-col justify-start items-start gap-4 relative z-10"
        style={{ maxWidth }}
      >
        {items.map((item, index) => (
          <SmoothFAQItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
            showMetadata={showMetadata}
            keyFigures={item.keyFigures}
            relatedEvents={item.relatedEvents}
            period={item.period}
          />
        ))}
      </div>
    </section>
  )
}

export { SmoothFAQItem }
