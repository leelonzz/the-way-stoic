import React from 'react';
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

export function LifeCalendarGrid({ data, getWeekData }: LifeCalendarGridProps) {
  const { totalWeeks, weeksLived, lifeExpectancy } = data;
  
  const renderYearRow = (yearIndex: number) => {
    const weeks = [];
    const startWeek = yearIndex * 52;
    
    for (let week = 0; week < 52; week++) {
      const weekIndex = startWeek + week;
      if (weekIndex >= totalWeeks) break;
      
      const weekData = getWeekData(weekIndex);
      
      weeks.push(
        <TooltipProvider key={weekIndex}>
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
                  {weekData.isCurrentWeek ? 'Current Week' : `Week ${week + 1}`}
                </p>
                <p>Year: {yearIndex + 1}</p>
                <p>Age: {yearIndex}</p>
                <p>Status: {weekData.isLived ? 'Lived' : 'Future'}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <div key={yearIndex} className="flex items-center gap-2 mb-1">
        <div className="w-8 text-xs text-stone/70 text-right shrink-0">
          {yearIndex === 0 ? '0' : yearIndex}
        </div>
        <div className="flex gap-0.5 flex-wrap">
          {weeks}
        </div>
      </div>
    );
  };

  const years = Math.ceil(totalWeeks / 52);
  const yearRows = [];
  
  for (let year = 0; year < years; year++) {
    yearRows.push(renderYearRow(year));
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm">
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
            <div>
              <div className="text-2xl font-bold text-cta">{data.weeksLived}</div>
              <div className="text-xs text-stone/70">Weeks Lived</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-stone">{totalWeeks - weeksLived}</div>
              <div className="text-xs text-stone/70">Weeks Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-ink">{data.yearsLived}</div>
              <div className="text-xs text-stone/70">Years Old</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-hero">{data.percentageLived}%</div>
              <div className="text-xs text-stone/70">Life Lived</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}