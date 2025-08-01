'use client';

import React from 'react';
import { Brain, Quote, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from './AuthProvider';

interface LoginScreenProps {
  onBack?: () => void;
}

export function LoginScreen({ onBack }: LoginScreenProps) {
  const { signInWithGoogle, isLoading, error } = useAuthContext();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex">
      {/* Back Button */}
      {onBack && (
        <div className="absolute top-6 left-6 z-50">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-stone hover:text-ink hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to landing
          </Button>
        </div>
      )}

      {/* Left Side - Login Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-cta rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-ink">
              The Stoic Way
            </h1>
            <p className="text-stone text-lg">
              Philosophy for daily life
            </p>
          </div>
        </div>

        {/* Inspirational Quote */}
        <Card className="bg-white/90 backdrop-blur-sm border-stone/20 shadow-xl">
          <CardContent className="p-6 text-center">
            <Quote className="w-8 h-8 text-accent mx-auto mb-4" />
            <blockquote className="space-y-3">
              <p className="text-ink font-serif italic text-lg leading-relaxed">
                "You have power over your mind—not outside events. Realize this, and you will find strength."
              </p>
              <footer className="text-stone font-medium">
                — Marcus Aurelius
              </footer>
            </blockquote>
          </CardContent>
        </Card>

        {/* Login Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-stone/20 shadow-xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-serif font-semibold text-ink">
                Begin Your Journey
              </h2>
              <p className="text-stone text-sm">
                Sign in to access your personal stoic practice
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm h-12 font-medium transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>

            <div className="text-center pt-4 border-t border-stone/20">
              <p className="text-xs text-stone">
                By signing in, you agree to practice stoic wisdom daily
              </p>
            </div>
          </CardContent>
        </Card>


        </div>
      </div>

      {/* Right Side - Artistic Background */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat relative"
          style={{
            backgroundImage: 'url(/Side.png)',
            backgroundPosition: 'center 20%'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="space-y-4">
              <Quote className="w-10 h-10 text-white/80" />
              <blockquote className="space-y-3">
                <p className="text-xl font-serif italic leading-relaxed">
                  "The path of wisdom is steep and winding, but each step brings us closer to inner peace."
                </p>
                <footer className="text-white/80 font-medium">
                  — Ancient Stoic Wisdom
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;