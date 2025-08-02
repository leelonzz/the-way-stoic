
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const mentors = [
  {
    name: 'Seneca',
    key: 'seneca',
    title: 'Roman Stoic Philosopher & Statesman',
    description: 'Former advisor to emperors, Seneca brings practical wisdom from navigating political power and personal challenges. His letters offer profound insights on wealth, time, and virtue.',
    expertise: ['Letters & Essays', 'Political Wisdom', 'Practical Ethics', 'Time Management'],
    greeting: 'Greetings, my friend. What troubles your mind today?',
    image: '/images/seneca-portrait.png'
  },
  {
    name: 'Epictetus',
    key: 'epictetus',
    title: 'Former Slave Turned Stoic Teacher',
    description: 'Having overcome slavery to become a renowned teacher, Epictetus embodies resilience and the power of inner freedom. His teachings focus on what we can and cannot control.',
    expertise: ['Dichotomy of Control', 'Personal Freedom', 'Resilience', 'Practical Teachings'],
    greeting: 'Welcome, student. What is within your control today?',
    image: '/images/epictetus-portrait.png'
  },
  {
    name: 'Marcus Aurelius',
    key: 'marcus-aurelius',
    title: 'The Philosopher Emperor',
    description: 'The only philosopher-king in history, Marcus Aurelius balanced the demands of ruling an empire with deep philosophical reflection. His Meditations remain timeless.',
    expertise: ['Leadership', 'Duty & Virtue', 'Applied Philosophy', 'Self-Reflection'],
    greeting: 'Fellow traveler on the path of virtue, how may I guide you?',
    image: '/images/marcus-aurelius-portrait.png'
  }
];

export default function Mentors() {
  const router = useRouter();
  
  const handleStartChat = (mentorName: string) => {
    const mentor = mentors.find(m => m.name === mentorName);
    if (mentor) {
      router.push(`/mentors/${mentor.key}/chat`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-parchment/95 to-parchment/90 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-6 pt-16 pb-12 px-4">
        <h1 className="font-inknut text-6xl md:text-7xl lg:text-8xl font-normal text-ink leading-tight">
          Stoic Mentors
        </h1>
        <p className="font-inknut text-xl md:text-2xl lg:text-3xl font-light text-ink max-w-4xl mx-auto leading-relaxed">
          Seek wisdom from great stoic philosophers
        </p>
      </div>

      {/* Mentors Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {mentors.map((mentor) => (
            <div
              key={mentor.name}
              className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center space-y-6"
            >
              {/* Portrait */}
              <div className="relative w-48 h-48 rounded-full overflow-hidden bg-stone/10 flex items-center justify-center">
                <Image
                  src={mentor.image}
                  alt={mentor.name}
                  width={192}
                  height={192}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* Name */}
              <h2 className="font-inknut text-4xl md:text-5xl font-normal text-ink">
                {mentor.name}
              </h2>
              
              {/* Description */}
              <p className="font-inknut text-base md:text-lg font-light text-ink leading-relaxed max-w-md">
                {mentor.description}
              </p>
              
              {/* Chat Button */}
              <button
                onClick={() => handleStartChat(mentor.name)}
                className="bg-transparent border-2 border-ink hover:bg-ink/5 text-ink font-inknut text-2xl md:text-3xl font-medium px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
              >
                Chat
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-4 pb-16">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl p-12 shadow-lg">
          <h3 className="font-inknut text-6xl md:text-7xl lg:text-8xl font-normal text-ink text-center mb-12">
            How it work
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-cta text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">1</div>
              <h4 className="font-inknut text-xl font-medium text-ink">Choose Your Mentor</h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">Select the philosopher whose wisdom resonates with your current needs.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">2</div>
              <h4 className="font-inknut text-xl font-medium text-ink">Share Your Challenge</h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">Describe your situation, question, or area where you seek guidance.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-sage text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">3</div>
              <h4 className="font-inknut text-xl font-medium text-ink">Receive Wisdom</h4>
              <p className="font-inknut text-base font-light text-ink leading-relaxed">Get personalized stoic guidance tailored to your specific circumstances.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
