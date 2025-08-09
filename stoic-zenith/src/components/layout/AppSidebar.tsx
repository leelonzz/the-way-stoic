'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Home,
  BookOpen,
  Quote,
  Calendar,
  Brain,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Library,
  Heart,
  FileText,
} from 'lucide-react'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ProfileModal } from '@/components/profile/ProfileModal'
import {
  getSubscriptionPlanDisplayName,
  hasPhilosopherPlan,
} from '@/utils/subscription'
import { useQueryClient } from '@tanstack/react-query'
import { handleNavigationPrefetch } from '@/lib/prefetch'
import { useNavigationState } from '@/hooks/useNavigationState'

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
  },
  {
    name: 'Mentors',
    href: '/mentors',
    icon: Brain,
  },
  {
    name: 'Course',
    href: '/course',
    icon: GraduationCap,
    comingSoon: true,
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: Quote,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
]

export function AppSidebar(): JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, user, profile } = useAuthContext()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isQuotesDropdownOpen, setIsQuotesDropdownOpen] = useState(() => pathname.startsWith('/quotes'))
  const queryClient = useQueryClient()
  const { isPathLikelyCached, prefetchPage } = useNavigationState()

  // Auto-sync Quotes dropdown with current route for smoother UX
  useEffect(() => {
    const shouldOpen = pathname.startsWith('/quotes')
    setIsQuotesDropdownOpen(shouldOpen)
  }, [pathname])

  const quotesSubItems = [
    {
      name: 'Library',
      param: 'library',
      icon: Library,
    },
    {
      name: 'Favorites',
      param: 'favorites',
      icon: Heart,
      requiresAuth: true,
    },
    {
      name: 'My Quotes',
      param: 'my-quotes',
      icon: FileText,
      requiresAuth: true,
    },
  ]

  const currentQuotesTab = searchParams.get('tab') || 'library'

  const handleMouseEnter = (href: string): void => {
    // Only prefetch if not already cached
    if (!isPathLikelyCached(href)) {
      handleNavigationPrefetch(href, queryClient, user?.id)
      prefetchPage(href)
    }
  }

  const handleQuotesNavigation = (tab: string): void => {
    router.push(`/quotes?tab=${tab}`)
  }

  return (
    <div className="w-64 bg-parchment border-r border-stone/20 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-sage/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-bold text-stone">
              The Stoic Way
            </h1>
            <p className="text-xs text-sage">Philosophy for daily life</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map(item => {
          const isActive = pathname === item.href
          const isComingSoon = item.comingSoon
          const showUpgradePill =
            item.name === 'Mentors' && !hasPhilosopherPlan(profile)

          if (isComingSoon) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sage/50 cursor-not-allowed relative"
              >
                <item.icon size={18} className="text-sage/50" />
                <span className="font-medium text-sm">{item.name}</span>
                <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            )
          }

          // Special handling for Quotes with dropdown
          if (item.name === 'Quotes') {
            return (
              <div key={item.name} className="space-y-1">
                {/* Main Quotes Link */}
                <div
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-primary text-white shadow-lg' : 'text-sage hover:bg-parchment/50 hover:text-stone'}
                  `}
                >
                  <Link
                    href={item.href}
                    prefetch={true}
                    onMouseEnter={() => handleMouseEnter(item.href)}
                    onClick={() => setIsQuotesDropdownOpen(true)}
                    className="flex items-center gap-3 flex-1"
                  >
                    <item.icon size={18} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>

                  {/* Dropdown Toggle */}
                  <button
                    onClick={() => setIsQuotesDropdownOpen(!isQuotesDropdownOpen)}
                    className="ml-1 p-1 rounded transition-all duration-200"
                    aria-label="Toggle quotes menu"
                  >
                    {isQuotesDropdownOpen ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                </div>

                {/* Dropdown Menu */}
                {isQuotesDropdownOpen && (
                  <div className="ml-6 space-y-1 animate-fade-in">
                    {quotesSubItems.map(subItem => {
                      if (subItem.requiresAuth && !isAuthenticated) {
                        return (
                          <div
                            key={subItem.name}
                            className="flex items-center gap-3 px-3 py-1.5 text-sage/50 cursor-not-allowed text-sm"
                          >
                            <subItem.icon size={14} className="text-sage/50" />
                            <span>{subItem.name}</span>
                          </div>
                        )
                      }
                      
                      const isSubActive = isActive && currentQuotesTab === subItem.param
                      
                      return (
                        <button
                          key={subItem.name}
                          onClick={() => handleQuotesNavigation(subItem.param)}
                          className={`
                            flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 w-full text-left text-sm
                            ${
                              isSubActive
                                ? 'bg-primary/20 text-primary'
                                : 'text-sage hover:bg-parchment/30 hover:text-stone'
                            }
                          `}
                        >
                          <subItem.icon size={14} className={isSubActive ? 'text-primary' : 'text-sage'} />
                          <span>{subItem.name}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true} // Enable Next.js prefetch
              onMouseEnter={() => handleMouseEnter(item.href)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-sage hover:bg-parchment/50 hover:text-stone'
                }
              `}
            >
              <item.icon
                size={18}
                className={isActive ? 'text-white' : 'text-sage'}
              />
              <span className="font-medium text-sm">{item.name}</span>
              {showUpgradePill && (
                <span className="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full">
                  Upgrade
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Profile Section */}
      {isAuthenticated && user && (
        <div className="p-4 border-t border-sage/20">
          <Button
            variant="ghost"
            className="w-full p-3 h-auto hover:bg-parchment/50 transition-colors"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-10 h-10 border-2 border-sage/20">
                <AvatarImage
                  src={profile?.avatar_url || undefined}
                  alt={profile?.full_name || user.email || 'User'}
                />
                <AvatarFallback className="bg-primary text-white font-medium">
                  {profile?.full_name
                    ? profile.full_name
                        .split(' ')
                        .map(name => name.charAt(0))
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-stone text-sm truncate">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-sage truncate">
                  {getSubscriptionPlanDisplayName(profile)}
                </p>
              </div>
            </div>
          </Button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  )
}