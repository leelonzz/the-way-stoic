// Script to refresh user session and test quote saving
// Run this in the browser console

async function refreshUserSession() {
  console.log('🔄 Refreshing user session...');
  
  try {
    // 1. Get current session
    const { data: currentSession, error: sessionError } = await window.supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting current session:', sessionError);
      return;
    }
    
    if (!currentSession.session) {
      console.error('❌ No active session found. Please log in.');
      return;
    }
    
    console.log('📋 Current session expires at:', new Date(currentSession.session.expires_at * 1000));
    
    // 2. Check if session is expired or about to expire
    const now = Date.now() / 1000;
    const expiresAt = currentSession.session.expires_at;
    const timeUntilExpiry = expiresAt - now;
    
    console.log('⏰ Time until expiry:', Math.round(timeUntilExpiry / 60), 'minutes');
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('⚠️ Session expires soon, refreshing...');
      
      // 3. Refresh the session
      const { data: refreshedSession, error: refreshError } = await window.supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Error refreshing session:', refreshError);
        console.log('💡 Please log out and log back in manually');
        return;
      }
      
      console.log('✅ Session refreshed successfully');
      console.log('📋 New session expires at:', new Date(refreshedSession.session.expires_at * 1000));
    } else {
      console.log('✅ Session is still valid');
    }
    
    // 4. Test quote saving after refresh
    console.log('🧪 Testing quote saving...');
    
    // Get a test quote
    const { data: quotes, error: quotesError } = await window.supabase
      .from('quotes')
      .select('*')
      .limit(1);
    
    if (quotesError || !quotes || quotes.length === 0) {
      console.error('❌ Cannot get test quote:', quotesError);
      return;
    }
    
    const testQuote = quotes[0];
    const { data: { user } } = await window.supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ No user found after session refresh');
      return;
    }
    
    console.log('👤 User ID:', user.id);
    
    // Try to save the quote
    const saveData = {
      user_id: user.id,
      quote_text: testQuote.text,
      author: testQuote.author,
      source: testQuote.source || 'Session Test',
      tags: testQuote.mood_tags || ['test'],
      personal_note: 'Session refresh test - ' + new Date().toISOString(),
      is_favorite: false,
      saved_at: new Date().toISOString()
    };
    
    const { data: saveResult, error: saveError } = await window.supabase
      .from('saved_quotes')
      .insert(saveData)
      .select();
    
    if (saveError) {
      console.error('❌ Quote save still failing:', saveError);
      
      if (saveError.message.includes('Key is not present in table')) {
        console.error('🔧 The user ID still does not exist in auth.users');
        console.error('💡 This suggests the user account may have been deleted from Supabase Auth');
        console.error('🔄 Try logging out completely and logging back in');
      }
      
      return;
    }
    
    console.log('✅ Quote saved successfully after session refresh!');
    
    // Clean up
    if (saveResult && saveResult.length > 0) {
      await window.supabase
        .from('saved_quotes')
        .delete()
        .eq('id', saveResult[0].id);
      console.log('🧹 Test quote cleaned up');
    }
    
    console.log('🎉 Session refresh and quote saving test completed successfully!');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Function to force logout and clear all cached data
async function forceLogoutAndClear() {
  console.log('🚪 Forcing logout and clearing all cached data...');
  
  try {
    // Clear localStorage
    localStorage.removeItem('was-authenticated');
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Sign out from Supabase
    await window.supabase.auth.signOut();
    
    console.log('✅ Logout completed. Please refresh the page and log back in.');
    
  } catch (error) {
    console.error('❌ Error during logout:', error);
  }
}

// Auto-run session refresh
if (typeof window !== 'undefined' && window.supabase) {
  console.log('🔧 Available functions:');
  console.log('  - refreshUserSession() - Refresh current session and test saving');
  console.log('  - forceLogoutAndClear() - Force logout and clear all cached data');
  console.log('');
  
  refreshUserSession();
} else {
  console.log('📋 Supabase not available. Make sure you are on a page with Supabase loaded.');
}
