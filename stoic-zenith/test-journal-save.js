// Test script to verify journal saving functionality
// Run this in the browser console after logging in

async function testJournalSave() {
  console.log('🧪 Testing journal save functionality...');
  
  try {
    // Import the journal functions
    const { createJournalEntry, updateJournalEntry } = await import('./src/lib/journal.js');
    
    // Test data
    const testEntry = {
      entry_date: new Date().toISOString().split('T')[0],
      entry_type: 'general',
      excited_about: 'Testing the journal save functionality',
      make_today_great: 'Fix the save issue',
      must_not_do: 'Give up on debugging',
      grateful_for: 'Having tools to debug',
      biggest_wins: ['Found the missing table issue'],
      tensions: ['Database migration problems'],
      mood_rating: 8,
      tags: ['test', 'debugging']
    };
    
    console.log('📝 Creating test journal entry...');
    const createdEntry = await createJournalEntry(testEntry);
    console.log('✅ Successfully created entry:', createdEntry);
    
    // Test update
    console.log('📝 Testing entry update...');
    const updatedEntry = await updateJournalEntry(createdEntry.id, {
      excited_about: 'Updated: Testing the journal save functionality',
      rich_text_content: [
        {
          id: `${createdEntry.id}-block-1`,
          type: 'paragraph',
          text: 'This is a test rich text block',
          createdAt: new Date()
        }
      ]
    });
    console.log('✅ Successfully updated entry:', updatedEntry);
    
    return { created: createdEntry, updated: updatedEntry };
    
  } catch (error) {
    console.error('❌ Journal save test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    // Check authentication
    const { supabase } = await import('./src/integrations/supabase/client.js');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.email : 'Not authenticated');
    
    // Check if table exists
    try {
      const { data, error: tableError } = await supabase
        .from('journal_entries')
        .select('count(*)')
        .limit(1);
      console.log('📊 Table check result:', { data, error: tableError });
    } catch (tableCheckError) {
      console.error('❌ Table check failed:', tableCheckError);
    }
    
    throw error;
  }
}

// Auto-run the test
testJournalSave()
  .then(result => {
    console.log('🎉 Journal save test completed successfully!', result);
  })
  .catch(error => {
    console.error('💥 Journal save test failed:', error);
  });
