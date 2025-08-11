// Debug script to reproduce and fix the autosave issue
// Run this in the browser console on the journal page

console.log('🔍 Starting autosave debug session...');

// Get the journal manager instance
const user = await window.supabase.auth.getUser();
if (!user.data.user) {
  console.error('❌ User not authenticated');
  throw new Error('Please log in first');
}

const manager = window.RealTimeJournalManager.getInstance(user.data.user.id);

// Check current state
console.log('📊 Current journal state:');
console.log('- Sync queue size:', manager.getSyncQueueSize());
console.log('- Sync status:', manager.getSyncStatus());

// Get all local entries
const localEntries = manager.getAllFromLocalStorage();
console.log('- Local entries:', localEntries.length);
localEntries.forEach(entry => {
  console.log(`  - ${entry.id}: ${entry.blocks?.length || 0} blocks, updated: ${entry.updatedAt}`);
});

// Create a test entry to reproduce the issue
console.log('\n🧪 Creating test entry...');
const testDate = new Date().toISOString().split('T')[0];
const testEntry = await manager.createEntryImmediately(testDate, 'general');
console.log('✅ Test entry created:', testEntry.id);

// Add some content to trigger autosave
console.log('\n📝 Adding content to trigger autosave...');
const testBlocks = [
  {
    id: 'block-1',
    type: 'paragraph',
    text: 'Test content for autosave debugging',
    richText: 'Test content for autosave debugging',
    createdAt: new Date()
  }
];

// Save content multiple times to trigger the issue
for (let i = 1; i <= 5; i++) {
  console.log(`\n💾 Save attempt ${i}:`);
  
  const updatedBlocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      text: `Test content for autosave debugging - update ${i}`,
      richText: `Test content for autosave debugging - update ${i}`,
      createdAt: new Date()
    }
  ];
  
  try {
    await manager.updateEntryImmediately(testEntry.id, updatedBlocks);
    console.log(`✅ Save ${i} successful`);
    
    // Check sync queue after save
    const syncStatus = manager.getSyncStatus();
    console.log(`- Sync queue size after save: ${syncStatus.pending}`);
    console.log(`- Queue entries: ${syncStatus.queueEntries.join(', ')}`);
    
    // Wait a bit for background sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check sync queue after background sync
    const syncStatusAfter = manager.getSyncStatus();
    console.log(`- Sync queue size after background sync: ${syncStatusAfter.pending}`);
    console.log(`- Queue entries after sync: ${syncStatusAfter.queueEntries.join(', ')}`);
    
    // Check if entry still exists in localStorage
    const entryAfterSync = manager.getFromLocalStorage(testEntry.id);
    console.log(`- Entry exists in localStorage: ${!!entryAfterSync}`);
    if (entryAfterSync) {
      console.log(`- Entry ID: ${entryAfterSync.id}`);
      console.log(`- Entry blocks: ${entryAfterSync.blocks?.length || 0}`);
    }
    
  } catch (error) {
    console.error(`❌ Save ${i} failed:`, error);
    break;
  }
}

console.log('\n🔍 Final state check:');
console.log('- Sync queue size:', manager.getSyncQueueSize());
console.log('- Sync status:', manager.getSyncStatus());

// Try to save again after sync to see if autosave is broken
console.log('\n🧪 Testing autosave after sync...');
try {
  const finalBlocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      text: 'Final test after sync - this should work if autosave is not broken',
      richText: 'Final test after sync - this should work if autosave is not broken',
      createdAt: new Date()
    }
  ];
  
  await manager.updateEntryImmediately(testEntry.id, finalBlocks);
  console.log('✅ Autosave still working after sync');
} catch (error) {
  console.error('❌ Autosave broken after sync:', error);
  console.log('🔧 This confirms the issue - autosave breaks after database sync');
}

console.log('\n✅ Debug session complete');
