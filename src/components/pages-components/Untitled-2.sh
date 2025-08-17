#!/bin/bash

# Update system packages
sudo apt-get update

# Install Node.js 20 (LTS) using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js and npm installation
node --version
npm --version

# Install dependencies
npm install

# Create test setup file if it doesn't exist
mkdir -p src/__tests__
if [ ! -f "src/__tests__/setup.ts" ]; then
  cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-dom'

// Global test setup
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
EOF
fi

# Create a simple test file if no tests exist
if [ ! -f "src/__tests__/example.test.tsx" ]; then
  cat > src/__tests__/example.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// Simple test to verify the testing setup works
describe('Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>
    render(<TestComponent />)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })

  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4)
  })
})
EOF
fi

# Build the project to ensure everything is working
npm run build

echo "✅ Setup completed successfully!"
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"
echo "🧪 Test setup file created at src/__tests__/setup.ts"
echo "🧪 Example test file created at src/__tests__/example.test.tsx"