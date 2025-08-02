import React, { useState, useMemo } from 'react';
import { format, isSameDay, isToday, addMonths, subMonths, parseISO, compareDesc } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DaySelectorProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  entriesMap?: Record<string, { hasEntry: boolean; timestamp?: string; preview?: string }>;
}

export function DaySelector({ selectedDate, onDateSelect, entriesMap = {} }: DaySelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const timelineEntries = useMemo(() => {
    const entries = Object.entries(entriesMap)
      .filter(([_, data]) => data.hasEntry)
      .map(([dateStr, data]) => ({
        date: parseISO(dateStr),
        dateStr,
        ...data
      }))
      .sort((a, b) => compareDesc(a.date, b.date));

    const groupedByMonth: Record<string, typeof entries> = {};
    entries.forEach(entry => {
      const monthKey = format(entry.date, 'MMMM yyyy');
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = [];
      }
      groupedByMonth[monthKey].push(entry);
    });

    return groupedByMonth;
  }, [entriesMap]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-8 w-8 p-0 hover:bg-stone-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="font-serif font-medium text-sm text-stone-800">
          Timeline
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-8 w-8 p-0 hover:bg-stone-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {Object.keys(timelineEntries).length === 0 ? (
            <div className="text-center text-stone-500 text-sm py-8">
              No entries yet
            </div>
          ) : (
            Object.entries(timelineEntries).map(([monthYear, entries]) => (
              <div key={monthYear} className="mb-6">
                <h3 className="text-sm font-medium text-stone-700 mb-3 sticky top-0 bg-white py-1">
                  {monthYear}
                </h3>
                
                <div className="space-y-1">
                  {entries.map(entry => {
                    const isSelected = isSameDay(entry.date, selectedDate);
                    const isTodayDate = isToday(entry.date);
                    
                    return (
                      <button
                        key={entry.dateStr}
                        onClick={() => onDateSelect(entry.date)}
                        className={`
                          w-full text-left p-3 rounded-lg transition-colors
                          ${isSelected ? 'bg-orange-50 border-l-2 border-orange-500' : 'hover:bg-stone-50'}
                          ${isTodayDate && !isSelected ? 'bg-stone-50' : ''}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`
                              text-lg font-bold w-8 text-center
                              ${isSelected ? 'text-orange-600' : isTodayDate ? 'text-stone-800' : 'text-stone-600'}
                            `}>
                              {format(entry.date, 'dd')}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {entry.timestamp && (
                              <div className="text-xs text-stone-500 mb-1">
                                {entry.timestamp}
                              </div>
                            )}
                            {entry.preview && (
                              <div className="text-sm text-stone-700 truncate leading-relaxed">
                                {entry.preview}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          
          <div className="mt-6 pt-4 border-t border-stone-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDateSelect(new Date())}
              className="w-full justify-start text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-800"
            >
              + Add Today's Entry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}