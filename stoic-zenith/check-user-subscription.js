const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function checkUserSubscription() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    // Find user by email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    const targetUser = users.users.find(user => user.email === 'nhatleelong@gmail.com')
    
    if (!targetUser) {
      console.log('❌ User not found with email: nhatleelong@gmail.com')
      return
    }
    
    console.log('✅ Found user:', targetUser.id)
    console.log('   Email:', targetUser.email)
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUser.id)
      .single()
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError)
      return
    }
    
    console.log('\n📊 Current Profile Data:')
    console.log(`   Email: ${profile.email}`)
    console.log(`   Plan: ${profile.subscription_plan}`)
    console.log(`   Status: ${profile.subscription_status}`)
    console.log(`   Expires: ${profile.subscription_expires_at}`)
    console.log(`   Subscription ID: ${profile.subscription_id}`)
    console.log(`   Updated: ${profile.updated_at}`)
    
    // Check if user has active subscription in Dodo
    if (profile.subscription_id) {
      console.log('\n🔍 Checking Dodo subscription status...')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('supabase.co', 'supabase.co')}/rest/v1/dodo_subscriptions?subscription_id=eq.${profile.subscription_id}`, {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      })
      
      if (response.ok) {
        const dodoSubs = await response.json()
        if (dodoSubs.length > 0) {
          console.log('   Dodo Subscription:', dodoSubs[0])
        } else {
          console.log('   No Dodo subscription found')
        }
      }
    }
    
  } catch (error) {
    console.error('Check script error:', error)
  }
}

checkUserSubscription()
