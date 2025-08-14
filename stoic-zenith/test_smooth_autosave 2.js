// Test script to verify smooth autosave functionality
// Run this in the browser console on the journal page

console.log('🧪 Testing smooth autosave functionality...');

// Get the journal manager instance
const user = await window.supabase.auth.getUser();
if (!user.data.user) {
  console.error('❌ User not authenticated');
  throw new Error('Please log in first');
}

const manager = window.RealTimeJournalManager.getInstance(user.data.user.id);

// Test 1: Create entry and verify smooth autosave
console.log('\n📝 Test 1: Creating new entry...');
const testDate = new Date().toISOString().split('T')[0];
const testEntry = manager.createEntryImmediately(testDate, 'general');
console.log('✅ Entry created:', testEntry.id);

// Test 2: Immediate autosave after creation
console.log('\n💾 Test 2: Testing immediate autosave...');
const testBlocks = [
  {
    id: 'block-1',
    type: 'paragraph',
    text: 'Testing smooth autosave immediately after creation',
    richText: 'Testing smooth autosave immediately after creation',
    createdAt: new Date()
  }
];

try {
  await manager.updateEntryImmediately(testEntry.id, testBlocks);
  console.log('✅ Immediate autosave successful');
} catch (error) {
  console.error('❌ Immediate autosave failed:', error);
}

// Test 3: Rapid autosave sequence
console.log('\n⚡ Test 3: Rapid autosave sequence...');
let saveCount = 0;
const maxSaves = 20;

const rapidSaveTest = async () => {
  for (let i = 1; i <= maxSaves; i++) {
    const blocks = [
      {
        id: 'block-1',
        type: 'paragraph',
        text: `Rapid save test ${i} - ${new Date().toISOString()}`,
        richText: `Rapid save test ${i} - ${new Date().toISOString()}`,
        createdAt: new Date()
      }
    ];
    
    try {
      // Get the current entry ID (might have changed during sync)
      let currentEntryId = testEntry.id;
      let currentEntry = manager.getFromLocalStorage(currentEntryId);
      
      if (!currentEntry) {
        // Try to find the entry by today's date
        const allEntries = manager.getAllFromLocalStorage();
        const todayEntries = allEntries.filter(e => e.date.startsWith(testDate));
        if (todayEntries.length > 0) {
          currentEntry = todayEntries[0];
          currentEntryId = currentEntry.id;
          console.log(`🔄 Entry ID changed: ${testEntry.id} → ${currentEntryId}`);
        }
      }
      
      if (!currentEntry) {
        console.error(`❌ Entry not found for save ${i}`);
        break;
      }
      
      await manager.updateEntryImmediately(currentEntryId, blocks);
      saveCount++;
      console.log(`✅ Save ${i}/${maxSaves} successful (Entry: ${currentEntryId})`);
      
      // Brief pause to simulate typing
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Save ${i} failed:`, error);
      break;
    }
  }
};

await rapidSaveTest();

console.log(`\n📊 Rapid save test completed: ${saveCount}/${maxSaves} saves successful`);

// Test 4: Wait for database sync and continue
console.log('\n🔄 Test 4: Waiting for database sync...');
await new Promise(resolve => setTimeout(resolve, 5000));

const syncStatus = manager.getSyncStatus();
console.log('Sync status:', syncStatus);

// Test 5: Continue autosave after sync
console.log('\n💾 Test 5: Testing autosave after database sync...');
const postSyncBlocks = [
  {
    id: 'block-1',
    type: 'paragraph',
    text: `Post-sync autosave test - ${new Date().toISOString()}`,
    richText: `Post-sync autosave test - ${new Date().toISOString()}`,
    createdAt: new Date()
  }
];

try {
  // Find the current entry (ID might have changed)
  const allEntries = manager.getAllFromLocalStorage();
  const todayEntries = allEntries.filter(e => e.date.startsWith(testDate));
  
  if (todayEntries.length > 0) {
    const currentEntry = todayEntries[0];
    await manager.updateEntryImmediately(currentEntry.id, postSyncBlocks);
    console.log('✅ Post-sync autosave successful');
  } else {
    console.error('❌ No entry found for post-sync test');
  }
} catch (error) {
  console.error('❌ Post-sync autosave failed:', error);
}

// Test 6: Monitor autosave counter
console.log('\n📈 Test 6: Monitoring autosave counter...');
const initialSaves = manager.metrics?.totalSaves || 0;
console.log(`Initial save count: ${initialSaves}`);

// Perform a few more saves and check counter
for (let i = 1; i <= 5; i++) {
  const blocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      text: `Counter test ${i} - ${new Date().toISOString()}`,
      richText: `Counter test ${i} - ${new Date().toISOString()}`,
      createdAt: new Date()
    }
  ];
  
  try {
    const allEntries = manager.getAllFromLocalStorage();
    const todayEntries = allEntries.filter(e => e.date.startsWith(testDate));
    
    if (todayEntries.length > 0) {
      const currentEntry = todayEntries[0];
      await manager.updateEntryImmediately(currentEntry.id, blocks);
      
      const currentSaves = manager.metrics?.totalSaves || 0;
      console.log(`✅ Save ${i}: Counter at ${currentSaves} (increased by ${currentSaves - initialSaves})`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (error) {
    console.error(`❌ Counter test ${i} failed:`, error);
  }
}

const finalSaves = manager.metrics?.totalSaves || 0;
console.log(`\n📊 Final save count: ${finalSaves} (total increase: ${finalSaves - initialSaves})`);

console.log('\n✅ Smooth autosave test completed');
console.log('🔍 Check console for any "🚨 AUTOSAVE BREAKING" messages');
console.log('🔍 Autosave counter should continue increasing smoothly');
