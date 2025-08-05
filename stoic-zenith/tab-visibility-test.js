// Tab Visibility Test Script
// Run this in the browser console to test the tab visibility functionality

console.log('🧪 Starting Tab Visibility Test...');

// Test configuration
const TEST_CONFIG = {
  testDuration: 30000, // 30 seconds
  checkInterval: 1000,  // 1 second
  simulateTabSwitch: true
};

// Test state
let testResults = {
  visibilityChanges: 0,
  callbacksExecuted: 0,
  errors: [],
  startTime: Date.now(),
  events: []
};

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Enhanced logging
function testLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] 🧪 ${message}`;
  
  testResults.events.push({
    timestamp: Date.now(),
    message,
    type
  });
  
  if (type === 'error') {
    originalConsoleError(logMessage);
    testResults.errors.push(message);
  } else {
    originalConsoleLog(logMessage);
  }
}

// Monitor visibility changes
let originalVisibilityHandler = null;
let visibilityChangeCount = 0;

function monitorVisibilityChanges() {
  testLog('Setting up visibility change monitoring...');
  
  const testVisibilityHandler = () => {
    visibilityChangeCount++;
    testResults.visibilityChanges++;
    
    const isVisible = !document.hidden;
    testLog(`Visibility change detected: ${isVisible ? 'VISIBLE' : 'HIDDEN'} (count: ${visibilityChangeCount})`);
  };
  
  document.addEventListener('visibilitychange', testVisibilityHandler);
  
  return () => {
    document.removeEventListener('visibilitychange', testVisibilityHandler);
    testLog('Visibility change monitoring stopped');
  };
}

// Check for multiple event listeners
function checkEventListeners() {
  testLog('Checking for multiple event listeners...');
  
  // This is a simplified check - in a real scenario you'd need more sophisticated detection
  const listeners = document.getEventListeners ? document.getEventListeners(document) : null;
  
  if (listeners && listeners.visibilitychange) {
    testLog(`Found ${listeners.visibilitychange.length} visibilitychange listeners`);
    if (listeners.visibilitychange.length > 1) {
      testLog('⚠️ WARNING: Multiple visibilitychange listeners detected!', 'error');
    }
  } else {
    testLog('Cannot detect event listeners (getEventListeners not available)');
  }
}

// Test quote loading
function testQuoteLoading() {
  testLog('Testing quote loading...');
  
  try {
    // Check if quotes are loaded
    const quotesElements = document.querySelectorAll('[data-testid="quote-card"], .quote-card, [class*="quote"]');
    testLog(`Found ${quotesElements.length} quote elements on page`);
    
    if (quotesElements.length === 0) {
      testLog('⚠️ No quote elements found - this might indicate a loading issue', 'error');
    }
    
    // Check for loading states
    const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"]');
    testLog(`Found ${loadingElements.length} loading elements`);
    
  } catch (error) {
    testLog(`Error testing quote loading: ${error.message}`, 'error');
  }
}

// Test journal loading
function testJournalLoading() {
  testLog('Testing journal loading...');
  
  try {
    // Check if journal entries are loaded
    const journalElements = document.querySelectorAll('[data-testid="journal-entry"], .journal-entry, [class*="entry"]');
    testLog(`Found ${journalElements.length} journal elements on page`);
    
    if (journalElements.length === 0) {
      testLog('⚠️ No journal elements found - this might indicate a loading issue', 'error');
    }
    
  } catch (error) {
    testLog(`Error testing journal loading: ${error.message}`, 'error');
  }
}

// Simulate tab visibility change
function simulateTabChange() {
  testLog('Simulating tab visibility change...');
  
  // Dispatch a custom visibility change event
  Object.defineProperty(document, 'hidden', {
    value: true,
    configurable: true
  });
  
  document.dispatchEvent(new Event('visibilitychange'));
  
  setTimeout(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true
    });
    
    document.dispatchEvent(new Event('visibilitychange'));
    testLog('Tab visibility simulation completed');
  }, 2000);
}

// Check console for relevant messages
function checkConsoleMessages() {
  testLog('Monitoring console messages...');
  
  // Override console methods to capture messages
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('useQuotes') || message.includes('Journal') || message.includes('TabVisibility')) {
      testLog(`Console: ${message}`);
    }
    originalConsoleLog.apply(console, args);
  };
  
  console.error = function(...args) {
    const message = args.join(' ');
    testLog(`Console Error: ${message}`, 'error');
    originalConsoleError.apply(console, args);
  };
}

// Run comprehensive test
async function runTabVisibilityTest() {
  testLog('🚀 Starting comprehensive tab visibility test...');
  
  // Setup monitoring
  const stopVisibilityMonitoring = monitorVisibilityChanges();
  checkConsoleMessages();
  
  // Initial checks
  checkEventListeners();
  testQuoteLoading();
  testJournalLoading();
  
  // Simulate tab changes if configured
  if (TEST_CONFIG.simulateTabSwitch) {
    setTimeout(simulateTabChange, 5000);
  }
  
  // Run test for specified duration
  const testInterval = setInterval(() => {
    const elapsed = Date.now() - testResults.startTime;
    const remaining = TEST_CONFIG.testDuration - elapsed;
    
    if (remaining <= 0) {
      clearInterval(testInterval);
      finishTest(stopVisibilityMonitoring);
    } else {
      testLog(`Test running... ${Math.round(remaining / 1000)}s remaining`);
    }
  }, TEST_CONFIG.checkInterval);
  
  testLog(`Test will run for ${TEST_CONFIG.testDuration / 1000} seconds`);
}

// Finish test and show results
function finishTest(stopVisibilityMonitoring) {
  testLog('🏁 Test completed!');
  
  // Stop monitoring
  stopVisibilityMonitoring();
  
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  
  // Show results
  const duration = Date.now() - testResults.startTime;
  
  console.log('\n📊 TEST RESULTS:');
  console.log('================');
  console.log(`Duration: ${Math.round(duration / 1000)} seconds`);
  console.log(`Visibility changes detected: ${testResults.visibilityChanges}`);
  console.log(`Errors encountered: ${testResults.errors.length}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\n📝 EVENT LOG:');
  testResults.events.forEach(event => {
    const time = new Date(event.timestamp).toLocaleTimeString();
    console.log(`[${time}] ${event.message}`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (testResults.visibilityChanges === 0) {
    console.log('- No visibility changes detected. Try switching tabs manually.');
  }
  if (testResults.errors.length > 0) {
    console.log('- Errors were detected. Check the error log above.');
  }
  if (testResults.visibilityChanges > 0 && testResults.errors.length === 0) {
    console.log('- ✅ Tab visibility appears to be working correctly!');
  }
}

// Test multiple tab switches
function testMultipleTabSwitches() {
  testLog('🔄 Starting multiple tab switch test...');

  let switchCount = 0;
  const maxSwitches = 5;

  function performTabSwitch() {
    if (switchCount >= maxSwitches) {
      testLog(`✅ Completed ${maxSwitches} tab switches`);
      return;
    }

    switchCount++;
    testLog(`🔄 Performing tab switch ${switchCount}/${maxSwitches}`);

    // Simulate tab becoming hidden
    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));

    // Wait 1 second, then make visible again
    setTimeout(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        configurable: true
      });
      document.dispatchEvent(new Event('visibilitychange'));

      testLog(`✅ Tab switch ${switchCount} completed`);

      // Wait 2 seconds before next switch
      setTimeout(performTabSwitch, 2000);
    }, 1000);
  }

  performTabSwitch();
}

// Instructions for manual testing
function showManualTestInstructions() {
  console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
  console.log('============================');
  console.log('1. Run: runTabVisibilityTest()');
  console.log('2. Switch to another tab or application MULTIPLE TIMES');
  console.log('3. Wait a few seconds between each switch');
  console.log('4. Return to this tab after each switch');
  console.log('5. Check the console for results');
  console.log('\nFor automated testing: tabVisibilityTest.multipleSwitch()');
}

// Export functions for manual use
window.tabVisibilityTest = {
  run: runTabVisibilityTest,
  checkListeners: checkEventListeners,
  testQuotes: testQuoteLoading,
  testJournal: testJournalLoading,
  simulate: simulateTabChange,
  multipleSwitch: testMultipleTabSwitches,
  instructions: showManualTestInstructions
};

// Show instructions
showManualTestInstructions();

console.log('\n🧪 Tab Visibility Test Script Loaded!');
console.log('Run tabVisibilityTest.run() to start the test');
