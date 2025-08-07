/**
 * Debug script for monitoring journal synchronization
 * Run this in the browser console to monitor sync activity
 */

function setupJournalSyncDebugger() {
  console.log('🔍 Setting up Journal Sync Debugger...\n');
  
  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Track sync events
  let syncEvents = [];
  let lastSyncTime = Date.now();
  
  // Enhanced logging for FastSync events
  console.log = function(...args) {
    const message = args.join(' ');
    
    // Track FastSync specific events
    if (message.includes('FastSync')) {
      const event = {
        timestamp: new Date().toISOString(),
        type: 'info',
        message: message,
        timeSinceLastSync: Date.now() - lastSyncTime
      };
      syncEvents.push(event);
      lastSyncTime = Date.now();
      
      // Highlight important FastSync events
      if (message.includes('Creating new entry') || 
          message.includes('Successfully created') ||
          message.includes('Successfully updated')) {
        originalLog('🚀 SYNC EVENT:', ...args);
      } else {
        originalLog(...args);
      }
    } else {
      originalLog(...args);
    }
  };
  
  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('FastSync') || message.includes('sync')) {
      const event = {
        timestamp: new Date().toISOString(),
        type: 'warning',
        message: message,
        timeSinceLastSync: Date.now() - lastSyncTime
      };
      syncEvents.push(event);
      originalWarn('⚠️ SYNC WARNING:', ...args);
    } else {
      originalWarn(...args);
    }
  };
  
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('FastSync') || message.includes('sync') || message.includes('save')) {
      const event = {
        timestamp: new Date().toISOString(),
        type: 'error',
        message: message,
        timeSinceLastSync: Date.now() - lastSyncTime
      };
      syncEvents.push(event);
      originalError('❌ SYNC ERROR:', ...args);
    } else {
      originalError(...args);
    }
  };
  
  // Monitor localStorage changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key.includes('journal_entries_cache')) {
      try {
        const entries = JSON.parse(value);
        console.log(`💾 localStorage updated: ${entries.length} entries`);
      } catch (e) {
        console.log('💾 localStorage updated (non-JSON)');
      }
    }
    return originalSetItem.call(this, key, value);
  };
  
  // Add global debug functions
  window.getSyncEvents = () => {
    console.table(syncEvents.slice(-20)); // Show last 20 events
    return syncEvents;
  };
  
  window.clearSyncEvents = () => {
    syncEvents = [];
    console.log('🧹 Sync events cleared');
  };
  
  window.getSyncStatus = async () => {
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      if (!user) {
        console.log('❌ No user authenticated');
        return;
      }
      
      const manager = window.RealTimeJournalManager?.getInstance(user.id);
      if (!manager) {
        console.log('❌ No journal manager available');
        return;
      }
      
      const status = {
        fastSyncActive: manager.isFastSyncActive(),
        userId: user.id,
        recentEvents: syncEvents.slice(-5)
      };
      
      console.log('📊 Current Sync Status:');
      console.table(status);
      return status;
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  };
  
  window.testQuickSave = async () => {
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      const manager = window.RealTimeJournalManager?.getInstance(user.id);
      
      // Create a test entry
      const testDate = new Date().toISOString();
      const entry = manager.createEntryImmediately(testDate, 'general');
      
      console.log('🧪 Created test entry:', entry.id);
      
      // Test rapid saves
      for (let i = 1; i <= 5; i++) {
        const testBlocks = [{
          id: `${entry.id}-block-${i}`,
          type: 'paragraph',
          text: `Test save #${i} at ${new Date().toLocaleTimeString()}`,
          createdAt: new Date()
        }];
        
        await manager.updateEntryFast(entry.id, testBlocks);
        console.log(`💾 Save ${i}/5 completed`);
        
        // Small delay between saves
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log('✅ Quick save test completed');
    } catch (error) {
      console.error('❌ Quick save test failed:', error);
    }
  };
  
  // Monitor network status
  window.addEventListener('online', () => {
    console.log('🌐 Network: ONLINE');
  });
  
  window.addEventListener('offline', () => {
    console.log('🌐 Network: OFFLINE');
  });
  
  console.log('✅ Journal Sync Debugger ready!');
  console.log('\nAvailable commands:');
  console.log('- getSyncEvents() - View recent sync events');
  console.log('- clearSyncEvents() - Clear event history');
  console.log('- getSyncStatus() - Check current sync status');
  console.log('- testQuickSave() - Test rapid save functionality');
  console.log('\n🎯 Now try typing in the journal to see sync events...');
}

// Auto-setup if we're on the journal page
if (window.location.pathname === '/journal') {
  setupJournalSyncDebugger();
} else {
  console.log('📍 Navigate to /journal page and run: setupJournalSyncDebugger()');
}

// Make function available globally
window.setupJournalSyncDebugger = setupJournalSyncDebugger;
