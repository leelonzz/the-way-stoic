
import React, { useState } from 'react';
import { MorningJournal } from '@/components/journal/MorningJournal';
import { EveningJournal } from '@/components/journal/EveningJournal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sun, Moon } from 'lucide-react';

export default function Journal() {
  const [activeTab, setActiveTab] = useState('morning');

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-ink">Daily Journal</h1>
        <p className="text-stone text-lg">
          "The unexamined life is not worth living" — Socrates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/50">
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
        
        <TabsContent value="morning" className="space-y-6">
          <MorningJournal />
        </TabsContent>
        
        <TabsContent value="evening" className="space-y-6">
          <EveningJournal />
        </TabsContent>
      </Tabs>
    </div>
  );
}
