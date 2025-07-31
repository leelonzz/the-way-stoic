
import React from 'react';
import { Quote, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DailyQuoteProps {
  quote: string;
  author: string;
  source?: string;
  onSave?: () => void;
}

export function DailyQuote({ quote, author, source, onSave }: DailyQuoteProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-stone/20 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent/10 rounded-full shrink-0">
            <Quote className="w-6 h-6 text-accent" />
          </div>
          
          <div className="flex-1 space-y-4">
            <blockquote className="text-xl font-serif italic text-ink leading-relaxed">
              "{quote}"
            </blockquote>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone">— {author}</p>
                {source && (
                  <p className="text-sm text-stone/70">{source}</p>
                )}
              </div>
              
              {onSave && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
                  className="text-stone hover:text-cta hover:bg-cta/10"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
