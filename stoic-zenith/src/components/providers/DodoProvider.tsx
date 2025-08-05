'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface DodoContextType {
  isLoaded: boolean
  createSubscription: (data: CreateSubscriptionData) => Promise<any>
  getSubscriptions: (customerId?: string) => Promise<any>
  createProduct: (data: CreateProductData) => Promise<any>
  getProducts: () => Promise<any>
}

interface CreateSubscriptionData {
  customer_id: string
  product_id: string
  payment_method_id?: string
  trial_end?: number
  metadata?: Record<string, any>
}

interface CreateProductData {
  name: string
  description?: string
  price: number
  currency: string
  type: 'one_time' | 'subscription'
  metadata?: Record<string, any>
}

const DodoContext = createContext<DodoContextType | undefined>(undefined)

export function DodoProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Initialize Dodo Payments
    const apiKey = process.env.NEXT_PUBLIC_DODO_API_KEY
    if (!apiKey) {
      console.error('Dodo Payments API key not configured')
      return
    }

    setIsLoaded(true)
  }, [])

  const createSubscription = async (data: CreateSubscriptionData) => {
    try {
      const response = await fetch('/api/dodo/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create subscription')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw error
    }
  }

  const getSubscriptions = async (customerId?: string) => {
    try {
      const url = customerId 
        ? `/api/dodo/subscriptions?customer_id=${customerId}`
        : '/api/dodo/subscriptions'
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      throw error
    }
  }

  const createProduct = async (data: CreateProductData) => {
    try {
      const response = await fetch('/api/dodo/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  const getProducts = async () => {
    try {
      const response = await fetch('/api/dodo/products')
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  const value: DodoContextType = {
    isLoaded,
    createSubscription,
    getSubscriptions,
    createProduct,
    getProducts,
  }

  return (
    <DodoContext.Provider value={value}>
      {children}
    </DodoContext.Provider>
  )
}

export function useDodo() {
  const context = useContext(DodoContext)
  if (context === undefined) {
    throw new Error('useDodo must be used within a DodoProvider')
  }
  return context
} 