import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookmarkCheck, Target, Calendar, Flame, TrendingUp, Award } from 'lucide-react';
import type { UserStats } from '@/hooks/useProfile';

interface ProfileStatsProps {
  stats: UserStats;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const progressItems = [
    {
      icon: BookmarkCheck,
      title: "Quotes Collection",
      value: stats.savedQuotes,
      maxValue: 100,
      color: "text-cta",
      bgColor: "bg-cta/10",
      description: "Wisdom gathered"
    },
    {
      icon: Target,
      title: "Goals Achieved",
      value: stats.goalsCompleted,
      maxValue: 50,
      color: "text-hero",
      bgColor: "bg-hero/10",
      description: "Milestones reached"
    },
    {
      icon: Calendar,
      title: "Journey Length",
      value: stats.daysSinceJoined,
      maxValue: 365,
      color: "text-stone",
      bgColor: "bg-stone/10",
      description: "Days of practice"
    }
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Joined The Stoic Way",
      earned: stats.daysSinceJoined > 0,
      icon: "🚀"
    },
    {
      title: "Wisdom Seeker",
      description: "Saved 10 quotes",
      earned: stats.savedQuotes >= 10,
      icon: "📚"
    },
    {
      title: "Goal Setter",
      description: "Completed 5 goals",
      earned: stats.goalsCompleted >= 5,
      icon: "🎯"
    },
    {
      title: "Dedicated Student",
      description: "30 days of practice",
      earned: stats.daysSinceJoined >= 30,
      icon: "⭐"
    },
    {
      title: "Stoic Scholar",
      description: "Saved 50 quotes",
      earned: stats.savedQuotes >= 50,
      icon: "🏛️"
    },
    {
      title: "Persistent Practitioner",
      description: "100 days of practice",
      earned: stats.daysSinceJoined >= 100,
      icon: "💎"
    }
  ];

  const earnedAchievements = achievements.filter(a => a.earned);
  const nextAchievement = achievements.find(a => !a.earned);

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {progressItems.map((item, index) => {
          const progressPercentage = Math.min((item.value / item.maxValue) * 100, 100);
          
          return (
            <Card key={index} className="bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-lg ${item.bgColor}`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <span className="text-ink">{item.title}</span>
                    <p className="text-xs text-stone/70 font-normal">{item.description}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </span>
                  <span className="text-stone/60 text-sm">
                    / {item.maxValue}
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2"
                />
                <p className="text-xs text-stone/60">
                  {progressPercentage.toFixed(0)}% complete
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cta" />
            Achievements
            <Badge variant="secondary" className="ml-2">
              {earnedAchievements.length} / {achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.earned
                    ? 'bg-cta/5 border-cta/20 shadow-sm'
                    : 'bg-stone/5 border-stone/10 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.earned ? 'text-ink' : 'text-stone/60'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.earned ? 'text-stone/70' : 'text-stone/50'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && (
                      <Badge variant="secondary" className="mt-2 text-xs bg-cta/10 text-cta">
                        Earned
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Achievement */}
      {nextAchievement && (
        <Card className="bg-gradient-to-r from-hero/5 to-cta/5 border-hero/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-hero">
              <TrendingUp className="w-5 h-5" />
              Next Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{nextAchievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink">{nextAchievement.title}</h3>
                <p className="text-stone/70">{nextAchievement.description}</p>
              </div>
              <Badge variant="outline" className="border-hero text-hero">
                Coming Soon
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress Summary */}
      <Card className="bg-gradient-to-br from-cta/5 to-hero/5">
        <CardHeader>
          <CardTitle className="text-center text-ink">Your Stoic Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-cta">{stats.daysSinceJoined}</div>
                <div className="text-xs text-stone/70">Days Practicing</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-hero">{stats.savedQuotes}</div>
                <div className="text-xs text-stone/70">Wisdom Collected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-stone">{stats.goalsCompleted}</div>
                <div className="text-xs text-stone/70">Goals Achieved</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{earnedAchievements.length}</div>
                <div className="text-xs text-stone/70">Achievements</div>
              </div>
            </div>
            
            <p className="text-stone/70 italic text-sm">
              "Every day is a new opportunity to practice virtue and wisdom."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}