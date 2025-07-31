
import React from 'react';
import { MentorCard } from '@/components/mentors/MentorCard';

const mentors = [
  {
    name: 'Seneca',
    title: 'Roman Stoic Philosopher & Statesman',
    description: 'Former advisor to emperors, Seneca brings practical wisdom from navigating political power and personal challenges. His letters offer profound insights on wealth, time, and virtue.',
    expertise: ['Letters & Essays', 'Political Wisdom', 'Practical Ethics', 'Time Management'],
    greeting: 'Greetings, my friend. What troubles your mind today?'
  },
  {
    name: 'Epictetus',
    title: 'Former Slave Turned Stoic Teacher',
    description: 'Having overcome slavery to become a renowned teacher, Epictetus embodies resilience and the power of inner freedom. His teachings focus on what we can and cannot control.',
    expertise: ['Dichotomy of Control', 'Personal Freedom', 'Resilience', 'Practical Teachings'],
    greeting: 'Welcome, student. What is within your control today?'
  },
  {
    name: 'Marcus Aurelius',
    title: 'The Philosopher Emperor',
    description: 'The only philosopher-king in history, Marcus Aurelius balanced the demands of ruling an empire with deep philosophical reflection. His Meditations remain timeless.',
    expertise: ['Leadership', 'Duty & Virtue', 'Applied Philosophy', 'Self-Reflection'],
    greeting: 'Fellow traveler on the path of virtue, how may I guide you?'
  }
];

export default function Mentors() {
  const handleStartChat = (mentorName: string) => {
    console.log(`Starting chat with ${mentorName}`);
    // TODO: Navigate to chat interface
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold text-ink">Stoic Mentors</h1>
        <p className="text-stone text-lg max-w-3xl mx-auto">
          Seek wisdom from the greatest stoic philosophers. Each offers unique insights 
          drawn from their life experiences and philosophical teachings.
        </p>
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 max-w-2xl mx-auto">
          <p className="text-sm text-ink italic">
            "The wise find pleasure in humane arts; the fool in bodily pleasures." — Seneca
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mentors.map((mentor) => (
          <MentorCard
            key={mentor.name}
            name={mentor.name}
            title={mentor.title}
            description={mentor.description}
            expertise={mentor.expertise}
            greeting={mentor.greeting}
            onStartChat={() => handleStartChat(mentor.name)}
          />
        ))}
      </div>

      <div className="text-center bg-white/80 backdrop-blur-sm rounded-lg p-8 border border-stone/20">
        <h3 className="text-xl font-serif font-semibold text-ink mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="space-y-2">
            <div className="w-8 h-8 bg-cta text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
            <h4 className="font-medium text-ink">Choose Your Mentor</h4>
            <p className="text-stone">Select the philosopher whose wisdom resonates with your current needs.</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
            <h4 className="font-medium text-ink">Share Your Challenge</h4>
            <p className="text-stone">Describe your situation, question, or area where you seek guidance.</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-sage text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
            <h4 className="font-medium text-ink">Receive Wisdom</h4>
            <p className="text-stone">Get personalized stoic guidance tailored to your specific circumstances.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
