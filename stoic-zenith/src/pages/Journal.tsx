
import React from 'react';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { Calendar } from 'lucide-react';

export default function Journal() {
  return (
    <div className="h-full flex bg-stone-50">
      {/* Left Panel - Navigation (Fixed width, but responsive) */}
      <div className="w-80 min-w-80 bg-white border-r border-stone-200 flex flex-col flex-shrink-0 hidden lg:flex">
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
                <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
              </div>
              <span className="text-xs text-stone-600 text-center">Morning Meditation</span>
            </div>
            
            <div className="flex flex-col items-center gap-2 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-orange-200 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
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

        {/* Navigation Tab */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex border-t border-stone-100">
            <div className="flex-1 flex flex-col items-center py-4 text-xs text-orange-600 border-b-2 border-orange-600">
              <Calendar className="w-5 h-5 mb-1" />
              <span>Journal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Content (Full remaining width/height) */}
      <div className="flex-1 min-w-0 bg-white flex flex-col">
        <JournalNavigation className="flex-1" />
      </div>
    </div>
  );
}
