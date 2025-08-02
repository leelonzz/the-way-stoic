import React, { useState, useMemo } from 'react';
import { format, isSameDay, isToday, addMonths, subMonths, parseISO, compareDesc } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <Card className="w-full h-full bg-white/80 backdrop-blur-sm border-stone/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="h-6 w-6 p-0 hover:bg-sage/20"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>
        
        <h2 className="font-serif font-medium text-sm text-ink">
          Timeline
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="h-6 w-6 p-0 hover:bg-sage/20"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 h-full">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="px-3 pb-4">
            {Object.keys(timelineEntries).length === 0 ? (
              <div className="text-center text-stone text-sm py-8">
                No entries yet
              </div>
            ) : (
              Object.entries(timelineEntries).map(([monthYear, entries]) => (
                <div key={monthYear} className="mb-6">
                  <h3 className="text-sm font-medium text-ink mb-3 sticky top-0 bg-white/80 backdrop-blur-sm py-1">
                    {monthYear}
                  </h3>
                  
                  <div className="space-y-2">
                    {entries.map(entry => {
                      const isSelected = isSameDay(entry.date, selectedDate);
                      const isTodayDate = isToday(entry.date);
                      
                      return (
                        <button
                          key={entry.dateStr}
                          onClick={() => onDateSelect(entry.date)}
                          className={`
                            w-full text-left p-2 rounded-lg transition-colors hover:bg-sage/10
                            ${isSelected ? 'bg-cta/10 border-l-2 border-cta' : ''}
                            ${isTodayDate && !isSelected ? 'bg-sage/5' : ''}
                          `}
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0">
                              <div className={`
                                text-xl font-bold w-8 text-center
                                ${isSelected ? 'text-cta' : isTodayDate ? 'text-ink' : 'text-stone'}
                              `}>
                                {format(entry.date, 'dd')}
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              {entry.timestamp && (
                                <div className="text-xs text-stone/70 mb-1">
                                  {entry.timestamp}
                                </div>
                              )}
                              {entry.preview && (
                                <div className="text-sm text-stone truncate">
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
            
            <div className="mt-8 pt-4 border-t border-stone/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateSelect(new Date())}
                className="w-full justify-start text-sm text-stone hover:bg-sage/10"
              >
                + Add Today's Entry
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}