
import React from 'react';
import { BookOpen, Brain, Quote, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      <Card className="bg-gradient-to-br from-hero/20 to-cta/10 border-cta/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl font-serif text-ink">
            <Sparkles className="w-6 h-6 text-cta" />
            Today's Quote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <blockquote className="text-xl font-serif italic text-ink leading-relaxed">
              "{sampleQuote.quote}"
            </blockquote>
            <div>
              <p className="font-semibold text-stone">— {sampleQuote.author}</p>
              {sampleQuote.source && (
                <p className="text-sm text-stone/70">{sampleQuote.source}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BookOpen className="w-8 h-8 text-cta" />
              <div>
                <p className="text-2xl font-bold text-ink">7</p>
                <p className="text-sm text-stone">Journal Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Brain className="w-8 h-8 text-cta" />
              <div>
                <p className="text-2xl font-bold text-ink">3</p>
                <p className="text-sm text-stone">Mentor Chats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Quote className="w-8 h-8 text-cta" />
              <div>
                <p className="text-2xl font-bold text-ink">15</p>
                <p className="text-sm text-stone">Daily Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-cta" />
              <div>
                <p className="text-2xl font-bold text-ink">5</p>
                <p className="text-sm text-stone">Calendar Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cta" />
              Daily Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-stone">Take a moment to reflect on your day and practice Stoic principles.</p>
              <Link href="/journal">
                <Button className="w-full bg-cta hover:bg-cta/90">
                  Start Journaling
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
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
