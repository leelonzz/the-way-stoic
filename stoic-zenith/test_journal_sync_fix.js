/**
 * Test script to verify journal synchronization fix
 * Run this in the browser console on the journal page
 */

async function testJournalSyncFix() {
  console.log('🧪 Testing Journal Synchronization Fix...\n');
  
  // Test 1: Check if user is authenticated
  console.log('📋 Test 1: User Authentication');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated. Please log in first.');
      return;
    }
    console.log('✅ User authenticated:', user.id);
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return;
  }
  
  // Test 2: Check FastSync Manager initialization
  console.log('\n📋 Test 2: FastSync Manager Status');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    
    if (!manager) {
      console.error('❌ Journal manager not available');
      return;
    }
    
    const isFastSyncActive = manager.isFastSyncActive();
    console.log(`FastSync Status: ${isFastSyncActive ? '✅ ACTIVE' : '❌ INACTIVE'}`);
    
    if (!isFastSyncActive) {
      console.log('🔧 Attempting to enable FastSync...');
      manager.setFastSyncEnabled(true);
      const newStatus = manager.isFastSyncActive();
      console.log(`FastSync Status after enable: ${newStatus ? '✅ ACTIVE' : '❌ STILL INACTIVE'}`);
    }
  } catch (error) {
    console.error('❌ FastSync check failed:', error);
  }
  
  // Test 3: Create a new journal entry
  console.log('\n📋 Test 3: Create New Journal Entry');
  let testEntryId = null;
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    
    const testDate = new Date().toISOString();
    const newEntry = manager.createEntryImmediately(testDate, 'general');
    testEntryId = newEntry.id;
    
    console.log('✅ Created new entry:', testEntryId);
    console.log('Entry details:', {
      id: newEntry.id,
      date: newEntry.date,
      blocks: newEntry.blocks.length,
      isTemp: newEntry.id.startsWith('temp')
    });
  } catch (error) {
    console.error('❌ Entry creation failed:', error);
    return;
  }
  
  // Test 4: Test real-time saving
  console.log('\n📋 Test 4: Test Real-time Saving');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    
    // Create test blocks with content
    const testBlocks = [
      {
        id: `${testEntryId}-block-1`,
        type: 'paragraph',
        text: 'This is a test entry to verify real-time synchronization is working properly.',
        createdAt: new Date()
      },
      {
        id: `${testEntryId}-block-2`,
        type: 'paragraph',
        text: 'If you can see this text persisting after a page reload, the sync fix is working!',
        createdAt: new Date()
      }
    ];
    
    console.log('💾 Saving test content...');
    await manager.updateEntryFast(testEntryId, testBlocks);
    
    console.log('✅ Content saved successfully');
    
    // Wait a moment for background sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if entry was synced to database
    const { data: dbEntry, error } = await window.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.warn('⚠️ Could not verify database sync:', error.message);
    } else {
      console.log('✅ Entry found in database:', {
        id: dbEntry.id,
        hasContent: !!dbEntry.rich_text_content,
        contentBlocks: dbEntry.rich_text_content?.length || 0,
        updatedAt: dbEntry.updated_at
      });
    }
    
  } catch (error) {
    console.error('❌ Real-time saving test failed:', error);
  }
  
  // Test 5: Test localStorage persistence
  console.log('\n📋 Test 5: Test localStorage Persistence');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const storageKey = `journal_entries_cache_${user.id}`;
    const localData = localStorage.getItem(storageKey);
    
    if (!localData) {
      console.warn('⚠️ No local data found');
    } else {
      const entries = JSON.parse(localData);
      const testEntry = entries.find(e => e.id === testEntryId || e.id.startsWith('temp'));
      
      if (testEntry) {
        console.log('✅ Test entry found in localStorage:', {
          id: testEntry.id,
          blocks: testEntry.blocks?.length || 0,
          hasContent: testEntry.blocks?.some(b => b.text?.length > 0) || false
        });
      } else {
        console.warn('⚠️ Test entry not found in localStorage');
      }
    }
  } catch (error) {
    console.error('❌ localStorage check failed:', error);
  }
  
  console.log('\n🎉 Journal Sync Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Try typing in the journal editor');
  console.log('2. Check browser console for FastSync logs');
  console.log('3. Reload the page to verify persistence');
  console.log('4. Check if your changes are still there');
}

// Auto-run if we're on the journal page
if (window.location.pathname === '/journal') {
  console.log('🚀 Auto-running journal sync test...');
  testJournalSyncFix().catch(console.error);
} else {
  console.log('📍 Navigate to /journal page and run: testJournalSyncFix()');
}

// Make function available globally for manual testing
window.testJournalSyncFix = testJournalSyncFix;
