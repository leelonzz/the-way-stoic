// Debug script to diagnose quote saving issues
// Run this in the browser console while on the quotes page

async function debugQuoteSaving() {
  console.log('🔍 Debugging Quote Saving Issues...');

  try {
    // Try to access supabase from different possible locations
    let supabase = window.supabase;

    if (!supabase) {
      // Try to get it from React DevTools or global scope
      console.log('🔍 Trying to find Supabase client...');

      // Check if we can access it through React components
      const reactRoot = document.querySelector('#__next') || document.querySelector('[data-reactroot]');
      if (reactRoot && reactRoot._reactInternalFiber) {
        console.log('Found React root, but cannot access Supabase directly');
      }

      console.error('❌ Cannot access Supabase client from console');
      console.log('💡 Please run this script by adding it to the application code instead');
      return;
    }

    // 1. Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.error('❌ User not authenticated. Please log in first.');
      return;
    }
    
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    });
    
    // 2. Check if user exists in auth.users table
    console.log('🔍 Checking if user exists in auth.users table...');
    const { data: authUsers, error: authError } = await window.supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', user.id);
    
    if (authError) {
      console.log('⚠️ Cannot query auth.users directly (expected):', authError.message);
    } else {
      console.log('✅ Auth users query result:', authUsers);
    }
    
    // 3. Check saved_quotes table schema
    console.log('🔍 Checking saved_quotes table schema...');
    const { data: schemaData, error: schemaError } = await window.supabase
      .from('saved_quotes')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('❌ Error checking saved_quotes schema:', schemaError);
      return;
    }
    
    console.log('✅ saved_quotes table accessible');
    
    // 4. Check if we can query quotes table
    console.log('🔍 Checking quotes table...');
    const { data: quotesData, error: quotesError } = await window.supabase
      .from('quotes')
      .select('id, text, author, source, category')
      .limit(1);
    
    if (quotesError) {
      console.error('❌ Error accessing quotes table:', quotesError);
      return;
    }
    
    if (!quotesData || quotesData.length === 0) {
      console.error('❌ No quotes found in database');
      return;
    }
    
    console.log('✅ Quotes table accessible, sample quote:', quotesData[0]);
    
    // 5. Test saving a quote with the current schema
    console.log('🧪 Testing quote save with current schema...');
    const testQuote = quotesData[0];
    
    const saveData = {
      user_id: user.id,
      quote_text: testQuote.text,
      author: testQuote.author,
      source: testQuote.source || 'Debug Test',
      tags: ['debug', 'test'],
      personal_note: 'Debug test save - ' + new Date().toISOString(),
      is_favorite: false,
      saved_at: new Date().toISOString()
    };
    
    console.log('📝 Attempting to save with data:', saveData);
    
    const { data: saveResult, error: saveError } = await window.supabase
      .from('saved_quotes')
      .insert(saveData)
      .select();
    
    if (saveError) {
      console.error('❌ Save failed:', saveError);
      
      // Analyze the error
      if (saveError.message.includes('Key is not present in table')) {
        console.error('🔧 DIAGNOSIS: Foreign key constraint violation - user_id not found in auth.users table');
        console.error('💡 SOLUTION: This suggests the user session is invalid or the user was deleted from auth.users');
        console.error('🔄 Try logging out and logging back in');
      } else if (saveError.message.includes('column') && saveError.message.includes('does not exist')) {
        console.error('🔧 DIAGNOSIS: Schema mismatch - missing columns in saved_quotes table');
        console.error('💡 SOLUTION: Run the database migration to add missing columns');
      } else {
        console.error('🔧 DIAGNOSIS: Unknown error');
      }
      
      return;
    }
    
    console.log('✅ Quote saved successfully!', saveResult);
    
    // 6. Clean up - delete the test quote
    if (saveResult && saveResult.length > 0) {
      const { error: deleteError } = await window.supabase
        .from('saved_quotes')
        .delete()
        .eq('id', saveResult[0].id);
      
      if (deleteError) {
        console.warn('⚠️ Could not clean up test quote:', deleteError);
      } else {
        console.log('🧹 Test quote cleaned up');
      }
    }
    
    console.log('🎉 Quote saving debug completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error during debug:', error);
  }
}

// Auto-run if supabase is available
if (typeof window !== 'undefined' && window.supabase) {
  debugQuoteSaving();
} else {
  console.log('📋 To run this debug script:');
  console.log('1. Open the browser console on a page with Supabase loaded');
  console.log('2. Paste this script and run it');
  console.log('3. Or call debugQuoteSaving() manually');
}
