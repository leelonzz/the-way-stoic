// Debug script to test journal save functionality
// Run this in the browser console to test the save pipeline

async function testJournalSave() {
  console.log('🔍 Testing journal save functionality...');
  
  // Test 1: Check localStorage format
  console.log('\n1️⃣ Testing localStorage format...');
  const today = new Date().toISOString().split('T')[0];
  const dateKey = `journal-${today}`;
  const dateKeyValue = localStorage.getItem(dateKey);
  
  console.log('Date key:', dateKey);
  console.log('Date key value:', dateKeyValue);
  
  if (dateKeyValue && dateKeyValue.startsWith('journal-entry-')) {
    const entryData = localStorage.getItem(dateKeyValue);
    console.log('Entry data exists:', !!entryData);
    if (entryData) {
      try {
        const parsed = JSON.parse(entryData);
        console.log('Entry ID:', parsed.id);
        console.log('Entry date:', parsed.date);
        console.log('Blocks count:', parsed.blocks?.length || 0);
        console.log('Last updated:', parsed.updatedAt);
      } catch (e) {
        console.error('Failed to parse entry data:', e);
      }
    }
  }
  
  // Test 2: Check Supabase authentication
  console.log('\n2️⃣ Testing Supabase authentication...');
  try {
    const { supabase } = await import('./src/integrations/supabase/client.js');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Auth error:', error);
      return;
    }
    
    if (!user) {
      console.error('❌ No authenticated user');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Test 3: Test database connectivity
    console.log('\n3️⃣ Testing database connectivity...');
    const { data: entries, error: dbError } = await supabase
      .from('journal_entries')
      .select('id, entry_date, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }
    
    console.log('✅ Database accessible, recent entries:', entries?.length || 0);
    entries?.forEach(entry => {
      console.log(`  - ${entry.entry_date}: ${entry.id} (updated: ${entry.updated_at})`);
    });
    
    // Test 4: Test save function
    console.log('\n4️⃣ Testing save function...');
    if (dateKeyValue && dateKeyValue.startsWith('journal-entry-')) {
      const entryData = localStorage.getItem(dateKeyValue);
      if (entryData) {
        const parsed = JSON.parse(entryData);
        
        // Add a test block
        const testBlock = {
          id: `${parsed.id}-test-${Date.now()}`,
          type: 'paragraph',
          text: `Test save at ${new Date().toLocaleTimeString()}`,
          createdAt: new Date()
        };
        
        const updatedBlocks = [...(parsed.blocks || []), testBlock];
        
        try {
          const { updateJournalEntryFromBlocks } = await import('./src/lib/journal.js');
          const result = await updateJournalEntryFromBlocks(parsed.id, updatedBlocks);
          console.log('✅ Save test successful:', result.id);
          
          // Update localStorage with test block
          const updatedEntry = { ...parsed, blocks: updatedBlocks, updatedAt: new Date() };
          localStorage.setItem(dateKeyValue, JSON.stringify(updatedEntry));
          console.log('✅ localStorage updated with test block');
          
        } catch (saveError) {
          console.error('❌ Save test failed:', saveError);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testJournalSave();
