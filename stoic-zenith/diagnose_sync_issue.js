// Comprehensive Journal Sync Diagnostic Script
// Run this in browser console to diagnose sync issues

console.log('🔍 Starting Journal Sync Diagnostic...');

async function diagnoseSyncIssue() {
  try {
    // Test 1: Check if we're on the journal page
    console.log('\n📋 Test 1: Page Check');
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    if (!currentPath.includes('journal')) {
      console.warn('⚠️ Not on journal page. Navigate to /journal first.');
      return;
    }
    
    // Test 2: Check authentication
    console.log('\n📋 Test 2: Authentication Check');
    const { data: { user }, error: authError } = await window.supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    
    // Test 3: Check if journal manager is available
    console.log('\n📋 Test 3: Journal Manager Check');
    const manager = window.RealTimeJournalManager?.getInstance(user.id);
    
    if (!manager) {
      console.error('❌ Journal manager not available');
      console.log('Available on window:', Object.keys(window).filter(key => key.includes('journal') || key.includes('Journal')));
      return;
    }
    
    console.log('✅ Journal manager available');
    
    // Test 4: Check if contentEditable elements exist
    console.log('\n📋 Test 4: Editor Elements Check');
    const editableElements = document.querySelectorAll('[contenteditable="true"]');
    console.log(`Found ${editableElements.length} contentEditable elements`);
    
    if (editableElements.length === 0) {
      console.error('❌ No contentEditable elements found');
      console.log('This suggests the journal editor is not properly mounted');
      return;
    }
    
    // Test 5: Check if elements have event listeners
    console.log('\n📋 Test 5: Event Listeners Check');
    editableElements.forEach((element, index) => {
      console.log(`Element ${index + 1}:`, {
        tagName: element.tagName,
        className: element.className,
        hasOnInput: element.oninput !== null,
        hasEventListeners: getEventListeners ? 'Available' : 'Not available'
      });
    });
    
    // Test 6: Manually trigger input event
    console.log('\n📋 Test 6: Manual Input Test');
    if (editableElements.length > 0) {
      const firstEditor = editableElements[0];
      console.log('Triggering manual input event...');
      
      // Add some text
      firstEditor.textContent = 'Test input ' + new Date().toLocaleTimeString();
      
      // Trigger input event
      const inputEvent = new Event('input', { bubbles: true });
      firstEditor.dispatchEvent(inputEvent);
      
      console.log('Manual input event dispatched. Check for debug messages above.');
    }
    
    // Test 7: Check React component tree
    console.log('\n📋 Test 7: React Component Check');
    const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
    if (reactRoot) {
      console.log('✅ React root found');
      
      // Check for journal-specific elements
      const journalElements = document.querySelectorAll('[data-block-id]');
      console.log(`Found ${journalElements.length} journal blocks`);
      
      if (journalElements.length === 0) {
        console.error('❌ No journal blocks found');
        console.log('This suggests the journal component is not rendering properly');
      }
    } else {
      console.error('❌ React root not found');
    }
    
    // Test 8: Check for JavaScript errors
    console.log('\n📋 Test 8: Error Check');
    console.log('Check the Console tab for any JavaScript errors (red messages)');
    console.log('Common issues:');
    console.log('- Module import errors');
    console.log('- React hydration errors');
    console.log('- Supabase connection errors');
    
    // Test 9: Test journal manager methods
    console.log('\n📋 Test 9: Journal Manager Methods Test');
    try {
      const entries = manager.getAllFromLocalStorage();
      console.log(`✅ Found ${entries.length} entries in localStorage`);
      
      if (entries.length > 0) {
        const firstEntry = entries[0];
        console.log('First entry:', {
          id: firstEntry.id,
          blocks: firstEntry.blocks.length,
          hasContent: firstEntry.blocks.some(b => b.text && b.text.trim())
        });
      }
    } catch (error) {
      console.error('❌ Error accessing journal manager methods:', error);
    }
    
    console.log('\n🎯 Diagnostic Summary:');
    console.log('1. If no contentEditable elements found → Journal component not mounting');
    console.log('2. If no debug messages after manual input → Event handlers not working');
    console.log('3. If JavaScript errors present → Fix errors first');
    console.log('4. If everything looks good but still no auto-save → Check network tab for failed requests');
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Auto-run the diagnostic
diagnoseSyncIssue();

// Add helper functions
window.diagnoseSyncIssue = diagnoseSyncIssue;

window.testManualInput = () => {
  const editableElements = document.querySelectorAll('[contenteditable="true"]');
  if (editableElements.length > 0) {
    const element = editableElements[0];
    element.textContent = 'Manual test ' + new Date().toLocaleTimeString();
    element.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('Manual input test completed. Check for debug messages.');
  } else {
    console.error('No contentEditable elements found');
  }
};

console.log('🔧 Diagnostic script loaded. Available functions:');
console.log('- diagnoseSyncIssue() - Run full diagnostic');
console.log('- testManualInput() - Test manual input event');
