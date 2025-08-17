import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JournalCardProps {
  streakCount?: number;
  onStartDay?: () => void;
  className?: string;
}

export function JournalCard({ streakCount = 7, onStartDay, className }: JournalCardProps) {
  return (
    <Card className={`w-80 h-96 bg-gradient-to-br from-green-400 to-green-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${className}`}>
      <CardContent className="p-8 flex flex-col items-center justify-between h-full text-center">
        {/* Streak Number */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-8xl font-bold text-black mb-2">
            {streakCount}
          </div>
          <div className="text-xl font-medium text-black">
            Journal
          </div>
          <div className="text-lg text-black/80">
            daily
          </div>
        </div>

        {/* Empty space for visual balance */}
        <div className="flex-1 flex items-center justify-center">
          {/* Small decorative leaf icon */}
          <div className="w-12 h-8 bg-amber-600 rounded-full transform rotate-45 opacity-80"></div>
        </div>

        {/* Start Day Button */}
        <Button
          onClick={onStartDay}
          className="w-48 bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-full py-3 shadow-md hover:shadow-lg transform group-hover:scale-[1.02] transition-all duration-200"
        >
          Start your day
        </Button>
      </CardContent>
    </Card>
  );
}
