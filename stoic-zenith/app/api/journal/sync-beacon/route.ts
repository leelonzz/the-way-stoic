import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server';

interface SyncData {
  entryId: string;
  entry: {
    id: string;
    date: string;
    blocks: unknown[];
    createdAt: Date;
    updatedAt: Date;
    characterCount: number;
    wordCount: number;
  };
  operation: 'create' | 'update';
}

interface BeaconSyncRequest {
  userId: string;
  syncData: SyncData[];
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Parse the beacon data
    const body: BeaconSyncRequest = await request.json();
    const { userId, syncData, timestamp } = body;

    if (!userId || !syncData || !Array.isArray(syncData)) {
      return NextResponse.json(
        { error: 'Invalid beacon sync data' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = [];
    
    // Process each sync item
    for (const syncItem of syncData) {
      try {
        const { entryId, entry, operation } = syncItem;
        
        if (operation === 'create' && entryId.startsWith('temp-')) {
          // Check for duplicates first
          const { data: existingEntries } = await supabase
            .from('journal_entries')
            .select('id, entry_date, created_at')
            .eq('user_id', userId)
            .eq('entry_date', entry.date);

          const duplicateEntry = existingEntries?.find(dbEntry =>
            Math.abs(new Date(dbEntry.created_at).getTime() - entry.createdAt.getTime()) < 5000
          );

          if (duplicateEntry) {
            results.push({
              entryId,
              status: 'duplicate_found',
              databaseId: duplicateEntry.id
            });
            continue;
          }

          // Create new entry
          const { data: newEntry, error: createError } = await supabase
            .from('journal_entries')
            .insert({
              user_id: userId,
              entry_date: entry.date,
              blocks: entry.blocks,
              character_count: entry.characterCount,
              word_count: entry.wordCount,
              created_at: entry.createdAt.toISOString(),
              updated_at: entry.updatedAt.toISOString()
            })
            .select()
            .single();

          if (createError) {
            results.push({
              entryId,
              status: 'error',
              error: createError.message
            });
          } else {
            results.push({
              entryId,
              status: 'created',
              databaseId: newEntry.id
            });
          }
        } else if (operation === 'update') {
          // Update existing entry
          const { error: updateError } = await supabase
            .from('journal_entries')
            .update({
              blocks: entry.blocks,
              character_count: entry.characterCount,
              word_count: entry.wordCount,
              updated_at: entry.updatedAt.toISOString()
            })
            .eq('id', entryId)
            .eq('user_id', userId);

          if (updateError) {
            results.push({
              entryId,
              status: 'error',
              error: updateError.message
            });
          } else {
            results.push({
              entryId,
              status: 'updated'
            });
          }
        }
      } catch (itemError) {
        results.push({
          entryId: syncItem.entryId,
          status: 'error',
          error: itemError instanceof Error ? itemError.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: syncData.length,
      results,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Beacon sync error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
