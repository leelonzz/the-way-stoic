
import React, { useState } from 'react';
import { MorningJournal } from '@/components/journal/MorningJournal';
import { EveningJournal } from '@/components/journal/EveningJournal';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { Sun, Moon, Calendar } from 'lucide-react';

export default function Journal() {
  const [activeView, setActiveView] = useState('navigation');

  return (
    <div className="h-full flex bg-stone-50">
      {/* Left Panel - Navigation */}
      <div className="w-80 bg-white border-r border-stone-200 flex flex-col">
        {/* Today Header */}
        <div className="p-6 border-b border-stone-100">
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">Today</h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-stone-100 rounded-lg px-3 py-1 flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">MON</span>
              <span className="text-lg font-bold text-stone-800">10</span>
            </div>
            <div className="text-xs text-stone-500">
              WHAT I WILL DO TO MAKE TODAY GREAT
            </div>
          </div>
          <p className="text-sm text-stone-700 font-medium">
            I'm going to enjoy the rain
          </p>
        </div>

        {/* Activity Icons */}
        <div className="p-6 border-b border-stone-100">
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-orange-200 bg-white flex items-center justify-center">
                <span className="text-xl font-serif font-bold text-stone-700">Q</span>
              </div>
              <span className="text-xs text-stone-600 text-center">Daily Quote</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-orange-200 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                <Sun className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-stone-600 text-center">Morning Meditation</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-orange-200 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Moon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-stone-600 text-center">Evening Meditation</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-orange-200 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-xs text-stone-600 text-center">Gratitude Energy</span>
            </div>
          </div>
        </div>

        {/* Gratitude Quote */}
        <div className="p-6 border-b border-stone-100">
          <div className="bg-stone-50 rounded-lg p-4 relative">
            <button className="absolute top-2 right-2 text-stone-400 hover:text-stone-600">
              ×
            </button>
            <p className="text-sm text-stone-700 font-serif mb-2">
              "Gratitude is its own reward, it feels good, it makes you healthier, it draws you closer to others."
            </p>
            <p className="text-xs text-stone-500">GLENN FOX, NEUROSCIENTIST</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex border-t border-stone-100">
            <button
              onClick={() => setActiveView('navigation')}
              className={`flex-1 flex flex-col items-center py-4 text-xs transition-colors ${
                activeView === 'navigation' 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span>Journal</span>
            </button>
            
            <button
              onClick={() => setActiveView('morning')}
              className={`flex-1 flex flex-col items-center py-4 text-xs transition-colors ${
                activeView === 'morning' 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Sun className="w-5 h-5 mb-1" />
              <span>Morning</span>
            </button>
            
            <button
              onClick={() => setActiveView('evening')}
              className={`flex-1 flex flex-col items-center py-4 text-xs transition-colors ${
                activeView === 'evening' 
                  ? 'text-orange-600 border-b-2 border-orange-600' 
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Moon className="w-5 h-5 mb-1" />
              <span>Evening</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 bg-stone-50">
        {activeView === 'navigation' && (
          <JournalNavigation className="h-full" />
        )}
        
        {activeView === 'morning' && (
          <div className="h-full p-6">
            <MorningJournal />
          </div>
        )}
        
        {activeView === 'evening' && (
          <div className="h-full p-6">
            <EveningJournal />
          </div>
        )}
      </div>
    </div>
  );
}
