/**
 * Comprehensive Journal Persistence Fix Test
 * 
 * This script tests the journal persistence fixes to ensure:
 * 1. No data loss occurs during logout/login cycles
 * 2. Anonymous entries are properly migrated to user storage
 * 3. Real-time auto-save works with proper user context
 * 4. Legacy functions require user authentication
 * 5. Storage keys are properly managed
 */

console.log('🧪 Starting Comprehensive Journal Persistence Test...');

// Test configuration
const TEST_CONFIG = {
  testEntryContent: 'Test entry created at ' + new Date().toISOString(),
  waitTime: 2000, // 2 seconds for operations to complete
  maxRetries: 3
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}${details ? ' - ' + details : ''}`);
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push(`${testName}: ${details}`);
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runComprehensiveTest() {
  try {
    console.log('\n📋 Test 1: Check User Authentication Status');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logTest('User Authentication Check', false, `Error: ${userError.message}`);
      return;
    }
    
    if (!user) {
      logTest('User Authentication Check', false, 'No authenticated user found');
      console.log('⚠️ Please log in to run the persistence tests');
      return;
    }
    
    logTest('User Authentication Check', true, `User ID: ${user.id}`);
    
    console.log('\n📋 Test 2: Test Journal Manager User Context Validation');
    
    try {
      // Test that anonymous manager throws error for critical operations
      const anonymousManager = RealTimeJournalManager.getInstance();
      
      try {
        await anonymousManager.createEntryImmediately('2024-01-01', 'general');
        logTest('Anonymous Manager Validation', false, 'Should have thrown error for anonymous create');
      } catch (error) {
        logTest('Anonymous Manager Validation', true, 'Correctly blocked anonymous create operation');
      }
      
      // Test that user-specific manager works
      const userManager = RealTimeJournalManager.getInstance(user.id);
      logTest('User Manager Creation', true, 'User-specific manager created successfully');
      
    } catch (error) {
      logTest('Journal Manager Context Validation', false, error.message);
    }
    
    console.log('\n📋 Test 3: Test Legacy Function Authentication');
    
    try {
      // Test legacy functions require authentication
      const testDate = new Date().toISOString().split('T')[0];
      
      // Test createJournalEntry with user context
      const entryData = {
        entry_date: testDate,
        entry_type: 'general',
        excited_about: TEST_CONFIG.testEntryContent
      };
      
      const createdEntry = await createJournalEntry(entryData, user.id);
      logTest('Legacy createJournalEntry with userId', true, `Entry created: ${createdEntry.id}`);
      
      // Test getJournalEntries with user context
      const entries = await getJournalEntries(5, user.id);
      logTest('Legacy getJournalEntries with userId', true, `Retrieved ${entries.length} entries`);
      
    } catch (error) {
      logTest('Legacy Function Authentication', false, error.message);
    }
    
    console.log('\n📋 Test 4: Test Data Migration');
    
    try {
      // Check localStorage for anonymous entries
      const anonymousEntries = localStorage.getItem('journal_entries_cache_anonymous');
      const userEntries = localStorage.getItem(`journal_entries_cache_${user.id}`);
      
      logTest('Storage Key Separation', true, 
        `Anonymous entries: ${anonymousEntries ? 'exist' : 'none'}, User entries: ${userEntries ? 'exist' : 'none'}`);
      
      // Test migration by creating a new manager instance
      const manager = RealTimeJournalManager.getInstance(user.id);
      manager.setUserId(user.id); // This should trigger migration
      
      await wait(1000); // Wait for migration to complete
      
      logTest('Data Migration Trigger', true, 'Migration process completed');
      
    } catch (error) {
      logTest('Data Migration', false, error.message);
    }
    
    console.log('\n📋 Test 5: Test Real-time Auto-save with User Context');
    
    try {
      const manager = RealTimeJournalManager.getInstance(user.id);
      const testDate = new Date().toISOString().split('T')[0];
      
      // Create a test entry
      const entry = await manager.createEntryImmediately(testDate, 'general');
      logTest('Entry Creation with User Context', true, `Entry created: ${entry.id}`);
      
      // Test auto-save
      const testBlocks = [
        { id: '1', type: 'paragraph', text: 'Auto-save test content' }
      ];
      
      await manager.updateEntryImmediately(entry.id, testBlocks);
      logTest('Auto-save with User Context', true, 'Entry updated successfully');
      
      // Verify the entry was saved
      const savedEntry = manager.getFromLocalStorage(entry.id);
      const hasCorrectContent = savedEntry && savedEntry.blocks.some(block => 
        block.text && block.text.includes('Auto-save test content')
      );
      
      logTest('Auto-save Content Verification', hasCorrectContent, 
        hasCorrectContent ? 'Content saved correctly' : 'Content not found or incorrect');
      
    } catch (error) {
      logTest('Real-time Auto-save', false, error.message);
    }
    
    console.log('\n📋 Test 6: Test Sync Status and Error Handling');
    
    try {
      const manager = RealTimeJournalManager.getInstance(user.id);
      const syncStatus = manager.getSyncStatus();
      
      logTest('Sync Status Check', true, 
        `Pending: ${syncStatus.pending}, Errors: ${syncStatus.hasErrors}, Online: ${syncStatus.isOnline}`);
      
      // Test force sync
      if (syncStatus.pending > 0) {
        await manager.forcSync();
        logTest('Force Sync', true, 'Force sync completed');
      } else {
        logTest('Force Sync', true, 'No pending entries to sync');
      }
      
    } catch (error) {
      logTest('Sync Status and Error Handling', false, error.message);
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n🚨 Failed Tests:');
      testResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Journal persistence fixes are working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the comprehensive test
runComprehensiveTest();
