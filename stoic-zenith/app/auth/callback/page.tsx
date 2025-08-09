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
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the authorization code from URL params
        const code = searchParams.get('code');
        
        if (code) {
          console.log('✅ Auth code found, exchanging for session');
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('❌ Code exchange failed:', error);
            router.push('/?error=auth_callback_failed');
            return;
          }
          
          if (data.session) {
            console.log('✅ Session established successfully');
            // Ensure we mark as authenticated before redirecting
            localStorage.setItem('was-authenticated', 'true');
            router.push('/');
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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session check failed:', sessionError);
          router.push('/?error=auth_callback_failed');
          return;
        }
        
        if (sessionData.session) {
          console.log('✅ Existing session found');
          localStorage.setItem('was-authenticated', 'true');
        }
        
        // Always redirect to home
        router.push('/');
      } catch (error) {
        console.error('❌ Unexpected auth callback error:', error);
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
            Welcome back
          </h1>
          <p className="text-stone">
            Redirecting to your dashboard...
          </p>
        </div>
        
        <LoadingSpinner size="sm" className="mx-auto" />
      </div>
    </div>
  );
}