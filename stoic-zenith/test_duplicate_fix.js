// Test script to verify duplicate entry fix
// Run this in the browser console on the Journal page

async function testDuplicateEntryFix() {
  console.log('🧪 Testing Duplicate Entry Fix...');
  
  // Test 1: Rapid entry creation
  console.log('\n📋 Test 1: Rapid entry creation prevention');
  
  // Get the create entry button
  const createButton = document.querySelector('button:has(svg)'); // Button with Plus icon
  if (!createButton) {
    console.error('❌ Create entry button not found');
    return;
  }
  
  console.log('🔄 Clicking create button rapidly...');
  
  // Record initial entry count
  const initialEntryCount = document.querySelectorAll('[data-testid="entry-item"]').length;
  console.log(`📊 Initial entry count: ${initialEntryCount}`);
  
  // Click rapidly 5 times
  for (let i = 0; i < 5; i++) {
    createButton.click();
    console.log(`🖱️ Click ${i + 1}`);
    await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between clicks
  }
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Check final entry count
  const finalEntryCount = document.querySelectorAll('[data-testid="entry-item"]').length;
  console.log(`📊 Final entry count: ${finalEntryCount}`);
  
  const newEntries = finalEntryCount - initialEntryCount;
  if (newEntries === 1) {
    console.log('✅ Test 1 PASSED: Only 1 entry created despite rapid clicks');
  } else {
    console.log(`❌ Test 1 FAILED: ${newEntries} entries created (expected 1)`);
  }
  
  // Test 2: Typing in new entry
  console.log('\n📋 Test 2: Typing in new entry (no duplicates)');
  
  // Create a new entry
  createButton.click();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const beforeTypingCount = document.querySelectorAll('[data-testid="entry-item"]').length;
  console.log(`📊 Entry count before typing: ${beforeTypingCount}`);
  
  // Find the editor and start typing
  const editor = document.querySelector('[contenteditable="true"]');
  if (!editor) {
    console.error('❌ Editor not found');
    return;
  }
  
  console.log('⌨️ Simulating typing...');
  
  // Simulate typing character by character
  const testText = 'This is a test entry to check for duplicates';
  for (let i = 0; i < testText.length; i++) {
    editor.textContent = testText.substring(0, i + 1);
    
    // Trigger input event
    const inputEvent = new Event('input', { bubbles: true });
    editor.dispatchEvent(inputEvent);
    
    await new Promise(resolve => setTimeout(resolve, 50)); // 50ms between characters
  }
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const afterTypingCount = document.querySelectorAll('[data-testid="entry-item"]').length;
  console.log(`📊 Entry count after typing: ${afterTypingCount}`);
  
  if (afterTypingCount === beforeTypingCount) {
    console.log('✅ Test 2 PASSED: No duplicate entries created while typing');
  } else {
    console.log(`❌ Test 2 FAILED: ${afterTypingCount - beforeTypingCount} duplicate entries created`);
  }
  
  // Test 3: Check localStorage for duplicates
  console.log('\n📋 Test 3: Check localStorage for duplicate entries');
  
  const localStorageKey = Object.keys(localStorage).find(key => key.includes('journal_entries'));
  if (!localStorageKey) {
    console.log('⚠️ No journal entries found in localStorage');
    return;
  }
  
  const storedEntries = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
  console.log(`📊 Total entries in localStorage: ${storedEntries.length}`);
  
  // Check for duplicate IDs
  const entryIds = storedEntries.map(entry => entry.id);
  const uniqueIds = new Set(entryIds);
  
  if (entryIds.length === uniqueIds.size) {
    console.log('✅ Test 3 PASSED: No duplicate IDs in localStorage');
  } else {
    console.log(`❌ Test 3 FAILED: ${entryIds.length - uniqueIds.size} duplicate IDs found`);
    
    // Find duplicates
    const duplicates = entryIds.filter((id, index) => entryIds.indexOf(id) !== index);
    console.log('🔍 Duplicate IDs:', [...new Set(duplicates)]);
  }
  
  // Test 4: Check for entries with same date and similar timestamps
  console.log('\n📋 Test 4: Check for entries with same date and similar timestamps');
  
  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = storedEntries.filter(entry => entry.date === today);
  
  console.log(`📊 Today's entries: ${todaysEntries.length}`);
  
  if (todaysEntries.length <= 1) {
    console.log('✅ Test 4 PASSED: No duplicate entries for today');
  } else {
    // Check if entries are created within 5 seconds of each other (likely duplicates)
    const suspiciousPairs = [];
    for (let i = 0; i < todaysEntries.length; i++) {
      for (let j = i + 1; j < todaysEntries.length; j++) {
        const timeDiff = Math.abs(
          new Date(todaysEntries[i].createdAt).getTime() - 
          new Date(todaysEntries[j].createdAt).getTime()
        );
        if (timeDiff < 5000) { // Within 5 seconds
          suspiciousPairs.push([todaysEntries[i].id, todaysEntries[j].id]);
        }
      }
    }
    
    if (suspiciousPairs.length === 0) {
      console.log('✅ Test 4 PASSED: Multiple entries for today but with sufficient time gaps');
    } else {
      console.log(`❌ Test 4 FAILED: ${suspiciousPairs.length} suspicious entry pairs found`);
      console.log('🔍 Suspicious pairs:', suspiciousPairs);
    }
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  console.log('1. Rapid creation prevention: Check console above');
  console.log('2. Typing duplicate prevention: Check console above');
  console.log('3. localStorage ID uniqueness: Check console above');
  console.log('4. Timestamp-based duplicate detection: Check console above');
  
  console.log('\n🎉 Duplicate entry fix testing completed!');
}

// Auto-run if on journal page
if (window.location.pathname.includes('journal') || window.location.pathname.includes('Journal')) {
  console.log('🔧 Duplicate Entry Fix Test Functions:');
  console.log('  - testDuplicateEntryFix() - Run comprehensive duplicate prevention tests');
  console.log('');
  
  // Run automatically after a short delay
  setTimeout(() => {
    testDuplicateEntryFix();
  }, 1000);
} else {
  console.log('📋 Navigate to the Journal page to run duplicate entry tests');
}
