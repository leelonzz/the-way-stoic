
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, MessageCircle, Quote, Calendar, User, Brain, FileText } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileModal } from '@/components/profile/ProfileModal';

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
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user, profile } = useAuthContext();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  return (
    <div className="w-64 bg-parchment border-r border-stone/20 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Header */}
      <div className="p-6 border-b border-stone/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cta rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-bold text-ink">The Stoic Way</h1>
            <p className="text-xs text-stone">Philosophy for daily life</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
      
      {/* Bottom Profile Section */}
      {isAuthenticated && user && profile && (
        <div className="p-4 border-t border-stone/20">
          <Button
            variant="ghost"
            className="w-full p-3 h-auto hover:bg-hero/50 transition-colors"
            onClick={() => setIsProfileModalOpen(true)}
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-10 h-10 border-2 border-stone/20">
                <AvatarImage 
                  src={profile.avatar_url || undefined} 
                  alt={profile.full_name || profile.email}
                />
                <AvatarFallback className="bg-cta text-white font-medium">
                  {profile.full_name 
                    ? profile.full_name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)
                    : profile.email.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-ink text-sm truncate">
                  {profile.full_name || profile.email.split('@')[0]}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-stone">Online</span>
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
