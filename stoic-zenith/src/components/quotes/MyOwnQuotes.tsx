'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { QuoteCard } from './QuoteCard';
import { Hourglass } from '@/components/ui/Hourglass';

export interface UserQuote {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: string;
  mood_tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface MyOwnQuotesProps {
  userQuotes: UserQuote[];
  loading: boolean;
  onCreateQuote: (quote: Omit<UserQuote, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  onUpdateQuote: (id: string, quote: Partial<UserQuote>) => Promise<boolean>;
  onDeleteQuote: (id: string) => Promise<boolean>;
}

const moodOptions = [
  'motivational', 'calming', 'reflective', 'inspirational', 
  'challenging', 'philosophical', 'stoic'
];

const categoryOptions = [
  'personal', 'wisdom', 'motivation', 'reflection', 'life', 'success', 'happiness'
];

export function MyOwnQuotes({ 
  userQuotes, 
  loading, 
  onCreateQuote, 
  onUpdateQuote, 
  onDeleteQuote 
}: MyOwnQuotesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<UserQuote | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    author: 'Me',
    source: '',
    category: 'personal',
    mood_tags: [] as string[],
    is_private: false
  });

  const resetForm = () => {
    setFormData({
      text: '',
      author: 'Me',
      source: '',
      category: 'personal',
      mood_tags: [],
      is_private: false
    });
  };

  const handleCreate = async () => {
    if (!formData.text.trim()) return;
    
    const success = await onCreateQuote(formData);
    if (success) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingQuote || !formData.text.trim()) return;
    
    const success = await onUpdateQuote(editingQuote.id, formData);
    if (success) {
      setEditingQuote(null);
      resetForm();
    }
  };

  const handleEdit = (quote: UserQuote) => {
    setEditingQuote(quote);
    setFormData({
      text: quote.text,
      author: quote.author,
      source: quote.source || '',
      category: quote.category,
      mood_tags: quote.mood_tags,
      is_private: quote.is_private
    });
  };

  const handleMoodToggle = (mood: string) => {
    setFormData(prev => ({
      ...prev,
      mood_tags: prev.mood_tags.includes(mood)
        ? prev.mood_tags.filter(tag => tag !== mood)
        : [...prev.mood_tags, mood]
    }));
  };

  const QuoteForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="quote-text">Quote Text *</Label>
        <Textarea
          id="quote-text"
          placeholder="Enter your quote..."
          value={formData.text}
          onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            placeholder="Quote author"
            value={formData.author}
            onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="source">Source (Optional)</Label>
          <Input
            id="source"
            placeholder="Book, speech, etc."
            value={formData.source}
            onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Mood Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {moodOptions.map(mood => (
            <Badge
              key={mood}
              variant={formData.mood_tags.includes(mood) ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => handleMoodToggle(mood)}
            >
              {mood}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="private"
          checked={formData.is_private}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_private: checked }))}
        />
        <Label htmlFor="private">Keep this quote private</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreateDialogOpen(false);
            setEditingQuote(null);
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={editingQuote ? handleUpdate : handleCreate}
          disabled={!formData.text.trim()}
        >
          {editingQuote ? 'Update Quote' : 'Create Quote'}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <Hourglass size="md" className="mx-auto" />
          <p className="text-stone">Loading your quotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif text-ink">My Own Quotes</h2>
          <p className="text-stone/70">Create and manage your personal quotes collection</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            <QuoteForm />
          </DialogContent>
        </Dialog>
      </div>

      {userQuotes.length > 0 ? (
        <div className="grid gap-6">
          {userQuotes.map((quote) => (
            <Card key={quote.id} className="relative">
              <CardContent className="pt-6">
                <QuoteCard
                  quote={{
                    id: quote.id,
                    text: quote.text,
                    author: quote.author,
                    source: quote.source,
                    category: quote.category,
                    created_at: quote.created_at
                  }}
                  showCategory={true}
                />
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {quote.mood_tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {quote.is_private && (
                      <Badge variant="outline" className="text-xs">
                        Private
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(quote)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteQuote(quote.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-stone/30 mx-auto mb-4" />
          <p className="text-stone">No personal quotes yet</p>
          <p className="text-stone/70 text-sm mb-4">Start building your personal quotes collection</p>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quote</DialogTitle>
              </DialogHeader>
              <QuoteForm />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {editingQuote && (
        <Dialog open={!!editingQuote} onOpenChange={(open) => !open && setEditingQuote(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Quote</DialogTitle>
            </DialogHeader>
            <QuoteForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}