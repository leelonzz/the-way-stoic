import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Mail, User } from 'lucide-react';
import type { UserProfile, UserStats } from '@/hooks/useProfile';

interface ProfileHeaderProps {
  profile: UserProfile;
  stats: UserStats | null;
}

export function ProfileHeader({ profile, stats }: ProfileHeaderProps) {
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="bg-gradient-to-br from-hero/10 to-cta/5 border-hero/20">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || 'User'} />
            <AvatarFallback className="text-2xl font-semibold bg-cta text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-3xl font-serif text-ink">
                {profile.full_name || 'Stoic Practitioner'}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-stone/70">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-stone/70">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {joinedDate}</span>
              </div>
            </div>
            
            {stats && (
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="secondary" className="bg-cta/10 text-cta">
                  {stats.savedQuotes} Quotes Saved
                </Badge>
                <Badge variant="secondary" className="bg-hero/10 text-hero">
                  {stats.goalsCompleted} Goals Completed
                </Badge>
                <Badge variant="secondary" className="bg-stone/10 text-stone">
                  {stats.daysSinceJoined} Days on Journey
                </Badge>
              </div>
            )}
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-cta mb-1">
              {stats?.daysSinceJoined || 0}
            </div>
            <div className="text-sm text-stone/70">Days of Practice</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}