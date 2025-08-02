
import React, { useState } from 'react';
import { MorningJournal } from '@/components/journal/MorningJournal';
import { EveningJournal } from '@/components/journal/EveningJournal';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon, Calendar } from 'lucide-react';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('navigation');

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-serif font-bold text-ink">Daily Journal</h1>
        <p className="text-stone text-lg">
          "The unexamined life is not worth living" — Socrates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 bg-white/50 mb-6">
          <TabsTrigger 
            value="navigation" 
            className="flex items-center gap-2 data-[state=active]:bg-cta data-[state=active]:text-white"
          >
            <Calendar className="w-4 h-4" />
            Navigation
          </TabsTrigger>
          <TabsTrigger 
            value="morning" 
            className="flex items-center gap-2 data-[state=active]:bg-cta data-[state=active]:text-white"
          >
            <Sun className="w-4 h-4" />
            Morning
          </TabsTrigger>
          <TabsTrigger 
            value="evening"
            className="flex items-center gap-2 data-[state=active]:bg-cta data-[state=active]:text-white"
          >
            <Moon className="w-4 h-4" />
            Evening
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="navigation" className="flex-1">
          <JournalNavigation className="h-full" />
        </TabsContent>
        
        <TabsContent value="morning" className="space-y-6 max-w-4xl mx-auto">
          <MorningJournal />
        </TabsContent>
        
        <TabsContent value="evening" className="space-y-6 max-w-4xl mx-auto">
          <EveningJournal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
