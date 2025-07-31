'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Brain } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        console.log('Current URL:', window.location.href);
        console.log('URL params:', window.location.search);
        
        // Check for URL fragments (common in OAuth)
        const urlParams = new URLSearchParams(window.location.search);
        const fragment = window.location.hash;
        console.log('URL fragment:', fragment);
        console.log('URL search params:', Object.fromEntries(urlParams));
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            details: error
          });
          router.push('/?error=auth_callback_failed');
          return;
        }

        console.log('📋 Session data:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          email: data.session?.user?.email,
          expires: data.session?.expires_in
        });

        if (data.session) {
          console.log('✅ Auth callback successful:', data.session.user.email);
          router.push('/');
        } else {
          console.log('⚠️ No session found, redirecting to login');
          router.push('/');
        }
      } catch (error) {
        console.error('❌ Unexpected auth callback error:', error);
        router.push('/?error=auth_callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

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
        
        <div className="w-6 h-6 border-2 border-cta border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );
}