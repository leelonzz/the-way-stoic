// Debug script to diagnose user session issues
// Run this in the browser console while on the quotes page

async function debugUserSession() {
  console.log('🔍 Debugging User Session Issues...');
  
  try {
    // 1. Check current user session
    console.log('📋 Step 1: Checking current user session...');
    const { data: { user }, error: userError } = await window.supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return;
    }
    
    if (!user) {
      console.error('❌ No user session found. Please log in.');
      return;
    }
    
    console.log('✅ User session found:', {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
      aud: user.aud,
      role: user.role
    });
    
    // 2. Validate user ID format
    console.log('📋 Step 2: Validating user ID format...');
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id);
    console.log('UUID validation:', isValidUUID ? '✅ Valid' : '❌ Invalid');
    
    if (!isValidUUID) {
      console.error('❌ User ID is not a valid UUID:', user.id);
      return;
    }
    
    // 3. Check if user exists in auth.users by trying to access user metadata
    console.log('📋 Step 3: Checking user metadata access...');
    const { data: session, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }
    
    console.log('✅ Session data:', {
      access_token: session.session?.access_token ? 'Present' : 'Missing',
      refresh_token: session.session?.refresh_token ? 'Present' : 'Missing',
      expires_at: session.session?.expires_at,
      user_id: session.session?.user?.id
    });
    
    // 4. Test database access with current user
    console.log('📋 Step 4: Testing database access...');
    
    // Try to query a simple table that requires authentication
    const { data: testData, error: testError } = await window.supabase
      .from('saved_quotes')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    
    if (testError) {
      console.error('❌ Database access test failed:', testError);
      
      if (testError.message.includes('JWT')) {
        console.error('🔧 DIAGNOSIS: JWT token issue - session may be expired or invalid');
        console.error('💡 SOLUTION: Log out and log back in to refresh the session');
      } else if (testError.message.includes('RLS')) {
        console.error('🔧 DIAGNOSIS: Row Level Security policy issue');
        console.error('💡 SOLUTION: Check RLS policies for saved_quotes table');
      } else {
        console.error('🔧 DIAGNOSIS: Unknown database access issue');
      }
      
      return;
    }
    
    console.log('✅ Database access successful');
    
    // 5. Test a simple insert to saved_quotes
    console.log('📋 Step 5: Testing quote save operation...');
    
    // First get a quote to test with
    const { data: quotes, error: quotesError } = await window.supabase
      .from('quotes')
      .select('id, text, author, source, category, mood_tags')
      .limit(1);
    
    if (quotesError || !quotes || quotes.length === 0) {
      console.error('❌ Cannot get test quote:', quotesError);
      return;
    }
    
    const testQuote = quotes[0];
    console.log('📝 Using test quote:', testQuote.text.substring(0, 50) + '...');
    
    // Try to save the quote
    const saveData = {
      user_id: user.id,
      quote_text: testQuote.text,
      author: testQuote.author,
      source: testQuote.source || 'Debug Test',
      tags: testQuote.mood_tags || ['debug'],
      personal_note: 'Debug test - ' + new Date().toISOString(),
      is_favorite: false,
      saved_at: new Date().toISOString()
    };
    
    console.log('💾 Attempting to save quote...');
    const { data: saveResult, error: saveError } = await window.supabase
      .from('saved_quotes')
      .insert(saveData)
      .select();
    
    if (saveError) {
      console.error('❌ Quote save failed:', saveError);
      
      // Detailed error analysis
      if (saveError.message.includes('Key is not present in table')) {
        console.error('🔧 DIAGNOSIS: Foreign key constraint violation');
        console.error('🔍 This means the user_id does not exist in auth.users table');
        console.error('💡 SOLUTIONS:');
        console.error('   1. Log out and log back in to refresh the user session');
        console.error('   2. Check if the user was deleted from Supabase Auth');
        console.error('   3. Verify the auth.users table exists and is accessible');
      } else if (saveError.message.includes('violates foreign key constraint')) {
        console.error('🔧 DIAGNOSIS: Foreign key constraint violation');
        console.error('💡 SOLUTION: User session is stale, log out and log back in');
      } else if (saveError.message.includes('duplicate key')) {
        console.error('🔧 DIAGNOSIS: Duplicate entry (this is actually good - means the save would work)');
        console.log('✅ Save operation would succeed (duplicate is expected for test)');
      } else {
        console.error('🔧 DIAGNOSIS: Unknown save error');
      }
      
      return;
    }
    
    console.log('✅ Quote saved successfully!', saveResult);
    
    // Clean up test quote
    if (saveResult && saveResult.length > 0) {
      const { error: deleteError } = await window.supabase
        .from('saved_quotes')
        .delete()
        .eq('id', saveResult[0].id);
      
      if (!deleteError) {
        console.log('🧹 Test quote cleaned up');
      }
    }
    
    console.log('🎉 User session debug completed - everything looks good!');
    
  } catch (error) {
    console.error('💥 Unexpected error during debug:', error);
  }
}

// Auto-run the debug
if (typeof window !== 'undefined' && window.supabase) {
  debugUserSession();
} else {
  console.log('📋 Supabase not available. Make sure you are on a page with Supabase loaded.');
}
