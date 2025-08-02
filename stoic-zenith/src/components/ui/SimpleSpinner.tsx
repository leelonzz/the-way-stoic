import React from 'react';

interface SimpleSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

export const SimpleSpinner: React.FC<SimpleSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = '#100804'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div 
        className="animate-spin rounded-full border-2 border-t-transparent"
        style={{ 
          borderColor: `${color}33`, // 20% opacity for border
          borderTopColor: color // Full opacity for spinning part
        }}
      />
    </div>
  );
};