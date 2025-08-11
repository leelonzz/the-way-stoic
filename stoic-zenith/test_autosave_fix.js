// Enhanced test script to verify the autosave fix
// Run this in the browser console on the journal page

console.log('🧪 Testing enhanced autosave fix...');

// Get the journal manager instance
const user = await window.supabase.auth.getUser();
if (!user.data.user) {
  console.error('❌ User not authenticated');
  throw new Error('Please log in first');
}

const manager = window.RealTimeJournalManager.getInstance(user.data.user.id);

// Test 1: Check current state and create entry
console.log('\n📊 Current state check:');
console.log('- Total saves so far:', manager.metrics?.totalSaves || 'unknown');
console.log('- Sync queue size:', manager.getSyncQueueSize());
console.log('- Available entries:', manager.getAllFromLocalStorage().length);

console.log('\n📝 Test 1: Creating new entry and testing autosave...');
const testDate = new Date().toISOString().split('T')[0];
const testEntry = await manager.createEntryImmediately(testDate, 'general');
console.log('✅ Test entry created:', testEntry.id);

// Test 2: Simulate rapid autosave operations
console.log('\n⚡ Test 2: Rapid autosave simulation...');
const testBlocks = [];

for (let i = 1; i <= 10; i++) {
  console.log(`💾 Autosave ${i}/10...`);
  
  const blocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      text: `Rapid autosave test ${i} - ${new Date().toISOString()}`,
      richText: `Rapid autosave test ${i} - ${new Date().toISOString()}`,
      createdAt: new Date()
    }
  ];
  
  try {
    await manager.updateEntryImmediately(testEntry.id, blocks);
    console.log(`✅ Autosave ${i} successful`);
    
    // Check if entry still exists after save
    const verifyEntry = manager.getFromLocalStorage(testEntry.id);
    if (!verifyEntry) {
      console.error(`❌ Entry lost after autosave ${i}!`);
      break;
    }
    
    // Brief pause to simulate typing
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } catch (error) {
    console.error(`❌ Autosave ${i} failed:`, error);
    break;
  }
}

// Test 3: Wait for database sync and continue autosave
console.log('\n🔄 Test 3: Testing autosave after database sync...');
console.log('Waiting for database sync...');
await new Promise(resolve => setTimeout(resolve, 5000));

// Check sync status
const syncStatus = manager.getSyncStatus();
console.log('Sync status:', syncStatus);

// Continue autosave after sync
console.log('Testing autosave after sync...');
for (let i = 11; i <= 15; i++) {
  console.log(`💾 Post-sync autosave ${i}/15...`);
  
  const blocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      text: `Post-sync autosave test ${i} - ${new Date().toISOString()}`,
      richText: `Post-sync autosave test ${i} - ${new Date().toISOString()}`,
      createdAt: new Date()
    }
  ];
  
  try {
    // Try to find the entry (ID might have changed during sync)
    let entryId = testEntry.id;
    let entry = manager.getFromLocalStorage(entryId);
    
    if (!entry) {
      // Entry might have gotten a new ID during sync
      const allEntries = manager.getAllFromLocalStorage();
      const todayEntries = allEntries.filter(e => e.date.startsWith(testDate));
      if (todayEntries.length > 0) {
        entry = todayEntries[0];
        entryId = entry.id;
        console.log(`🔄 Entry ID changed during sync: ${testEntry.id} → ${entryId}`);
      }
    }
    
    if (!entry) {
      console.error(`❌ Entry not found for post-sync autosave ${i}`);
      break;
    }
    
    await manager.updateEntryImmediately(entryId, blocks);
    console.log(`✅ Post-sync autosave ${i} successful`);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
  } catch (error) {
    console.error(`❌ Post-sync autosave ${i} failed:`, error);
    
    // Try to diagnose the issue
    console.log('🔍 Diagnosing autosave failure...');
    console.log('- Original entry ID:', testEntry.id);
    console.log('- All local entries:', manager.getAllFromLocalStorage().map(e => ({ id: e.id, date: e.date })));
    console.log('- Sync queue:', manager.getSyncStatus());
    
    break;
  }
}

// Test 4: Test cursor preservation (if we're on the journal page)
console.log('\n🎯 Test 4: Testing cursor preservation...');
if (document.querySelector('[contenteditable="true"]')) {
  console.log('Found contenteditable element, testing cursor preservation...');
  
  const editor = document.querySelector('[contenteditable="true"]');
  editor.focus();
  editor.textContent = 'Testing cursor preservation';
  
  // Place cursor at end
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(editor);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
  
  console.log('Cursor positioned, triggering autosave...');
  
  // Trigger input event to simulate typing
  const inputEvent = new Event('input', { bubbles: true });
  editor.dispatchEvent(inputEvent);
  
  // Wait a moment and check if cursor is still there
  setTimeout(() => {
    const activeElement = document.activeElement;
    if (activeElement === editor) {
      console.log('✅ Cursor preserved after autosave');
    } else {
      console.log('❌ Cursor lost after autosave');
    }
  }, 1500);
} else {
  console.log('⚠️ No contenteditable element found, skipping cursor test');
}

console.log('\n✅ Autosave fix test completed');
console.log('Check the console output above for any failures');
