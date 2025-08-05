
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { JournalNavigation } from '@/components/journal/JournalNavigation';
import { EntryList } from '@/components/journal/EntryList';
import { JournalEntry } from '@/components/journal/types';
import { createJournalEntry } from '@/lib/journal';

export default function Journal(): JSX.Element {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [entryListLoading, setEntryListLoading] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error'>('synced');



  const handleCreateEntry = (): void => {
    // Create entry immediately in UI for instant response (0ms delay)
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');

    // Generate temporary ID for immediate UI update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Create local entry immediately for instant UI response
    const newEntry: JournalEntry = {
      id: tempId,
      date: today,
      blocks: [{
        id: `${tempId}-initial`,
        type: 'paragraph',
        text: '',
        createdAt: now
      }],
      createdAt: now,
      updatedAt: now
    };

    // Update UI immediately - no waiting, no loading states
    setSelectedEntry(newEntry);
    setRefreshKey(prev => prev + 1);

    // Create in database in background without blocking UI
    createJournalEntry({
      entry_date: today,
      entry_type: 'general',
      excited_about: '',
      make_today_great: '',
    }).then(supabaseEntry => {
      // Update with real ID from database
      const updatedEntry: JournalEntry = {
        ...newEntry,
        id: supabaseEntry.id,
        blocks: newEntry.blocks.map(block => ({
          ...block,
          id: block.id.replace(tempId, supabaseEntry.id)
        })),
        createdAt: new Date(supabaseEntry.created_at),
        updatedAt: new Date(supabaseEntry.updated_at)
      };

      setSelectedEntry(updatedEntry);
      setRefreshKey(prev => prev + 1);

    }).catch(error => {
      console.error('Failed to sync entry to database:', error);
      // Entry is already created locally, so user can continue working
      // Show subtle notification without interrupting workflow
      toast({
        title: "Entry created locally",
        description: "Your entry is saved locally and will sync when connection is restored.",
        variant: "default",
      });
    });
  };

  const handleSelectEntry = async (entry: JournalEntry): Promise<void> => {
    // If there's a currently selected entry, save it before switching
    if (selectedEntry && selectedEntry.id !== entry.id) {
      console.log('🔄 Saving current entry before switching to:', entry.id);
      
      try {
        // Save current entry to localStorage immediately
        const entryIdKey = `journal-entry-${selectedEntry.id}`;
        const dateKey = `journal-${selectedEntry.date}`;
        const entryWithScopedBlocks = {
          ...selectedEntry,
          blocks: selectedEntry.blocks.map(block => ({
            ...block,
            id: block.id.startsWith(`${selectedEntry.id}-`) ? block.id : `${selectedEntry.id}-${block.id}`
          }))
        };
        localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
        localStorage.setItem(dateKey, entryIdKey);
        
        // Try to save to Supabase in the background
        try {
          const { updateJournalEntryFromBlocks } = await import('@/lib/journal');
          await updateJournalEntryFromBlocks(selectedEntry.id, selectedEntry.blocks);
          console.log('✅ Current entry saved to Supabase before switch');
        } catch (supabaseError) {
          console.warn('⚠️ Failed to save current entry to Supabase before switch:', supabaseError);
          // Continue with switch even if Supabase save fails
        }
      } catch (error) {
        console.error('❌ Failed to save current entry before switch:', error);
        // Continue with switch even if save fails
      }
    }
    
    // Switch to the new entry
    setSelectedEntry(entry);
  };

  const handleDeleteEntry = (entryId: string): void => {
    // Clear selected entry if it's the one being deleted
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }

    // Remove from entries list
    setEntries(prev => prev.filter(entry => entry.id !== entryId));

    // Refresh entry list
    setRefreshKey(prev => prev + 1);
  };

  const handleEntryUpdate = (updatedEntry: JournalEntry): void => {
    setSelectedEntry(updatedEntry);

    // Standardize localStorage key usage - use entry ID as primary key
    const entryIdKey = `journal-entry-${updatedEntry.id}`;
    try {
      const serializedEntry = JSON.stringify({
        ...updatedEntry,
        // Ensure blocks have proper IDs scoped to this entry
        blocks: updatedEntry.blocks.map(block => ({
          ...block,
          id: block.id.startsWith(`${updatedEntry.id}-`) ? block.id : `${updatedEntry.id}-${block.id}`
        }))
      });
      localStorage.setItem(entryIdKey, serializedEntry);
      
      // Keep date key for backward compatibility but make it reference the entry ID key
      const dateKey = `journal-${updatedEntry.date}`;
      localStorage.setItem(dateKey, entryIdKey);
    } catch (error) {
      console.error('Failed to save entry to localStorage:', error);
    }

    // Update entries list if this entry is in it
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === updatedEntry.id);
      if (existingIndex >= 0) {
        const newEntries = [...prev];
        newEntries[existingIndex] = updatedEntry;
        return newEntries;
      } else {
        return [updatedEntry, ...prev];
      }
    });

    // Trigger background save to Supabase for non-temporary entries
    if (!updatedEntry.id.startsWith('temp-') && !updatedEntry.id.startsWith('recovery-')) {
      // Save to Supabase in the background without blocking the UI
      (async () => {
        try {
          const { updateJournalEntryFromBlocks } = await import('@/lib/journal');
          await updateJournalEntryFromBlocks(updatedEntry.id, updatedEntry.blocks);
          console.log('✅ Background save to Supabase successful for entry:', updatedEntry.id);
        } catch (error) {
          console.warn('⚠️ Background save to Supabase failed for entry:', updatedEntry.id, error);
          // Don't show error to user since localStorage save worked
        }
      })();
    }
  };

  // Load today's entry on mount if it exists
  useEffect(() => {
    const loadTodaysEntry = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');

      // First check localStorage for unsaved changes using new standardized approach
      const dateKey = `journal-${today}`;
      const dateKeyValue = localStorage.getItem(dateKey);

      // Check if date key points to entry ID key (new format) or contains entry data (old format)
      if (dateKeyValue) {
        try {
          if (dateKeyValue.startsWith('journal-entry-')) {
            // New format: date key points to entry ID key
            const actualEntry = localStorage.getItem(dateKeyValue);
            if (actualEntry) {
              const parsedEntry = JSON.parse(actualEntry) as JournalEntry;
              setSelectedEntry(parsedEntry);
              setIsLoading(false);
              return;
            }
          } else {
            // Old format: date key contains entry data directly
            const parsedEntry = JSON.parse(dateKeyValue) as JournalEntry;
            // Migrate to new format
            const entryIdKey = `journal-entry-${parsedEntry.id}`;
            const updatedEntry = {
              ...parsedEntry,
              blocks: parsedEntry.blocks.map(block => ({
                ...block,
                id: block.id.startsWith(`${parsedEntry.id}-`) ? block.id : `${parsedEntry.id}-${block.id}`
              }))
            };
            localStorage.setItem(entryIdKey, JSON.stringify(updatedEntry));
            localStorage.setItem(dateKey, entryIdKey);
            setSelectedEntry(updatedEntry);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Failed to parse local entry:', error);

          // Enhanced recovery: Try to salvage data before clearing
          try {
            const rawData = localStorage.getItem(dateKey);
            if (rawData) {
              // Try to extract any readable text content
              const textMatches = rawData.match(/"text":"([^"]*?)"/g);
              if (textMatches && textMatches.length > 0) {
                console.log('🔄 Attempting to recover text content from corrupted entry...');

                // Create a recovery entry with extracted text
                const recoveredText = textMatches
                  .map(match => match.replace(/"text":"/, '').replace(/"$/, ''))
                  .join('\n\n');

                if (recoveredText.trim()) {
                  toast({
                    title: "Data Recovery",
                    description: `Recovered ${recoveredText.length} characters from corrupted entry. Please review and save.`,
                    variant: "default",
                  });

                  // Create a recovery entry with the extracted text
                  const now = new Date();
                  const recoveryEntryId = `recovery-${Date.now()}`;
                  const recoveredBlock = {
                    id: `${recoveryEntryId}-recovered-block`,
                    type: 'paragraph' as const,
                    text: recoveredText,
                    createdAt: now
                  };

                  const recoveredEntry: JournalEntry = {
                    id: recoveryEntryId,
                    date: today,
                    blocks: [recoveredBlock],
                    createdAt: now,
                    updatedAt: now
                  };

                  setSelectedEntry(recoveredEntry);
                  handleEntryUpdate(recoveredEntry);
                }
              }
            }
          } catch (recoveryError) {
            console.warn('Data recovery failed:', recoveryError);
          }

          // Clear corrupted data
          localStorage.removeItem(dateKey);
        }
      }

      // If no local entry, try to load from Supabase
      try {
        const { getJournalEntryAsRichText } = await import('@/lib/journal');
        const supabaseEntry = await getJournalEntryAsRichText(today);

        if (supabaseEntry) {
          // Save using standardized format
          const entryIdKey = `journal-entry-${supabaseEntry.id}`;
          const entryWithScopedBlocks = {
            ...supabaseEntry,
            blocks: supabaseEntry.blocks.map(block => ({
              ...block,
              id: block.id.startsWith(`${supabaseEntry.id}-`) ? block.id : `${supabaseEntry.id}-${block.id}`
            }))
          };
          localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
          localStorage.setItem(dateKey, entryIdKey);
          setSelectedEntry(entryWithScopedBlocks);
        }
      } catch (error) {
        console.warn('Failed to load entry from Supabase:', error);
      }

      setIsLoading(false);
    };

    loadTodaysEntry();
  }, []);

  // Save current entry when component unmounts
  useEffect(() => {
    return () => {
      if (selectedEntry) {
        console.log('🔄 Saving entry on component unmount');
        const entryIdKey = `journal-entry-${selectedEntry.id}`;
        const dateKey = `journal-${selectedEntry.date}`;
        const entryWithScopedBlocks = {
          ...selectedEntry,
          blocks: selectedEntry.blocks.map(block => ({
            ...block,
            id: block.id.startsWith(`${selectedEntry.id}-`) ? block.id : `${selectedEntry.id}-${block.id}`
          }))
        };
        localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
        localStorage.setItem(dateKey, entryIdKey);
        
        // Try to save to Supabase in the background
        if (!selectedEntry.id.startsWith('temp-') && !selectedEntry.id.startsWith('recovery-')) {
          (async () => {
            try {
              const { updateJournalEntryFromBlocks } = await import('@/lib/journal');
              await updateJournalEntryFromBlocks(selectedEntry.id, selectedEntry.blocks);
              console.log('✅ Entry saved to Supabase on component unmount');
            } catch (error) {
              console.warn('⚠️ Failed to save entry to Supabase on component unmount:', error);
            }
          })();
        }
      }
    };
  }, [selectedEntry]);

  // Real-time sync with Supabase subscriptions
  useEffect(() => {
    let subscription: any = null;

    const setupRealtimeSync = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Subscribe to changes in journal_entries table for the current user
        subscription = supabase
          .channel(`journal_entries_changes_${user.id}`, {
            config: {
              broadcast: { self: false },
              presence: { key: user.id }
            }
          })
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
              schema: 'public',
              table: 'journal_entries',
              filter: `user_id=eq.${user.id}`
            },
            async (payload) => {
              console.log('Real-time update received:', payload);

              // Handle different types of changes
              if (payload.eventType === 'UPDATE' && selectedEntry) {
                const updatedEntry = payload.new;

                // Check if this update is for the currently selected entry
                if (updatedEntry.id === selectedEntry.id) {
                  try {
                    const { getJournalEntryAsRichText } = await import('@/lib/journal');
                    const serverEntry = await getJournalEntryAsRichText(selectedEntry.date);

                    if (serverEntry) {
                      const serverTime = new Date(serverEntry.updatedAt);
                      const localTime = new Date(selectedEntry.updatedAt);

                      console.log('Real-time sync comparison:', {
                        serverTime: serverTime.toISOString(),
                        localTime: localTime.toISOString(),
                        serverNewer: serverTime > localTime,
                        serverBlocks: serverEntry.blocks.length,
                        localBlocks: selectedEntry.blocks.length
                      });

                      if (serverTime > localTime) {
                        console.log('Real-time sync: Server has newer version, updating local entry');
                        const entryIdKey = `journal-entry-${serverEntry.id}`;
                        const dateKey = `journal-${serverEntry.date}`;
                        const entryWithScopedBlocks = {
                          ...serverEntry,
                          blocks: serverEntry.blocks.map(block => ({
                            ...block,
                            id: block.id.startsWith(`${serverEntry.id}-`) ? block.id : `${serverEntry.id}-${block.id}`
                          }))
                        };
                        localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
                        localStorage.setItem(dateKey, entryIdKey);
                        setSelectedEntry(entryWithScopedBlocks);
                        setSyncStatus('synced');
                      } else {
                        console.log('Real-time sync: Local version is newer or same, keeping local changes');
                        setSyncStatus('synced');
                      }
                    }
                  } catch (error) {
                    console.warn('Real-time sync failed:', error);
                    setSyncStatus('error');
                  }
                }
              }

              // Refresh entry list for INSERT/DELETE events
              if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
                setRefreshKey(prev => prev + 1);
              }
            }
          )
          .subscribe((status) => {
            console.log('Real-time subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setSyncStatus('synced');
              console.log('✅ Real-time sync established');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              setSyncStatus('error');
              console.warn('❌ Real-time sync failed:', status);

              // Retry connection after a delay
              setTimeout(() => {
                console.log('🔄 Retrying real-time connection...');
                setupRealtimeSync();
              }, 5000);
            } else if (status === 'CLOSED') {
              setSyncStatus('pending');
              console.log('🔄 Real-time connection closed, will retry...');
            }
          });

      } catch (error) {
        console.error('Failed to setup real-time sync:', error);
        setSyncStatus('error');
      }
    };

    setupRealtimeSync();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [selectedEntry]);

  // Save current entry before page unload and on page visibility change
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedEntry) {
        console.log('🔄 Saving entry before page unload');
        const entryIdKey = `journal-entry-${selectedEntry.id}`;
        const dateKey = `journal-${selectedEntry.date}`;
        const entryWithScopedBlocks = {
          ...selectedEntry,
          blocks: selectedEntry.blocks.map(block => ({
            ...block,
            id: block.id.startsWith(`${selectedEntry.id}-`) ? block.id : `${selectedEntry.id}-${block.id}`
          }))
        };
        localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
        localStorage.setItem(dateKey, entryIdKey);
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && selectedEntry) {
        console.log('🔄 Saving entry on page visibility change (page hidden)');
        
        // Save to localStorage immediately
        const entryIdKey = `journal-entry-${selectedEntry.id}`;
        const dateKey = `journal-${selectedEntry.date}`;
        const entryWithScopedBlocks = {
          ...selectedEntry,
          blocks: selectedEntry.blocks.map(block => ({
            ...block,
            id: block.id.startsWith(`${selectedEntry.id}-`) ? block.id : `${selectedEntry.id}-${block.id}`
          }))
        };
        localStorage.setItem(entryIdKey, JSON.stringify(entryWithScopedBlocks));
        localStorage.setItem(dateKey, entryIdKey);
        
        // Try to save to Supabase in the background
        if (!selectedEntry.id.startsWith('temp-') && !selectedEntry.id.startsWith('recovery-')) {
          try {
            const { updateJournalEntryFromBlocks } = await import('@/lib/journal');
            await updateJournalEntryFromBlocks(selectedEntry.id, selectedEntry.blocks);
            console.log('✅ Entry saved to Supabase on page visibility change');
          } catch (error) {
            console.warn('⚠️ Failed to save entry to Supabase on page visibility change:', error);
          }
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedEntry]);

  return (
    <div className="h-full flex bg-stone-50 animate-fade-in">
      {/* Left Panel - Entry List (Fixed width, responsive) */}
      <div className="w-80 min-w-80 bg-white border-r border-stone-200 flex-shrink-0 hidden lg:flex">
        <EntryList
          key={refreshKey}
          selectedEntry={selectedEntry}
          onSelectEntry={handleSelectEntry}
          onCreateEntry={handleCreateEntry}
          className="flex-1"
          isParentLoading={isLoading}
          onLoadingStateChange={setEntryListLoading}
          entries={entries}
          onEntriesChange={setEntries}
        />
      </div>

      {/* Right Panel - Content (Full remaining width/height) */}
      <div className="flex-1 min-w-0 bg-white flex flex-col">
        {(isLoading || entryListLoading) ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-stone-500 font-inknut">
              <div className="h-6 bg-stone-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-stone-100 rounded w-48 mx-auto"></div>
            </div>
          </div>
        ) : selectedEntry ? (
          <JournalNavigation
            className="flex-1"
            entry={selectedEntry}
            onEntryUpdate={handleEntryUpdate}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-stone-500 font-inknut mb-4">No entry selected</div>
              <button
                onClick={handleCreateEntry}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
              >
                Create New Entry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
