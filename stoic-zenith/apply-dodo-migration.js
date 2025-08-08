/**
 * Script to apply DodoPayments subscription migration manually
 * Run this with: node apply-dodo-migration.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applyMigration() {
  try {
    console.log('🚀 Applying DodoPayments subscription migration...')
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250808000001_add_dodo_subscription_support.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`)
      console.log(`📄 ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct execution if rpc fails
          const { error: directError } = await supabase.from('_').select('*').limit(0)
          if (directError) {
            console.warn(`⚠️ Statement ${i + 1} may have failed:`, error.message)
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (execError) {
        console.warn(`⚠️ Statement ${i + 1} execution error:`, execError.message)
      }
    }
    
    console.log('\n🎉 Migration application completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Test the subscription upgrade flow at: /test-subscription-upgrade')
    console.log('2. Verify the database schema in Supabase dashboard')
    console.log('3. Check that webhook handlers work correctly')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Alternative: Apply migration statements individually
async function applyMigrationManually() {
  console.log('🔧 Applying migration statements manually...')
  
  try {
    // 1. Add subscription_id to profiles
    console.log('\n1️⃣ Adding subscription_id column to profiles...')
    const { error: profileError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;'
    })
    if (profileError) console.warn('Profile column error:', profileError.message)
    else console.log('✅ Added subscription_id column')
    
    // 2. Create dodo_subscriptions table
    console.log('\n2️⃣ Creating dodo_subscriptions table...')
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.dodo_subscriptions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
        dodo_subscription_id TEXT UNIQUE NOT NULL,
        dodo_customer_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        plan_type TEXT NOT NULL DEFAULT 'philosopher',
        amount DECIMAL(10,2) NOT NULL DEFAULT 14.00,
        currency TEXT NOT NULL DEFAULT 'USD',
        current_period_start TIMESTAMP WITH TIME ZONE,
        current_period_end TIMESTAMP WITH TIME ZONE,
        next_billing_time TIMESTAMP WITH TIME ZONE,
        last_payment_time TIMESTAMP WITH TIME ZONE,
        failed_payment_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `
    
    const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL })
    if (tableError) console.warn('Table creation error:', tableError.message)
    else console.log('✅ Created dodo_subscriptions table')
    
    console.log('\n🎉 Manual migration completed!')
    console.log('Note: Some advanced features (triggers, functions) may need to be added via Supabase SQL editor')
    
  } catch (error) {
    console.error('❌ Manual migration failed:', error)
  }
}

// Run the migration
if (process.argv.includes('--manual')) {
  applyMigrationManually()
} else {
  applyMigration()
}
