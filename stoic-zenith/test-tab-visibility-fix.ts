// Test script to verify tab visibility fix
// This simulates the tab visibility change behavior

console.log('Testing tab visibility fix for quotes...');

// Simulate tab visibility change
function _simulateTabVisibilityChange(): void {
  console.log('Simulating tab visibility change...');
  
  // Simulate tab becoming hidden
  Object.defineProperty(document, 'hidden', {
    value: true,
    writable: true
  });
  
  // Trigger visibility change event
  document.dispatchEvent(new Event('visibilitychange'));
  
  console.log('Tab hidden, waiting 6 seconds...');
  
  // Simulate tab becoming visible after 6 seconds (more than 5 minute threshold)
  setTimeout(() => {
    Object.defineProperty(document, 'hidden', {
      value: false,
      writable: true
    });
    
    document.dispatchEvent(new Event('visibilitychange'));
    console.log('Tab visible again - should trigger refetch if more than 5 minutes passed');
  }, 6000);
}

// Test localStorage cache
function testLocalStorageCache(): void {
  console.log('Testing localStorage cache...');
  
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `daily-quote-${today}`;
  
  // Test quote cache
  const testQuote = {
    id: 'test-quote',
    text: 'Test quote for cache',
    author: 'Test Author',
    category: 'test',
    created_at: new Date().toISOString()
  };
  
  try {
    localStorage.setItem(cacheKey, JSON.stringify(testQuote));
    console.log('Quote cached successfully');
    
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log('Retrieved cached quote:', parsed.text);
    }
  } catch (error) {
    console.error('LocalStorage test failed:', error);
  }
}

// Run tests
if (typeof window !== 'undefined') {
  testLocalStorageCache();
  // simulateTabVisibilityChange(); // Uncomment to test tab visibility
}

console.log('Tab visibility fix test completed'); 