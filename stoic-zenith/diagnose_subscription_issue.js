/**
 * Diagnostic script to identify subscription plan issues
 * Run this in the browser console to check subscription status
 */

async function diagnoseSubscriptionIssue() {
  console.log('🔍 DIAGNOSING SUBSCRIPTION PLAN ISSUE...\n');
  
  // Step 1: Check authentication
  console.log('🔐 Step 1: Authentication Check');
  try {
    if (!window.supabase) {
      console.error('❌ Supabase not available');
      return;
    }
    
    const { data: { user }, error } = await window.supabase.auth.getUser();
    if (error) {
      console.error('❌ Auth error:', error);
      return;
    }
    
    if (!user) {
      console.error('❌ No user authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', user.id);
    console.log('User email:', user.email);
    console.log('User metadata:', user.user_metadata);
  } catch (error) {
    console.error('❌ Authentication check failed:', error);
    return;
  }
  
  // Step 2: Check profile data
  console.log('\n👤 Step 2: Profile Data Check');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    const { data: profile, error: profileError } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return;
    }
    
    if (!profile) {
      console.error('❌ No profile found');
      return;
    }
    
    console.log('✅ Profile found:', profile);
    console.log('Subscription status:', profile.subscription_status);
    console.log('Subscription plan:', profile.subscription_plan);
    console.log('Profile created:', profile.created_at);
    console.log('Profile updated:', profile.updated_at);
    
    // Check subscription fields specifically
    const subscriptionFields = {
      subscription_status: profile.subscription_status,
      subscription_plan: profile.subscription_plan,
      subscription_id: profile.subscription_id,
      subscription_expires_at: profile.subscription_expires_at
    };
    
    console.log('📋 Subscription fields:', subscriptionFields);
    
  } catch (error) {
    console.error('❌ Profile check failed:', error);
  }
  
  // Step 3: Test subscription utility functions
  console.log('\n🧪 Step 3: Subscription Utility Functions');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    const { data: profile } = await window.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Test hasPhilosopherPlan function
    const hasPhilosopher = (
      profile?.subscription_status === 'active' && 
      profile?.subscription_plan === 'philosopher'
    );
    
    console.log('Has Philosopher Plan:', hasPhilosopher);
    console.log('Subscription Status Check:', profile?.subscription_status === 'active');
    console.log('Plan Type Check:', profile?.subscription_plan === 'philosopher');
    
    // Test plan display name
    let planDisplayName = 'Free plan';
    if (profile?.subscription_plan === 'philosopher') {
      planDisplayName = 'Philosopher plan';
    } else if (profile?.subscription_plan === 'seeker') {
      planDisplayName = 'Seeker plan';
    }
    
    console.log('Plan Display Name:', planDisplayName);
    
  } catch (error) {
    console.error('❌ Subscription utility test failed:', error);
  }
  
  // Step 4: Check React context
  console.log('\n⚛️ Step 4: React Context Check');
  try {
    // Try to access React context data
    const authProvider = document.querySelector('[data-auth-provider]');
    if (authProvider) {
      console.log('✅ Auth provider found in DOM');
    } else {
      console.warn('⚠️ Auth provider not found in DOM');
    }
    
    // Check if we can access the profile from React context
    if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
      console.log('⚛️ React is available');
    }
    
  } catch (error) {
    console.error('❌ React context check failed:', error);
  }
  
  // Step 5: Check subscription-related API endpoints
  console.log('\n🌐 Step 5: API Endpoints Check');
  try {
    // Test subscription API
    const subscriptionResponse = await fetch('/api/dodo/subscriptions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (subscriptionResponse.ok) {
      console.log('✅ Subscription API accessible');
    } else {
      console.warn('⚠️ Subscription API returned:', subscriptionResponse.status);
    }
    
  } catch (error) {
    console.warn('⚠️ Subscription API check failed:', error);
  }
  
  // Step 6: Check localStorage for cached data
  console.log('\n💾 Step 6: LocalStorage Check');
  try {
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('profile') || key.includes('subscription')
    );
    
    console.log('Auth-related localStorage keys:', authKeys);
    
    authKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value && value.length < 500) { // Only show short values
          console.log(`${key}:`, value);
        } else {
          console.log(`${key}: [${value?.length || 0} characters]`);
        }
      } catch (e) {
        console.log(`${key}: [parse error]`);
      }
    });
    
  } catch (error) {
    console.error('❌ LocalStorage check failed:', error);
  }
  
  // Step 7: Manual subscription test
  console.log('\n🔧 Step 7: Manual Subscription Test');
  try {
    const { data: { user } } = await window.supabase.auth.getUser();
    
    // Manually update profile to test subscription
    console.log('🧪 Testing manual subscription update...');
    
    const { data: updateResult, error: updateError } = await window.supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select();
    
    if (updateError) {
      console.error('❌ Manual update failed:', updateError);
    } else {
      console.log('✅ Manual update successful:', updateResult);
      console.log('🔄 Please refresh the page to see if subscription access works now');
    }
    
  } catch (error) {
    console.error('❌ Manual subscription test failed:', error);
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
  console.log('\n📋 Summary:');
  console.log('- Check profile data for subscription_status and subscription_plan fields');
  console.log('- Verify subscription_status is "active" and subscription_plan is "philosopher"');
  console.log('- If manual update worked, the issue is with the subscription creation process');
  console.log('- If manual update didn\'t work, there may be a caching or React context issue');
}

// Make available globally
window.diagnoseSubscriptionIssue = diagnoseSubscriptionIssue;

// Auto-run
console.log('🚀 Running subscription diagnosis...');
setTimeout(() => {
  diagnoseSubscriptionIssue().catch(console.error);
}, 1000);
