import React from 'react';
import { List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'list' | 'calendar';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center bg-stone-100 rounded-lg p-1 ${className}`}>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className={`h-8 w-8 p-0 transition-all ${
          currentView === 'list'
            ? 'bg-orange-400 text-white shadow-md hover:bg-orange-500'
            : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
        }`}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'calendar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('calendar')}
        className={`h-8 w-8 p-0 transition-all ${
          currentView === 'calendar'
            ? 'bg-orange-400 text-white shadow-md hover:bg-orange-500'
            : 'text-stone-600 hover:text-stone-900 hover:bg-white/70'
        }`}
      >
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
};