import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Save, ChevronDownIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LifeCalendarSetupProps {
  onSetup: (birthDate: Date, lifeExpectancy: number) => Promise<boolean>;
  initialBirthDate?: Date | null;
  initialLifeExpectancy?: number;
  isLoading?: boolean;
}

export function LifeCalendarSetup({ 
  onSetup, 
  initialBirthDate = null, 
  initialLifeExpectancy = 80,
  isLoading: externalLoading = false
}: LifeCalendarSetupProps): React.JSX.Element {
  const [birthDate, setBirthDate] = useState<Date | undefined>(initialBirthDate || undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [lifeExpectancy, setLifeExpectancy] = useState(initialLifeExpectancy.toString());
  const [internalLoading, setInternalLoading] = useState(false);
  const { toast } = useToast();
  
  const isLoading = externalLoading || internalLoading;

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!birthDate) {
      toast({
        title: "Birth date required",
        description: "Please enter your birth date to create your life calendar.",
        variant: "destructive"
      });
      return;
    }

    const lifeExpectancyNum = parseInt(lifeExpectancy);
    
    if (birthDate > new Date()) {
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

    setInternalLoading(true);
    try {
      const success = await onSetup(birthDate, lifeExpectancyNum);
      if (success) {
        toast({
          title: "Settings saved",
          description: "Your life calendar has been updated.",
        });
      }
    } finally {
      setInternalLoading(false);
    }
  };

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
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="birthDate"
                  className="w-full justify-between font-normal bg-white/70 border-stone/20 focus:border-cta"
                >
                  {birthDate ? birthDate.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={(date) => {
                    setBirthDate(date);
                    setCalendarOpen(false);
                  }}
                  captionLayout="dropdown"
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-stone/60">
              This helps calculate how many weeks you&apos;ve lived
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
              &quot;Memento Mori&quot; is Latin for &quot;remember you must die.&quot; This Stoic practice 
              isn&apos;t morbid—it&apos;s motivational. By visualizing the finite nature of life, 
              we&apos;re reminded to focus on what truly matters and live with intention.
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