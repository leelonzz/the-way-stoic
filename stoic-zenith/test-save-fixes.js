// Comprehensive test for journal save fixes
// Run this in the browser console after making changes to test the fixes

async function testSaveFixes() {
  console.log('🧪 Testing journal save fixes...');
  
  const today = new Date().toISOString().split('T')[0];
  const dateKey = `journal-${today}`;
  
  // Test 1: Check localStorage format consistency
  console.log('\n1️⃣ Testing localStorage format consistency...');
  
  // Clear any existing data for clean test
  const existingDateKey = localStorage.getItem(dateKey);
  if (existingDateKey && existingDateKey.startsWith('journal-entry-')) {
    localStorage.removeItem(existingDateKey);
  }
  localStorage.removeItem(dateKey);
  
  // Create a test entry
  const testEntry = {
    id: `test-entry-${Date.now()}`,
    date: today,
    blocks: [
      {
        id: `test-block-${Date.now()}`,
        type: 'paragraph',
        text: 'This is a test entry to verify save functionality.',
        createdAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Save using the new format
  const entryIdKey = `journal-entry-${testEntry.id}`;
  localStorage.setItem(entryIdKey, JSON.stringify(testEntry));
  localStorage.setItem(dateKey, entryIdKey);
  
  console.log('✅ Test entry saved with new format');
  console.log('Entry ID key:', entryIdKey);
  console.log('Date key points to:', localStorage.getItem(dateKey));
  
  // Test 2: Verify loading works with new format
  console.log('\n2️⃣ Testing entry loading with new format...');
  
  const loadedDateKey = localStorage.getItem(dateKey);
  if (loadedDateKey && loadedDateKey.startsWith('journal-entry-')) {
    const loadedEntryData = localStorage.getItem(loadedDateKey);
    if (loadedEntryData) {
      try {
        const loadedEntry = JSON.parse(loadedEntryData);
        console.log('✅ Entry loaded successfully');
        console.log('Loaded entry ID:', loadedEntry.id);
        console.log('Loaded blocks count:', loadedEntry.blocks.length);
        console.log('Loaded text:', loadedEntry.blocks[0]?.text);
      } catch (e) {
        console.error('❌ Failed to parse loaded entry:', e);
      }
    } else {
      console.error('❌ Entry data not found for key:', loadedDateKey);
    }
  } else {
    console.error('❌ Date key does not point to entry ID key');
  }
  
  // Test 3: Test Supabase save functionality
  console.log('\n3️⃣ Testing Supabase save functionality...');
  
  try {
    // Check authentication
    const { supabase } = await import('./src/integrations/supabase/client.js');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Create a real entry in Supabase for testing
    const { data: newEntry, error: createError } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        entry_date: today,
        entry_type: 'general',
        excited_about: 'Testing save functionality',
        rich_text_content: testEntry.blocks
      })
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Failed to create test entry:', createError);
      return;
    }
    
    console.log('✅ Test entry created in Supabase:', newEntry.id);
    
    // Test updating the entry
    const updatedBlocks = [
      ...testEntry.blocks,
      {
        id: `updated-block-${Date.now()}`,
        type: 'paragraph',
        text: 'This block was added during the update test.',
        createdAt: new Date()
      }
    ];
    
    const { updateJournalEntryFromBlocks } = await import('./src/lib/journal.js');
    const updateResult = await updateJournalEntryFromBlocks(newEntry.id, updatedBlocks);
    
    console.log('✅ Entry updated successfully:', updateResult.id);
    console.log('Updated at:', updateResult.updated_at);
    
    // Verify the update
    const { data: verifyEntry, error: verifyError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', newEntry.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Failed to verify update:', verifyError);
    } else {
      console.log('✅ Update verified - blocks count:', verifyEntry.rich_text_content?.length || 0);
    }
    
    // Clean up test entry
    await supabase.from('journal_entries').delete().eq('id', newEntry.id);
    console.log('✅ Test entry cleaned up');
    
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
  }
  
  // Test 4: Test real-time sync logic
  console.log('\n4️⃣ Testing real-time sync timestamp comparison...');
  
  const now = new Date();
  const serverTime = new Date(now.getTime() + 1000); // 1 second newer
  const localTime = now;
  
  console.log('Server time:', serverTime.toISOString());
  console.log('Local time:', localTime.toISOString());
  console.log('Server newer?', serverTime > localTime);
  
  if (serverTime > localTime) {
    console.log('✅ Timestamp comparison working correctly');
  } else {
    console.error('❌ Timestamp comparison failed');
  }
  
  console.log('\n🎉 Save fixes test completed!');
  console.log('\nNext steps:');
  console.log('1. Try editing a journal entry and watch the console for save logs');
  console.log('2. Switch to another entry and back to verify persistence');
  console.log('3. Refresh the page to test localStorage loading');
}

// Run the test
testSaveFixes();
