
'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, Quote, Calendar, User, Brain } from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { useAuthContext } from '@/components/auth/AuthProvider';

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Dashboard'
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
    description: 'Daily reflections'
  },
  {
    name: 'Mentors',
    href: '/mentors',
    icon: Brain,
    description: 'Stoic wisdom'
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: Quote,
    description: 'Daily teachings'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Memento Mori'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Settings'
  }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  
  return (
    <div className="w-64 bg-parchment border-r border-stone/20 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-stone/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cta rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-ink">The Stoic Way</h1>
            <p className="text-xs text-stone">Philosophy for daily life</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-cta text-white shadow-lg' 
                  : 'text-stone hover:bg-hero/50 hover:text-ink'
                }
              `}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-stone'} />
              <div className="flex-1">
                <span className="font-medium">{item.name}</span>
                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-stone/70'}`}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* User Profile Section - Moved to bottom */}
      {isAuthenticated && <UserProfile />}
    </div>
  );
}
