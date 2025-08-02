import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Heart, Target, Lightbulb } from 'lucide-react';
import type { LifeCalendarData } from '@/hooks/useLifeCalendar';

interface MementoMoriInsightsProps {
  data: LifeCalendarData;
  motivationalMessage: string;
}

export function MementoMoriInsights({ data, motivationalMessage }: MementoMoriInsightsProps): JSX.Element {
  const insights = [
    {
      icon: Clock,
      title: "Time Perspective",
      content: `You have approximately ${data.daysRemaining.toLocaleString()} days remaining. That&apos;s ${Math.floor(data.daysRemaining / 365)} years of potential experiences, growth, and impact.`,
      color: "text-cta"
    },
    {
      icon: Heart,
      title: "Life's Seasons",
      content: data.percentageLived < 25 
        ? "You&apos;re in life&apos;s spring - time for growth, learning, and planting seeds for the future."
        : data.percentageLived < 50
        ? "You&apos;re in life&apos;s summer - peak time for achievement, building, and making your mark."
        : data.percentageLived < 75
        ? "You&apos;re in life&apos;s autumn - time for wisdom sharing, mentoring, and harvesting what you&apos;ve sown."
        : "You&apos;re in life&apos;s winter - time for reflection, legacy building, and savoring life&apos;s essence.",
      color: "text-hero"
    },
    {
      icon: Target,
      title: "Focus Reminder",
      content: "With finite time, choose your priorities wisely. Focus on relationships, meaningful work, and personal growth rather than trivial distractions.",
      color: "text-stone"
    },
    {
      icon: Lightbulb,
      title: "Stoic Wisdom",
      content: "Marcus Aurelius reminded us: &apos;It is not death that a man should fear, but never beginning to live.&apos; Use this awareness to live more fully.",
      color: "text-ink"
    }
  ];

  const weeklyReflections = [
    "What did I do this week that aligned with my values?",
    "How did I grow or learn something new?",
    "What relationships did I nurture?",
    "What would I do differently if I knew this was my last week?",
    "How can I make next week more meaningful?"
  ];

  return (
    <div className="space-y-6">
      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-cta/10 to-hero/10 border-cta/20 animate-fade-in">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-serif text-ink mb-3">Today's Reflection</h3>
          <p className="text-stone italic">{motivationalMessage}</p>
        </CardContent>
      </Card>

      {/* Life Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 animate-fade-in">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-cta mb-1">
              {data.daysLived.toLocaleString()}
            </div>
            <div className="text-sm text-stone/70">Days Lived</div>
            <div className="text-xs text-stone/50 mt-1">
              {Math.floor(data.daysLived / 365)} years, {data.daysLived % 365} days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 animate-fade-in">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-hero mb-1">
              {data.daysRemaining.toLocaleString()}
            </div>
            <div className="text-sm text-stone/70">Days Remaining</div>
            <div className="text-xs text-stone/50 mt-1">
              Approximately {Math.floor(data.daysRemaining / 365)} years left
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 animate-fade-in">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-stone mb-1">
              {Math.floor(data.daysRemaining / 7).toLocaleString()}
            </div>
            <div className="text-sm text-stone/70">Weeks Left</div>
            <div className="text-xs text-stone/50 mt-1">
              Make each one count
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 animate-fade-in">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-ink mb-1">
              {data.percentageLived}%
            </div>
            <div className="text-sm text-stone/70">Life Complete</div>
            <div className="text-xs text-stone/50 mt-1">
              {100 - data.percentageLived}% remaining
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="bg-white/90 animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                {insight.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-stone/80 text-sm leading-relaxed">{insight.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Reflection Questions */}
      <Card className="bg-white/90 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-ink">Weekly Reflection Questions</CardTitle>
          <p className="text-stone/70 text-sm">
            Use these questions to make the most of each week
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {weeklyReflections.map((question, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-hero/5 rounded-lg">
                <Badge variant="secondary" className="shrink-0 mt-0.5">
                  {index + 1}
                </Badge>
                <p className="text-stone text-sm">{question}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}