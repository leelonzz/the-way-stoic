#!/bin/bash
set -e

echo "🚀 Setting up Next.js development environment..."

# Update system packages
sudo apt-get update -y

# Install Node.js 20 (LTS) if not already installed
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | cut -d'v' -f2) -lt 18 ]]; then
    echo "📦 Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verify Node.js and npm versions
echo "📋 Node.js version: $(node -v)"
echo "📋 npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create test setup file if it doesn't exist
if [ ! -f "src/__tests__/setup.ts" ]; then
    echo "🧪 Creating test setup file..."
    mkdir -p src/__tests__
    cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-dom'

// Global test setup
beforeEach(() => {
  // Reset any mocks or test state before each test
})

afterEach(() => {
  // Cleanup after each test
})
EOF
fi

# Create a simple test file if none exist
if [ ! -f "src/__tests__/example.test.tsx" ]; then
    echo "🧪 Creating example test file..."
    cat > src/__tests__/example.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple test to verify testing setup works
describe('Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })

  it('should perform basic assertions', () => {
    expect(1 + 1).toBe(2)
    expect('hello').toBe('hello')
    expect([1, 2, 3]).toHaveLength(3)
  })
})
EOF
fi

echo "✅ Development environment setup complete!"
echo "🧪 Test files created and ready to run!"