import React, { useState, useMemo, useCallback } from 'react';
import { format, isSameDay, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { EntryListItem } from './EntryListItem';
import { JournalEntry } from './types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JournalCalendarViewProps {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
  showDeleteButton?: boolean;
  className?: string;
}

export const JournalCalendarView: React.FC<JournalCalendarViewProps> = ({
  entries,
  selectedEntry,
  onSelectEntry,
  onDeleteEntry,
  showDeleteButton = true,
  className = ''
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get dates that have entries
  const datesWithEntries = useMemo(() => {
    const dateSet = new Set<string>();
    entries.forEach(entry => {
      const entryDate = startOfDay(new Date(entry.createdAt));
      dateSet.add(entryDate.toISOString());
    });
    return Array.from(dateSet).map(dateStr => new Date(dateStr));
  }, [entries]);

  // Get entries for selected date
  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    
    return entries
      .filter(entry => isSameDay(new Date(entry.createdAt), selectedDate))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, selectedDate]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
  }, []);

  // Handle entry deletion
  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (onDeleteEntry) {
      await onDeleteEntry(entryId);
    }
  }, [onDeleteEntry]);

  // Get entry count and unified blue styling for dates
  const getEntryInfo = useCallback((date: Date) => {
    const entryCount = entries.filter(entry => 
      isSameDay(new Date(entry.createdAt), date)
    ).length;
    
    return { entryCount };
  }, [entries]);

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Clean Calendar Section */}
      <div className="flex-shrink-0 p-6 bg-white border-b border-stone-200">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className="w-full rounded-lg border border-stone-200 bg-white"
          classNames={{
            table: "w-full",
            head_row: "flex mb-2",
            head_cell: "text-stone-500 rounded-md w-8 font-medium text-xs uppercase tracking-wide",
            row: "flex w-full mt-1",
            cell: "relative p-0.5 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
            day: cn(
              "h-8 w-8 p-0 font-normal rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-sm",
              "aria-selected:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            ),
            day_selected: "bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg",
            day_today: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 font-semibold border border-amber-300",
            day_outside: "text-stone-300 opacity-50",
            day_disabled: "text-stone-300 opacity-30",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            caption: "flex justify-center pt-1 relative items-center mb-4",
            caption_label: "text-lg font-semibold text-stone-800",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "inline-flex items-center justify-center rounded-lg w-8 h-8 p-0",
              "border border-stone-200 bg-white hover:bg-stone-50 transition-colors",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
          }}
          components={{
            DayButton: ({ day, ...props }) => {
              const { entryCount } = getEntryInfo(day.date);
              const isToday = isSameDay(day.date, new Date());
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const hasEntries = entryCount > 0;
              
              return (
                <button
                  {...props}
                  className={cn(
                    "relative h-8 w-8 p-0 font-normal rounded-lg transition-all duration-200",
                    "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    isSelected && "bg-orange-400 text-white font-semibold",
                    isToday && !isSelected && "bg-orange-400 text-white font-semibold",
                    hasEntries && !isSelected && !isToday && "bg-blue-50 text-blue-700",
                    !hasEntries && !isSelected && !isToday && "text-stone-700 hover:bg-stone-50",
                    props.disabled && "text-stone-300 opacity-30"
                  )}
                >
                  {day.date.getDate()}
                  {hasEntries && (
                    <div className={cn(
                      "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full",
                      (isSelected || isToday) ? "bg-white" : "bg-blue-500"
                    )}>
                    </div>
                  )}
                </button>
              );
            },
            Nav: ({ className, children, ...props }) => (
              <nav className={cn("flex items-center space-x-1", className)} {...props}>
                {children}
              </nav>
            )
          }}
        />
      </div>

      {/* Selected Date Header with Modern Styling */}
      {selectedDate && (
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-stone-50 to-stone-100 border-b border-stone-200/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-stone-800">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-stone-600 mt-0.5">
                {entriesForSelectedDate.length} {entriesForSelectedDate.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            {entriesForSelectedDate.length > 0 && (
              <div className="flex items-center space-x-1">
                {entriesForSelectedDate.slice(0, 3).map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-blue-500 opacity-60"
                  />
                ))}
                {entriesForSelectedDate.length > 3 && (
                  <span className="text-xs text-stone-500 ml-1">+{entriesForSelectedDate.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Entries Display */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-white">
        {entriesForSelectedDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h4 className="text-sm font-medium text-stone-700 mb-2">
              {selectedDate ? 'No entries for this date' : 'Select a date'}
            </h4>
            <p className="text-xs text-stone-500 max-w-48">
              {selectedDate 
                ? 'Start writing your thoughts for this day' 
                : 'Choose a date from the calendar to view or create entries'
              }
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {entriesForSelectedDate.map((entry, index) => {
              // Generate preview from entry blocks
              const contentParts = entry.blocks
                .map(block => block.text?.trim())
                .filter(Boolean);
              
              const fullText = contentParts.join(' ');
              const preview = fullText.length > 0 ? fullText.slice(0, 80) : '';
              
              const entryWithPreview = {
                ...entry,
                preview
              };

              return (
                <div
                  key={entry.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <EntryListItem
                    entry={entryWithPreview}
                    isSelected={selectedEntry?.id === entry.id}
                    onSelect={() => onSelectEntry(entry)}
                    onDelete={() => handleDeleteEntry(entry.id)}
                    dateLabel={format(new Date(entry.createdAt), 'h:mm a')}
                    showDeleteButton={showDeleteButton}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};