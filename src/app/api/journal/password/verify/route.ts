import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseRouteHandlerClient } from '@/integrations/supabase/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseRouteHandlerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's password hash
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

    if (!profile.journal_password_enabled || !profile.journal_password_hash) {
      return NextResponse.json(
        { error: 'Journal password protection is not enabled' },
        { status: 400 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(
      password,
      profile.journal_password_hash
    )

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
