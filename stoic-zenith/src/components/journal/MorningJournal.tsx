
import React, { useState } from 'react';
import { Star, Smile, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const handleChange = (key: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving morning journal:', entries);
    // TODO: Implement save to database
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
            className="bg-cta hover:bg-cta/90 text-white px-8"
          >
            Save Morning Reflection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
