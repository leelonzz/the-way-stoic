"use client"

import type React from "react"
import { SmoothFAQ, type FAQItem } from '@/components/ui/smooth-faq'

const faqData: FAQItem[] = [
  {
    question: "What is The Way Stoic and who is it for?",
    answer:
      "The Way Stoic is a comprehensive Stoic philosophy application designed for anyone seeking wisdom, resilience, and personal growth. It's perfect for individuals looking to apply ancient Stoic principles to modern life challenges, whether you're new to philosophy or a seasoned practitioner.",
  },
  {
    question: "How does the AI mentor system work?",
    answer:
      "Our AI mentors are trained on the teachings of great Stoic philosophers like Marcus Aurelius, Seneca, and Epictetus. They provide personalized guidance, answer your questions about Stoic philosophy, and help you apply these timeless principles to your daily life situations.",
  },
  {
    question: "What features are included in the journaling system?",
    answer:
      "The journaling system includes daily reflection prompts, mood tracking, gratitude exercises, and guided Stoic practices. You can write freely, use structured templates, and track your progress over time to see how Stoic principles are transforming your mindset.",
  },
  {
    question: "What's included in the free plan?",
    answer:
      "The free plan includes daily Stoic quotes, basic journaling features, access to one AI mentor, and fundamental Stoic exercises. It's perfect for beginners who want to explore Stoic philosophy and start their journey toward wisdom and resilience.",
  },
  {
    question: "How does the life calendar feature work?",
    answer:
      "The life calendar is a visual representation of your life's timeline, inspired by the Stoic concept of memento mori (remember you must die). It helps you gain perspective on time, prioritize what truly matters, and live each day with intention and purpose.",
  },
  {
    question: "Is my personal data secure with The Way Stoic?",
    answer:
      "Absolutely. We use enterprise-grade security measures to protect your personal reflections, journal entries, and preferences. Your data is encrypted and never shared with third parties. We believe in the Stoic principle of trust and integrity in all our practices.",
  },
]

export function FAQSection(): JSX.Element {
  return (
    <SmoothFAQ
      items={faqData}
      title="Frequently Asked Questions"
      description="Everything you need to know about The Way Stoic and how it can transform your life through ancient wisdom"
      showBackground={true}
      className="w-full pt-[66px] pb-20 md:pb-40 px-5"
    />
  )
}
