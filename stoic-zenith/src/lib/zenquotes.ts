export interface ZenQuote {
  q: string; // quote text
  a: string; // author
  i: string; // image URL (if available)
  c: string; // character count
  h: string; // HTML formatted quote
}

export interface FormattedQuote {
  id: string;
  text: string;
  author: string;
  source: string;
  category: string;
  created_at: string;
  mood_tags: string[];
}

class ZenQuotesService {
  private readonly baseUrl = 'https://zenquotes.io/api';

  private formatQuote(zenQuote: ZenQuote, category: string = 'general'): FormattedQuote {
    return {
      id: `zen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: zenQuote.q,
      author: zenQuote.a,
      source: 'ZenQuotes',
      category,
      created_at: new Date().toISOString(),
      mood_tags: ['philosophical']
    };
  }

  async getRandomQuotes(count: number = 50): Promise<FormattedQuote[]> {
    try {
      const response = await fetch(`${this.baseUrl}/quotes`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ZenQuote[] = await response.json();
      return data.slice(0, count).map(quote => this.formatQuote(quote));
    } catch (error) {
      console.error('Error fetching random quotes:', error);
      throw new Error('Failed to fetch quotes from ZenQuotes');
    }
  }

  async getRandomQuote(): Promise<FormattedQuote> {
    try {
      const response = await fetch(`${this.baseUrl}/random`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ZenQuote[] = await response.json();
      if (data.length === 0) {
        throw new Error('No quote received');
      }
      
      return this.formatQuote(data[0]);
    } catch (error) {
      console.error('Error fetching random quote:', error);
      throw new Error('Failed to fetch random quote from ZenQuotes');
    }
  }

  async getTodayQuote(): Promise<FormattedQuote> {
    try {
      const response = await fetch(`${this.baseUrl}/today`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ZenQuote[] = await response.json();
      if (data.length === 0) {
        throw new Error('No quote received');
      }
      
      return this.formatQuote(data[0], 'daily');
    } catch (error) {
      console.error('Error fetching today quote:', error);
      throw new Error('Failed to fetch today\'s quote from ZenQuotes');
    }
  }

  async getQuotesByKeyword(keyword: string): Promise<FormattedQuote[]> {
    try {
      // Note: This endpoint typically requires an API key for ZenQuotes
      // For now, we'll filter from random quotes by keyword
      const quotes = await this.getRandomQuotes(50);
      const filtered = quotes.filter(quote => 
        quote.text.toLowerCase().includes(keyword.toLowerCase()) ||
        quote.author.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return filtered.map(quote => ({
        ...quote,
        category: keyword
      }));
    } catch (error) {
      console.error('Error fetching quotes by keyword:', error);
      throw new Error(`Failed to fetch quotes for keyword: ${keyword}`);
    }
  }

  // Mood-based keywords mapping
  async getQuotesByMood(mood: string): Promise<FormattedQuote[]> {
    const moodKeywords: Record<string, string[]> = {
      'motivational': ['success', 'courage', 'strength', 'determination'],
      'calming': ['peace', 'calm', 'serenity', 'tranquil'],
      'reflective': ['wisdom', 'truth', 'understanding', 'knowledge'],
      'inspirational': ['hope', 'dream', 'inspire', 'believe'],
      'challenging': ['failure', 'adversity', 'challenge', 'overcome']
    };

    const keywords = moodKeywords[mood.toLowerCase()] || [mood];
    const allQuotes: FormattedQuote[] = [];

    for (const keyword of keywords) {
      try {
        const quotes = await this.getQuotesByKeyword(keyword);
        allQuotes.push(...quotes);
      } catch (error) {
        console.warn(`Failed to fetch quotes for keyword: ${keyword}`);
      }
    }

    // Remove duplicates and limit results
    const uniqueQuotes = allQuotes.filter((quote, index, self) => 
      index === self.findIndex(q => q.text === quote.text && q.author === quote.author)
    );

    return uniqueQuotes.slice(0, 20).map(quote => ({
      ...quote,
      category: mood
    }));
  }
}

export const zenQuotesService = new ZenQuotesService();