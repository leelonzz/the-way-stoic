// Clear all quote-related localStorage for debugging
// Run this in browser console to start fresh

console.log('🧹 Clearing all quote-related localStorage...');

const keysToRemove = [];

// Find all quote-related keys
Object.keys(localStorage).forEach(key => {
  if (key.includes('quote') || 
      key.includes('twstoic') || 
      key.includes('daily-quote') ||
      key.includes('carousel') ||
      key.includes('wisdom')) {
    keysToRemove.push(key);
  }
});

// Remove the keys
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('❌ Removed:', key);
});

console.log(`✅ Cleared ${keysToRemove.length} localStorage keys`);
console.log('🔄 Refresh the page to test fresh state');

// Show remaining localStorage keys for reference
console.log('📋 Remaining localStorage keys:', Object.keys(localStorage));
