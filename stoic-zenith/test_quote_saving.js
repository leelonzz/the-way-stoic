// Test script to verify quote saving functionality
// Run this in the browser console while on the Daily Stoic Wisdom page

async function testQuoteSaving() {
  console.log('🧪 Testing Quote Saving Functionality...');
  
  // Check if user is logged in
  const { data: { user } } = await window.supabase?.auth?.getUser?.() || { data: { user: null } };
  
  if (!user) {
    console.error('❌ User not logged in. Please log in first.');
    return;
  }
  
  console.log('✅ User logged in:', user.email);
  
  // Test database connection
  try {
    const { data, error } = await window.supabase
      .from('quotes')
      .select('id, text, author')
      .limit(1);
      
    if (error) {
      console.error('❌ Database connection error:', error);
      return;
    }
    
    console.log('✅ Database connection working');
    
    if (!data || data.length === 0) {
      console.error('❌ No quotes found in database');
      return;
    }
    
    const testQuote = data[0];
    console.log('📝 Test quote:', testQuote.text.substring(0, 50) + '...');
    
    // Test saving a quote
    console.log('💾 Testing quote save...');
    
    const { error: saveError } = await window.supabase
      .from('saved_quotes')
      .insert({
        user_id: user.id,
        quote_text: testQuote.text,
        author: testQuote.author,
        source: 'Test',
        tags: ['test'],
        personal_note: 'Test save from console',
        is_favorite: false,
        saved_at: new Date().toISOString()
      });
    
    if (saveError) {
      console.error('❌ Save error:', saveError);
      
      // Check if it's a schema issue
      if (saveError.message.includes('column') && saveError.message.includes('does not exist')) {
        console.error('🔧 Schema issue detected. Please run the fix_saved_quotes_schema.sql script in Supabase.');
      }
      
      return;
    }
    
    console.log('✅ Quote saved successfully!');
    
    // Test fetching saved quotes
    console.log('📖 Testing saved quotes fetch...');
    
    const { data: savedQuotes, error: fetchError } = await window.supabase
      .from('saved_quotes')
      .select('*')
      .eq('user_id', user.id)
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    console.log('✅ Saved quotes fetched successfully:', savedQuotes.length, 'quotes');
    
    // Clean up test data
    if (savedQuotes.length > 0) {
      const testSavedQuote = savedQuotes.find(sq => sq.personal_note === 'Test save from console');
      if (testSavedQuote) {
        await window.supabase
          .from('saved_quotes')
          .delete()
          .eq('id', testSavedQuote.id);
        console.log('🧹 Test data cleaned up');
      }
    }
    
    console.log('🎉 All tests passed! Quote saving should work correctly.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Instructions
console.log(`
🧪 Quote Saving Test Script Loaded

To run the test, execute:
testQuoteSaving()

This will:
1. Check if you're logged in
2. Test database connection
3. Try saving a test quote
4. Try fetching saved quotes
5. Clean up test data

Make sure you're on the Daily Stoic Wisdom page and logged in before running.
`);

// Make function available globally
window.testQuoteSaving = testQuoteSaving;
