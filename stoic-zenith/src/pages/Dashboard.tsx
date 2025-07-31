
import React from 'react';
import { BookOpen, Brain, Quote, Calendar } from 'lucide-react';
import { DailyQuote } from '@/components/quotes/DailyQuote';
import { StreakCard } from '@/components/stats/StreakCard';
import { MorningJournal } from '@/components/journal/MorningJournal';
import { Button } from '@/components/ui/button';

const sampleQuote = {
  quote: "You have power over your mind—not outside events. Realize this, and you will find strength.",
  author: "Marcus Aurelius",
  source: "Meditations, Book 2"
};

export default function Dashboard() {
  const currentHour = new Date().getHours();
  const isEvening = currentHour >= 17;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-ink">
          {currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening'}
        </h1>
        <p className="text-stone text-lg">
          "Every new beginning comes from some other beginning's end."
        </p>
      </div>

      {/* Daily Quote */}
      <DailyQuote 
        quote={sampleQuote.quote}
        author={sampleQuote.author}
        source={sampleQuote.source}
        onSave={() => console.log('Quote saved')}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StreakCard
          title="Journal Streak"
          currentStreak={7}
          longestStreak={24}
          icon={<BookOpen className="w-4 h-4" />}
        />
        <StreakCard
          title="Mentor Chats"
          currentStreak={3}
          longestStreak={12}
          icon={<Brain className="w-4 h-4" />}
        />
        <StreakCard
          title="Daily Quotes"
          currentStreak={15}
          longestStreak={45}
          icon={<Quote className="w-4 h-4" />}
        />
        <StreakCard
          title="Calendar Views"
          currentStreak={5}
          longestStreak={18}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Main Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <MorningJournal />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm border border-stone/20 rounded-lg p-8">
            <h3 className="text-xl font-serif font-semibold text-ink mb-4">Today's Focus</h3>
            <div className="space-y-4">
              <div className="p-4 bg-hero/50 rounded-lg">
                <h4 className="font-medium text-ink mb-2">Stoic Practice</h4>
                <p className="text-stone text-sm">
                  Focus on the dichotomy of control. What is within your influence today, 
                  and what lies beyond it?
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  onClick={() => window.location.href = '/mentors'}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Seek Wisdom
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-stone/30 hover:bg-hero/50"
                  onClick={() => window.location.href = '/calendar'}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Memento Mori
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
