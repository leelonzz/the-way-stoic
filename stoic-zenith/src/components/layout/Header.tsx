'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useScrollDirection } from '@/hooks/useScrollDirection'

export const Header: React.FC = () => {
  const router = useRouter()
  const { user } = useAuthContext()
  const { isVisible } = useScrollDirection({ threshold: 100 })

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
    <header
      className={`w-full fixed top-0 z-50 shadow-sm transition-all duration-300 ease-in-out backdrop-blur-sm ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}
      style={{ backgroundColor: '#d69162' }}
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation Section - Left Side */}
          <div className="flex items-center ml-2 space-x-6">
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

            {/* Blog Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                href="/blog"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm"
              >
                Blog
              </Link>
              <Link
                href="/blog/philosophy"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm"
              >
                Philosophy
              </Link>
              <Link
                href="/blog/practices"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm"
              >
                Daily Practices
              </Link>
              <Link
                href="/blog/wisdom"
                className="text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm"
              >
                Wisdom
              </Link>
            </nav>
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
