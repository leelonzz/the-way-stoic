import { NextRequest, NextResponse } from 'next/server'

interface CreateCustomerRequest {
  email: string
  name: string
  phone_number?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCustomerRequest = await request.json()
    const { email, name, phone_number } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: 'email and name are required' },
        { status: 400 }
      )
    }

    // For now, return a mock customer
    // In a real implementation, this would use the MCP tools
    const mockCustomer = {
      customer_id: `cust_${Date.now()}`,
      email,
      name,
      phone_number,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(mockCustomer)
  } catch (error) {
    console.error('Dodo customer creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customer_id')

    if (customerId) {
      // Return mock customer details
      const mockCustomer = {
        customer_id: customerId,
        email: 'user@example.com',
        name: 'John Doe',
        created_at: new Date().toISOString(),
      }
      return NextResponse.json(mockCustomer)
    }

    // Return empty list for now
    return NextResponse.json({ customers: [] })
  } catch (error) {
    console.error('Dodo customer fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
