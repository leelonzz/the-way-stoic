'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscriptionCancelPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-orange-500" />
            <CardTitle className="text-center text-ink">
              Subscription Cancelled
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-stone">
              Your subscription process was cancelled. No charges were made to your account.
            </p>
            <p className="text-sm text-stone/70">
              You can try again anytime or continue using the free plan.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-ink">Free plan includes:</h4>
            <ul className="space-y-1 text-sm text-stone">
              <li>• Unlimited journal entries</li>
              <li>• Quote library & saving</li>
              <li>• Memento mori calendar</li>
              <li>• Daily stoic quotes</li>
              <li>• Basic streak tracking</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button onClick={handleRetry} className="w-full bg-cta hover:bg-cta/90 text-white">
              Try Subscription Again
            </Button>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}