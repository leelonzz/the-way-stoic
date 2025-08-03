'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscriptionId = searchParams.get('subscription_id');
  const token = searchParams.get('token');

  const fetchSubscriptionDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/paypal/subscriptions?subscriptionId=${subscriptionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription details');
      }

      const data = await response.json();
      setSubscriptionData(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionDetails();
    } else {
      setError('No subscription ID found');
      setIsLoading(false);
    }
  }, [subscriptionId, fetchSubscriptionDetails]);

  const handleContinue = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-cta" />
            <p className="text-center text-stone">
              Processing your subscription...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-parchment flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              Subscription Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-stone">
              {error}
            </p>
            <Button onClick={handleContinue} className="w-full">
              Return to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <CardTitle className="text-center text-ink">
              Subscription Activated!
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-stone">
              Welcome to the Philosopher plan! You now have access to all premium features.
            </p>
            
            {subscriptionData && (
              <div className="bg-stone/10 rounded-lg p-4 space-y-2">
                <p className="text-sm text-stone">
                  <strong>Subscription ID:</strong> {String(subscriptionData.id || 'N/A')}
                </p>
                <p className="text-sm text-stone">
                  <strong>Status:</strong> {String(subscriptionData.status || 'N/A')}
                </p>
                <p className="text-sm text-stone">
                  <strong>Next Billing:</strong> {
                    (subscriptionData.billing_info as any)?.next_billing_time 
                      ? new Date((subscriptionData.billing_info as any).next_billing_time).toLocaleDateString()
                      : 'N/A'
                  }
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-ink">You now have access to:</h4>
            <ul className="space-y-1 text-sm text-stone">
              <li>• Unlimited chat with philosopher</li>
              <li>• Advanced streak analytics</li>
              <li>• Personalized insights</li>
              <li>• Export journal entries</li>
              <li>• Priority support</li>
            </ul>
          </div>

          <Button onClick={handleContinue} className="w-full bg-cta hover:bg-cta/90 text-white">
            Continue to App
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}