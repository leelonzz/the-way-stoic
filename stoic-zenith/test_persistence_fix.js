// Test script to verify journal persistence fix
// Run this in the browser console on the Journal page

async function testJournalPersistence() {
  console.log('🧪 Testing Journal Persistence Fix...');
  
  // Test 1: Check if user is authenticated
  console.log('\n📋 Test 1: Authentication Status');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    if (user) {
      console.log('✅ User authenticated:', user.email);
      console.log('📊 User ID:', user.id);
    } else {
      console.log('❌ No user authenticated - please log in first');
      return;
    }
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    return;
  }
  
  // Test 2: Check database entries
  console.log('\n📋 Test 2: Database Entries Check');
  
  try {
    const { data: dbEntries, error } = await window.supabase
      .from('journal_entries')
      .select('id, entry_date, created_at, rich_text_content')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Database query failed:', error);
    } else {
      console.log(`✅ Found ${dbEntries.length} entries in database`);
      dbEntries.forEach((entry, index) => {
        const contentPreview = entry.rich_text_content && entry.rich_text_content.length > 0 
          ? entry.rich_text_content[0].text?.substring(0, 50) + '...'
          : 'No content';
        console.log(`  ${index + 1}. ${entry.entry_date} - ${contentPreview}`);
      });
    }
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
  
  // Test 3: Check localStorage entries
  console.log('\n📋 Test 3: LocalStorage Entries Check');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const localStorageKey = `journal_entries_cache_${user.id}`;
    const localData = localStorage.getItem(localStorageKey);
    
    if (localData) {
      const localEntries = JSON.parse(localData);
      console.log(`✅ Found ${localEntries.length} entries in localStorage`);
      console.log('📊 LocalStorage key:', localStorageKey);
      
      localEntries.slice(0, 5).forEach((entry, index) => {
        const contentPreview = entry.blocks && entry.blocks.length > 0 
          ? entry.blocks[0].text?.substring(0, 50) + '...'
          : 'No content';
        console.log(`  ${index + 1}. ${entry.date} - ${contentPreview}`);
      });
    } else {
      console.log('⚠️ No entries found in localStorage');
    }
  } catch (error) {
    console.error('❌ LocalStorage test failed:', error);
  }
  
  // Test 4: Test journal manager loading
  console.log('\n📋 Test 4: Journal Manager Loading Test');
  
  try {
    // Get the journal manager
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Access the journal manager (assuming it's available globally)
    if (window.journalManager || window.getJournalManager) {
      const manager = window.getJournalManager ? window.getJournalManager(user.id) : window.journalManager;
      
      if (manager) {
        console.log('✅ Journal manager found');
        
        // Test getAllEntries
        const entries = await manager.getAllEntries();
        console.log(`✅ Manager loaded ${entries.length} entries`);
        
        if (entries.length > 0) {
          console.log('📊 Sample entry:', {
            id: entries[0].id,
            date: entries[0].date,
            blocksCount: entries[0].blocks.length
          });
        }
      } else {
        console.log('❌ Journal manager not found');
      }
    } else {
      console.log('⚠️ Journal manager not accessible from console');
    }
  } catch (error) {
    console.error('❌ Journal manager test failed:', error);
  }
  
  // Test 5: Create a test entry and verify persistence
  console.log('\n📋 Test 5: Create Test Entry and Verify Persistence');
  
  try {
    const testContent = `Test entry created at ${new Date().toISOString()} for persistence verification`;
    
    // Create entry via UI if possible
    const createButton = document.querySelector('button:has(svg)'); // Button with Plus icon
    if (createButton) {
      console.log('🔄 Creating test entry via UI...');
      createButton.click();
      
      // Wait for entry creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find editor and add test content
      const editor = document.querySelector('[contenteditable="true"]');
      if (editor) {
        editor.textContent = testContent;
        
        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        editor.dispatchEvent(inputEvent);
        
        console.log('✅ Test content added to editor');
        
        // Wait for save
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if it appears in localStorage
        const { data: { user } } = await window.supabase.auth.getUser();
        const localStorageKey = `journal_entries_cache_${user.id}`;
        const localData = localStorage.getItem(localStorageKey);
        
        if (localData) {
          const localEntries = JSON.parse(localData);
          const testEntry = localEntries.find(entry => 
            entry.blocks.some(block => block.text && block.text.includes('persistence verification'))
          );
          
          if (testEntry) {
            console.log('✅ Test entry found in localStorage');
            console.log('📊 Entry ID:', testEntry.id);
          } else {
            console.log('❌ Test entry not found in localStorage');
          }
        }
      } else {
        console.log('❌ Editor not found');
      }
    } else {
      console.log('❌ Create button not found');
    }
  } catch (error) {
    console.error('❌ Test entry creation failed:', error);
  }
  
  // Test 6: Simulate page reload scenario
  console.log('\n📋 Test 6: Page Reload Simulation');
  console.log('🔄 To test page reload persistence:');
  console.log('1. Note the current entry count above');
  console.log('2. Refresh the page (F5 or Ctrl+R)');
  console.log('3. Run this test again');
  console.log('4. Compare entry counts - they should match');
  
  console.log('\n🎉 Journal persistence testing completed!');
  console.log('📋 Summary:');
  console.log('- Check that database entries exist');
  console.log('- Check that localStorage has correct user-specific key');
  console.log('- Check that journal manager loads entries properly');
  console.log('- Test entry creation and persistence');
  console.log('- Refresh page to verify persistence across reloads');
}

// Auto-run if on journal page
if (window.location.pathname.includes('journal') || window.location.pathname.includes('Journal')) {
  console.log('🔧 Journal Persistence Test Functions:');
  console.log('  - testJournalPersistence() - Run comprehensive persistence tests');
  console.log('');
  
  // Run automatically after a short delay
  setTimeout(() => {
    testJournalPersistence();
  }, 1000);
} else {
  console.log('📋 Navigate to the Journal page to run persistence tests');
}
