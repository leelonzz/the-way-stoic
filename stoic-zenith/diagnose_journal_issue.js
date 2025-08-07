/**
 * Diagnostic script to identify why journal sync is not working
 * Run this in the browser console on the journal page
 */

async function diagnoseJournalIssue() {
  console.log('🔍 DIAGNOSING JOURNAL SYNC ISSUE...\n');
  
  // Step 1: Check if we're on the right page
  console.log('📍 Step 1: Page Check');
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  
  if (!window.location.pathname.includes('journal')) {
    console.warn('⚠️ Not on journal page. Navigate to /journal first.');
    return;
  }
  
  // Step 2: Check global objects availability
  console.log('\n🌐 Step 2: Global Objects Check');
  console.log('window.supabase available:', !!window.supabase);
  console.log('window.RealTimeJournalManager available:', !!window.RealTimeJournalManager);
  
  // Step 3: Check authentication
  console.log('\n🔐 Step 3: Authentication Check');
  try {
    if (!window.supabase) {
      console.error('❌ Supabase not available globally');
      return;
    }
    
    const { data: { user }, error } = await window.supabase.auth.getUser();
    if (error) {
      console.error('❌ Auth error:', error);
      return;
    }
    
    if (!user) {
      console.error('❌ No user authenticated');
      console.log('💡 Please log in first');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return;
  }
  
  // Step 4: Check journal manager initialization
  console.log('\n📚 Step 4: Journal Manager Check');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Try to access the journal manager
    let manager = null;
    
    // Check if RealTimeJournalManager is available globally
    if (window.RealTimeJournalManager) {
      manager = window.RealTimeJournalManager.getInstance(user.id);
      console.log('✅ Journal manager created via global RealTimeJournalManager');
    } else {
      console.warn('⚠️ RealTimeJournalManager not available globally');
      
      // Try to import it
      try {
        const { RealTimeJournalManager } = await import('/src/lib/journal.ts');
        manager = RealTimeJournalManager.getInstance(user.id);
        console.log('✅ Journal manager created via import');
      } catch (importError) {
        console.error('❌ Failed to import RealTimeJournalManager:', importError);
      }
    }
    
    if (!manager) {
      console.error('❌ Could not create journal manager');
      return;
    }
    
    console.log('✅ Journal manager available');
    
    // Check FastSync status
    const isFastSyncActive = manager.isFastSyncActive();
    console.log('FastSync active:', isFastSyncActive);
    
    if (!isFastSyncActive) {
      console.log('🔧 Attempting to enable FastSync...');
      try {
        manager.setFastSyncEnabled(true);
        const newStatus = manager.isFastSyncActive();
        console.log('FastSync after enable:', newStatus);
      } catch (enableError) {
        console.error('❌ Failed to enable FastSync:', enableError);
      }
    }
    
  } catch (error) {
    console.error('❌ Journal manager check failed:', error);
  }
  
  // Step 5: Check React components
  console.log('\n⚛️ Step 5: React Components Check');
  try {
    // Look for journal navigation component
    const journalNav = document.querySelector('[data-testid="journal-navigation"]') || 
                      document.querySelector('.journal-navigation') ||
                      document.querySelector('[class*="journal"]');
    
    if (journalNav) {
      console.log('✅ Journal component found in DOM');
    } else {
      console.warn('⚠️ Journal component not found in DOM');
    }
    
    // Check for rich text editor
    const editor = document.querySelector('[contenteditable="true"]') ||
                   document.querySelector('.rich-text-editor') ||
                   document.querySelector('[class*="editor"]');
    
    if (editor) {
      console.log('✅ Rich text editor found in DOM');
    } else {
      console.warn('⚠️ Rich text editor not found in DOM');
    }
    
  } catch (error) {
    console.error('❌ React components check failed:', error);
  }
  
  // Step 6: Test basic functionality
  console.log('\n🧪 Step 6: Basic Functionality Test');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Try to access journal manager again
    let manager = null;
    if (window.RealTimeJournalManager) {
      manager = window.RealTimeJournalManager.getInstance(user.id);
    }
    
    if (manager) {
      // Test creating an entry
      console.log('🆕 Testing entry creation...');
      const testDate = new Date().toISOString();
      const newEntry = manager.createEntryImmediately(testDate, 'general');
      console.log('✅ Entry created:', newEntry.id);
      
      // Test updating the entry
      console.log('💾 Testing entry update...');
      const testBlocks = [{
        id: `${newEntry.id}-test`,
        type: 'paragraph',
        text: 'Test content for diagnosis',
        createdAt: new Date()
      }];
      
      await manager.updateEntryFast(newEntry.id, testBlocks);
      console.log('✅ Entry updated successfully');
      
    } else {
      console.error('❌ Cannot test functionality - no manager available');
    }
    
  } catch (error) {
    console.error('❌ Basic functionality test failed:', error);
  }
  
  // Step 7: Check localStorage
  console.log('\n💾 Step 7: LocalStorage Check');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const storageKey = `journal_entries_cache_${user.id}`;
    const localData = localStorage.getItem(storageKey);
    
    if (localData) {
      const entries = JSON.parse(localData);
      console.log('✅ LocalStorage data found:', entries.length, 'entries');
    } else {
      console.warn('⚠️ No localStorage data found');
    }
  } catch (error) {
    console.error('❌ LocalStorage check failed:', error);
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('\n📋 Summary:');
  console.log('- Check the steps above for any ❌ errors');
  console.log('- If FastSync is not active, that\'s likely the issue');
  console.log('- If journal manager is not available, there\'s an import/initialization problem');
  console.log('- If authentication failed, log in first');
}

// Make available globally and auto-run
window.diagnoseJournalIssue = diagnoseJournalIssue;

// Auto-run if on journal page
if (window.location.pathname.includes('journal')) {
  console.log('🚀 Auto-running journal diagnosis...');
  setTimeout(() => {
    diagnoseJournalIssue().catch(console.error);
  }, 1000); // Wait a bit for page to load
} else {
  console.log('📍 Navigate to /journal page and run: diagnoseJournalIssue()');
}
