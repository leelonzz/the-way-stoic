'use client';

import React, { useState } from 'react';
import { X, Mail, Calendar, Trophy, BookOpen, Target, Star, Medal, Award, Crown, Gem } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, profile, signOut } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    return profile?.full_name || user.email?.split('@')[0] || 'User';
  };

  const getJoinDate = () => {
    if (profile?.created_at) {
      return new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'July 31, 2025';
  };

  // Mock data for now - will be replaced with real data
  const userStats = {
    daysOfPractice: 0,
    quotesSaved: 0,
    goalsCompleted: 0,
    daysOnJourney: 0
  };

  const achievements = [
    {
      id: 'first_steps',
      name: 'First Steps',
      description: 'Begin The Stoic Way',
      icon: Star,
      unlocked: true,
      color: 'text-yellow-500'
    },
    {
      id: 'wisdom_seeker',
      name: 'Wisdom Seeker',
      description: 'Save 10 quotes',
      icon: BookOpen,
      unlocked: false,
      color: 'text-blue-500'
    },
    {
      id: 'goal_setter',
      name: 'Goal Setter',
      description: 'Complete 1 goal',
      icon: Target,
      unlocked: false,
      color: 'text-green-500'
    },
    {
      id: 'dedicated_student',
      name: 'Dedicated Student',
      description: '30 days of practice',
      icon: Medal,
      unlocked: false,
      color: 'text-purple-500'
    },
    {
      id: 'stoic_scholar',
      name: 'Stoic Scholar',
      description: 'Save 50 quotes',
      icon: Award,
      unlocked: false,
      color: 'text-orange-500'
    },
    {
      id: 'persistent_practitioner',
      name: 'Persistent Practitioner',
      description: '100 days of practice',
      icon: Crown,
      unlocked: false,
      color: 'text-red-500'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-parchment">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-2xl font-serif text-ink">Your Profile</DialogTitle>
          <p className="text-stone">Manage your account and track your progress</p>
        </DialogHeader>

        {/* Profile Header */}
        <div className="bg-gradient-to-r from-cta to-cta/80 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarImage 
                src={profile?.avatar_url || undefined} 
                alt={getDisplayName()}
              />
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-bold">{getDisplayName()}</h2>
              <div className="flex items-center gap-2 text-white/80 mb-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile?.email || user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {getJoinDate()}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{userStats.daysOfPractice}</div>
              <div className="text-white/80 text-sm">Days of Practice</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
              <div className="text-orange-200 text-sm font-medium">Quotes Saved</div>
              <div className="text-2xl font-bold">{userStats.quotesSaved}</div>
            </div>
            <div className="text-center">
              <div className="text-orange-200 text-sm font-medium">Goals Completed</div>
              <div className="text-2xl font-bold">{userStats.goalsCompleted}</div>
            </div>
            <div className="text-center">
              <div className="text-orange-200 text-sm font-medium">Days on Journey</div>
              <div className="text-2xl font-bold">{userStats.daysOnJourney}</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-hero">
            <TabsTrigger value="progress" className="data-[state=active]:bg-cta data-[state=active]:text-white">
              Progress & Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cta data-[state=active]:text-white">
              Account Settings
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-cta data-[state=active]:text-white">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-6 mt-6">
            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border border-stone/20">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-cta" />
                  <div>
                    <h3 className="font-serif font-bold text-ink">Quotes Collection</h3>
                    <p className="text-sm text-stone">Wisdom gathered</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-cta mb-2">{userStats.quotesSaved}</div>
                <div className="text-sm text-stone mb-3">/ 100</div>
                <Progress value={(userStats.quotesSaved / 100) * 100} className="mb-2" />
                <div className="text-sm text-stone">0% complete</div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-stone/20">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-serif font-bold text-ink">Goals Achieved</h3>
                    <p className="text-sm text-stone">Milestones reached</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{userStats.goalsCompleted}</div>
                <div className="text-sm text-stone mb-3">/ 50</div>
                <Progress value={(userStats.goalsCompleted / 50) * 100} className="mb-2" />
                <div className="text-sm text-stone">0% complete</div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-stone/20">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-serif font-bold text-ink">Journey Length</h3>
                    <p className="text-sm text-stone">Days of practice</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{userStats.daysOnJourney}</div>
                <div className="text-sm text-stone mb-3">/ 365</div>
                <Progress value={(userStats.daysOnJourney / 365) * 100} className="mb-2" />
                <div className="text-sm text-stone">0% complete</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-r from-cta/10 to-cta/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-cta" />
                <h3 className="text-xl font-serif font-bold text-ink">Achievements</h3>
                <Badge variant="secondary" className="bg-cta/20 text-cta">
                  1 / 6
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all ${
                        achievement.unlocked
                          ? 'bg-white border-cta/30 shadow-sm'
                          : 'bg-stone/10 border-stone/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent 
                          className={`w-5 h-5 ${
                            achievement.unlocked ? achievement.color : 'text-stone'
                          }`} 
                        />
                        <h4 className={`font-medium text-sm ${
                          achievement.unlocked ? 'text-ink' : 'text-stone'
                        }`}>
                          {achievement.name}
                        </h4>
                      </div>
                      <p className="text-xs text-stone">{achievement.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-stone/20">
              <h3 className="text-lg font-serif font-bold text-ink mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-stone">Display Name</label>
                  <p className="text-ink">{getDisplayName()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone">Email</label>
                  <p className="text-ink">{profile?.email || user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone">Member Since</label>
                  <p className="text-ink">{getJoinDate()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-stone/20">
              <h3 className="text-lg font-serif font-bold text-ink mb-4">Account Actions</h3>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg p-6 border border-stone/20">
              <h3 className="text-lg font-serif font-bold text-ink mb-4">Notification Preferences</h3>
              <p className="text-stone">Notification settings will be available soon.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-stone/20">
              <h3 className="text-lg font-serif font-bold text-ink mb-4">Display Preferences</h3>
              <p className="text-stone">Display customization options will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}