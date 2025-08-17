'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { usePayPal } from '@/components/providers/PayPalProvider';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Loader2, Zap } from 'lucide-react';

interface SubscriptionButtonProps {
  planType: 'philosopher';
  planName: string;
  planPrice: string;
  className?: string;
  onSuccess?: (subscriptionId: string) => void;
  onError?: (error: string) => void;
}

export function SubscriptionButton({
  planType,
  planName,
  planPrice,
  className,
  onSuccess,
  onError,
}: SubscriptionButtonProps) {
  const { user } = useAuthContext();
  const { createSubscription, createSubscriptionPlan, isLoading, error } = usePayPal();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = useCallback(async () => {
    if (!user) {
      onError?.('Please sign in to subscribe');
      return;
    }

    setIsProcessing(true);

    try {
      // Use a fixed plan ID to avoid creating plans each time
      const planId = 'P-5ML4271244454362WXNWU5NQ'; // Default PayPal plan ID
      
      const { subscriptionId, approvalUrl } = await createSubscription(planId, user.id);

      if (approvalUrl) {
        window.location.href = approvalUrl;
      } else {
        onSuccess?.(subscriptionId);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create subscription';
      console.error('Subscription creation error:', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [user, createSubscription, onSuccess, onError]);

  const buttonText = isProcessing || isLoading ? 'Processing...' : `Subscribe for ${planPrice}`;
  const isDisabled = isProcessing || isLoading || !user;

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSubscribe}
        disabled={isDisabled}
        className={`w-full bg-cta hover:bg-cta/90 text-white ${className}`}
        size="lg"
      >
        {(isProcessing || isLoading) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {buttonText}
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-600 text-center">
          {error}
        </p>
      )}
      
      {!user && (
        <p className="text-xs text-stone text-center">
          Please sign in to subscribe
        </p>
      )}
      
      <div className="text-xs text-stone/70 text-center space-y-1">
        <p>• Cancel anytime</p>
        <p>• Secure PayPal checkout</p>
        <p>• Instant access to all features</p>
      </div>
    </div>
  );
}