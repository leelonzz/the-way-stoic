
import React, { useState, useEffect } from 'react';
import { Star, Smile, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createJournalEntry, getJournalEntryByDate, updateJournalEntry } from '@/lib/journal';
import { useToast } from '@/hooks/use-toast';

const morningPrompts = [
  {
    key: 'excited_about',
    icon: Star,
    placeholder: 'Thing I\'m excited about today...',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    key: 'make_today_great',
    icon: Smile,
    placeholder: 'What would make today great...',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    key: 'must_not_do',
    icon: Ban,
    placeholder: 'Thing I must not do today...',
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  }
];

export function MorningJournal() {
  const [entries, setEntries] = useState({
    excited_about: '',
    make_today_great: '',
    must_not_do: ''
  });
  const [existingEntry, setExistingEntry] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingEntry();
  }, []);

  const loadExistingEntry = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const entry = await getJournalEntryByDate(today, 'morning');
      
      if (entry) {
        setExistingEntry(entry);
        setEntries({
          excited_about: entry.excited_about || '',
          make_today_great: entry.make_today_great || '',
          must_not_do: entry.must_not_do || ''
        });
      }
    } catch (error) {
      console.error('Failed to load existing entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const entryData = {
        entry_date: today,
        entry_type: 'morning' as const,
        excited_about: entries.excited_about || null,
        make_today_great: entries.make_today_great || null,
        must_not_do: entries.must_not_do || null
      };

      if (existingEntry) {
        await updateJournalEntry(existingEntry.id, entryData);
        toast({
          title: "Morning journal updated!",
          description: "Your morning reflections have been saved.",
        });
      } else {
        const newEntry = await createJournalEntry(entryData);
        setExistingEntry(newEntry);
        toast({
          title: "Morning journal saved!",
          description: "Your morning reflections have been saved.",
        });
      }

      // Refresh the entry list if the function exists
      if (typeof window !== 'undefined' && (window as any).refreshJournalEntries) {
        (window as any).refreshJournalEntries();
      }
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      toast({
        title: "Error saving journal",
        description: "There was an error saving your journal entry. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-stone/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-ink">Morning Kickstart</CardTitle>
        <p className="text-stone">Begin your day with intention and purpose</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {morningPrompts.map((prompt) => (
          <div key={prompt.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${prompt.bgColor} ${prompt.borderColor} border`}>
                <prompt.icon className={`w-5 h-5 ${prompt.color}`} />
              </div>
              <label className="font-medium text-ink capitalize">
                {prompt.key.replace(/_/g, ' ')}
              </label>
            </div>
            <Textarea
              placeholder={prompt.placeholder}
              value={entries[prompt.key as keyof typeof entries]}
              onChange={(e) => handleChange(prompt.key, e.target.value)}
              className="min-h-[80px] bg-white/50 border-stone/30 focus:border-cta resize-none"
            />
          </div>
        ))}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-cta hover:bg-cta/90 text-white px-8"
          >
            {isSaving ? 'Saving...' : existingEntry ? 'Update Morning Reflection' : 'Save Morning Reflection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
