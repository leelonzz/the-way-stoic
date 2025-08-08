const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixUserSubscription() {
  console.log('🔧 Fixing user subscription status...')
  
  try {
    // Update the user who just purchased (long2000707@gmail.com)
    const userId = 'a22aaf35-1119-429c-965f-1db6fa60780e'
    
    console.log(`Updating subscription for user: ${userId}`)
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_plan: 'philosopher',
        subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()

    if (error) {
      console.error('❌ Error updating subscription:', error)
      return
    }

    console.log('✅ Successfully updated user subscription!')
    console.log('Updated profile:', data)

    // Verify the update
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching updated profile:', fetchError)
      return
    }

    console.log('\n📊 Updated user profile:')
    console.log(`   Email: ${profile.email}`)
    console.log(`   Plan: ${profile.subscription_plan}`)
    console.log(`   Status: ${profile.subscription_status}`)
    console.log(`   Expires: ${profile.subscription_expires_at}`)
    console.log(`   Updated: ${profile.updated_at}`)

  } catch (error) {
    console.error('Fix script error:', error)
  }
}

fixUserSubscription()
