// Debug script specifically for new account issues
// Run this in the browser console while logged in with the new account

async function debugNewAccount() {
  console.log('🔍 Debugging New Account Issues...');
  
  try {
    // 1. Check current user session details
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
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata
    });
    
    // 2. Check if this is a newly created account
    const accountAge = Date.now() - new Date(user.created_at).getTime();
    const accountAgeMinutes = Math.round(accountAge / (1000 * 60));
    console.log(`📅 Account age: ${accountAgeMinutes} minutes`);
    
    if (accountAgeMinutes < 60) {
      console.log('🆕 This appears to be a newly created account');
    }
    
    // 3. Check session validity
    const { data: session, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
      return;
    }
    
    if (!session.session) {
      console.error('❌ No active session found');
      return;
    }
    
    console.log('✅ Session details:', {
      access_token_present: !!session.session.access_token,
      refresh_token_present: !!session.session.refresh_token,
      expires_at: new Date(session.session.expires_at * 1000),
      token_type: session.session.token_type,
      user_id_match: session.session.user.id === user.id
    });
    
    // 4. Test database connectivity with auth context
    console.log('📋 Step 2: Testing database connectivity...');
    
    // Try to query saved_quotes with the current user
    const { data: savedQuotes, error: savedQuotesError } = await window.supabase
      .from('saved_quotes')
      .select('id, user_id')
      .eq('user_id', user.id);
    
    if (savedQuotesError) {
      console.error('❌ Error querying saved_quotes:', savedQuotesError);
      
      if (savedQuotesError.message.includes('JWT')) {
        console.error('🔧 DIAGNOSIS: JWT/Authentication issue');
        console.error('💡 SOLUTION: The session token may be invalid');
      } else if (savedQuotesError.message.includes('RLS')) {
        console.error('🔧 DIAGNOSIS: Row Level Security issue');
        console.error('💡 SOLUTION: RLS policies may not recognize this user');
      }
    } else {
      console.log('✅ Database query successful');
      console.log(`📊 Found ${savedQuotes.length} saved quotes for this user`);
    }
    
    // 5. Test a simple insert operation
    console.log('📋 Step 3: Testing quote save operation...');
    
    // Get a test quote
    const { data: quotes, error: quotesError } = await window.supabase
      .from('quotes')
      .select('id, text, author, source, mood_tags')
      .limit(1);
    
    if (quotesError || !quotes || quotes.length === 0) {
      console.error('❌ Cannot get test quote:', quotesError);
      return;
    }
    
    const testQuote = quotes[0];
    console.log('📝 Using test quote:', testQuote.text.substring(0, 50) + '...');
    
    // Prepare save data
    const saveData = {
      user_id: user.id,
      quote_text: testQuote.text,
      author: testQuote.author,
      source: testQuote.source || 'New Account Test',
      tags: testQuote.mood_tags || ['test'],
      personal_note: 'New account test - ' + new Date().toISOString(),
      is_favorite: false,
      saved_at: new Date().toISOString()
    };
    
    console.log('💾 Attempting to save quote with data:', {
      user_id: saveData.user_id,
      quote_text_length: saveData.quote_text.length,
      author: saveData.author
    });
    
    const { data: saveResult, error: saveError } = await window.supabase
      .from('saved_quotes')
      .insert(saveData)
      .select();
    
    if (saveError) {
      console.error('❌ Quote save failed:', saveError);
      
      // Detailed error analysis for new accounts
      if (saveError.message.includes('Key is not present in table')) {
        console.error('🔧 DIAGNOSIS: Foreign key constraint violation');
        console.error('🔍 The user_id does not exist in auth.users table');
        console.error('💡 POSSIBLE CAUSES:');
        console.error('   1. Account creation process was incomplete');
        console.error('   2. User was created in the app but not in Supabase Auth');
        console.error('   3. There is a delay in user propagation');
        console.error('');
        console.error('🔄 SOLUTIONS TO TRY:');
        console.error('   1. Log out completely and log back in');
        console.error('   2. Wait a few minutes and try again');
        console.error('   3. Check Supabase Auth dashboard for this user');
        
        // Try to get more info about the user
        console.log('🔍 Attempting to verify user existence...');
        
        // Test if we can create a profile (this might give us more info)
        const { data: profileTest, error: profileError } = await window.supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.error('❌ User profile does not exist - account creation was incomplete');
          } else {
            console.error('❌ Profile check error:', profileError);
          }
        } else {
          console.log('✅ User profile exists:', profileTest);
        }
        
      } else if (saveError.message.includes('violates foreign key constraint')) {
        console.error('🔧 DIAGNOSIS: Foreign key constraint violation');
        console.error('💡 SOLUTION: User session is invalid for new account');
      } else if (saveError.message.includes('duplicate key')) {
        console.error('🔧 DIAGNOSIS: Duplicate entry (this is actually good)');
        console.log('✅ Save operation would succeed - duplicate is expected for test');
      } else {
        console.error('🔧 DIAGNOSIS: Unknown save error for new account');
        console.error('📋 Full error details:', saveError);
      }
      
      return;
    }
    
    console.log('✅ Quote saved successfully for new account!', saveResult);
    
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
    
    console.log('🎉 New account debug completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error during new account debug:', error);
  }
}

// Function specifically for new account setup
async function fixNewAccountSetup() {
  console.log('🔧 Attempting to fix new account setup...');
  
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No user found');
      return;
    }
    
    console.log('👤 Fixing setup for user:', user.email);
    
    // 1. Refresh the session
    console.log('🔄 Refreshing session...');
    const { data: refreshed, error: refreshError } = await window.supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('❌ Session refresh failed:', refreshError);
    } else {
      console.log('✅ Session refreshed');
    }
    
    // 2. Wait a moment for propagation
    console.log('⏳ Waiting for user propagation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Try the save operation again
    console.log('🧪 Testing save operation after fix...');
    await debugNewAccount();
    
  } catch (error) {
    console.error('💥 Error during new account fix:', error);
  }
}

// Auto-run for new account
if (typeof window !== 'undefined' && window.supabase) {
  console.log('🔧 New Account Debug Functions:');
  console.log('  - debugNewAccount() - Debug new account issues');
  console.log('  - fixNewAccountSetup() - Attempt to fix new account setup');
  console.log('');
  
  debugNewAccount();
} else {
  console.log('📋 Supabase not available. Make sure you are on a page with Supabase loaded.');
}
