'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { Brain } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');

        // First, handle the auth callback from the URL
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

        if (data.session?.user) {
          console.log('✅ Auth callback successful, user authenticated');
          // Mark user as authenticated immediately
          localStorage.setItem('was-authenticated', 'true');

          // Add a small delay to ensure auth state is properly set
          await new Promise(resolve => setTimeout(resolve, 500));

          // Navigate to home
          router.push('/');
        } else {
          console.warn('⚠️ Auth callback completed but no session found');
          // Clear any stale auth markers
          localStorage.removeItem('was-authenticated');
          router.push('/?error=no_session');
        }
      } catch (error) {
        console.error('❌ Unexpected auth callback error:', error);
        localStorage.removeItem('was-authenticated');
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
        
        <LoadingSpinner size="sm" className="mx-auto" />
      </div>
    </div>
  );
}