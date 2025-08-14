// Test script for quote persistence
// Run this in the browser console to test quote persistence functionality

console.log('=== Quote Persistence Test ===');

// Function to test localStorage persistence
function testQuotePersistence() {
  const storageKey = 'twstoic:wisdom-state';
  
  console.log('1. Checking current localStorage state...');
  const currentState = localStorage.getItem(storageKey);
  console.log('Current state:', currentState ? JSON.parse(currentState) : 'No state found');
  
  console.log('2. Testing quote navigation...');
  
  // Simulate navigation by checking if navigation buttons exist
  const leftButton = document.querySelector('button[aria-label="Next quote"]');
  const rightButton = document.querySelector('button[aria-label="Previous quote"]');
  
  if (leftButton && rightButton) {
    console.log('Navigation buttons found');
    
    // Get current quote text
    const currentQuoteElement = document.querySelector('blockquote');
    const currentQuoteText = currentQuoteElement ? currentQuoteElement.textContent : 'No quote found';
    console.log('Current quote:', currentQuoteText.substring(0, 100) + '...');
    
    // Test navigation
    console.log('3. Testing navigation...');
    console.log('Clicking next button...');
    leftButton.click();
    
    setTimeout(() => {
      const newQuoteElement = document.querySelector('blockquote');
      const newQuoteText = newQuoteElement ? newQuoteElement.textContent : 'No quote found';
      console.log('New quote after navigation:', newQuoteText.substring(0, 100) + '...');
      
      // Check if state was updated
      const updatedState = localStorage.getItem(storageKey);
      console.log('Updated state:', updatedState ? JSON.parse(updatedState) : 'No state found');
      
      console.log('4. Test page reload simulation...');
      console.log('Current quote ID should persist after reload');
      console.log('To test: reload the page and check if the same quote is displayed');
      
    }, 1000);
    
  } else {
    console.log('Navigation buttons not found. Make sure you are on the quotes page with library tab active.');
  }
}

// Function to check quote counter
function checkQuoteCounter() {
  const counter = document.querySelector('.absolute.bottom-8.right-8');
  if (counter) {
    console.log('Quote counter:', counter.textContent);
    return counter.textContent;
  }
  return 'Counter not found';
}

// Function to manually test persistence
function manualPersistenceTest() {
  console.log('=== Manual Persistence Test ===');
  console.log('1. Note the current quote and counter position');
  console.log('2. Navigate to a different quote using arrow keys or buttons');
  console.log('3. Reload the page (Ctrl+R or Cmd+R)');
  console.log('4. Check if the same quote is displayed after reload');
  console.log('');
  console.log('Current quote counter:', checkQuoteCounter());
}

// Run the test
testQuotePersistence();

// Export functions for manual testing
window.testQuotePersistence = testQuotePersistence;
window.manualPersistenceTest = manualPersistenceTest;
window.checkQuoteCounter = checkQuoteCounter;

console.log('');
console.log('Available test functions:');
console.log('- testQuotePersistence(): Run automated test');
console.log('- manualPersistenceTest(): Get instructions for manual testing');
console.log('- checkQuoteCounter(): Check current quote position');
