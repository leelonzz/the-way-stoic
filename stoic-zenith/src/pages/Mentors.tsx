import React from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const mentors = [
  {
    name: 'Seneca',
    key: 'seneca',
    title: 'Roman Stoic Philosopher & Statesman',
    description:
      'Former advisor to emperors, Seneca brings practical wisdom from navigating political power and personal challenges. His letters offer profound insights on wealth, time, and virtue.',
    expertise: [
      'Letters & Essays',
      'Political Wisdom',
      'Practical Ethics',
      'Time Management',
    ],
    greeting: 'Greetings, my friend. What troubles your mind today?',
    image: '/images/seneca-portrait.png',
  },
  {
    name: 'Epictetus',
    key: 'epictetus',
    title: 'Former Slave Turned Stoic Teacher',
    description:
      'Having overcome slavery to become a renowned teacher, Epictetus embodies resilience and the power of inner freedom. His teachings focus on what we can and cannot control.',
    expertise: [
      'Dichotomy of Control',
      'Personal Freedom',
      'Resilience',
      'Practical Teachings',
    ],
    greeting: 'Welcome, student. What is within your control today?',
    image: '/images/epictetus-portrait.png',
  },
  {
    name: 'Marcus Aurelius',
    key: 'marcus-aurelius',
    title: 'The Philosopher Emperor',
    description:
      'The only philosopher-king in history, Marcus Aurelius balanced the demands of ruling an empire with deep philosophical reflection. His Meditations remain timeless.',
    expertise: [
      'Leadership',
      'Duty & Virtue',
      'Applied Philosophy',
      'Self-Reflection',
    ],
    greeting: 'Fellow traveler on the path of virtue, how may I guide you?',
    image: '/images/marcus-aurelius-portrait.png',
  },
]

export default function Mentors(): JSX.Element {
  const router = useRouter()

  const handleStartChat = (mentorName: string): void => {
    const mentor = mentors.find(m => m.name === mentorName)
    if (mentor) {
      router.push(`/mentors/${mentor.key}/chat`)
    }
  }

  return (
    <div
      className="min-h-screen animate-fade-in"
      style={{ background: 'transparent' }}
    >
      {/* Header Section */}
      <div className="text-center space-y-6 pt-16 pb-12 px-4">
        <h1 className="font-inknut text-4xl md:text-5xl lg:text-6xl font-normal text-ink leading-tight">
          Stoic Mentors
        </h1>
        <p className="font-inknut text-lg md:text-xl lg:text-2xl font-light text-ink max-w-4xl mx-auto leading-relaxed">
          Seek wisdom from great stoic philosophers
        </p>
      </div>

      {/* Mentors Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
          {mentors.map(mentor => {
            return (
              <div
                key={mentor.name}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-6 border border-stone/20 w-full max-w-md mx-auto"
              >
                {/* Portrait */}
                <div className="relative w-56 h-56 flex items-center justify-center transition-transform duration-300 hover:scale-105">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    width={224}
                    height={224}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Name */}
                <h2 className="font-inknut text-3xl md:text-4xl font-normal text-ink">
                  {mentor.name}
                </h2>

                {/* Description */}
                <p className="font-inknut text-base md:text-lg font-light text-ink leading-relaxed max-w-lg">
                  {mentor.description}
                </p>

                {/* Chat Button */}
                <button
                  onClick={() => handleStartChat(mentor.name)}
                  className="bg-transparent border-2 border-ink hover:bg-ink hover:text-white text-ink font-inknut text-2xl md:text-3xl font-medium px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Chat
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl p-12 shadow-lg">
          <h3 className="font-inknut text-2xl md:text-3xl lg:text-4xl font-normal text-ink text-center mb-12">
            How it work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-cta text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                1
              </div>
              <h4 className="font-inknut text-xl font-medium text-ink">
                Choose Your Mentor
              </h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">
                Select the philosopher whose wisdom resonates with your current
                needs.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                2
              </div>
              <h4 className="font-inknut text-xl font-medium text-ink">
                Share Your Challenge
              </h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">
                Describe your situation, question, or area where you seek
                guidance.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-cta text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                3
              </div>
              <h4 className="font-inknut text-xl font-medium text-ink">
                Receive Wisdom
              </h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">
                Get personalized stoic guidance tailored to your specific
                circumstances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
