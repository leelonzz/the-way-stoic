import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, isToday, isYesterday, differenceInDays, startOfDay } from 'date-fns';
import { Search, Plus } from 'lucide-react';
import { EntryListItem } from './EntryListItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { JournalEntry } from './types';
import type { RealTimeJournalManager } from '@/lib/journal';
import { useTabVisibility } from '@/hooks/useTabVisibility';
import { toast } from '@/components/ui/use-toast';

interface EntryListProps {
  selectedEntry: JournalEntry | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onCreateEntry: () => void;
  onDeleteEntry?: (entryId: string) => void;
  className?: string;
  isParentLoading?: boolean;
  onLoadingStateChange?: (loading: boolean) => void;
  entries?: JournalEntry[];
  onEntriesChange?: (entries: JournalEntry[]) => void;
  syncStatus?: 'synced' | 'pending' | 'error';
  onRetrySync?: () => void;
  journalManager: RealTimeJournalManager;
}

interface EntryListItemData {
  entry: JournalEntry & { preview?: string };
  dateKey: string;
}

interface GroupedEntries {
  groupName: string;
  entries: EntryListItemData[];
  order: number;
  groupType: 'today' | 'yesterday' | 'previous7days' | 'previous30days' | 'older';
}

export const EntryList = React.memo(function EntryList({
  selectedEntry,
  onSelectEntry,
  onCreateEntry,
  onDeleteEntry,
  className = '',
  isParentLoading: _isParentLoading = false,
  onLoadingStateChange,
  entries: parentEntries,
  onEntriesChange,
  syncStatus: _syncStatus = 'synced',
  onRetrySync: _onRetrySync,
  journalManager
}: EntryListProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Use centralized tab visibility management
  const tabVisibility = useTabVisibility({ refreshThreshold: 2000 });

  // Convert parent entries to EntryListItemData format
  const processEntries = useCallback((journalEntries: JournalEntry[]): EntryListItemData[] => {
    // Filter out entries that appear to be test/debug entries with timestamp text
    // But allow empty entries to be deletable
    const filteredJournalEntries = journalEntries.filter(entry => {
      const timestampPattern = /^Entry created at \d{1,2}:\d{2}:\d{2}$/;
      const isTimestampEntry = entry.blocks.some(block =>
        timestampPattern.test(block.text || '')
      );

      // Allow empty entries (they should be deletable)
      // Only filter out timestamp-only entries
      return !isTimestampEntry;
    });

    // Sort entries by creation timestamp in descending order (newest first)
    const sortedEntries = filteredJournalEntries.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return sortedEntries.map(entry => {
      // Generate preview from journal entry blocks
      const contentParts = entry.blocks
        .map(block => block.text)
        .filter(Boolean);

      const preview = contentParts.join(' ').slice(0, 80);

      return {
        entry: {
          ...entry,
          preview
        },
        dateKey: entry.date
      };
    });
  }, []);

  // Group entries by date ranges
  const groupEntriesByDateRange = useCallback((entries: EntryListItemData[]): GroupedEntries[] => {
    const now = new Date();
    const today = startOfDay(now);

    const groups: Record<string, GroupedEntries> = {};

    entries.forEach(({ entry, dateKey }) => {
      const entryDate = startOfDay(entry.createdAt);
      const daysDiff = differenceInDays(today, entryDate);

      let groupName: string;
      let groupType: GroupedEntries['groupType'];
      let order: number;

      if (isToday(entry.createdAt)) {
        groupName = 'Today';
        groupType = 'today';
        order = 0;
      } else if (isYesterday(entry.createdAt)) {
        groupName = 'Yesterday';
        groupType = 'yesterday';
        order = 1;
      } else if (daysDiff >= 2 && daysDiff <= 7) {
        groupName = 'Previous 7 Days';
        groupType = 'previous7days';
        order = 2;
      } else if (daysDiff >= 8 && daysDiff <= 30) {
        groupName = 'Previous 30 Days';
        groupType = 'previous30days';
        order = 3;
      } else {
        // Group older entries by month
        groupName = format(entry.createdAt, 'MMMM yyyy');
        groupType = 'older';
        // Order by year and month (newer first)
        const year = entry.createdAt.getFullYear();
        const month = entry.createdAt.getMonth();
        order = 1000 - (year * 12 + month);
      }

      if (!groups[groupName]) {
        groups[groupName] = {
          groupName,
          entries: [],
          order,
          groupType
        };
      }

      groups[groupName].entries.push({ entry, dateKey });
    });

    // Sort entries within each group (most recent first)
    Object.values(groups).forEach(group => {
      group.entries.sort((a, b) =>
        new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime()
      );
    });

    // Return groups sorted by order
    return Object.values(groups).sort((a, b) => a.order - b.order);
  }, []);

  // Get appropriate date display format based on group type
  const getDateDisplayForEntry = useCallback((entry: JournalEntry, groupType: GroupedEntries['groupType']): string => {
    try {
      switch (groupType) {
        case 'today':
        case 'yesterday':
          return format(entry.createdAt, 'h:mm a');
        case 'previous7days':
          return format(entry.createdAt, 'EEEE');
        case 'previous30days':
        case 'older':
          return format(entry.createdAt, 'MMM d, yyyy');
        default:
          return format(entry.createdAt, 'MMM d, yyyy');
      }
    } catch (error) {
      console.warn('Invalid date format:', entry.createdAt, error);
      return 'Unknown Date';
    }
  }, []);

  // Use parent entries if provided, otherwise load from manager
  const entries = useMemo(() => {
    if (parentEntries && parentEntries.length >= 0) {
      return processEntries(parentEntries);
    }
    return [];
  }, [parentEntries, processEntries]);

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) {
      return entries;
    }

    return entries.filter(({ entry }) =>
      entry.preview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.includes(searchQuery) ||
      entry.blocks.some(block =>
        block.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [entries, searchQuery]);

  // Group filtered entries by date ranges
  const groupedEntries = useMemo(() => {
    return groupEntriesByDateRange(filteredEntries);
  }, [filteredEntries, groupEntriesByDateRange]);

  const loadEntries = useCallback(async () => {
    // Only load entries if parent doesn't provide them
    if (parentEntries !== undefined) {
      return;
    }

    if (!onLoadingStateChange) {
      setIsLoading(true);
    } else {
      onLoadingStateChange(true);
    }

    try {
      // Use the real-time manager to get entries
      const journalEntries = await journalManager.getAllEntries();

      // Update parent with entries
      onEntriesChange?.(journalEntries);

    } catch (error) {
      console.error('Failed to load entries:', error);
      toast({
        title: "Failed to load entries",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      if (!onLoadingStateChange) {
        setIsLoading(false);
      } else {
        onLoadingStateChange(false);
      }
    }
  }, [onLoadingStateChange, onEntriesChange, parentEntries, processEntries, journalManager]);

  // Load entries on mount and when tab becomes visible
  useEffect(() => {
    if (tabVisibility.isVisible) {
      loadEntries();
    }
  }, [loadEntries, tabVisibility.isVisible]);

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };



  const handleDeleteEntry = async (entryId: string): Promise<void> => {
    try {
      if (onDeleteEntry) {
        await onDeleteEntry(entryId);
      }
      // Refresh entries after deletion only if we're managing our own entries
      if (parentEntries === undefined) {
        await loadEntries();
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-800">Journal Entries</h2>
          <Button
            onClick={() => {
              console.log('🔄 New Entry button clicked');
              onCreateEntry();
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Sync Status */}
        {/* <div className="mt-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'synced' ? 'bg-green-500' :
            syncStatus === 'pending' ? 'bg-yellow-500' :
            'bg-red-500'
          }`} />
          <span className="text-xs text-stone-500">
            {syncStatus === 'synced' ? 'Synced' :
             syncStatus === 'pending' ? 'Syncing...' :
             'Sync failed'}
          </span>
          {syncStatus === 'error' && onRetrySync && (
            <button
              onClick={onRetrySync}
              className="text-xs text-blue-600 hover:text-blue-800 underline ml-1"
            >
              Retry
            </button>
          )}
        </div> */}
      </div>

      {/* Entries List - Scrollable content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 journal-entry-list-scroll">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-800 mx-auto mb-2"></div>
            <p className="text-sm text-stone-600">Loading entries...</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-stone-600">No entries found</p>
          </div>
        ) : (
          <div className="p-2">
            {groupedEntries.map((group) => (
              <div key={group.groupName} className="mb-4">
                {/* Group Header */}
                <div className="px-2 py-2 mb-2">
                  <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                    {group.groupName}
                  </h3>
                </div>

                {/* Group Entries */}
                <div className="space-y-1">
                  {group.entries.map(({ entry }) => (
                    <EntryListItem
                      key={entry.id}
                      entry={entry}
                      isSelected={selectedEntry?.id === entry.id}
                      onSelect={() => onSelectEntry(entry)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                      dateLabel={getDateDisplayForEntry(entry, group.groupType)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
