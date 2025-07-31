
import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StreakCardProps {
  title: string;
  currentStreak: number;
  longestStreak: number;
  icon: React.ReactNode;
}

export function StreakCard({ title, currentStreak, longestStreak, icon }: StreakCardProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-stone/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-stone">{title}</CardTitle>
        <div className="text-stone/70">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-ink">{currentStreak}</div>
              <p className="text-xs text-stone">Current</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cta" />
            <div>
              <div className="text-2xl font-bold text-ink">{longestStreak}</div>
              <p className="text-xs text-stone">Record</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
