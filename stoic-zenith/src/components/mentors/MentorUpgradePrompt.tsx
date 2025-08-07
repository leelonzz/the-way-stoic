import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Star, Zap, ArrowRight } from 'lucide-react';
import { DodoSubscriptionButton } from '@/components/subscription/DodoSubscriptionButton';

interface MentorUpgradePromptProps {
  onClose?: () => void;
}

export function MentorUpgradePrompt({ onClose }: MentorUpgradePromptProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-hero/5 to-cta/5 border-cta/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cta to-accent rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-serif text-ink mb-2">
            Unlock Mentor Conversations
          </CardTitle>
          <p className="text-stone text-lg">
            Connect with ancient Stoic philosophers and receive personalized guidance
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <Star className="w-5 h-5 text-cta flex-shrink-0" />
              <span className="text-sm text-ink">Unlimited conversations</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <Brain className="w-5 h-5 text-cta flex-shrink-0" />
              <span className="text-sm text-ink">3 Stoic mentors</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <Zap className="w-5 h-5 text-cta flex-shrink-0" />
              <span className="text-sm text-ink">Personalized guidance</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg">
              <ArrowRight className="w-5 h-5 text-cta flex-shrink-0" />
              <span className="text-sm text-ink">Instant responses</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center space-y-4">
            <div className="bg-white/80 rounded-lg p-4 border border-cta/20">
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-3xl font-bold text-ink">$14</span>
                <span className="text-stone text-sm">/month</span>
              </div>
              <p className="text-sm text-stone">
                Philosopher Plan - Full access to all mentors
              </p>
            </div>

            <DodoSubscriptionButton
              productId="pdt_1xvwazO5L41SzZeMegxyk"
              productName="The Stoic Way"
              buttonText="Upgrade to Philosopher Plan"
              className="font-medium py-3 text-lg"
              onSuccess={(subscription) => {
                console.log('Subscription successful:', subscription);
                // Handle successful subscription - user will be redirected back after payment
              }}
              onError={(error) => {
                console.error('Subscription error:', error);
                // Error handling is already done by the DodoSubscriptionButton component
              }}
            />

            <p className="text-xs text-stone/70">
              Cancel anytime • Secure payment • Instant access
            </p>
          </div>

          {/* Close button for modal usage */}
          {onClose && (
            <div className="text-center pt-4 border-t border-stone/10">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-stone hover:text-ink"
              >
                Maybe later
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
