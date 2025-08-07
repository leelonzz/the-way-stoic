// Comprehensive Journal Sync Fix and Diagnostic Script
// Run this in browser console on the journal page

console.log('🔧 Starting Journal Sync Fix and Diagnostic...');

async function fixJournalSync() {
  try {
    // Step 1: Basic checks
    console.log('\n📋 Step 1: Basic Environment Check');
    
    if (!window.location.pathname.includes('journal')) {
      console.error('❌ Not on journal page. Navigate to /journal first.');
      return;
    }
    
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Step 2: Check journal manager
    console.log('\n📋 Step 2: Journal Manager Check');
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    if (!manager) {
      console.error('❌ Journal manager not available');
      return;
    }
    
    console.log('✅ Journal manager available');
    
    // Step 3: Check sync status
    console.log('\n📋 Step 3: Current Sync Status');
    const syncStatus = manager.getSyncStatus();
    console.log('Sync Status:', syncStatus);
    
    if (syncStatus.pending > 0) {
      console.log(`⚠️ ${syncStatus.pending} entries pending sync`);
      console.log('Pending entries:', syncStatus.queueEntries);
    }
    
    // Step 4: Check contentEditable elements
    console.log('\n📋 Step 4: Editor Elements Check');
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    console.log(`Found ${editableElements.length} contentEditable elements`);
    
    if (editableElements.length === 0) {
      console.error('❌ No contentEditable elements found - journal editor not mounted');
      return;
    }
    
    // Step 5: Test input chain
    console.log('\n📋 Step 5: Testing Input Chain');
    console.log('🎯 About to test the input chain - watch for debug messages...');
    
    const firstEditor = editableElements[0];
    firstEditor.focus();
    
    // Clear any existing content
    firstEditor.textContent = '';
    
    // Add test content
    const testText = 'Sync test ' + new Date().toLocaleTimeString();
    firstEditor.textContent = testText;
    
    // Trigger input event
    console.log('🔥 Dispatching input event...');
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    firstEditor.dispatchEvent(inputEvent);
    
    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Check if sync worked
    console.log('\n📋 Step 6: Verify Sync Results');
    const newSyncStatus = manager.getSyncStatus();
    console.log('New Sync Status:', newSyncStatus);
    
    // Check localStorage
    const entries = manager.getAllFromLocalStorage();
    const testEntry = entries.find(entry => 
      entry.blocks.some(block => block.text && block.text.includes('Sync test'))
    );
    
    if (testEntry) {
      console.log('✅ Test content found in localStorage:', testEntry.id);
      console.log('Test entry blocks:', testEntry.blocks.map(b => ({ id: b.id, text: b.text?.substring(0, 50) })));
    } else {
      console.error('❌ Test content NOT found in localStorage');
    }
    
    // Step 7: Force sync if needed
    if (newSyncStatus.pending > 0) {
      console.log('\n📋 Step 7: Force Sync Pending Entries');
      try {
        await manager.forcSync();
        console.log('✅ Force sync completed');
      } catch (error) {
        console.error('❌ Force sync failed:', error);
      }
    }
    
    // Step 8: Verify database sync
    console.log('\n📋 Step 8: Database Verification');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for background sync
    
    const { data: dbEntries, error: dbError } = await window.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(5);
    
    if (dbError) {
      console.error('❌ Database query failed:', dbError);
    } else {
      console.log(`📊 Found ${dbEntries.length} recent entries in database`);
      
      const testEntryInDb = dbEntries.find(entry => 
        entry.rich_text_content && 
        entry.rich_text_content.some(block => 
          block.text && block.text.includes('Sync test')
        )
      );
      
      if (testEntryInDb) {
        console.log('✅ Test entry found in database!');
        console.log('Database entry details:', {
          id: testEntryInDb.id,
          updated_at: testEntryInDb.updated_at,
          content_blocks: testEntryInDb.rich_text_content?.length || 0
        });
      } else {
        console.error('❌ Test entry NOT found in database');
        console.log('Recent database entries:');
        dbEntries.forEach((entry, index) => {
          console.log(`${index + 1}. ID: ${entry.id}, Updated: ${entry.updated_at}, Blocks: ${entry.rich_text_content?.length || 0}`);
        });
      }
    }
    
    // Step 9: Summary and recommendations
    console.log('\n🎯 Diagnostic Summary:');
    
    if (testEntry && testEntryInDb) {
      console.log('✅ SYNC IS WORKING: Content saved to both localStorage and database');
    } else if (testEntry && !testEntryInDb) {
      console.log('⚠️ PARTIAL SYNC: Content saved to localStorage but not database');
      console.log('💡 Recommendation: Check network connection and database permissions');
    } else {
      console.log('❌ SYNC NOT WORKING: Content not saved to localStorage');
      console.log('💡 Recommendation: Check for JavaScript errors and component mounting issues');
    }
    
    const finalSyncStatus = manager.getSyncStatus();
    if (finalSyncStatus.pending > 0) {
      console.log(`⚠️ ${finalSyncStatus.pending} entries still pending sync`);
      console.log('💡 Try running: await window.getJournalManager(user.id).forcSync()');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Auto-run the fix
fixJournalSync();

// Add helper functions
window.fixJournalSync = fixJournalSync;

window.checkSyncNow = async () => {
  const { data: { user } } = await window.supabase.auth.getUser();
  const manager = window.getJournalManager(user.id);
  const status = manager.getSyncStatus();
  console.log('📊 Current Sync Status:', status);
  return status;
};

window.forceSyncNow = async () => {
  const { data: { user } } = await window.supabase.auth.getUser();
  const manager = window.getJournalManager(user.id);
  await manager.forcSync();
  console.log('✅ Force sync completed');
};

console.log('🔧 Fix script loaded. Available functions:');
console.log('- fixJournalSync() - Run full diagnostic and fix');
console.log('- checkSyncNow() - Check current sync status');
console.log('- forceSyncNow() - Force sync all pending entries');
