'use client'

import React, { useState, useMemo } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, BookOpen, Heart } from 'lucide-react';
import { useQuotes } from '@/hooks/useQuotes';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { QuoteSearch } from '@/components/quotes/QuoteSearch';
import { useAuthContext } from '@/components/auth/AuthProvider';

const queryClient = new QueryClient();

function QuotesContent() {
  const { 
    quotes, 
    savedQuotes, 
    loading, 
    error, 
    getDailyQuote, 
    saveQuote, 
    unsaveQuote, 
    isQuoteSaved,
    getQuotesByCategory,
    searchQuotes
  } = useQuotes();
  
  const { isAuthenticated } = useAuthContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const dailyQuote = getDailyQuote();
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(quotes.map(q => q.category))];
    return uniqueCategories.sort();
  }, [quotes]);

  const filteredQuotes = useMemo(() => {
    let filtered = quotes;
    
    if (searchTerm) {
      filtered = searchQuotes(searchTerm);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(q => q.category === selectedCategory);
    }
    
    return filtered;
  }, [quotes, searchTerm, selectedCategory, searchQuotes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-cta border-t-transparent mx-auto"></div>
          <p className="text-stone">Loading wisdom...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-serif text-ink">Daily Quotes</h1>
        <p className="text-red-600 mt-4">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif text-ink">Daily Stoic Wisdom</h1>
        <p className="text-stone">Timeless teachings for modern life</p>
      </div>

      {dailyQuote && (
        <Card className="bg-gradient-to-br from-hero/20 to-cta/10 border-cta/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-serif text-ink">
              <Sparkles className="w-6 h-6 text-cta" />
              Today's Quote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteCard
              quote={dailyQuote}
              isSaved={isAuthenticated ? isQuoteSaved(dailyQuote.id) : false}
              onSave={isAuthenticated ? saveQuote : undefined}
              onUnsave={isAuthenticated ? unsaveQuote : undefined}
              showCategory={false}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/50">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            All Quotes
          </TabsTrigger>
          <TabsTrigger value="saved" className="flex items-center gap-2" disabled={!isAuthenticated}>
            <Heart className="w-4 h-4" />
            Saved ({savedQuotes.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <QuoteSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
          />
          
          <div className="text-sm text-stone/70 mb-4">
            Showing {filteredQuotes.length} of {quotes.length} quotes
          </div>
          
          <div className="grid gap-6">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                isSaved={isAuthenticated ? isQuoteSaved(quote.id) : false}
                onSave={isAuthenticated ? saveQuote : undefined}
                onUnsave={isAuthenticated ? unsaveQuote : undefined}
              />
            ))}
          </div>
          
          {filteredQuotes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-stone">No quotes found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          {isAuthenticated ? (
            <>
              {savedQuotes.length > 0 ? (
                <div className="grid gap-6">
                  {savedQuotes.map((savedQuote) => (
                    <QuoteCard
                      key={savedQuote.id}
                      quote={savedQuote.quote}
                      isSaved={true}
                      onUnsave={unsaveQuote}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-stone/30 mx-auto mb-4" />
                  <p className="text-stone">No saved quotes yet.</p>
                  <p className="text-stone/70 text-sm">Save quotes you love by clicking the bookmark icon.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone">Please sign in to view saved quotes.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryQuotes = getQuotesByCategory(category);
              return (
                <Card key={category} className="bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category);
                        // Switch to all quotes tab to show filtered results
                        document.querySelector('[value="all"]')?.click();
                      }}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize text-ink">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone/70 text-sm mb-2">{categoryQuotes.length} quotes</p>
                    {categoryQuotes[0] && (
                      <blockquote className="text-sm italic text-stone line-clamp-3">
                        "{categoryQuotes[0].text}"
                      </blockquote>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function QuotesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppLayout>
          <QuotesContent />
        </AppLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}