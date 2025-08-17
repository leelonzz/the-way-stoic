import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-server'
import { checkTrialEligibility, recordTrialUsage } from '@/lib/trial-prevention'

/**
 * GET - Check if user is eligible for trial
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check trial eligibility
    const eligibility = await checkTrialEligibility(user.id)

    return NextResponse.json({
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      hasUsedTrial: eligibility.hasUsedTrial,
      trialUsedAt: eligibility.trialUsedAt,
      googleAccountId: eligibility.googleAccountId
    })

  } catch (error) {
    console.error('Error checking trial eligibility:', error)
    return NextResponse.json(
      { error: 'Failed to check trial eligibility' },
      { status: 500 }
    )
  }
}

/**
 * POST - Start trial for eligible user
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planType = 'philosopher' } = body

    // Check trial eligibility first
    const eligibility = await checkTrialEligibility(user.id)
    if (!eligibility.eligible) {
      return NextResponse.json(
        { 
          error: 'Not eligible for trial',
          reason: eligibility.reason,
          hasUsedTrial: eligibility.hasUsedTrial
        },
        { status: 403 }
      )
    }

    // Record trial usage
    const result = await recordTrialUsage(user.id, planType)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start trial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Trial started successfully',
      planType
    })

  } catch (error) {
    console.error('Error starting trial:', error)
    return NextResponse.json(
      { error: 'Failed to start trial' },
      { status: 500 }
    )
  }
}
