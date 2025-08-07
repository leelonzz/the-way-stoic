import { NextRequest, NextResponse } from 'next/server';
import { generateMentorResponse } from '@/lib/gemini';
import { authenticateRequest, hasPhilosopherPlan } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check subscription plan
    const authenticatedUser = await authenticateRequest(request);

    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has philosopher plan access
    if (!hasPhilosopherPlan(authenticatedUser.profile)) {
      return NextResponse.json(
        {
          error: 'Philosopher plan required',
          message: 'Upgrade to Philosopher plan to access mentor conversations'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { mentorKey, message, conversationHistory } = body;

    // Validate required fields
    if (!mentorKey || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: mentorKey and message' },
        { status: 400 }
      );
    }

    // Validate mentor key
    const validMentors = ['seneca', 'epictetus', 'marcus-aurelius'];
    if (!validMentors.includes(mentorKey)) {
      return NextResponse.json(
        { error: 'Invalid mentor key' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long. Please keep messages under 1000 characters.' },
        { status: 400 }
      );
    }

    // Validate conversation history format
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Invalid conversation history format' },
        { status: 400 }
      );
    }

    // Generate response from Gemini
    const response = await generateMentorResponse(
      mentorKey,
      message,
      conversationHistory || []
    );

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to send messages.' },
    { status: 405 }
  );
}