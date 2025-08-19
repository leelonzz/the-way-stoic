'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const SQRT_5000 = Math.sqrt(5000)

const testimonials = [
  {
    tempId: 0,
    testimonial:
      'The daily journal has completely transformed my perspective. I finally understand what Marcus Aurelius meant about morning reflections.',
    by: 'Sarah, Psychology Student',
    imgSrc: 'https://i.pravatar.cc/150?img=1',
  },
  {
    tempId: 1,
    testimonial:
      'Talking with the AI Seneca helped me navigate a difficult business decision. His practical wisdom is exactly what I needed.',
    by: 'Michael, Startup Founder',
    imgSrc: 'https://i.pravatar.cc/150?img=2',
  },
  {
    tempId: 2,
    testimonial:
      'The Memento Mori calendar gave me the push I needed to finally quit my toxic job and pursue my passion. Life is too short!',
    by: 'Elena, Former Corporate Manager',
    imgSrc: 'https://i.pravatar.cc/150?img=3',
  },
  {
    tempId: 3,
    testimonial:
      'I was skeptical about ancient philosophy, but this app made Stoicism accessible and practical for my anxiety management.',
    by: 'David, Software Engineer',
    imgSrc: 'https://i.pravatar.cc/150?img=4',
  },
  {
    tempId: 4,
    testimonial:
      'The daily wisdom quotes paired with my morning coffee have become my favorite ritual. It centers my entire day.',
    by: 'Maria, High School Teacher',
    imgSrc: 'https://i.pravatar.cc/150?img=5',
  },
  {
    tempId: 5,
    testimonial:
      'Epictetus taught me about focusing on what I can control. My stress levels have dropped dramatically since joining.',
    by: 'James, Project Manager',
    imgSrc: 'https://i.pravatar.cc/150?img=6',
  },
  {
    tempId: 6,
    testimonial:
      'The progress tracking keeps me accountable to my philosophical growth. I love seeing my journal streak grow!',
    by: 'Ashley, Life Coach',
    imgSrc: 'https://i.pravatar.cc/150?img=7',
  },
  {
    tempId: 7,
    testimonial:
      "Marcus Aurelius' leadership advice through the AI mentor helped me become a better manager and person.",
    by: 'Robert, Team Lead at Fortune 500',
    imgSrc: 'https://i.pravatar.cc/150?img=8',
  },
  {
    tempId: 8,
    testimonial:
      "This isn't just an app, it's a way of life. The Stoic principles have made me more resilient and peaceful.",
    by: 'Jennifer, Nurse',
    imgSrc: 'https://i.pravatar.cc/150?img=9',
  },
  {
    tempId: 9,
    testimonial:
      "I've read philosophy books for years, but having AI conversations with the masters brings their teachings to life.",
    by: 'Thomas, Philosophy Professor',
    imgSrc: 'https://i.pravatar.cc/150?img=10',
  },
  {
    tempId: 10,
    testimonial:
      "The evening reflection prompts helped me process my father's passing with grace and acceptance. Truly grateful.",
    by: 'Linda, Grief Counselor',
    imgSrc: 'https://i.pravatar.cc/150?img=11',
  },
  {
    tempId: 11,
    testimonial:
      "My teenage daughter and I bond over daily Stoic quotes now. It's amazing how timeless this wisdom is.",
    by: 'Patricia, Single Mother',
    imgSrc: 'https://i.pravatar.cc/150?img=12',
  },
  {
    tempId: 12,
    testimonial:
      'The practical application tools helped me reframe my chronic illness as a teacher rather than a burden.',
    by: 'Carlos, Chronic Pain Warrior',
    imgSrc: 'https://i.pravatar.cc/150?img=13',
  },
  {
    tempId: 13,
    testimonial:
      'As a CEO, the Stoic leadership principles from Marcus Aurelius have revolutionized how I handle pressure.',
    by: 'Amanda, Tech CEO',
    imgSrc: 'https://i.pravatar.cc/150?img=14',
  },
  {
    tempId: 14,
    testimonial:
      'The gratitude practice integrated into the journal has shifted my entire worldview. I see abundance everywhere now.',
    by: 'Kevin, Minimalist Blogger',
    imgSrc: 'https://i.pravatar.cc/150?img=15',
  },
  {
    tempId: 15,
    testimonial:
      "Seneca's letters came alive through the AI conversations. It's like having a philosophical mentor in my pocket.",
    by: 'Rachel, Graduate Student',
    imgSrc: 'https://i.pravatar.cc/150?img=16',
  },
  {
    tempId: 16,
    testimonial:
      'The community aspect is wonderful. Knowing others are on this journey makes the path feel less lonely.',
    by: 'Mark, Retired Veteran',
    imgSrc: 'https://i.pravatar.cc/150?img=17',
  },
  {
    tempId: 17,
    testimonial:
      'I was going through a divorce and the Stoic teachings on acceptance and moving forward saved my sanity.',
    by: 'Lisa, Marketing Director',
    imgSrc: 'https://i.pravatar.cc/150?img=18',
  },
  {
    tempId: 18,
    testimonial:
      'The morning excitement prompts paired with Stoic wisdom create the perfect balance of motivation and mindfulness.',
    by: 'Daniel, Personal Trainer',
    imgSrc: 'https://i.pravatar.cc/150?img=19',
  },
  {
    tempId: 19,
    testimonial:
      'After 6 months of daily practice, I finally understand what inner peace means. This app changed my life.',
    by: 'Christine, Healthcare Worker',
    imgSrc: 'https://i.pravatar.cc/150?img=20',
  },
]

interface TestimonialCardProps {
  position: number
  testimonial: (typeof testimonials)[0]
  handleMove: (steps: number) => void
  cardSize: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize,
}) => {
  const isCenter = position === 0

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        'absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out',
        isCenter
          ? 'z-10 bg-primary text-primary-foreground border-primary'
          : 'z-0 bg-card text-card-foreground border-border hover:border-primary/50'
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 2) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? '0px 8px 0px 4px hsl(var(--border))'
          : '0px 0px 0px 0px transparent',
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(',')[0]}`}
        className="mb-4 h-14 w-12 bg-muted object-cover object-top"
        style={{
          boxShadow: '3px 3px 0px hsl(var(--background))',
        }}
      />
      <h3
        className={cn(
          'text-base sm:text-xl font-medium',
          isCenter ? 'text-primary-foreground' : 'text-foreground'
        )}
      >
        "{testimonial.testimonial}"
      </h3>
      <p
        className={cn(
          'absolute bottom-8 left-8 right-8 mt-2 text-sm italic',
          isCenter ? 'text-primary-foreground/80' : 'text-muted-foreground'
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  )
}

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365)
  const [testimonialsList, setTestimonialsList] = useState(testimonials)

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList]
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift()
        if (!item) return
        newList.push({ ...item, tempId: Math.random() })
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop()
        if (!item) return
        newList.unshift({ ...item, tempId: Math.random() })
      }
    }
    setTestimonialsList(newList)
  }

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia('(min-width: 640px)')
      setCardSize(matches ? 365 : 290)
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div
      className="relative w-full overflow-visible bg-transparent px-8 md:px-16"
      style={{ height: 600 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position =
          testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        )
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            'flex h-14 w-14 items-center justify-center text-2xl transition-all duration-300 rounded-lg',
            'bg-card/80 backdrop-blur-sm border-2 border-stone/20 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-md hover:shadow-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            'flex h-14 w-14 items-center justify-center text-2xl transition-all duration-300 rounded-lg',
            'bg-card/80 backdrop-blur-sm border-2 border-stone/20 hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-md hover:shadow-lg',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
