
import React, { useState } from 'react';
import { Heart, Trophy, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const eveningPrompts = [
  {
    key: 'grateful_for',
    icon: Heart,
    placeholder: 'What am I grateful for today...',
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200'
  },
  {
    key: 'biggest_wins',
    icon: Trophy,
    placeholder: 'What were my biggest wins today...',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  {
    key: 'tensions',
    icon: AlertTriangle,
    placeholder: 'What tensions did I experience today...',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
];

export function EveningJournal() {
  const [entries, setEntries] = useState({
    grateful_for: '',
    biggest_wins: '',
    tensions: ''
  });

  const handleChange = (key: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving evening journal:', entries);
    // TODO: Implement save to database
  };

  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-stone/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-serif text-ink">Evening Shutdown</CardTitle>
        <p className="text-stone">Reflect on your day with wisdom and gratitude</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {eveningPrompts.map((prompt) => (
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
            Save Evening Reflection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
