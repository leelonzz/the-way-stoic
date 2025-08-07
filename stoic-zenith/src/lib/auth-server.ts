import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { UserProfile } from '@/integrations/supabase/auth';

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
);

export interface AuthenticatedUser {
  id: string;
  email: string;
  profile: UserProfile;
}

/**
 * Authenticate user from request headers and return user profile
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return null;
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      profile: profile as UserProfile
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Check if user has philosopher plan access
 */
export function hasPhilosopherPlan(profile: UserProfile): boolean {
  return (
    profile.subscription_status === 'active' && 
    profile.subscription_plan === 'philosopher'
  );
}
