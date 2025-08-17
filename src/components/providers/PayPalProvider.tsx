'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PayPalScriptProvider, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';

interface PayPalContextType {
  createSubscription: (planId: string, userId: string) => Promise<{ subscriptionId: string; approvalUrl: string }>;
  createSubscriptionPlan: (planType: string) => Promise<{ planId: string }>;
  isLoading: boolean;
  error: string | null;
}

const PayPalContext = createContext<PayPalContextType | undefined>(undefined);

export function usePayPal() {
  const context = useContext(PayPalContext);
  if (context === undefined) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
}

interface PayPalProviderProps {
  children: React.ReactNode;
}

export function PayPalProvider({ children }: PayPalProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const environment = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'sandbox';

  const createSubscriptionPlan = useCallback(async (planType: string): Promise<{ planId: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/paypal/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription plan');
      }

      const data = await response.json();
      return { planId: data.planId };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubscription = useCallback(async (
    planId: string, 
    userId: string
  ): Promise<{ subscriptionId: string; approvalUrl: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/paypal/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId,
          returnUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subscription');
      }

      const data = await response.json();
      
      if (!data.approvalUrl) {
        throw new Error('No approval URL received from PayPal');
      }

      return {
        subscriptionId: data.subscriptionId,
        approvalUrl: data.approvalUrl,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (!clientId) {
    console.error('PayPal client ID not configured');
    return <div>PayPal configuration error</div>;
  }

  const paypalOptions: ReactPayPalScriptOptions = {
    clientId,
    currency: 'USD',
    intent: 'subscription',
    vault: true,
    components: 'buttons,fastlane',
    dataClientToken: undefined,
  };

  const contextValue: PayPalContextType = {
    createSubscription,
    createSubscriptionPlan,
    isLoading,
    error,
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <PayPalContext.Provider value={contextValue}>
        {children}
      </PayPalContext.Provider>
    </PayPalScriptProvider>
  );
}