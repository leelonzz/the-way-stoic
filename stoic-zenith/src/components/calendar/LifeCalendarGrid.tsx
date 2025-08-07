import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LifeCalendarData } from '@/hooks/useLifeCalendar';

interface LifeCalendarGridProps {
  data: LifeCalendarData;
  getWeekData: (weekIndex: number) => {
    isLived: boolean;
    yearNumber: number;
    weekInYear: number;
    isCurrentWeek: boolean;
  };
}

// Memoized week component for better performance
const WeekSquare = memo(({ 
  weekData, 
  weekNumber 
}: { 
  weekIndex: number; 
  weekData: ReturnType<LifeCalendarGridProps['getWeekData']>; 
  weekNumber: number; 
}) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={`
            w-3 h-3 rounded-sm border cursor-pointer transition-all duration-200 hover:scale-110
            ${weekData.isCurrentWeek 
              ? 'bg-cta border-cta shadow-lg ring-2 ring-cta/50' 
              : weekData.isLived 
                ? 'bg-stone border-stone/50' 
                : 'bg-white border-stone/20 hover:bg-hero/20'
            }
          `}
        />
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-sm">
          <p className="font-semibold">
            {weekData.isCurrentWeek ? 'Current Week' : `Week ${weekNumber}`}
          </p>
          <p>Year: {weekData.yearNumber + 1}</p>
          <p>Age: {weekData.yearNumber}</p>
          <p>Status: {weekData.isLived ? 'Lived' : 'Future'}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
));

WeekSquare.displayName = 'WeekSquare';

// Memoized year row component
const YearRow = memo(({ 
  yearIndex, 
  totalWeeks, 
  getWeekData 
}: { 
  yearIndex: number; 
  totalWeeks: number; 
  getWeekData: LifeCalendarGridProps['getWeekData']; 
}) => {
  const weeks = useMemo(() => {
    const weekElements = [];
    const startWeek = yearIndex * 52;
    
    for (let week = 0; week < 52; week++) {
      const weekIndex = startWeek + week;
      if (weekIndex >= totalWeeks) break;
      
      const weekData = getWeekData(weekIndex);
      
      weekElements.push(
        <WeekSquare
          key={weekIndex}
          weekIndex={weekIndex}
          weekData={weekData}
          weekNumber={week + 1}
        />
      );
    }
    
    return weekElements;
  }, [yearIndex, totalWeeks, getWeekData]);

  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="w-8 text-xs text-stone/70 text-right shrink-0">
        {yearIndex === 0 ? '0' : yearIndex}
      </div>
      <div className="flex gap-0.5 flex-wrap">
        {weeks}
      </div>
    </div>
  );
});

YearRow.displayName = 'YearRow';

export const LifeCalendarGrid = memo(({ data, getWeekData }: LifeCalendarGridProps) => {
  const { totalWeeks, weeksLived, lifeExpectancy } = data;
  
  // Memoize year rows for better performance
  const yearRows = useMemo(() => {
    const years = Math.ceil(totalWeeks / 52);
    const rows = [];
    
    for (let year = 0; year < years; year++) {
      rows.push(
        <YearRow
          key={year}
          yearIndex={year}
          totalWeeks={totalWeeks}
          getWeekData={getWeekData}
        />
      );
    }
    
    return rows;
  }, [totalWeeks, getWeekData]);

  // Memoize stats for better performance
  const stats = useMemo(() => [
    { value: data.weeksLived, label: 'Weeks Lived', color: 'text-cta' },
    { value: totalWeeks - weeksLived, label: 'Weeks Remaining', color: 'text-stone' },
    { value: data.yearsLived, label: 'Years Old', color: 'text-ink' },
    { value: `${data.percentageLived}%`, label: 'Life Lived', color: 'text-stone' }
  ], [data.weeksLived, data.yearsLived, data.percentageLived, totalWeeks, weeksLived]);

  return (
    <Card className="bg-white/90 backdrop-blur-sm animate-fade-in">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-serif text-ink">Your Life in Weeks</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {lifeExpectancy} years
          </Badge>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-stone border-stone/50 rounded-sm"></div>
            <span className="text-stone/70">Weeks lived ({weeksLived})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cta border-cta rounded-sm"></div>
            <span className="text-stone/70">Current week</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-stone/20 rounded-sm"></div>
            <span className="text-stone/70">Future weeks</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {yearRows}
        </div>
        
        <div className="mt-6 pt-4 border-t border-stone/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-stone/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LifeCalendarGrid.displayName = 'LifeCalendarGrid';