import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LifeCalendarSetupProps {
  onSetup: (birthDate: Date, lifeExpectancy: number) => Promise<boolean>;
  initialBirthDate?: Date | null;
  initialLifeExpectancy?: number;
}

export function LifeCalendarSetup({ 
  onSetup, 
  initialBirthDate = null, 
  initialLifeExpectancy = 80 
}: LifeCalendarSetupProps) {
  const [birthDate, setBirthDate] = useState(
    initialBirthDate ? initialBirthDate.toISOString().split('T')[0] : ''
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(initialLifeExpectancy.toString());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Birth date required",
        description: "Please enter your birth date to create your life calendar.",
        variant: "destructive"
      });
      return;
    }

    const birthDateObj = new Date(birthDate);
    const lifeExpectancyNum = parseInt(lifeExpectancy);
    
    if (birthDateObj > new Date()) {
      toast({
        title: "Invalid birth date",
        description: "Birth date cannot be in the future.",
        variant: "destructive"
      });
      return;
    }

    if (lifeExpectancyNum < 1 || lifeExpectancyNum > 150) {
      toast({
        title: "Invalid life expectancy",
        description: "Life expectancy must be between 1 and 150 years.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await onSetup(birthDateObj, lifeExpectancyNum);
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your life calendar has been updated.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <Card className="bg-gradient-to-br from-hero/10 to-cta/5 border-hero/20">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-serif text-ink">
          <CalendarIcon className="w-6 h-6 text-cta" />
          {initialBirthDate ? 'Update Your Life Calendar' : 'Create Your Life Calendar'}
        </CardTitle>
        <p className="text-stone/70">
          Visualize your life as a reminder that time is precious
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-ink font-medium">
              Birth Date
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="bg-white/70 border-stone/20 focus:border-cta"
              required
            />
            <p className="text-xs text-stone/60">
              This helps calculate how many weeks you've lived
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lifeExpectancy" className="text-ink font-medium">
              Life Expectancy (years)
            </Label>
            <Input
              id="lifeExpectancy"
              type="number"
              min="1"
              max="150"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
              className="bg-white/70 border-stone/20 focus:border-cta"
              required
            />
            <p className="text-xs text-stone/60">
              Global average is around 72-80 years. Adjust based on your lifestyle and health.
            </p>
          </div>

          <div className="bg-white/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-ink">About Memento Mori</h4>
            <p className="text-sm text-stone/70">
              "Memento Mori" is Latin for "remember you must die." This Stoic practice 
              isn't morbid—it's motivational. By visualizing the finite nature of life, 
              we're reminded to focus on what truly matters and live with intention.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-cta hover:bg-cta/90 text-white"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : initialBirthDate ? 'Update Calendar' : 'Create Calendar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}