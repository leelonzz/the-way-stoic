import React, { useState, useEffect, useCallback } from 'react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Search } from 'lucide-react';
import { EntryListItem } from './EntryListItem';
import { Input } from '@/components/ui/input';
import { JournalEntry } from './types';
import { getJournalEntries, JournalEntryResponse, convertSupabaseToBlocks } from '@/lib/journal';
import { useTabVisibility } from '@/hooks/useTabVisibility';

interface EntryListProps {
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => Promise<void>;
  onCreateEntry: () => void;
  className?: string;
  isParentLoading?: boolean;
  onLoadingStateChange?: (loading: boolean) => void;
  entries?: JournalEntry[];
  onEntriesChange?: (entries: JournalEntry[]) => void;
}

interface EntryListItem {
  entry: JournalEntryResponse & { preview?: string };
  dateKey: string;
}

export function EntryList({ selectedEntry, onSelectEntry, onCreateEntry: _onCreateEntry, className = '', isParentLoading = false, onLoadingStateChange, entries: _parentEntries, onEntriesChange }: EntryListProps): JSX.Element {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEntries, setFilteredEntries] = useState<EntryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState<number>(Date.now());

  // Use centralized tab visibility management
  const tabVisibility = useTabVisibility({ refreshThreshold: 2000 }); // 2 seconds threshold

  const loadEntries = useCallback(async () => {
    if (!onLoadingStateChange) {
      setIsLoading(true);
    } else {
      onLoadingStateChange(true);
    }
    
    try {
      const journalEntries = await getJournalEntries(50);

      // Filter out entries that appear to be test/debug entries with timestamp text
      const filteredJournalEntries = journalEntries.filter(entry => {
        // Check if the entry contains only timestamp-like content
        const timestampPattern = /^Entry created at \d{1,2}:\d{2}:\d{2}$/;
        const isTimestampEntry = timestampPattern.test(entry.excited_about || '');

        // Also check if the entry has no meaningful content (only timestamp text)
        const hasRealContent = [
          entry.make_today_great,
          entry.must_not_do,
          entry.grateful_for,
          ...(Array.isArray(entry.biggest_wins) ? entry.biggest_wins : []),
          ...(Array.isArray(entry.tensions) ? entry.tensions : [])
        ].some(content => content && content.trim() !== '');

        // Include entry if it's not a timestamp entry OR if it has real content beyond the timestamp
        return !isTimestampEntry || hasRealContent;
      });

      const entryItems: EntryListItem[] = filteredJournalEntries.map(entry => {
        // Generate preview from journal entry content
        const contentParts = [
          entry.excited_about,
          entry.make_today_great,
          entry.must_not_do,
          entry.grateful_for,
          ...(Array.isArray(entry.biggest_wins) ? entry.biggest_wins : []),
          ...(Array.isArray(entry.tensions) ? entry.tensions : [])
        ].filter(Boolean);

        const preview = contentParts.join(' ').slice(0, 80);

        return {
          entry: {
            ...entry,
            preview
          },
          dateKey: entry.entry_date
        };
      });
      
      setEntries(entryItems);
      setFilteredEntries(entryItems);
      
      // Convert to JournalEntry format for parent using proper conversion
      const journalEntryFormat = entryItems.map(item => ({
        id: item.entry.id,
        date: item.entry.entry_date,
        blocks: convertSupabaseToBlocks(item.entry),
        createdAt: new Date(item.entry.created_at),
        updatedAt: new Date(item.entry.updated_at)
      }));
      
      onEntriesChange?.(journalEntryFormat);
      setLastLoadTime(Date.now());
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      if (!onLoadingStateChange) {
        setIsLoading(false);
      } else {
        onLoadingStateChange(false);
      }
    }
  }, [onLoadingStateChange, onEntriesChange]);

  const formatEntryDate = (dateStr: string): string => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredEntries(entries);
    } else {
      const filtered = entries.filter(({ entry }) =>
        entry.preview?.toLowerCase().includes(query.toLowerCase()) ||
        entry.entry_date.includes(query) ||
        entry.excited_about?.toLowerCase().includes(query.toLowerCase()) ||
        entry.make_today_great?.toLowerCase().includes(query.toLowerCase()) ||
        entry.must_not_do?.toLowerCase().includes(query.toLowerCase()) ||
        entry.grateful_for?.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(entry.biggest_wins) && entry.biggest_wins.some(win => win.toLowerCase().includes(query.toLowerCase()))) ||
        (Array.isArray(entry.tensions) && entry.tensions.some(tension => tension.toLowerCase().includes(query.toLowerCase())))
      );
      setFilteredEntries(filtered);
    }
  };

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Real-time subscription for entry list updates
  useEffect(() => {
    let subscription: any = null;

    const setupRealtimeSync = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Subscribe to changes in journal_entries table for the current user
        subscription = supabase
          .channel('entry_list_changes')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'journal_entries',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Entry list real-time update received:', payload);
              // Refresh the entry list when any journal entry changes
              loadEntries();
            }
          )
          .subscribe((status) => {
            console.log('Entry list subscription status:', status);
          });

      } catch (error) {
        console.error('Failed to setup entry list real-time sync:', error);
      }
    };

    setupRealtimeSync();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadEntries]);

  // Function to refresh entries (can be called from parent components)
  const refreshEntries = useCallback((): void => {
    loadEntries();
  }, [loadEntries]);

  // Expose refresh function via ref or callback
  useEffect((): (() => void) => {
    if (typeof window !== 'undefined') {
      window.refreshJournalEntries = refreshEntries;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.refreshJournalEntries;
      }
    };
  }, [refreshEntries]);

  // Register tab visibility callbacks with centralized system
  useEffect(() => {
    const callbackId = 'entryList';

    tabVisibility.registerCallbacks(callbackId, {
      onVisible: async (state) => {
        const hasNoEntries = entries.length === 0;
        const shouldRefreshData = tabVisibility.shouldRefresh(lastLoadTime);

        console.log('🔍 [EntryList] Tab became visible, checking refresh conditions:', {
          hasNoEntries,
          shouldRefreshData,
          wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000),
          entriesLength: entries.length,
          lastLoadTime: new Date(lastLoadTime).toLocaleTimeString()
        });

        // Refresh if:
        // 1. No entries are currently loaded
        // 2. shouldRefresh logic determines it's needed based on time thresholds
        if (hasNoEntries || shouldRefreshData) {
          console.log('✅ [EntryList] TRIGGERING REFRESH:', {
            hasNoEntries,
            shouldRefreshData,
            reason: hasNoEntries ? 'no entries loaded' : 'time threshold exceeded'
          });
          await loadEntries();
        } else {
          console.log('⏭️ [EntryList] No refresh needed:', {
            entriesCount: entries.length,
            wasHiddenDuration: Math.round(state.wasHiddenDuration / 1000)
          });
        }
      },
      onHidden: () => {
        console.log('🔍 [EntryList] Tab became hidden');
      }
    });

    return () => {
      tabVisibility.unregisterCallbacks(callbackId);
    };
  }, [tabVisibility, entries.length, lastLoadTime, loadEntries]);

  // const hasEntryContent = selectedEntry?.blocks?.some(block => block.text?.trim() !== '') || false;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Search Only */}
      <div className="p-4 border-b border-stone-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-stone-50 border-stone-200 focus:border-orange-400 focus:ring-orange-400 font-inknut"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {(isLoading || isParentLoading) ? (
          <div className="p-6 text-center font-inknut text-stone-500">
            <div className="animate-pulse">
              <div className="h-4 bg-stone-200 rounded w-24 mx-auto mb-2"></div>
              <div className="h-3 bg-stone-100 rounded w-32 mx-auto"></div>
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-6 text-center font-inknut text-stone-500">
            {searchQuery ? 'No entries match your search' : 'No journal entries yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredEntries.map(({ entry }) => (
              <EntryListItem
                key={entry.id}
                entry={entry}
                isSelected={selectedEntry?.id === entry.id}
                formatEntryDate={formatEntryDate}
                onSelect={onSelectEntry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
