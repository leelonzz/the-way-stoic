'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'

export const Header: React.FC = () => {
  const router = useRouter()
  const { user } = useAuthContext()

  const handleSignIn = () => {
    // Check if user is logged in and redirect accordingly
    if (user) {
      // User is logged in, go directly to journal
      router.push('/journal')
    } else {
      // User is not logged in, go to login page
      router.push('/login')
    }
  }

  return (
    <header className="w-full sticky top-0 z-50 shadow-sm" style={{ backgroundColor: '#d69162' }}>
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Left Side */}
          <div className="flex items-center ml-2">
            <Link
              href="/"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
              aria-label="The Stoic Way - Home"
            >
              {/* Logo Icon */}
              <div className="flex-shrink-0">
                <Image
                  src="/logo-icon.png"
                  alt="The Stoic Way Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                  priority
                />
              </div>

              {/* App Name */}
              <div className="hidden sm:block">
                <span className="text-xl font-semibold text-white" style={{ fontFamily: 'var(--font-inknut-antiqua)' }}>
                  The Stoic Way
                </span>
              </div>
            </Link>
          </div>

          {/* Authentication Section - Right Side */}
          <div className="flex items-center mr-2">
            <button
              onClick={handleSignIn}
              className="bg-white text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              {user ? 'Start Your Journey' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
