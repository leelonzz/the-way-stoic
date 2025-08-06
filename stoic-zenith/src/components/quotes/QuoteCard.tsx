import React, { useState } from 'react';
import { Quote, Bookmark, BookmarkCheck, Share } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Quote as QuoteType } from '@/hooks/useQuotes';

interface QuoteCardProps {
  quote: QuoteType;
  isSaved?: boolean;
  onSave?: (quoteId: string) => Promise<boolean>;
  onUnsave?: (quoteId: string) => Promise<boolean>;
  showCategory?: boolean;
}

export function QuoteCard({ 
  quote, 
  isSaved = false, 
  onSave, 
  onUnsave, 
  showCategory = true 
}: QuoteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveToggle = async () => {
    if (!onSave || !onUnsave) return;

    setIsLoading(true);
    try {
      const success = isSaved
        ? await onUnsave(quote.id)
        : await onSave(quote.id);

      if (success) {
        toast({
          title: isSaved ? "Quote removed" : "Quote saved",
          description: isSaved ? "Removed from your collection" : "Added to your collection",
        });
      } else {
        toast({
          title: "Error",
          description: isSaved ? "Failed to remove quote" : "Failed to save quote",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const text = `"${quote.text}" - ${quote.author}${quote.source ? ` (${quote.source})` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Stoic Quote',
          text: text,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Quote copied",
          description: "Quote copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Unable to copy quote to clipboard",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-stone/20 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cta/10 rounded-full shrink-0">
            <Quote className="w-6 h-6 text-cta" />
          </div>
          
          <div className="flex-1 space-y-4">
            <blockquote className="text-lg font-serif italic text-ink leading-relaxed">
              "{quote.text}"
            </blockquote>
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <p className="font-semibold text-stone">— {quote.author}</p>
                {quote.source && (
                  <p className="text-sm text-stone/70">{quote.source}</p>
                )}
                {showCategory && (
                  <Badge variant="secondary" className="text-xs">
                    {quote.category}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-stone hover:text-cta hover:bg-cta/10"
                >
                  <Share className="w-4 h-4" />
                </Button>
                
                {(onSave || onUnsave) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveToggle}
                    disabled={isLoading}
                    className={`${
                      isSaved 
                        ? 'text-cta hover:text-cta/70 hover:bg-cta/10' 
                        : 'text-stone hover:text-cta hover:bg-cta/10'
                    }`}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}