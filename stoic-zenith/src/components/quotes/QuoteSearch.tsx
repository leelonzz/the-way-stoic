import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuoteSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: string[];
}

export function QuoteSearch({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories
}: QuoteSearchProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const clearSearch = () => {
    onSearchChange('');
    onCategoryChange(null);
  };

  const hasActiveFilters = searchTerm.length > 0 || selectedCategory !== null;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
          isSearchFocused ? 'text-cta' : 'text-stone/50'
        }`} />
        <Input
          type="text"
          placeholder="Search quotes by text, author, or source..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="pl-10 pr-4 py-3 bg-white/50 border-stone/20 focus:border-cta focus:ring-cta/20"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`border-stone/20 ${
                selectedCategory 
                  ? 'bg-cta text-white border-cta hover:bg-cta/90' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedCategory ? `Category: ${selectedCategory}` : 'All Categories'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-white/95 backdrop-blur-sm">
            <DropdownMenuItem 
              onClick={() => onCategoryChange(null)}
              className={selectedCategory === null ? 'bg-cta/10 text-cta' : ''}
            >
              All Categories
            </DropdownMenuItem>
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => onCategoryChange(category)}
                className={selectedCategory === category ? 'bg-cta/10 text-cta' : ''}
              >
                <span className="capitalize">{category}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="bg-hero/20 text-stone">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="secondary" className="bg-cta/20 text-cta">
                Category: {selectedCategory}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="text-stone/70 hover:text-stone hover:bg-stone/10 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}