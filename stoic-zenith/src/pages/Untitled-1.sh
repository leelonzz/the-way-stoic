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

# Create test setup file with Vitest syntax (not Jest)
mkdir -p src/__tests__
cat > src/__tests__/setup.ts << 'EOF'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Global test setup
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
EOF

# Create a simple test file if no tests exist
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

# Create basic app directory structure if it doesn't exist
mkdir -p src/app
if [ ! -f "src/app/page.tsx" ]; then
  cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Welcome to The Way Stoic</h1>
      </div>
    </main>
  )
}
EOF
fi

if [ ! -f "src/app/layout.tsx" ]; then
  cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Way Stoic',
  description: 'A modern web application created with kens-webapps',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF
fi

if [ ! -f "src/app/globals.css" ]; then
  cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
EOF
fi

echo "✅ Setup completed successfully!"
echo "📦 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"
echo "🧪 Test setup file created at src/__tests__/setup.ts"
echo "🧪 Example test file created at src/__tests__/example.test.tsx"
echo "📁 Basic app directory structure created"