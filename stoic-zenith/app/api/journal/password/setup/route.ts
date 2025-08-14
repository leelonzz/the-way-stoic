import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseRouteHandlerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user already has a password set
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('journal_password_enabled, journal_password_hash')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (profile.journal_password_enabled && profile.journal_password_hash) {
      return NextResponse.json(
        { error: 'Journal password is already set. Use change password instead.' },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // Update the profile with hashed password
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        journal_password_hash: hashedPassword,
        journal_password_enabled: true,
        journal_password_updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to setup password' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}