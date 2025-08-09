'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Brain } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use useLayoutEffect for faster execution
  useLayoutEffect(() => {
    // Mark that we're authenticating to prevent logout
    localStorage.setItem('was-authenticated', 'true');
    // Set a flag to indicate we're in auth callback
    localStorage.setItem('auth-callback-in-progress', 'true');
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL params
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // Handle OAuth errors first
        if (error) {
          console.error('❌ OAuth error:', error);
          const errorDescription = searchParams.get('error_description');
          console.error('Error description:', errorDescription);
          router.push(`/?error=oauth_${error}`);
          return;
        }

        if (code) {
          console.log('✅ Auth code found, exchanging for session');

          // Exchange the code for a session - single attempt with immediate redirect
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);

            if (error) {
              console.error('❌ Code exchange failed:', error);
              router.push('/?error=auth_callback_failed');
              return;
            }

            if (data.session) {
              console.log('✅ Session established successfully');
              // Mark as authenticated and clear callback flag
              localStorage.setItem('was-authenticated', 'true');
              localStorage.setItem('last-user-id', data.session.user.id);
              localStorage.removeItem('auth-callback-in-progress');
              
              // Use replace to prevent back button issues and add fallback
              router.replace('/');
              
              // Fallback redirect after 1 second if router doesn't work
              setTimeout(() => {
                if (window.location.pathname === '/auth/callback') {
                  window.location.href = '/';
                }
              }, 1000);
              return;
            }
          } catch (networkError) {
            console.error('❌ Network error during code exchange:', networkError);
            router.push('/?error=auth_callback_failed');
            return;
          }
        }
        
        // Fallback: check for hash-based auth (for backwards compatibility)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        
        if (accessToken) {
          console.log('✅ Hash token found, session should be auto-established');
          localStorage.setItem('was-authenticated', 'true');
          router.push('/');
          return;
        }
        
        // Final fallback: check for existing session
        console.log('🔍 Checking for existing session as fallback');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session check failed:', sessionError);
          router.push('/?error=auth_callback_failed');
          return;
        }

        if (sessionData.session) {
          console.log('✅ Existing session found in fallback');
          localStorage.setItem('was-authenticated', 'true');
          // Clear the callback flag
          localStorage.removeItem('auth-callback-in-progress');
          router.push('/');
          return;
        }

        // No session found anywhere - this might be an error
        console.warn('⚠️ No session found in callback, redirecting with error');
        // Clear the callback flag even on error
        localStorage.removeItem('auth-callback-in-progress');
        router.push('/?error=no_session_found');
      } catch (error) {
        console.error('❌ Unexpected auth callback error:', error);
        // Clear the callback flag on error
        localStorage.removeItem('auth-callback-in-progress');
        router.push('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-cta rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-ink">
            Completing your journey...
          </h1>
          <p className="text-stone">
            Please wait while we set up your stoic practice
          </p>
        </div>
        
        <LoadingSpinner size="sm" className="mx-auto" />
      </div>
    </div>
  );
}