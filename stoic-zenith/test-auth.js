// Simple test to verify Supabase authentication
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://xzindyqvzwbaeerlcbyx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aW5keXF2endiYWVlcmxjYnl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5Mzg0ODIsImV4cCI6MjA2OTUxNDQ4Mn0.465X0mjMf6FrxZlqbl-8zmCcy5rvx3U8XQYeE82vwbg";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

async function testAuth() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test getting session
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('Session:', session ? 'Found' : 'None');
    console.log('Session details:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      email: session?.user?.email,
      expiresAt: session?.expires_at
    });
    
    if (error) {
      console.error('Session error:', error);
    }
    
    // Test getting user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User:', user ? 'Found' : 'None');
    console.log('User details:', {
      hasUser: !!user,
      email: user?.email,
      id: user?.id
    });
    
    if (userError) {
      console.error('User error:', userError);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run if this is being executed directly
if (typeof window !== 'undefined') {
  testAuth();
}

export { testAuth };
