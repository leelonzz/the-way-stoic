'use client';

import React, { useState } from 'react';
import { LogOut, Settings, User, ChevronDown, Mail } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export function UserProfile() {
  const { user, profile, signOut, isLoading } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = () => {
    if (profile.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return profile.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return profile.full_name || profile.email.split('@')[0];
  };

  return (
    <div className="border-b border-stone/10 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full p-3 h-auto hover:bg-hero/50 transition-colors"
          >
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-10 h-10 border-2 border-stone/20">
                <AvatarImage 
                  src={profile.avatar_url || undefined} 
                  alt={getDisplayName()}
                />
                <AvatarFallback className="bg-cta text-white font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink text-sm truncate">
                    {getDisplayName()}
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>
              
              <ChevronDown className="w-4 h-4 text-stone flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="start" 
          className="w-64 bg-white/95 backdrop-blur-sm border-stone/20"
          sideOffset={5}
        >
          <div className="px-3 py-2 border-b border-stone/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={profile.avatar_url || undefined} 
                  alt={getDisplayName()}
                />
                <AvatarFallback className="bg-cta text-white text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-ink text-sm truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-stone truncate">
                  {profile.email}
                </p>
              </div>
            </div>
          </div>
          
          <DropdownMenuItem className="focus:bg-hero/50 cursor-pointer">
            <User className="w-4 h-4 mr-2" />
            <span>View Profile</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="focus:bg-hero/50 cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-stone/20" />
          
          <DropdownMenuItem 
            className="focus:bg-red-50 text-red-600 cursor-pointer"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default UserProfile;