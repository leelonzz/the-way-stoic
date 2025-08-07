
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Quote, Calendar, Brain, GraduationCap } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileModal } from '@/components/profile/ProfileModal';
import { useQueryClient } from '@tanstack/react-query';
import { handleNavigationPrefetch } from '@/lib/prefetch';
import { useNavigationState } from '@/hooks/useNavigationState';

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen
  },
  {
    name: 'Mentors',
    href: '/mentors',
    icon: Brain
  },
  {
    name: 'Course',
    href: '/course',
    icon: GraduationCap,
    comingSoon: true
  },
  {
    name: 'Quotes',
    href: '/quotes',
    icon: Quote
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar
  },
];

export function AppSidebar(): JSX.Element {
  const pathname = usePathname();
  const { isAuthenticated, user, profile } = useAuthContext();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { isPathLikelyCached, prefetchPage } = useNavigationState();

  const handleMouseEnter = (href: string): void => {
    // Only prefetch if not already cached
    if (!isPathLikelyCached(href)) {
      handleNavigationPrefetch(href, queryClient, user?.id);
      prefetchPage(href);
    }
  };
  
  return (
    <div className="w-64 bg-parchment border-r border-stone/20 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-sage/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-bold text-stone">The Stoic Way</h1>
            <p className="text-xs text-sage">Philosophy for daily life</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const isComingSoon = item.comingSoon;
          
          if (isComingSoon) {
            return (
              <div
                key={item.name}
                className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sage/50 cursor-not-allowed relative"
              >
                <item.icon size={18} className="text-sage/50" />
                <span className="font-medium text-sm">{item.name}</span>
                <span className="ml-auto text-xs bg-sage/20 text-sage/70 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            );
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true} // Enable Next.js prefetch
              onMouseEnter={() => handleMouseEnter(item.href)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-sage hover:bg-parchment/50 hover:text-stone'
                }
              `}
            >
              <item.icon size={18} className={isActive ? 'text-white' : 'text-sage'} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
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
                    ? profile.full_name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)
                    : user.email?.charAt(0).toUpperCase() || 'U'
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-stone text-sm truncate">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-sage">Online</span>
                </div>
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
  );
}
