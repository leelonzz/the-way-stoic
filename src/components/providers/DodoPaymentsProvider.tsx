'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuthContext } from '@/components/auth/AuthProvider';

interface DodoPaymentsContextType {
  createPaymentLink: (productId: string, customerEmail: string, customerName: string) => Promise<{ paymentLink: string }>;
  isLoading: boolean;
  error: string | null;
}

const DodoPaymentsContext = createContext<DodoPaymentsContextType | undefined>(undefined);

interface DodoPaymentsProviderProps {
  children: ReactNode;
}

export function DodoPaymentsProvider({ children }: DodoPaymentsProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentLink = async (productId: string, customerEmail: string, customerName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dodopayments/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerEmail,
          customerName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const data = await response.json();
      return { paymentLink: data.paymentLink };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DodoPaymentsContext.Provider value={{ createPaymentLink, isLoading, error }}>
      {children}
    </DodoPaymentsContext.Provider>
  );
}

export function useDodoPayments() {
  const context = useContext(DodoPaymentsContext);
  if (!context) {
    throw new Error('useDodoPayments must be used within a DodoPaymentsProvider');
  }
  return context;
}
