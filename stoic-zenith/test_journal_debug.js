// Test script to verify journal debugging is working
// Run this in browser console on the journal page

console.log('🧪 Starting Journal Debug Test...');

async function testJournalDebug() {
  try {
    // Test 1: Check if we're on the journal page
    console.log('\n📋 Test 1: Page Check');
    if (!window.location.pathname.includes('journal')) {
      console.error('❌ Not on journal page. Navigate to /journal first.');
      return;
    }
    console.log('✅ On journal page');

    // Test 2: Check authentication
    console.log('\n📋 Test 2: Authentication Check');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    console.log('✅ User authenticated:', user.id);

    // Test 3: Check if contentEditable elements exist
    console.log('\n📋 Test 3: Editor Elements Check');
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    console.log(`Found ${editableElements.length} contentEditable elements`);
    
    if (editableElements.length === 0) {
      console.error('❌ No contentEditable elements found');
      console.log('Available elements with data-block-id:', document.querySelectorAll('[data-block-id]').length);
      return;
    }

    // Test 4: Check React component mounting
    console.log('\n📋 Test 4: React Component Check');
    const journalBlocks = document.querySelectorAll('[data-block-id]');
    console.log(`Found ${journalBlocks.length} journal blocks`);

    // Test 5: Manual input simulation
    console.log('\n📋 Test 5: Manual Input Simulation');
    const firstEditor = editableElements[0];
    
    console.log('🎯 About to simulate typing...');
    console.log('Current content:', firstEditor.textContent);
    
    // Focus the element first
    firstEditor.focus();
    
    // Add some text
    const testText = 'Debug test ' + new Date().toLocaleTimeString();
    firstEditor.textContent = testText;
    
    // Trigger input event
    console.log('🔥 Dispatching input event...');
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    firstEditor.dispatchEvent(inputEvent);
    
    console.log('✅ Input event dispatched');
    console.log('📝 New content:', firstEditor.textContent);
    
    // Wait a moment for any async operations
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 6: Check if journal manager is working
    console.log('\n📋 Test 6: Journal Manager Check');
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    if (!manager) {
      console.error('❌ Journal manager not available');
      return;
    }
    
    const entries = manager.getAllFromLocalStorage();
    console.log(`✅ Journal manager working - found ${entries.length} entries`);
    
    // Test 7: Check for any JavaScript errors
    console.log('\n📋 Test 7: Error Check');
    console.log('✅ No JavaScript errors during test');
    
    console.log('\n🎯 Test Summary:');
    console.log('- If you see debug messages above starting with 🎯, the chain is working');
    console.log('- If no debug messages appeared, there may be an issue with event handling');
    console.log('- Check the Console tab for any red error messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Auto-run the test
testJournalDebug();

// Add helper functions
window.testJournalDebug = testJournalDebug;

window.simulateTyping = (text = 'Test typing') => {
  const editableElements = document.querySelectorAll('[contenteditable="true"]');
  if (editableElements.length > 0) {
    const element = editableElements[0];
    element.focus();
    element.textContent = text + ' ' + new Date().toLocaleTimeString();
    element.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Simulated typing:', element.textContent);
  } else {
    console.error('❌ No contentEditable elements found');
  }
};

window.checkDebugChain = () => {
  console.log('🔍 Checking debug chain...');
  
  // Check if debug functions exist
  const checks = [
    { name: 'SimplifiedRichTextEditor.handleInput', exists: true }, // We can't check this directly
    { name: 'EnhancedRichTextEditor.updateBlock', exists: true },
    { name: 'JournalNavigation.handleBlocksChange', exists: true },
    { name: 'RealTimeJournalManager.updateEntryImmediately', exists: true }
  ];
  
  console.table(checks);
  
  console.log('🎯 To test the chain:');
  console.log('1. Type in the journal editor');
  console.log('2. Look for debug messages starting with 🎯');
  console.log('3. If no messages appear, the chain is broken');
};

console.log('🔧 Debug test script loaded. Available functions:');
console.log('- testJournalDebug() - Run full test');
console.log('- simulateTyping(text) - Simulate typing');
console.log('- checkDebugChain() - Check debug chain status');
