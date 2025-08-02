'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, RefreshCw, Zap, Leaf, Brain, Heart, Mountain, BookOpen, Shield } from 'lucide-react';
import { QuoteCard } from './QuoteCard';
import { zenQuotesService } from '@/lib/zenquotes';
import { Hourglass } from '@/components/ui/Hourglass';

export interface MoodCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  keywords: string[];
}

interface FormattedQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  category: string;
  created_at: string;
}

interface MoodBasedQuotesProps {
  onSaveQuote?: (quoteId: string) => Promise<boolean>;
  onUnsaveQuote?: (quoteId: string) => Promise<boolean>;
  isQuoteSaved?: (quoteId: string) => boolean;
  isAuthenticated: boolean;
}

const moodCategories: MoodCategory[] = [
  {
    id: 'motivational',
    name: 'Motivational',
    description: 'Inspire action and determination',
    color: '#F59E0B',
    icon: 'Zap',
    keywords: ['success', 'courage', 'strength', 'determination', 'action', 'achieve']
  },
  {
    id: 'calming',
    name: 'Calming',
    description: 'Find peace and tranquility',
    color: '#10B981',
    icon: 'Leaf',
    keywords: ['peace', 'calm', 'serenity', 'tranquil', 'quiet', 'stillness']
  },
  {
    id: 'reflective',
    name: 'Reflective',
    description: 'Deep thinking and wisdom',
    color: '#8B5CF6',
    icon: 'Brain',
    keywords: ['wisdom', 'truth', 'understanding', 'knowledge', 'think', 'reflect']
  },
  {
    id: 'inspirational',
    name: 'Inspirational',
    description: 'Uplift and encourage',
    color: '#EC4899',
    icon: 'Heart',
    keywords: ['hope', 'dream', 'inspire', 'believe', 'possibility', 'faith']
  },
  {
    id: 'challenging',
    name: 'Challenging',
    description: 'Overcome difficulties',
    color: '#EF4444',
    icon: 'Mountain',
    keywords: ['failure', 'adversity', 'challenge', 'overcome', 'struggle', 'perseverance']
  },
  {
    id: 'philosophical',
    name: 'Philosophical',
    description: 'Life and existence',
    color: '#6366F1',
    icon: 'BookOpen',
    keywords: ['life', 'existence', 'meaning', 'purpose', 'philosophy', 'reality']
  },
  {
    id: 'stoic',
    name: 'Stoic',
    description: 'Classical stoic wisdom',
    color: '#374151',
    icon: 'Shield',
    keywords: ['stoic', 'virtue', 'discipline', 'acceptance', 'control', 'reason']
  }
];

const iconComponents = {
  Zap, Leaf, Brain, Heart, Mountain, BookOpen, Shield
};

export function MoodBasedQuotes({ 
  onSaveQuote, 
  onUnsaveQuote, 
  isQuoteSaved, 
  isAuthenticated 
}: MoodBasedQuotesProps) {
  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null);
  const [quotes, setQuotes] = useState<FormattedQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodQuotes = async (mood: MoodCategory) => {
    setLoading(true);
    setError(null);
    
    try {
      const moodQuotes = await zenQuotesService.getQuotesByMood(mood.id);
      setQuotes(moodQuotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mood quotes');
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (mood: MoodCategory) => {
    setSelectedMood(mood);
    fetchMoodQuotes(mood);
  };

  const handleRefresh = () => {
    if (selectedMood) {
      fetchMoodQuotes(selectedMood);
    }
  };

  const MoodCard = ({ mood }: { mood: MoodCategory }) => {
    const IconComponent = iconComponents[mood.icon as keyof typeof iconComponents] || Smile;
    
    return (
      <Card 
        className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
        style={{ borderColor: mood.color + '40' }}
        onClick={() => handleMoodSelect(mood)}
      >
        <CardContent className="p-6 text-center">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: mood.color + '20' }}
          >
            <IconComponent 
              className="w-6 h-6" 
              style={{ color: mood.color }}
            />
          </div>
          <h3 className="font-semibold text-ink mb-1">{mood.name}</h3>
          <p className="text-sm text-stone/70">{mood.description}</p>
        </CardContent>
      </Card>
    );
  };

  if (!selectedMood) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif text-ink">How are you feeling today?</h2>
          <p className="text-stone/70">Choose a mood to discover quotes that resonate with you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moodCategories.map((mood) => (
            <MoodCard key={mood.id} mood={mood} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setSelectedMood(null)}
          >
            ← Back to Moods
          </Button>
          <div>
            <h2 className="text-2xl font-serif text-ink flex items-center gap-2">
              {React.createElement(iconComponents[selectedMood.icon as keyof typeof iconComponents] || Smile, {
                className: "w-6 h-6",
                style: { color: selectedMood.color }
              })}
              {selectedMood.name} Quotes
            </h2>
            <p className="text-stone/70">{selectedMood.description}</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
          <Hourglass size="md" className="mx-auto" />
          <p className="text-stone">Finding quotes for your mood...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && quotes.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: selectedMood.color + '20', color: selectedMood.color }}
            >
              {quotes.length} quotes found
            </Badge>
            <div className="flex flex-wrap gap-1">
              {selectedMood.keywords.slice(0, 3).map(keyword => (
                <Badge key={keyword} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                isSaved={isAuthenticated && isQuoteSaved ? isQuoteSaved(quote.id) : false}
                onSave={isAuthenticated && onSaveQuote ? onSaveQuote : undefined}
                onUnsave={isAuthenticated && onUnsaveQuote ? onUnsaveQuote : undefined}
                showCategory={true}
              />
            ))}
          </div>
        </>
      )}

      {!loading && !error && quotes.length === 0 && selectedMood && (
        <div className="text-center py-12">
          <Smile className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <p className="text-stone">No quotes found for this mood</p>
          <p className="text-stone/70 text-sm mb-4">Try refreshing or selecting a different mood</p>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}