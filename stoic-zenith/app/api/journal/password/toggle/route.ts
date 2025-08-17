import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { enabled, password } = await request.json()

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled flag is required' },
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

    // Get user's current settings
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

    if (enabled) {
      // User wants to enable protection
      if (!profile.journal_password_hash) {
        return NextResponse.json(
          { error: 'No password set. Use setup endpoint first.' },
          { status: 400 }
        )
      }
    } else {
      // User wants to disable protection - verify password
      if (!password || typeof password !== 'string') {
        return NextResponse.json(
          { error: 'Password is required to disable protection' },
          { status: 400 }
        )
      }

      if (!profile.journal_password_hash) {
        return NextResponse.json(
          { error: 'No password is currently set' },
          { status: 400 }
        )
      }

      // Verify password before disabling
      const isPasswordValid = await bcrypt.compare(password, profile.journal_password_hash)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 400 }
        )
      }
    }

    // Update the enabled status
    const updateData: any = {
      journal_password_enabled: enabled,
      journal_password_updated_at: new Date().toISOString()
    }

    // If disabling, also clear the password hash
    if (!enabled) {
      updateData.journal_password_hash = null
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update password protection setting' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, enabled })
  } catch (error) {
    console.error('Password toggle error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}